(function () {
    
    'use strict';
    
    var UI              = require('../ui');
    var EventEmitter    = require('eventemitter3');
    var loadLayouts     = require('../layouts');
    var BotCanvasLayout = require('../layouts/bot-canvas');
    var Tracing         = require('../tracing');
    var Emitter         = require('../events/emitter');
    var Events          = require('../events/events');

    /**
     * PhaseOneMaths is a game phase where a 100-cells-gameboard is used to show the value of numbers
     * @class
    **/
    function PhaseOneMaths (game) {
        Phaser.State.call(this);
        this.game = game;
    }

    PhaseOneMaths.prototype = Object.create(Phaser.State.prototype);
    PhaseOneMaths.prototype.constructor = PhaseOneMaths;


    /**
     * This function is called by Phaser
    **/
    PhaseOneMaths.prototype.preload = function phaseOneMathsPreload () {
        
        console.log(this.game.gameConfig.pedagogicData);
        var notion = this.notion = this.game.config.pedagogicData;
        var pathToFolder = "";

        // 1 image and 1 sound to be played in this phase
        this.game.load.audio('illustrative_sound_'+ grapheme, this.game.config.pedagogicData.illustrativeSound);
        this.game.load.image('illustrative_image_'+ grapheme, this.game.config.pedagogicData.image);

        // 3 Kalulu speeches 
        this.game.load.audio('kaluluIntro',         'minigames/lookandlearn/assets/audio/kalulu/kalulu_intro_CommonCore02_' + this.game.config.disciplines[this.game.config.pedagogicData.discipline] + '.ogg');
        this.game.load.audio('kaluluHelp',          'minigames/lookandlearn/assets/audio/kalulu/kalulu_help_CommonCore02_' + this.game.config.disciplines[this.game.config.pedagogicData.discipline] + '.ogg');
        this.game.load.audio('kaluluGameOverWin',   'minigames/lookandlearn/assets/audio/kalulu/kalulu_end_CommonCore02_' + this.game.config.disciplines[this.game.config.pedagogicData.discipline] + '.ogg');
    };
    
    PhaseOneMaths.prototype.create = function phaseOneMathsCreate () {
        if (this.game.load.hasLoaded) console.info("PhaseOneMaths State has correctly completed loading.");

        // #### Init
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
            this.game.ui.resetKaluluSpeeches();
        }

        // #### Stage
        this.imagePhaseStage = new Phaser.Group(this.game, this.game.world, 'imagePhaseStage');

        // #### Letters Frame
        this.frameTexture = new Phaser.BitmapData(this.game, 'lettersFrame', 900, 450);
        this.frameTexture.fill(255, 255, 255, 1);
        this.lettersFrame = new Phaser.Sprite(this.game, this.game.width/2, 1000, this.frameTexture);
        this.lettersFrame.name = "Letters Frame";
        this.lettersFrame.anchor.set(0.5, 0.5);
        this.lettersFrame.scale.set(0, 0);
        this.imagePhaseStage.add(this.lettersFrame);

        // #### Image & Sound
        this.image = new Phaser.Sprite(this.game, 960, 400, 'illustrative_image_' + this.grapheme);
        this.image.anchor.set(0.5, 0.5);
        var scaleRatio = 600/this.image.height;
        this.image.scale.set(scaleRatio, scaleRatio);
        this.imagePhaseStage.add(this.image);

        // #### Tracer
        this.startTracingDelay = null;
        this.secondsOfDelay = 0.8;

        this.game.layouts = [new BotCanvasLayout(this.game, this.game.config.layouts.phase1Uppercase)];
        //Emitter.emit(Events.TRIGGER_LAYOUT, -1);

        this.tracingLayout = this.game.layouts[0];
        this.tracingLayout.name = "ImagePhase-BotLayout";
        //this.lowercase = this.game.layouts[1];
        if (this.game.config.globalVars) window.lookandlearn.bot1 = this.tracingLayout;
        this.imagePhaseStage.add(this.tracingLayout.group);
        //this.imagePhaseStage.add(this.lowercase.group);
        var tracerScaleRatio = this.scaleRatio = 0.8;
        this.tracingLayout.group.scale.set(tracerScaleRatio, tracerScaleRatio);
        //this.lowercase.group.scale.set(0.5, 0.5);

        this.xLeftLetter    = 550;
        this.xMidLetter     = 750;
        this.xRightLetter   = 950;
        this.yLetter        = 720;

        var xValue;
        if (this.game.config.pedagogicData.traceUppercase) {
            console.info("We will trace uppercase and lower case");
            xValue = this.xLeftLetter;
        }
        else {
            console.info("We will trace only lower case");
            xValue = this.xMidLetter;
        }
        this.tracingLayout.group.position.set(xValue, this.yLetter);
        //this.lowercase.group.position.set(1020, 850);

        this.progression = new Tracing.ProgressionHandler(this.game.config.progression, this.game);

        this.tracingOn = false;

        this.onFirstLetterTracingComplete = this.onFirstLetterTracingComplete.bind(this);
        this.onSecondLetterTracingComplete = this.onSecondLetterTracingComplete.bind(this);

        // #### Events
        this.game.eventManager.on('introSequenceComplete', this.startTracingDemoAfterDelay, this);
        this.game.eventManager.emit('startGame');
    };

    PhaseOneMaths.prototype.update = function phaseOneMathsUpdate () {
        
        this.game.ui.update(); // the ui group is not added to world so we have to manually update it.

        if (this.firstTime) {
            this.onFirstTime();
        }

        if (this.startTracingDelay === 0) {
            this.startTracingDemo();
        }
        else if (this.startTracingDelay) this.startTracingDelay--;

        if (this.tracingOn) {
            this.tracingLayout.update();
        }

        // if (this.videoTexture1.playing) {

        // }
    };

    PhaseOneMaths.prototype.onFirstTime = function onFirstTime () {
        this.onFirstTime = false;
        console.log("First Time playing a Look & Learn !");
    };

    PhaseOneMaths.prototype.startTracingDemoAfterDelay = function startTracingDemoAfterDelay () {
        this.startTracingDelay = Math.round(this.secondsOfDelay * 60);
        this.startEaseInOfLettersFrame();
    };

    PhaseOneMaths.prototype.startTracingDemo = function startTracingDemo () {
        this.startTracingDelay = null;
        console.log("Start Tracing");
        this.tracingOn = true;
        Emitter.on(Events.TRIGGER_LAYOUT, this.onFirstLetterTracingComplete);
        var value;
        if (this.game.config.pedagogicData.traceUppercase) {
            console.info("We will trace uppercase first");
            value = this.game.config.pedagogicData.textValue.toUpperCase();
        }
        else {
            console.info("We will trace lowercase now");
            value = this.game.config.pedagogicData.textValue.toLowerCase();
        }

        this.progression.setModel(value);
    };

    PhaseOneMaths.prototype.startEaseInOfLettersFrame = function startEaseInOfLettersFrame () {
        this.game.add.tween(this.lettersFrame.scale).to({x: 1.0, y: 1.0}, 800, Phaser.Easing.Bounce.Out, true);
    };

    PhaseOneMaths.prototype.makeBounceLettersFrame = function makeBounceLettersFrame () {
        this.lettersFrame.scale.set(1.25, 1.25);
        this.game.add.tween(this.lettersFrame.scale).to({x: 1.0, y: 1.0}, 800, Phaser.Easing.Bounce.Out, true);
    };

    PhaseOneMaths.prototype.onFirstLetterTracingComplete = function onFirstLetterTracingComplete (layoutId) {
        Emitter.off(Events.TRIGGER_LAYOUT, this.onFirstLetterTracingComplete);

        if (layoutId === 4) {
            console.info("Bot Layout just finished first letter");
        }
        else {
            console.info("Unidentified Layout just finished a letter");
        }

        
        // var letterBitmapData = new Phaser.BitmapData(this.game, 'frozenFirstLetter', 300, 300);
        // // source, x, y, width, height, tx, ty, newWidth, newHeight
        // letterBitmapData.copy(this.tracingLayout.bitmap, 0, 0, 600, 600, 0, 0, 300, 300);
        // this.frozenFirstLetter = new Phaser.Image(this.game, 600, 850, letterBitmapData);
        // this.imagePhaseStage.add(this.frozenFirstLetter);
        
        if (this.game.config.pedagogicData.traceUppercase) { // if we had to trace uppercase, we have now to trace the lower case.
            
            this.freezeLetter(this.xLeftLetter, this.yLetter);

            console.info("We will trace lowercase now");

            this.tracingLayout.group.x = this.xRightLetter;

            Emitter.on(Events.TRIGGER_LAYOUT, this.onSecondLetterTracingComplete);
            this.progression.setModel(this.game.config.pedagogicData.textValue.toLowerCase());
        }
        else {
            this.freezeLetter(this.xMidLetter, this.yLetter)
            this.endTracing();
        }
        
    };

    PhaseOneMaths.prototype.onSecondLetterTracingComplete = function onSecondLetterTracingComplete (layoutId) {
        Emitter.off(Events.TRIGGER_LAYOUT, this.onSecondLetterTracingComplete);

        if (layoutId === 4) {
            console.info("Bot Layout just finished 2nd letter");
        }
        else {
            console.info("Unidentified Layout just finished a letter");
        }

        this.freezeLetter(this.xRightLetter, this.yLetter);
        // var letterBitmapData = new Phaser.BitmapData(this.game, 'frozenSecondLetter', 300, 300);
        //                         // source, x, y, width, height, tx, ty, newWidth, newHeight
        // letterBitmapData.copy(this.tracingLayout.bitmap, 0, 0, 600, 600, 0, 0, 300, 300);
        // this.frozenSecondLetter = new Phaser.Image(this.game, 1020, 850, letterBitmapData);
        // this.imagePhaseStage.add(this.frozenSecondLetter);


        this.endTracing();
        
    };

    PhaseOneMaths.prototype.freezeLetter = function PhaseVideoFreezeLetter (x, y) {
        if (!this.frozenLetters) this.frozenLetters = [];

        var letterBitmapData = new Phaser.BitmapData(this.game, 'frozenLetter' + (this.frozenLetters.length + 1), 600*this.scaleRatio, 900*this.scaleRatio);
                                // source, x, y, width, height, tx, ty, newWidth, newHeight
        letterBitmapData.copy(this.tracingLayout.bitmap, 0, 0, 600, 900, 0, 0, 600*this.scaleRatio, 900*this.scaleRatio);
        var lImage = new Phaser.Image(this.game, x, y, letterBitmapData);
        
        this.frozenLetters.push(lImage);
        this.imagePhaseStage.add(lImage);
    };

    PhaseOneMaths.prototype.endTracing = function PhaseOneMathsEndTracing () {
        
        this.tracingOn = false;
        this.imagePhaseStage.remove(this.tracingLayout.group, true);
        this.tracingLayout = null;
        this.game.layouts = [];

        this.lettersFrame.inputEnabled = true;
        this.lettersFrame.events.onInputDown.add(this.onClickOnLetters, this);
        this.makeBounceLettersFrame();
    };

    PhaseOneMaths.prototype.onClickOnLetters = function (onClickOnLetters) {
        console.log("here on click");
        this.game.ui.disableUiMenu();
        this.sound = this.game.sound.play('illustrative_sound_'+ this.grapheme);
        this.sound.onStop.addOnce(this.enableNextStep, this);
    };

    PhaseOneMaths.prototype.enableNextStep = function PhaseOneMathsEnableNextStep () {
        this.game.ui.enableNext('Phase3Tracing');
    };

    PhaseOneMaths.prototype.shutdown = function PhaseOneMathsShutdown () {
        Emitter.listeners = {};
    }


    module.exports = PhaseOneMaths;
})();