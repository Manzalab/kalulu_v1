define([
    'phaser-bundle',
    '../ui',
    'eventemitter3',
    '../layouts',
    '../layouts/bot-canvas',
    '../tracing',
    '../events/emitter',
    '../events/events'
], function (
    Phaser,
    UI,
    EventEmitter,
    loadLayouts,
    BotCanvasLayout,
    Tracing,
    Emitter,
    Events
) {
    'use strict';

    /**
	 * PhaseVideo is a game phase where a video is played to teach something to the player
	 * @class
	**/
    function PhaseVideo (game) {
        console.log(game);
        this.game = game;
        console.log(this.game);
        Phaser.State.call(this);
        console.log(game);
        console.log(this.game);
        this.game = game;
        if (this.game.config.globalVars) window.lookandlearn.phaseVideo = this;
    }

    PhaseVideo.prototype = Object.create(Phaser.State.prototype);
    PhaseVideo.prototype.constructor = PhaseVideo;

    PhaseVideo.prototype.preload = function phaseVideoPreload () {
        
        var grapheme = this.game.config.pedagogicData.textValue;
        var pathToFolder = "";

        // 2 video to be played in this phase
        this.game.load.video('video_'+ grapheme + '_1', this.game.config.pedagogicData.video1);
        this.game.load.video('video_'+ grapheme + '_2', this.game.config.pedagogicData.video2);

        // 3 Kalulu speeches 
        this.game.load.audio('kaluluIntro',         'minigames/lookandlearn/assets/audio/kalulu/kalulu_intro_CommonCore01_' + this.game.config.disciplines[this.game.config.pedagogicData.discipline] + '.ogg');
        this.game.load.audio('kaluluHelp',          'minigames/lookandlearn/assets/audio/kalulu/kalulu_help_CommonCore01_' + this.game.config.disciplines[this.game.config.pedagogicData.discipline] + '.ogg');
        this.game.load.audio('kaluluGameOverWin',   'minigames/lookandlearn/assets/audio/kalulu/kalulu_end_CommonCore01_' + this.game.config.disciplines[this.game.config.pedagogicData.discipline] + '.ogg');
    };
    
    PhaseVideo.prototype.create = function phaseVideoCreate () {
        if (this.game.load.hasLoaded) console.info("PhaseVideo State has correctly completed loading.");

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

        // #### Stage
        this.videoPhaseStage = new Phaser.Group(this.game, this.game.world, 'videoPhaseStage');
        
        // #### Video
        this.videoTexture1 = new Phaser.Video(this.game, 'video_a_1');
        this.videoTexture2 = new Phaser.Video(this.game, 'video_a_2');
        this.video = new Phaser.Sprite(this.game, 960, 400, this.videoTexture1);
        this.video.inputEnabled = false;
        this.video.anchor.set(0.5, 0.5);
        var scaleRatio = 600/this.video.height;
        this.video.scale.set(scaleRatio, scaleRatio);
        this.videoPhaseStage.add(this.video);

        // #### Letters Frame
        this.frameTexture = new Phaser.BitmapData(this.game, 'lettersFrame', 900, 450);
        this.frameTexture.fill(255, 255, 255, 1);
        this.lettersFrame = new Phaser.Sprite(this.game, this.game.width/2, 1000, this.frameTexture);
        this.lettersFrame.name = "Letters Frame";
        this.lettersFrame.anchor.set(0.5, 0.5);
        this.lettersFrame.scale.set(0, 0);
        this.videoPhaseStage.add(this.lettersFrame);
        
        // #### Tracer
        this.startTracingDelay = null;
        this.secondsOfDelay = 0.8;

        this.game.layouts = [new BotCanvasLayout(this.game, this.game.config.layouts.phase1Uppercase)];
        //Emitter.emit(Events.TRIGGER_LAYOUT, -1);

        this.tracingLayout = this.game.layouts[0];
        this.tracingLayout.name = "VideoPhase-BotLayout";
        //this.lowercase = this.game.layouts[1];
        if (this.game.config.globalVars) window.lookandlearn.bot1 = this.tracingLayout;
        this.videoPhaseStage.add(this.tracingLayout.group);
        //this.videoPhaseStage.add(this.lowercase.group);
        var tracerScaleRatio = this.scaleRatio = 0.8;
        this.tracingLayout.group.scale.set(tracerScaleRatio, tracerScaleRatio);
        console.log(this.tracingLayout.group);
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

    PhaseVideo.prototype.update = function phaseVideoUpdate () {
        
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

    PhaseVideo.prototype.onFirstTime = function onFirstTime () {
        this.onFirstTime = false;
        console.log("First Time playing a Look & Learn !");
    };

    PhaseVideo.prototype.startTracingDemoAfterDelay = function startTracingDemoAfterDelay () {
        this.startTracingDelay = Math.round(this.secondsOfDelay * 60);
        this.startEaseInOfLettersFrame();
    };

    PhaseVideo.prototype.startTracingDemo = function startTracingDemo () {
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

    PhaseVideo.prototype.startEaseInOfLettersFrame = function startEaseInOfLettersFrame () {
        this.game.add.tween(this.lettersFrame.scale).to({x: 1.0, y: 1.0}, 800, Phaser.Easing.Bounce.Out, true);
    };

    PhaseVideo.prototype.makeBounceLettersFrame = function makeBounceLettersFrame () {
        this.lettersFrame.scale.set(1.25, 1.25);
        this.game.add.tween(this.lettersFrame.scale).to({x: 1.0, y: 1.0}, 800, Phaser.Easing.Bounce.Out, true);
    };

    PhaseVideo.prototype.onFirstLetterTracingComplete = function onFirstLetterTracingComplete (layoutId) {
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
        // this.videoPhaseStage.add(this.frozenFirstLetter);
        
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

    PhaseVideo.prototype.onSecondLetterTracingComplete = function onSecondLetterTracingComplete (layoutId) {
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
        // this.videoPhaseStage.add(this.frozenSecondLetter);


        this.endTracing();
        
    };

    PhaseVideo.prototype.freezeLetter = function PhaseVideoFreezeLetter (x, y) {
        if (!this.frozenLetters) this.frozenLetters = [];

        var letterBitmapData = new Phaser.BitmapData(this.game, 'frozenLetter' + (this.frozenLetters.length + 1), 600*this.scaleRatio, 900*this.scaleRatio);
                                // source, x, y, width, height, tx, ty, newWidth, newHeight
        letterBitmapData.copy(this.tracingLayout.bitmap, 0, 0, 600, 900, 0, 0, 600*this.scaleRatio, 900*this.scaleRatio);
        var lImage = new Phaser.Image(this.game, x, y, letterBitmapData);
        
        this.frozenLetters.push(lImage);
        this.videoPhaseStage.add(lImage);
    };

    PhaseVideo.prototype.endTracing = function PhaseVideoEndTracing () {
        
        this.tracingOn = false;
        this.videoPhaseStage.remove(this.tracingLayout.group, true);
        this.tracingLayout = null;
        this.game.layouts = [];

        this.lettersFrame.inputEnabled = true;
        this.lettersFrame.events.onInputDown.add(this.onClickOnLetters, this);
        this.makeBounceLettersFrame();
    };

    PhaseVideo.prototype.onClickOnLetters = function (onClickOnLetters) {
        console.log("here on click");
        this.game.ui.disableUiMenu();
        this.loadAndPlayVideo(this.videoTexture1, function () {

            this.loadAndPlayVideo(this.videoTexture2, this.enableNextStep.bind(this));
        }.bind(this));
    };

    PhaseVideo.prototype.loadAndPlayVideo = function PhaseVideoLoadAndPlayVideo (videoTexture, callback) {
        this.video.loadTexture(videoTexture, 0);
        videoTexture.onComplete.addOnce(callback, this);
        videoTexture.play(false);
    };

    PhaseVideo.prototype.enableNextStep = function PhaseVideoEnableNextStep () {
        this.game.ui.enableNext('Phase2Image');
    };

    PhaseVideo.prototype.shutdown = function PhaseVideoShutdown () {
        Emitter.listeners = {};
    }

    return PhaseVideo;
});