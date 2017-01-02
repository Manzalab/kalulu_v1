define([
    'phaser-bundle',
    '../ui',
    'eventemitter3',
    '../layouts',
    '../layouts/bot-canvas',
    '../tracing',
    '../events/emitter',
    '../events/events',
    '../tracing_frame'
], function (
    Phaser,
    UI,
    EventEmitter,
    loadLayouts,
    BotCanvasLayout,
    Tracing,
    Emitter,
    Events,
    TracingFrame
) {
    'use strict';

    /**
     * PhaseImage is a game phase where a video is played to teach something to the player
     * @class
    **/
    function PhaseImage (game) {
        Phaser.State.call(this);
        this.game = game;
    }

    PhaseImage.prototype = Object.create(Phaser.State.prototype);
    PhaseImage.prototype.constructor = PhaseImage;

    PhaseImage.prototype.preload = function phaseImagePreload () {
        
        this._notions = this.game.gameConfig.pedagogicData.data.notions;

        // 1 image and 1 sound to be played in this phase
        for (var i = 0 ; i < this._notions.length ; i++) {
            
            var lNotion = this._notions[i];

            this.game.load.audio('illustrative_sound_'+ lNotion.value, lNotion.illustrativeSound);
            this.game.load.image('illustrative_image_'+ lNotion.value, lNotion.image);            
        }

        // 3 Kalulu speeches 
        this.game.load.audio('kaluluIntro',         'minigames/lookandlearn/assets/audio/kalulu/kalulu_intro_commoncore02_' + this.game.gameConfig.pedagogicData.discipline + '.ogg');
        this.game.load.audio('kaluluHelp',          'minigames/lookandlearn/assets/audio/kalulu/kalulu_help_commoncore02_'  + this.game.gameConfig.pedagogicData.discipline + '.ogg');
        this.game.load.audio('kaluluGameOverWin',   'minigames/lookandlearn/assets/audio/kalulu/kalulu_end_commoncore02_'   + this.game.gameConfig.pedagogicData.discipline + '.ogg');
    };
    
    PhaseImage.prototype.create = function phaseImageCreate () {
        
        if (this.game.load.hasLoaded) console.info("PhaseImage State has completed loading.");

        this._initPhase();

        this._addPhaseStageToWorld();


        this._initPedago();


        // #### Events
        this.game.eventManager.once('introSequenceComplete', this.startBotTracingAfterDelay, this);
        this.game.eventManager.emit('startGame');
    };


    /**
     * Ensure the UI, EventEmitter are up and ready
    **/
    PhaseImage.prototype._initPhase = function initImagePhase () {
        
        //GamePhase._init.call(this);

        if (!this.game.eventManager) {
            this.game.eventManager = new EventEmitter();
        }

        if (!this.game.ui) {
            var options = {
                isKaluluEnabled                 : true,
                isIntroPhonemeButtonEnabled     : false,
                isReplayEnabled                 : false,
                isPhonemeButtonEnabled          : true
            };

            this.game.ui = new UI(0, this.game, options);
        }
        else {
            this.game.ui.resetKaluluSpeeches(); // may be called ui.prepareForNewPhase()
        }

        if (this.firstTime) {
            this.onFirstTime();
        }
    }

    /**
     * Creates and adds to World a new Phaser.Group containing all the elements of this phase.
    **/
    PhaseImage.prototype._addPhaseStageToWorld = function addImagePhaseStageToWorld () {
        
        this.imagePhaseStage = new Phaser.Group(this.game, this.game.world, 'imagePhaseStage');
    }

    /**
     * Sets up the notions sequence
    **/
    PhaseImage.prototype._initPedago = function initPedagoImagePhase () {
        

        this._currentNotion = this._notions[0];
        this._computeCoords();

        var notionsCount = this._notions.length;
        for (var i = 0 ; i < notionsCount ; i++) {

            var lNotion = this._notions[i];
            var lCoords = this._framesCoords[lNotion.id]
            
            this._addNewTracingFrame(lNotion, lCoords.x, lCoords.y, lCoords.width, lCoords .height);
            this._addIllustration(lNotion, 960, 400);
        }
        
        this._setIllustrationVisible(this._currentNotion.id);

        this._setTracerPositionToNotionX1(this._currentNotion);

        this._setupTracer(this.tracerPosX, this.tracerPosX);

        this.progression = new Tracing.ProgressionHandler(this.game.gameConfig.progression, this.game);
        this.tracingOn = false;

        this.onFirstLetterTracingComplete = this.onFirstLetterTracingComplete.bind(this);
        this.onSecondLetterTracingComplete = this.onSecondLetterTracingComplete.bind(this);
    };

    /**
     * Creates and adds to the phase stage a new TracingFrame().
     * 
     * @param notion {object} the notion to draw
     * @param x      {number} the x position where the center of the frame will be added
     * @param y      {number} the y position where the center of the frame will be added
     * @param width  {number} the width of the frame
     * @param height {number} the height of the frame
     * @param color  {object} optional - the color of the frame
    **/
    PhaseImage.prototype._addNewTracingFrame = function addNewTracingFrame (notion, x, y, width, height, color) {
        
        if (!this._tracingFrames) {
            this._tracingFrames = {};
            if (this.game.gameConfig.globalVars) window.lookandlearn.tracingFrames = this._tracingFrames;
        }
        
        var lFrame = new TracingFrame(this.game, x, y, width, height, color);
        this.imagePhaseStage.add(lFrame);
        
        this._tracingFrames[notion.id] = lFrame;
    };

    /**
     * Creates and adds a Sprite with the texture at key 'illustrative_image_' + notion.value
     * Warning : the spris is not visible at creation, set visible to true to see it.
    **/
    PhaseImage.prototype._addIllustration = function addIllustration (notion, x, y) {
        
        if (!this._illustrations) {
            this._illustrations = {};
            if (this.game.gameConfig.globalVars) window.lookandlearn.illustrations = this._illustrations;
        }

        var lImage = new Phaser.Sprite(this.game, x, y, 'illustrative_image_' + notion.value);
        lImage.anchor.set(0.5, 0.5);
        var scaleRatio = 600/lImage.height;
        lImage.scale.set(scaleRatio, scaleRatio);
        lImage.visible = false;
        this.imagePhaseStage.add(lImage);

        this._illustrations[notion.id] = lImage;
    };

    /**
     * Set the current Illustration to invisible, the required to current and visible
    **/
    PhaseImage.prototype._setIllustrationVisible = function setIllustrationVisible (notionId) {
        if (this._currentIllustration) this._currentIllustration.visible = false;
        this._currentIllustration = this._illustrations[notionId];
        this._currentIllustration.visible = true;
    };

    /**
     * Set the illustration 'visible' attribute to false. If notionId is undefined or not found, the currentIllsutration will be used.
    **/
    PhaseImage.prototype._setIllustrationInvisible = function setIllustrationInvisible (notionId) {
        if (notionId && this._illustrations[notionId]) this._illustrations[notionId].visible = false;
        else if (this._currentIllustration) this._currentIllustration.visible = false;
    };


    PhaseImage.prototype._computeCoords = function computeCoords () {
        
        if (!this._tracerPositions) {
            this._tracerPositions = {};
            if (this.game.gameConfig.globalVars) window.lookandlearn.tracerPositions = this._tracerPositions;
        }
        if (!this._framesCoords) {
            this._framesCoords = {};
            if (this.game.gameConfig.globalVars) window.lookandlearn.framesCoords = this._framesCoords;
        }

        var notionsCount = this._notions.length;
        var availableWidth = 1920 - 400 // 400 for left and right ui
        var sidesMargin = 30;
        var widthPerNotion = (availableWidth / notionsCount) - 2 * sidesMargin;

        for (var i = 0 ; i < notionsCount ; i++) {
            var lNotion = this._notions[i];

            var lCoords = {
                x      : 200 + i * (widthPerNotion + 2 * sidesMargin) + (sidesMargin + widthPerNotion/2),
                y      : 1000,
                width  : widthPerNotion,
                height : Math.min(450, widthPerNotion)
            };
            this._framesCoords[lNotion.id] = lCoords;

            var lPos = {
                x1 : lCoords.x,
                x2 : lCoords.x,
                y : 720
            };
            this._tracerPositions[lNotion.id] = lPos;
        }
    };

    PhaseImage.prototype._setTracerPositionToNotionX1 = function setTracerPositionToNotionX1 (notion) {
        this.tracerPosX = this._tracerPositions[notion.id].x1;
        this.tracerPosY = this._tracerPositions[notion.id].y;
    };

    PhaseImage.prototype._setupTracer = function setupTracerImagePhase (x, y) {

        this.startTracingDelay = null;
        this.secondsOfDelay = 0.8;
        var tracerScaleRatio = this.scaleRatio = 0.8;

        this.game.layouts = [new BotCanvasLayout(this.game, this.game.gameConfig.layouts.phase1Uppercase)];
        //Emitter.emit(Events.TRIGGER_LAYOUT, -1);

        this.tracingLayout = this.game.layouts[0];
        this.tracingLayout.name = "ImagePhase-BotLayout";
        //this.lowercase = this.game.layouts[1];
        if (this.game.gameConfig.globalVars) window.lookandlearn.bot1 = this.tracingLayout;
        this.imagePhaseStage.add(this.tracingLayout.group);
        //this.imagePhaseStage.add(this.lowercase.group);
        
        this.tracingLayout.group.scale.set(tracerScaleRatio, tracerScaleRatio);
        //this.lowercase.group.scale.set(0.5, 0.5);

        this.tracingLayout.group.position.set(x, y);
        //this.lowercase.group.position.set(1020, 850);
    };

    PhaseImage.prototype.onFirstTime = function onFirstTime () {
        this.onFirstTime = false;
        console.log("First Time playing a Look & Learn !");
    };

    PhaseImage.prototype.update = function phaseImageUpdate () {
        
        this.game.ui.update(); // the ui group is not added to world so we have to manually update it.

        this._updateTracing();
    };


    PhaseImage.prototype._updateTracing = function updateTracingImagePhase () {
        
        if (this.startTracingDelay === 0) {
            this.startBotTracing(this._notions[0]);
        }
        else if (this.startTracingDelay) this.startTracingDelay--;

        if (this.tracingOn) {
            this.tracingLayout.update();
        }
    }

    PhaseImage.prototype.startBotTracingAfterDelay = function startBotTracingAfterDelay () {
        this.startTracingDelay = Math.round(this.secondsOfDelay * 60);
        this._tracingFrames[this._currentNotion.id].easeIn();
        this._tracingFrames[51].easeIn();
        this._tracingFrames[52].easeIn();
        this._tracingFrames[53].easeIn();
        this._tracingFrames[54].easeIn();
    };

    PhaseImage.prototype.startBotTracing = function startBotTracing (notion) {
        
        this.startTracingDelay = null;
        console.log("Start Tracing");
        this.tracingOn = true;
        Emitter.on(Events.TRIGGER_LAYOUT, this.onFirstLetterTracingComplete);
        var value;
        if (notion.traceUppercase) {
            console.info("We will trace uppercase first");
            value = notion.textValue.toUpperCase();
        }
        else {
            console.info("We will trace lowercase now");
            value = notion.textValue.toLowerCase();
        }

        this.progression.setModel(value);
    };

    PhaseImage.prototype.onFirstLetterTracingComplete = function onFirstLetterTracingComplete (layoutId) {
        
        Emitter.off(Events.TRIGGER_LAYOUT, this.onFirstLetterTracingComplete);

        // if (layoutId === 4) {
        //     console.info("Bot Layout just finished first letter");
        // }
        // else {
        //     console.info("Unidentified Layout just finished a letter");
        // }

        if (this.notion.traceUppercase) { // if we had to trace uppercase, we have now to trace the lower case.
            
            this.freezeLetter(this.xLeftLetter, this.yLetter);

            console.info("We will trace lowercase now");

            this.tracingLayout.group.x = this._tracerPositions[this._currentNotion.id].x2;

            Emitter.on(Events.TRIGGER_LAYOUT, this.onSecondLetterTracingComplete);
            this.progression.setModel(this.notion.value.toLowerCase());
        }
        else {
            this.freezeLetter(this.xMidLetter, this.yLetter)
            this.endTracing();
        }
        
    };

    PhaseImage.prototype.onSecondLetterTracingComplete = function onSecondLetterTracingComplete (layoutId) {
        
        Emitter.off(Events.TRIGGER_LAYOUT, this.onSecondLetterTracingComplete);

        // if (layoutId === 4) {
        //     console.info("Bot Layout just finished 2nd letter");
        // }
        // else {
        //     console.info("Unidentified Layout just finished a letter");
        // }

        this.freezeLetter(this.xRightLetter, this.yLetter);

        this.endTracing();
    };

    PhaseImage.prototype.freezeLetter = function PhaseVideoFreezeLetter (x, y) {
        
        if (!this.frozenLetters) this.frozenLetters = [];

        var letterBitmapData = new Phaser.BitmapData(this.game, 'frozenLetter' + (this.frozenLetters.length + 1), 600*this.scaleRatio, 900*this.scaleRatio);
                                // source, x, y, width, height, tx, ty, newWidth, newHeight
        letterBitmapData.copy(this.tracingLayout.bitmap, 0, 0, 600, 900, 0, 0, 600*this.scaleRatio, 900*this.scaleRatio);
        var lImage = new Phaser.Image(this.game, x, y, letterBitmapData);
        
        this.frozenLetters.push(lImage);
        this.imagePhaseStage.add(lImage);
    };

    PhaseImage.prototype.endTracing = function PhaseImageEndTracing () {
        
        this.tracingOn = false;
        this.imagePhaseStage.remove(this.tracingLayout.group, true);
        this.tracingLayout = null;
        this.game.layouts = [];

        this.lettersFrame.inputEnabled = true;
        this.lettersFrame.events.onInputDown.add(this.onClickOnLetters, this);
        this.lettersFrame.bounce();
    };

    PhaseImage.prototype.onClickOnLetters = function (onClickOnLetters) {
        console.log("here on click");
        this.game.ui.disableUiMenu();
        this.sound = this.game.sound.play('illustrative_sound_'+ this.notion.value);
        this.sound.onStop.addOnce(this.enableNextStep, this);
    };

    PhaseImage.prototype.enableNextStep = function PhaseImageEnableNextStep () {
        this.game.ui.enableNext('Phase3Tracing');
    };

    PhaseImage.prototype.shutdown = function PhaseImageShutdown () {
        Emitter.listeners = {};
    };
    
    return PhaseImage;
});