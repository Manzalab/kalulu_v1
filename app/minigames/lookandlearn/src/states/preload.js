define([], function () {
    
    'use strict';
    
    function Preload (game) {
        Phaser.State.call(this);
        this.game = game;
    }

    Preload.prototype = Object.create(Phaser.State.prototype);
    Preload.prototype.constructor = Preload;

    Preload.prototype.create = function createPreloadState () {

        this._pedagogicData = this.game.rafiki.getPedagogicData();
        this.game.gameConfig.pedagogicData = this._pedagogicData;
        this.game.discipline = this._pedagogicData.discipline;

        this._startLoading();
    };

    Preload.prototype._startLoading = function startLoading () {

        this.game.load.onLoadComplete.add(this._onComplete, this);

        this._addCommonAssets();
        this._addSpecificAssets();
        this._addPedagogicAssets();

        this.game.load.start();
    };

    Preload.prototype._addCommonAssets = function preloadAddSharedAssets() {

        //UI 
        this.game.load.image('black_overlay', 'minigames/common/assets/images/ui/pause.png');
        this.game.load.atlasJSONHash('ui', 'minigames/common/assets/images/ui/ui.png', 'minigames/common/assets/images/ui/ui.json');

        //KaluluGraphics
        this.game.load.atlasJSONHash('kaluluIntro', 'minigames/common/assets/images/kalulu_animations/kaluluIntro.png', 'minigames/common/assets/images/kalulu_animations/kaluluIntro.json');
        this.game.load.atlasJSONHash('kaluluOutro', 'minigames/common/assets/images/kalulu_animations/kaluluOutro.png', 'minigames/common/assets/images/kalulu_animations/kaluluOutro.json');
        this.game.load.atlasJSONHash('kaluluIdle1', 'minigames/common/assets/images/kalulu_animations/kaluluIdle1.png', 'minigames/common/assets/images/kalulu_animations/kaluluIdle1.json');
        this.game.load.atlasJSONHash('kaluluIdle2', 'minigames/common/assets/images/kalulu_animations/kaluluIdle2.png', 'minigames/common/assets/images/kalulu_animations/kaluluIdle2.json');
        this.game.load.atlasJSONHash('kaluluSpeaking1', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking1.png', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking1.json');
        this.game.load.atlasJSONHash('kaluluSpeaking2', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking2.png', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking2.json');

        //General Audio
        this.game.load.audio('menuNo'   , 'minigames/common/assets/audio/sfx/ButtonCancel.ogg');
        this.game.load.audio('menuYes'  , 'minigames/common/assets/audio/sfx/ButtonOK.ogg');
        this.game.load.audio('winGame'  , 'minigames/common/assets/audio/sfx/GameOverWin.ogg');
        this.game.load.audio('loseGame' , 'minigames/common/assets/audio/sfx/GameOverLose.ogg');
        this.game.load.audio('kaluluOn' , 'minigames/common/assets/audio/sfx/KaluluOn.ogg');
        this.game.load.audio('kaluluOff', 'minigames/common/assets/audio/sfx/KaluluOff.ogg');
        this.game.load.audio('menu'     , 'minigames/common/assets/audio/sfx/OpenPopin.ogg');           
    };

    Preload.prototype._addSpecificAssets = function preloadAddSpecificAssets () {
        
        this.game.load.json('layouts'           , 'minigames/lookandlearn/assets/config/layouts.json');
        this.game.load.json('progression'       , 'minigames/lookandlearn/assets/config/progression.json');
        this.game.load.json('game'              , 'minigames/lookandlearn/assets/config/game.json');
        this.game.load.json('audio'             , 'minigames/lookandlearn/assets/config/audio.json');            
        this.game.load.json('config'            , 'minigames/lookandlearn/assets/config/config.json');            
        this.game.load.json('letters-descriptor', 'minigames/lookandlearn/assets/config/letters-descriptor.json');
    };

    Preload.prototype._addPedagogicAssets = function preloadAddPedagogicAssets() {
        
        this._addKaluluSounds(this._pedagogicData.discipline);
        
        if (this._pedagogicData.discipline === 'maths')  {
            this._addMathsAssets();
        }
        else if (this._pedagogicData.discipline === 'language')  {
            this._addLanguageAssets();
        }
        else {
            console.error(this._pedagogicData.discipline + ' isnot a valid Discipline Name');
        }
    };
    
    Preload.prototype._addKaluluSounds = function preloaderAddKaluluSounds (discipline) {

        if (this.game.gameConfig.tutoEnabled) {
            this.game.load.audio('kaluluIntro1', 'minigames/lookandlearn/assets/audio/kalulu/kalulu_intro_commoncore01_' + discipline + '.ogg');
            this.game.load.audio('kaluluIntro2', 'minigames/lookandlearn/assets/audio/kalulu/kalulu_intro_commoncore02_' + discipline + '.ogg');
            this.game.load.audio('kaluluIntro3', 'minigames/lookandlearn/assets/audio/kalulu/kalulu_intro_commoncore03_' + discipline + '.ogg');
        }

        this.game.load.audio('kaluluHelp1', 'minigames/lookandlearn/assets/audio/kalulu/kalulu_help_commoncore01_' + discipline + '.ogg');
        this.game.load.audio('kaluluHelp2', 'minigames/lookandlearn/assets/audio/kalulu/kalulu_help_commoncore02_' + discipline + '.ogg');
        this.game.load.audio('kaluluHelp3', 'minigames/lookandlearn/assets/audio/kalulu/kalulu_help_commoncore03_' + discipline + '.ogg');
        
        this.game.load.audio('kaluluGameOverWin1', 'minigames/lookandlearn/assets/audio/kalulu/kalulu_end_commoncore01_' + discipline + '.ogg');
        this.game.load.audio('kaluluGameOverWin2', 'minigames/lookandlearn/assets/audio/kalulu/kalulu_end_commoncore02_' + discipline + '.ogg');
        this.game.load.audio('kaluluGameOverWin3', 'minigames/lookandlearn/assets/audio/kalulu/kalulu_end_commoncore03_' + discipline + '.ogg');
    };

    Preload.prototype._addMathsAssets = function preloadAddMathsAssets() {
        
        this.game.load.image('board', 'minigames/lookandlearn/assets/images/board.png');
        this.game.load.image('figures', 'minigames/lookandlearn/assets/images/figures.png');
        this.game.load.image('cell', 'minigames/lookandlearn/assets/images/cell.png');

        var count = this._pedagogicData.data.illustrationPhase.illustrations.length;
        var key, assetsPaths;
        for (var i = 0; i < count; i++) {

            key = 'notion_' + this._pedagogicData.data.notionIds[i];
            assetsPaths = this._pedagogicData.data.illustrationPhase.illustrations[i];
            
            this.game.load.image(key, assetsPaths.image);
            this.game.load.audio(key, assetsPaths.sound);
        }

    };

    Preload.prototype._addLanguageAssets = function preloadAddLanguageAssets() {
        
        var data = this._pedagogicData.data;
        var videoSequence = data.videoPhase.sequence;
        var i = 0;
        for (i = 0 ; i < videoSequence.length ; i++) {
            this.game.load.video('video_'+ data.notionIds[0] + '_' + (i+1), videoSequence[i]);
        }

        var count = this._pedagogicData.data.illustrationPhase.illustrations.length;
        var key, assetsPaths;
        for (i = 0; i < count; i++) {

            key = 'notion_' + this._pedagogicData.data.notionIds[i];
            assetsPaths = this._pedagogicData.data.illustrationPhase.illustrations[i];
            
            this.game.load.image(key, assetsPaths.image);
            this.game.load.audio(key, assetsPaths.sound);
        }
    };

    Preload.prototype._onComplete = function onPreloadComplete () {
        
        this.game.load.onLoadComplete.remove(this._onComplete, this);

        this.game.gameConfig.layouts      = this.game.cache.getJSON('layouts');
        this.game.gameConfig.progression  = this.game.cache.getJSON('progression');
        this.game.gameConfig.game         = this.game.cache.getJSON('game');
        this.game.gameConfig.audio        = this.game.cache.getJSON('audio');
        this.game.gameConfig.letters      = this.game.cache.getJSON('letters-descriptor');
        

        var stateName = "";

        if (this._pedagogicData.discipline === 'language') {
            // stateName = this.game.stateNames.VIDEO_PHASE;
            stateName = this.game.stateNames.ILLUSTRATION_PHASE;
        }
        else if (this._pedagogicData.discipline === 'maths') {
            // stateName = this.game.stateNames.BOARD_GAME_PHASE;
            stateName = this.game.stateNames.ILLUSTRATION_PHASE;
        }
        
        this.state.start(stateName);
    };

    Preload.prototype.shutdown = function shutdownPreload () {
        this._pedagogicData = null;
        this.game.cache.removeImage('preloaderBar');
        this.game = null;
    };

    return Preload;
});
