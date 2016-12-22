define([
    'phaser-bundle',
    'common/src/ui',
    'eventemitter3',
    '../layouts',
    '../layouts/bot-canvas'
], function (
    Phaser,
    UI,
    EventEmitter,
    loadLayouts,
    BotCanvasLayout
) {
    'use strict';

    /**
     * PhaseTracing is a game phase where a video is played to teach something to the player
     * @class
    **/
    function PhaseTracing (game) {
        Phaser.State.call(this);
    }

    PhaseTracing.prototype = Object.create(Phaser.State.prototype);
    PhaseTracing.prototype.constructor = PhaseTracing;

    PhaseTracing.prototype.preload = function phaseTracingPreload () {
        
        var grapheme = this.grapheme = this.game.config.pedagogicData.textValue;
        var pathToFolder = "";
        
        // the grapheme sound
        //this.game.load.audio(this.game.config.pedagogicData.sound, this.game.config.pedagogicData.sound);

        // 3 Kalulu speeches 
        this.game.load.audio('kaluluIntro',         'lookandlearn/assets/audio/' + this.game.config.pedagogicData.language + '/kalulu/kalulu_intro_CommonCore03_' + this.game.config.disciplines[this.game.config.pedagogicData.discipline] + '.ogg');
        this.game.load.audio('kaluluHelp',          'lookandlearn/assets/audio/' + this.game.config.pedagogicData.language + '/kalulu/kalulu_help_CommonCore03_' + this.game.config.disciplines[this.game.config.pedagogicData.discipline] + '.ogg');
        this.game.load.audio('kaluluGameOverWin',   'lookandlearn/assets/audio/' + this.game.config.pedagogicData.language + '/kalulu/kalulu_end_CommonCore03_' + this.game.config.disciplines[this.game.config.pedagogicData.discipline] + '.ogg');
    }
    
    PhaseTracing.prototype.create = function phaseTracingCreate () {
        if (this.game.load.hasLoaded) console.info("PhaseTracing State has correctly completed loading.");

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
        this.tracingPhaseStage = new Phaser.Group(this.game, this.game.world, 'tracingPhaseStage');

        // #### Letters Frame
        this.frameTexture = new Phaser.BitmapData(this.game, 'lettersFrame', 900, 400);
        this.frameTexture.fill(255, 255, 255, 1);
        this.lettersFrame = new Phaser.Sprite(this.game, this.game.width/2, 1000, this.frameTexture);
        this.lettersFrame.name = "Letters Frame";
        this.lettersFrame.anchor.set(0.5, 0.5);
        this.lettersFrame.scale.set(0, 0);
        this.tracingPhaseStage.add(this.lettersFrame);


        // #### Tracer
        this.startTracingDelay = null;
        this.secondsOfDelay = 0.8;
        var options2 = {
            isBotOn : true,
            isPlayerOn : true,
            isDebugOn : false
        };
        
        loadLayouts(this.game, this.game.config, options2);
        Emitter.emit(Events.TRIGGER_LAYOUT, -1);
        for (var i = 0 ; i < this.game.layouts.length ; i++) {
            this.tracingPhaseStage.add(this.game.layouts[i].group);
        }

        this.progression = new Tracing.ProgressionHandler(this.game.config.progression, this.game);
        this.tracingOn = false;
        this.game.endOfTracing = this.endTracing.bind(this);

        // #### Events
        this.game.eventManager.on('introSequenceComplete', this.startTracingDemoAfterDelay, this);
        this.game.eventManager.emit('startGame');
    };

    PhaseTracing.prototype.prepareSeries = function phaseTracingPrepareSeries () {
        return {
            'A': { nbOfTimes: 2 },
            'a': { nbOfTimes: 2 }
        };
    };

    PhaseTracing.prototype.update = function phaseTracingUpdate () {
        
        this.game.ui.update(); // the ui group is not added to world so we have to manually update it.

        if (this.firstTime) {
            this.onFirstTime();
        }

        if (this.startTracingDelay === 0) {
            this.startTracingDemo();
        }
        else if (this.startTracingDelay) this.startTracingDelay--;

        if (this.tracingOn) {
            if(this.game.layouts !== undefined){
                var i = 0;
                for(i; i < this.game.layouts.length; i++){
                    if(this.game.layouts[i].enabled){
                        this.game.layouts[i].update();
                    }
                }
            }
        }
    };

    PhaseTracing.prototype.onFirstTime = function onFirstTime () {
        this.onFirstTime = false;
        console.log("First Time playing a Look & Learn !");
    };

    PhaseTracing.prototype.startTracingDemoAfterDelay = function startTracingDemoAfterDelay () {
        this.startTracingDelay = Math.round(this.secondsOfDelay * 60);
    };

    PhaseTracing.prototype.startTracingDemo = function startTracingDemo () {
        this.startTracingDelay = null;
        console.log("Start Tracing");
        this.tracingOn = true;
        this.progression.setSeries(this.prepareSeries());
    };

    PhaseTracing.prototype.endTracing = function PhaseTracingEndTracing () {
        console.info("tracingPhase end of Trace");
        this.tracingOn = false;
        this.game.rafiki.save();
        this.game.ui.enableNext();
    };
    
    PhaseTracing.prototype.enableNextStep = function PhaseTracingEnableNextStep () {
        this.game.ui.enableNext();
    };

    PhaseTracing.prototype.shutdown = function PhaseTracingShutdown () {
        Emitter.listeners = {};
    };

    return PhaseTracing;
});