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
     * This class sequences the lifecycle of 2 inter-related zones : the top 'Illustrative' zone and the bottom 'Interactive' zone
     * @class
    **/
    function IllustrationPhase (game) {
        
        Phaser.State.call(this);
        this.game = game;
    }

    IllustrationPhase.prototype = Object.create(Phaser.State.prototype);
    IllustrationPhase.prototype.constructor = IllustrationPhase;
    
    IllustrationPhase.prototype.create = function illustrationPhaseCreate () {
        
        this._notionIds = this.game.gameConfig.pedagogicData.data.notionIds;
        
        this._initPhase();
        this._addPhaseStageToWorld();
        this._initZones();
    
        this._startPhase();
    };

    IllustrationPhase.prototype._initPhase = function initImagePhase () {
        
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

        this.game.ui.resetKaluluSpeeches(2); // may be called ui.prepareForNewPhase()

        if (this.firstTime) {
            this.onFirstTime();
        }
    }

    IllustrationPhase.prototype._addPhaseStageToWorld = function addImagePhaseStageToWorld () {
        
        this._imagePhaseStage = new Phaser.Group(this.game, this.game.world, 'ImagePhaseStage');
    }

    IllustrationPhase.prototype._initZones = function initPedagoImagePhase () {
        

        this._illustrationZone = new IllustrationZone(this.game, this._imagePhaseStage, this._notionIds);
        this._illustrationZone.show(this._notionIds[0]);

        var data = this.game.gameConfig.pedagogicData.data;
        var count = data.interactiveZone.buttons.length;
        var zoneData = {};
        this._notionsFlags = {};
        for (var i = 0 ; i < count ; i++) {
            zoneData[data.notionIds[i]] = data.interactiveZone.buttons[i];
            this._notionsFlags[data.notionIds[i]] = false;
        }
        this._interactiveZone = new InteractiveZone(this.game, this._imagePhaseStage, zoneData, this.onClickOnFrame.bind(this));
        this.game.eventManager.once('introSequenceComplete', this._startInteractiveZone, this);

        console.log('Zones Initialised');
    };

    IllustrationPhase.prototype._startInteractiveZone = function startInteractiveZone () {
        
        console.log("[IllustrationPhase] Intro Sequence Complete. Starting Interactive Zone.");
        this._interactiveZone.start();
    };

    IllustrationPhase.prototype._startPhase = function startPhase () {
        
        this.game.eventManager.emit('startGame');
    }

    IllustrationPhase.prototype.update = function illustrationPhaseUpdate () {
        
        this.game.ui.update(); // the ui group is not added to world so we have to manually update it.
    };

    IllustrationPhase.prototype.onClickOnFrame = function onClickOnFrame (eventData) {
        
        this._interactiveZone.disableInteractivity();
        this._flagNotionAsSeen(eventData.id);
        this._illustrationZone.show(eventData.id);

        this.sound = this.game.sound.play('notion_'+ eventData.id);

        this.sound.onStop.addOnce(this._checkNotionsFlags, this);
    };

    IllustrationPhase.prototype._flagNotionAsSeen = function flagNotionAsSeen (notion) {
        
        this._notionsFlags[notion] = true;

        this._allNotionsFlaggedAsSeen = true;
        for (var lNotion in this._notionsFlags) {
            if (!this._notionsFlags.hasOwnProperty(lNotion)) continue;
            if (!this._notionsFlags[lNotion]) {
                this._allNotionsFlaggedAsSeen = false;
                return;
            }
        }
    };

    IllustrationPhase.prototype._checkNotionsFlags = function checkNotionsFlags () {
        
        this._interactiveZone.enableInteractivity();

        if (this._allNotionsFlaggedAsSeen) {
            this.enableNextStep();
        }
        else {
            console.log(this._notionsFlags);
            this.game.ui.enableUiMenu();
        }
    };

    IllustrationPhase.prototype.enableNextStep = function IllustrationPhaseEnableNextStep () {
        
        this.game.ui.enableNext(this.game.stateNames.TRACING_PHASE);
    };

    IllustrationPhase.prototype.shutdown = function IllustrationPhaseShutdown () {
        
        var count = this._illustrationData.illustrations.length;
        for (var i = 0; i < count ; i++) {
            this.game.cache.removeImage('illustration_' + this._notionIds[i], this._illustrationData.illustrations[i].image);
            this.game.load.removeSound('sound_' + this._notionIds[i], this._illustrationData.illustrations[i].sound);
        }

        this.game.cache.removeSound('kaluluIntro');
        this.game.cache.removeSound('kaluluHelp');
        this.game.cache.removeSound('kaluluGameOverWin');
        
        this._notionIds        = null;
        this._illustrationData = null;
        this._interactionsData = null;

        Emitter.listeners = {};
    };
    

    IllustrationPhase.prototype.onFirstTime = function onFirstTime () {
        
        this.onFirstTime = false;
        console.log("First Time playing a Look & Learn !");
    };
    // IllustrationPhase.prototype.onClickOnLetters = function onClickOnLetters () {
    //     console.log("here on click");
    //     this.game.ui.disableUiMenu();
    //     this.sound = this.game.sound.play('illustrative_sound_'+ this.notion.value);
    //     this.sound.onStop.addOnce(this.enableNextStep, this);
    // };


    return IllustrationPhase;
});