define([
    '../ui',
    '../graphic_objects/illustration-zone',
    '../graphic_objects/interactive-zone'
], function (
    UI,
    IllustrationZone,
    InteractiveZone
) {
    'use strict';

    /**
     * IllustrationPhase is a game phase where images are shown to illustrate notions.
     * @class
    **/
    function IllustrationPhase (game) {
        
        Phaser.State.call(this);
        this.game = game;
    }

    IllustrationPhase.prototype = Object.create(Phaser.State.prototype);
    IllustrationPhase.prototype.constructor = IllustrationPhase;

    IllustrationPhase.prototype.preload = function illustrationPhasePreload () {
        
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
    
    IllustrationPhase.prototype.create = function illustrationPhaseCreate () {
        
        if (this.game.load.hasLoaded) console.info("IllustrationPhase State has completed loading.");

        this._initPhase();
        this._addPhaseStageToWorld();
        this._initPedago();
    
        this.game.eventManager.emit('startGame');
    };

    IllustrationPhase.prototype._initPhase = function initImagePhase () {
        
        //GamePhase._init.call(this);
        if(this.game.gameConfig.globalVars) window.lookandlearn.imagePhase = this;

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

    IllustrationPhase.prototype._addPhaseStageToWorld = function addImagePhaseStageToWorld () {
        
        this._imagePhaseStage = new Phaser.Group(this.game, this.game.world, 'ImagePhaseStage');
    }

    IllustrationPhase.prototype._initPedago = function initPedagoImagePhase () {
        
        this._illustrationZone = new IllustrationZone(this.game, this._imagePhaseStage, this._notions);
        this._illustrationZone.show(this._notions[0].id);

        this._interactiveZone = new InteractiveZone(this.game, this._imagePhaseStage, this._notions, this.onClickOnFrame.bind(this));
        this.game.eventManager.once('introSequenceComplete', this._initInteractiveZone, this);
        console.log('Pedago Inited');
    };


    IllustrationPhase.prototype._initInteractiveZone = function _initInteractiveZone () {
        console.log("[State IllustrationPhase] Intro Sequence Complete. Starting Interactive Zone.");
        this._interactiveZone.start();
    };



    IllustrationPhase.prototype.update = function illustrationPhaseUpdate () {
        
        this.game.ui.update(); // the ui group is not added to world so we have to manually update it.
    };

    IllustrationPhase.prototype.onClickOnFrame = function onClickOnFrame (eventData) {
        console.log("here on click on Frame");
        console.log(eventData);
        this._interactiveZone.disableInteractivity();
        this._interactiveZone.checkNotion(eventData.notionId);
        this._illustrationZone.show(eventData.notionId);
        this.sound = this.game.sound.play('illustrative_sound_'+ eventData.notionId);
        this.sound.onStop.addOnce(this._interactiveZone.enableInteractivity, this._interactiveZone);
    };

    IllustrationPhase.prototype.enableNextStep = function IllustrationPhaseEnableNextStep () {
        
        this.game.ui.enableNext('Phase3Tracing');
    };

    IllustrationPhase.prototype.shutdown = function IllustrationPhaseShutdown () {
        
        Emitter.listeners = {};
    };
    

    // IllustrationPhase.prototype.onFirstTime = function onFirstTime () {
    //     this.onFirstTime = false;
    //     console.log("First Time playing a Look & Learn !");
    // };
    // IllustrationPhase.prototype.onClickOnLetters = function onClickOnLetters () {
    //     console.log("here on click");
    //     this.game.ui.disableUiMenu();
    //     this.sound = this.game.sound.play('illustrative_sound_'+ this.notion.value);
    //     this.sound.onStop.addOnce(this.enableNextStep, this);
    // };


    return IllustrationPhase;
});