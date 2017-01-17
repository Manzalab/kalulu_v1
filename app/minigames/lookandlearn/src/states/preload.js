define([
    'phaser-bundle'
], function (
    Phaser
) {
    'use strict';
    
    /**
	 * Boot is in charge of the boot options
	 * @class
     * @memberof Template
	 * @param game {Phaser.Game} game instance
	**/
    function PreloadState (game) {
        this.game = game;
    }

    /**
     * Load assets to be used later in the preloader
    **/
    PreloadState.prototype.preload = function preloadStatePreload() {

        this.loadSpecificAssets();
        this.loadSharedAssets();
    };

    /**
     * Add to the loading queue the assets specific to this module
    **/
    PreloadState.prototype.loadSpecificAssets = function preloadStateLoadSpecificAssets () {
        
        this.game.load.json('layouts'           , 'minigames/lookandlearn/assets/config/layouts.json');
        this.game.load.json('progression'       , 'minigames/lookandlearn/assets/config/progression.json');
        this.game.load.json('game'              , 'minigames/lookandlearn/assets/config/game.json');
        this.game.load.json('audio'             , 'minigames/lookandlearn/assets/config/audio.json');            
        this.game.load.json('config'            , 'minigames/lookandlearn/assets/config/config.json');            
        this.game.load.json('letters-descriptor', 'minigames/lookandlearn/assets/config/letters-descriptor.json');
        console.log(this.game.gameConfig);
        this.game.load.audio(this.game.gameConfig.pedagogicData.sound, this.game.gameConfig.pedagogicData.sound);
    };

    /**
     * Add to the loading queue the assets specific generic to all minigames modules
    **/
    PreloadState.prototype.loadSharedAssets = function preloadStateLoadSharedAssets() {

        //UI 
        this.game.load.image('black_overlay', 'minigames/common/assets/images/ui/pause.png');
        this.game.load.atlasJSONHash('ui', 'minigames/common/assets/images/ui/ui.png', 'minigames/common/assets/images/ui/ui.json');

        //FX 
        this.game.load.atlasJSONHash('fx', 'minigames/common/assets/images/fx/fx.png', 'minigames/common/assets/images/fx/fx.json');
        this.game.load.image('wrong', 'minigames/common/assets/images/fx/wrong.png');

        //KaluluGraphics
        this.game.load.atlasJSONHash('kaluluIntro', 'minigames/common/assets/images/kalulu_animations/kaluluIntro.png', 'minigames/common/assets/images/kalulu_animations/kaluluIntro.json');
        this.game.load.atlasJSONHash('kaluluOutro', 'minigames/common/assets/images/kalulu_animations/kaluluOutro.png', 'minigames/common/assets/images/kalulu_animations/kaluluOutro.json');
        this.game.load.atlasJSONHash('kaluluIdle1', 'minigames/common/assets/images/kalulu_animations/kaluluIdle1.png', 'minigames/common/assets/images/kalulu_animations/kaluluIdle1.json');
        this.game.load.atlasJSONHash('kaluluIdle2', 'minigames/common/assets/images/kalulu_animations/kaluluIdle2.png', 'minigames/common/assets/images/kalulu_animations/kaluluIdle2.json');
        this.game.load.atlasJSONHash('kaluluSpeaking1', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking1.png', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking1.json');
        this.game.load.atlasJSONHash('kaluluSpeaking2', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking2.png', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking2.json');

        //General Audio
        this.game.load.audio('menuNo', 'minigames/common/assets/audio/sfx/ButtonCancel.ogg');
        this.game.load.audio('menuYes', 'minigames/common/assets/audio/sfx/ButtonOK.ogg');
        this.game.load.audio('winGame', 'minigames/common/assets/audio/sfx/GameOverWin.ogg');
        this.game.load.audio('loseGame', 'minigames/common/assets/audio/sfx/GameOverLose.ogg');
        this.game.load.audio('kaluluOn', 'minigames/common/assets/audio/sfx/KaluluOn.ogg');
        this.game.load.audio('kaluluOff', 'minigames/common/assets/audio/sfx/KaluluOff.ogg');
        this.game.load.audio('menu', 'minigames/common/assets/audio/sfx/OpenPopin.ogg');
        this.game.load.audio('right', 'minigames/common/assets/audio/sfx/ResponseCorrect.ogg');
        this.game.load.audio('wrong', 'minigames/common/assets/audio/sfx/ResponseIncorrect.ogg');            
    };

    /**
     * Stores the config Json in the this.game.gameConfig object
    **/
    PreloadState.prototype.create = function preloadStateCreate () {
        
        //if (this.game.load.hasLoaded) console.info("Preload State has correctly completed loading.");
        
        this.game.gameConfig.layouts      = this.game.cache.getJSON('layouts');
        this.game.gameConfig.progression  = this.game.cache.getJSON('progression');
        this.game.gameConfig.game         = this.game.cache.getJSON('game');
        this.game.gameConfig.audio        = this.game.cache.getJSON('audio');
        this.game.gameConfig.letters      = this.game.cache.getJSON('letters-descriptor');
        // console.log('before');
        this.game.add.audio(this.game.gameConfig.pedagogicData.sound);
        // console.log('after');
        console.log(this.game.rafiki);
        var discipline = this.game.gameConfig.pedagogicData.discipline;
        if (discipline === 'language') {
            // console.info("Preload Complete, Starting Phase1Video...");
            this.state.start('Phase1Video');
        }
        else if (discipline === 'maths') {
            var lesson = this.game.gameConfig.pedagogicData.data.notions[0].textValue;
            console.log(this.game.gameConfig.pedagogicData.data.notions[0]);
            console.log(lesson);
            if(lesson === "0" || lesson == '3-2-1' || lesson === '+' || lesson === '-' || lesson === '+2' || lesson === '+5' || lesson === '+10') {
                // console.log('0, skipping phase 1');
                this.state.start('Phase2Image');
                return;
            }
            // console.info("Preload Complete, Starting Phase1Maths...");
            this.state.start('Phase1Maths');
        }
    };
    
    return PreloadState;
});
