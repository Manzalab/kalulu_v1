(function () {
    'use strict';

    var LoadEventType        = require ('./utils/events/load_event_type');
    var GameLoader           = require ('./utils/loader/game_loader');
    var MovieClipAnimFactory = require ('./utils/game/factories/movie_clip_anim_factory');
    var UIBuilder            = require ('./utils/ui/ui_builder');

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    
    /**
     * The LoadingManager object is responsible for loading the assets.
     * @class
     * @extends AuthoritativeSystem
     * @memberof Namespace (e.g. Kalulu.Remediation)
     * @param parameter {Object} Description of the parameter
    **/
    function LoadingManager (eventSystem) {
        
        this._eventSystem = eventSystem;

        this._eventSystem.on(Events.GAME.START_BOOT, this.loadBootAssets, this);
        this._eventSystem.on(Events.GAME.START_PRELOAD, this.loadGameAssets, this);
    }


    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################


    /**
     * Load the boot spritesheet and calls the callback when done.
     * @param onComplete {function} the callback to execute when the loading is complete
    **/
    LoadingManager.prototype.loadBootAssets = function loadBootStateAssets (onComplete) {
        
        // lance le chargement des assets graphiques du preloader
        var lLoader = new GameLoader(Config);
        lLoader.addImageFile("user_interface/boot_and_title/boot.json");
        lLoader.once(LoadEventType.COMPLETE, onComplete);
        lLoader.load();
    };

    /**
     * Load the boot spritesheet and calls the callback when done.
     * @param onProgress {function} the callback to execute when the loading progressed
     * @param onComplete {function} the callback to execute when the loading is complete
    **/
    LoadingManager.prototype.loadGameAssets = function loadBootStateAssets () {
        
        var lLoader = new GameLoader(Config);
        
        // ## SOUNDS
        lLoader.addSoundList("user_interface/general_sounds.json");
        //lLoader.addSoundList("ui/swahili/swahili_ui_sounds.json");
        //lLoader.addSoundList("swahili/_sounds.json");
        
        // ## TEXTS
        //lLoader.addTxtFile("init.json");
        //lLoader.addTxtFile("ui_test.json");
        lLoader.addTxtFile("user_interface/ui.json");
        lLoader.addTxtFile("user_interface/ui_toy_chest.json");
        
        // for (var i = 0;i <= 9; i++) lLoader.addVideoFile("Akili"+i+".m4v");
        // ## GRAPHICS
        lLoader.addImageFile("user_interface/global_ui.json");

        //lLoader.addImageFile("garden_screen.json");
        lLoader.addImageFile("user_interface/garden_transition/garden_transition_0.json");
        lLoader.addImageFile("user_interface/garden_transition/garden_transition_1.json");
        lLoader.addImageFile("user_interface/garden_transition/garden_transition_2.json");
        lLoader.addImageFile("user_interface/lesson_screen/lesson_screen_0.json");
        lLoader.addImageFile("user_interface/boot_and_title/title_card.json");
        lLoader.addImageFile("user_interface/brain_screen/brain_screen_0.json");
        lLoader.addImageFile("user_interface/brain_screen/brain_screen_1.json");
        lLoader.addImageFile("user_interface/toy_chest/burrow_screen.json");
        lLoader.addImageFile("user_interface/toy_chest/burrow_activity_screen.json");
        lLoader.addImageFile("user_interface/toy_chest/video_player.json");
        lLoader.addImageFile("user_interface/toy_chest/story.json");

        lLoader.addImageFile("user_interface/plant/plant_0.json");
        lLoader.addImageFile("user_interface/plant/plant_1.json");

        lLoader.addImageFile("user_interface/background/background_0.json");
        lLoader.addImageFile("user_interface/background/background_1.json");
        lLoader.addImageFile("user_interface/background/background_2.json");

        lLoader.addImageFile("user_interface/kalulu_anims/Kalulu_idle.json");
        lLoader.addImageFile("user_interface/kalulu_anims/Kalulu_pop.json");
        lLoader.addImageFile("user_interface/kalulu_anims/Kalulu_talk.json");
        
        for (var j = 0 ; j <= 40; j++) {
            lLoader.addImageFile("user_interface/garden_screen/garden_screen_" + j + ".json");
        }

        for (var l = 1 ; l <= 20; l++) {
            lLoader.addImageFile("user_interface/garden_buttons/GardenButton_" + l + ".png");
        }

        // for (var m = 1 ; m < 7; m++) lLoader.addImageFile("activity_covers/story/" + m + ".jpg");
        // for (var n = 1 ; n < 1; n++) lLoader.addImageFile("activity_covers/minigame/" + n + ".jpg");
        // for (var o = 1 ; o < 1; o++) lLoader.addImageFile("activity_covers/video/" + o + ".jpg");
        
        // ## FONTS
        // lLoader.addFontFile("fonts.css");

        lLoader.on(LoadEventType.PROGRESS, this._onLoadProgress, this);

        lLoader.once(LoadEventType.COMPLETE, this._onLoadCompleted, this);
        
        lLoader.load();
    };

    LoadingManager.prototype._onLoadProgress = function _onLoadProgress (loader) {
        this._eventSystem.emit(Events.APPLICATION.LOAD_PROGRESS, loader);
    };

    LoadingManager.prototype._onLoadCompleted = function _onLoadCompleted (loader) {
        
        loader.off(LoadEventType.PROGRESS, this._onLoadProgress, this);

        var factory = new MovieClipAnimFactory();
        
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/global_ui.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/garden_transition/garden_transition_0.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/garden_transition/garden_transition_1.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/garden_transition/garden_transition_2.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/lesson_screen/lesson_screen_0.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/boot_and_title/title_card.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/brain_screen/brain_screen_0.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/brain_screen/brain_screen_1.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/toy_chest/burrow_screen.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/toy_chest/burrow_activity_screen.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/toy_chest/video_player.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/toy_chest/story.json"));

        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/plant/plant_0.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/plant/plant_1.json"));

        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/background/background_0.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/background/background_1.json"));
        factory.addTextures(loader.getContent(Config.imagesPath, "user_interface/background/background_2.json"));

        // for (var k = 0 ; k < 3 ; k++) {
        //     factory.addTextures(loader.getContent(Config.imagesPath, "kalulu_character_" + k + ".json"));
        // }

        factory.addTextures(loader.getContent(Config.imagesPath + "user_interface/kalulu_anims/", "Kalulu_idle.json"));
        factory.addTextures(loader.getContent(Config.imagesPath + "user_interface/kalulu_anims/", "Kalulu_pop.json"));
        factory.addTextures(loader.getContent(Config.imagesPath + "user_interface/kalulu_anims/", "Kalulu_talk.json"));
        
        // for (var i = 0 ; i < 7 ; i++) {
        //     factory.addTextures(loader.getContent(Config.imagesPath, "illustrations_" + i + ".json"));
        // }

        for (var j = 0 ; j <= 40; j++) {
            factory.addTextures(loader.getContent(Config.imagesPath + "user_interface/garden_screen/", "garden_screen_" + j + ".json"));
        }



        //var lMainUI = loader.getContent(Config.txtPath, "ui_test.json");
        var lMainUI = loader.getContent(Config.txtPath, "user_interface/ui.json");
        var lToyChestUI = loader.getContent(Config.txtPath, "user_interface/ui_toy_chest.json");
        for (var key in lToyChestUI)
        {
            if (!lMainUI.key)  lMainUI[key] = lToyChestUI[key];
            else console.warn("[LoadingManager] "+key+" already exists in ui_test.json");
        }
        //console.log(lMainUI);
        UIBuilder.addDescription(lMainUI);




        this._eventSystem.emit(Events.APPLICATION.LOAD_COMPLETED, loader);
    };

    module.exports = LoadingManager;
})();