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
        
        // console.log(this.game.gameConfig.pedagogicData);
        var notion = this.notion = this.game.gameConfig.pedagogicData.data.notions[0];
        
        // 1 image and 1 sound to be played in this phase
        this.game.load.audio('illustrative_sound_' + notion.value, notion.sound);
        this.game.load.image('board', 'minigames/lookandlearn/assets/images/board.png');
        this.game.load.image('figures', 'minigames/lookandlearn/assets/images/figures.png');
        this.game.load.image('cell', 'minigames/lookandlearn/assets/images/cell.png');

        // 3 Kalulu speeches 
        this.game.load.audio('kaluluIntro',         'minigames/lookandlearn/assets/audio/kalulu/kalulu_intro_commoncore01_' + this.game.gameConfig.pedagogicData.discipline + '.ogg');
        this.game.load.audio('kaluluHelp',          'minigames/lookandlearn/assets/audio/kalulu/kalulu_help_commoncore01_' + this.game.gameConfig.pedagogicData.discipline + '.ogg');
        this.game.load.audio('kaluluGameOverWin',   'minigames/lookandlearn/assets/audio/kalulu/kalulu_end_commoncore01_' + this.game.gameConfig.pedagogicData.discipline + '.ogg');
    };
    
    PhaseOneMaths.prototype.create = function phaseOneMathsCreate () {
        // if (this.game.load.hasLoaded) console.info("PhaseOneMaths State has correctly completed loading.");

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
        this.frameTexture.fill(239, 241, 255, 1);
        this.lettersFrame = new Phaser.Sprite(this.game, this.game.width/2, 1000, this.frameTexture);
        this.lettersFrame.name = "Letters Frame";
        this.lettersFrame.anchor.set(0.5, 0.5);
        this.lettersFrame.scale.set(0, 0);
        this.imagePhaseStage.add(this.lettersFrame);

        // #### Image & Sound
        var scale = 1.75;
        this.board = new Phaser.Sprite(this.game, this.game.width/2, 400, 'board');
        this.cell = new Phaser.Sprite(this.game, 0, 0, 'cell');
        this.figures = new Phaser.Sprite(this.game, this.game.width/2, 400, 'figures');
        this.board.anchor.set(0.5, 0.5);
        this.board.scale.set(scale, scale);
        this.cell.anchor.set(0.5, 0.5);
        this.cell.scale.set(scale, scale);
        this.cell.visible = false;
        this.figures.anchor.set(0.5, 0.5);
        this.cellSize = (200-8)/5 * scale;
        this.figures.scale.set(scale, scale);
        this.imagePhaseStage.add(this.board);
        this.imagePhaseStage.add(this.cell);
        this.imagePhaseStage.add(this.figures);

        // #### Tracer
        this.startTracingDelay = null;
        this.secondsOfDelay = 0.8;

        this.game.layouts = [new BotCanvasLayout(this.game, this.game.gameConfig.layouts.phase1Uppercase)];
        //Emitter.emit(Events.TRIGGER_LAYOUT, -1);

        this.tracingLayout = this.game.layouts[0];
        this.tracingLayout.name = "ImagePhase-BotLayout";
        //this.lowercase = this.game.layouts[1];
        if (this.game.gameConfig.globalVars) window.lookandlearn.bot1 = this.tracingLayout;
        this.imagePhaseStage.add(this.tracingLayout.group);
        //this.imagePhaseStage.add(this.lowercase.group);
        var tracerScaleRatio = this.scaleRatio = 0.8;
        this.tracingLayout.group.scale.set(tracerScaleRatio, tracerScaleRatio);
        //this.lowercase.group.scale.set(0.5, 0.5);

        this.xLeftLetter    = 550;
        this.xMidLetter     = 700;
        this.xRightLetter   = 950;
        this.yLetter        = 720;

        var xValue = this.xMidLetter;
        
        this.tracingLayout.group.position.set(xValue, this.yLetter);
        //this.lowercase.group.position.set(1020, 850);

        this.progression = new Tracing.ProgressionHandler(this.game.gameConfig.progression, this.game);

        this.tracingOn = false;

        this.onFirstLetterTracingComplete = this.onFirstLetterTracingComplete.bind(this);

        // #### Events
        this.game.eventManager.once('introSequenceComplete', this.startTracingDemoAfterDelay, this);
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
            //##console.log('this.tracingOn : ' + this.tracingOn);
            this.tracingLayout.update();
        }

        // if (this.videoTexture1.playing) {

        // }
    };

    PhaseOneMaths.prototype.onFirstTime = function onFirstTime () {
        this.onFirstTime = false;
        // console.log("First Time playing a Look & Learn !");
    };

    PhaseOneMaths.prototype.startTracingDemoAfterDelay = function startTracingDemoAfterDelay () {
        this.startTracingDelay = Math.round(this.secondsOfDelay * 60);
        this.startEaseInOfLettersFrame();
    };

    PhaseOneMaths.prototype.startTracingDemo = function startTracingDemo () {
        this.startTracingDelay = null;
        // console.log("Start Tracing");
        this.tracingOn = true;
        Emitter.on(Events.TRIGGER_LAYOUT, this.onFirstLetterTracingComplete);
        var value = this.game.gameConfig.pedagogicData.data.notions[0].value;
        // console.log('[Phase 1 Maths] About to trace <' + value + '>');
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
            // console.info("Bot Layout just finished first letter");
        }
        else {
            // console.info("Unidentified Layout just finished a letter");
        }

        this.freezeLetter(this.xMidLetter, this.yLetter);
        this.endTracing();
    };

    PhaseOneMaths.prototype.onSecondLetterTracingComplete = function onSecondLetterTracingComplete (layoutId) {
        Emitter.off(Events.TRIGGER_LAYOUT, this.onSecondLetterTracingComplete);

        if (layoutId === 4) {
            // console.info("Bot Layout just finished 2nd letter");
        }
        else {
            // console.info("Unidentified Layout just finished a letter");
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
        // console.log('this.tracingOn : ' + this.tracingOn);
        this.imagePhaseStage.remove(this.tracingLayout.group, true);
        this.tracingLayout = null;
        this.game.layouts = [];

        this.lettersFrame.inputEnabled = true;
        this.lettersFrame.events.onInputDown.add(this.onClickOnLetters, this);
        this.makeBounceLettersFrame();
    };

    PhaseOneMaths.prototype.onClickOnLetters = function (onClickOnLetters) {
        // console.log("here on click");
        this.lettersFrame.inputEnabled = false;
        this.game.ui.disableUiMenu();
        this.sound = this.game.sound.play('illustrative_sound_'+ this.notion.value);
        this.sound.onStop.addOnce(this.moveCell, this);
    };

    PhaseOneMaths.prototype.moveCell = function moveCell () {
        this.cell.visible = true;
        var x0, y0;
        x0 = this.board.position.x - (4.5 * this.cellSize) ;
        y0 = this.board.position.y + (4.5 * this.cellSize) ;
        this.cell.position.set(x0, y0);

        var rows = Math.floor(this.notion.value/10);
        var cols = this.notion.value % 10;
        var tweens = [];
        var lTween = null;
        var startingPos, endingPos;

        for (var line = 0 ; line < rows ; line++) {
            startingPos = new Phaser.Point(x0, y0 - this.cellSize * line);
            endingPos = new Phaser.Point(startingPos.x + 9 * this.cellSize, startingPos.y);
            lTween = new Phaser.Tween(this.cell, this.game, this.game.tweens);
            lTween.to({ x: startingPos.x, y : startingPos.y }, 1, Phaser.Easing.Cubic.InOut);
            tweens.push(lTween);
            lTween = new Phaser.Tween(this.cell, this.game, this.game.tweens);
            lTween.to({ x: endingPos.x, y : endingPos.y }, 2000, Phaser.Easing.Cubic.InOut);
            tweens.push(lTween);
        }

        if (cols > 0) {
            startingPos = new Phaser.Point(x0, y0 - this.cellSize * rows);
            endingPos = new Phaser.Point(startingPos.x + ((cols - 1) * this.cellSize), startingPos.y);
            lTween = new Phaser.Tween(this.cell, this.game, this.game.tweens);
            lTween.to({ x: startingPos.x, y : startingPos.y }, 1, Phaser.Easing.Cubic.InOut);
            tweens.push(lTween);
            lTween = new Phaser.Tween(this.cell, this.game, this.game.tweens);
            lTween.to({ x: endingPos.x, y : endingPos.y }, 2000, Phaser.Easing.Cubic.InOut);
            tweens.push(lTween);
        }

        var intialScale = this.cell.scale.x;
        var scale = intialScale * 2;
        lTween = new Phaser.Tween(this.cell.scale, this.game, this.game.tweens);
        lTween.to({ x: scale, y : scale }, 500, Phaser.Easing.Cubic.InOut);
        tweens.push(lTween);
        lTween = new Phaser.Tween(this.cell.scale, this.game, this.game.tweens);
        lTween.to({ x: intialScale, y : intialScale }, 1000, Phaser.Easing.Bounce.Out);
        tweens.push(lTween);

        for (var i = tweens.length - 1 ; i >= 1 ; i--) {
            tweens[i - 1].chain(tweens[i]);
        }

        tweens[0].start();
        tweens[tweens.length - 1].onComplete.add(this.enableNextStep, this);
    };


    PhaseOneMaths.prototype.enableNextStep = function PhaseOneMathsEnableNextStep () {
        this.lettersFrame.inputEnabled = true;
        this.game.ui.enableNext('Phase2Image');
    };

    PhaseOneMaths.prototype.shutdown = function PhaseOneMathsShutdown () {
        Emitter.listeners = {};
    };


    module.exports = PhaseOneMaths;
})();