(function () {
    
    'use strict';

    var Dat                     = require ('dat.gui');
    
    var SoundManager            = require ('./utils/sound/sound_manager');
    var GameLoader              = require ('./utils/loader/game_loader');
    var LoadEventType           = require ('./utils/events/load_event_type');
    var MovieClipAnimFactory    = require ('./utils/game/factories/movie_clip_anim_factory');
    var UIBuilder               = require ('./utils/ui/ui_builder');
    
    var RenderingManager        = require ('./rendering_manager');
    var ScreensManager          = require ('./screens_manager');
    var LoadingManager          = require ('./loading_manager');
    var Reward                  = require ('./dynamic_rewards');
    
    var GraphicLoader           = require ('./screens/graphic_loader');
    var TitleCard               = require ('./screens/title_card');
    var BrainScreen             = require ('./screens/brain_screen');
    var GardenScreen            = require ('./screens/garden_screen');
    var LessonScreen            = require ('./screens/lesson_screen');
    var ToyChestScreen          = require ('./screens/toy_chest_screen');
    var ToyChestActivityScreen  = require ('./screens/toy_chest_activity_screen');

    var KaluluCharacter         = require ('./elements/kalulu_character');

    var Timer                   = require ('../../../src/game_logic/timer');


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    
    /**
     * The UserInterface class is ...
     * @class
     * @memberof Namespace (e.g. Kalulu.Remediation)
     * @param parameter {Object} Description of the parameter
    **/
    function UserInterface (eventSystem) {
        console.log("UserInterface Instanciated");

        if (Config.enableGlobalvars) {
            window.kalulu.userInterface = this;
        }

        this._eventSystem = eventSystem;

        this._renderingManager = null;
        this._screensManager   = null;
        this._loadingManager   = null;
        this._debugPanel       = null;

        /**
         * A lists of screen instances by Name
         * @type {Object.<string, Screen>}
         * @private
        **/
        this._screens = {};

        this._init();
        this.kaluluCharacter = KaluluCharacter;
        if (!Config.skipKalulu) this.kaluluCharacter.initEvents(eventSystem);
        this.rewards = Reward;
        this.unlockedRewards = ["Mamba_mwenye_njaa"];
        this._eventSystem.on(Events.GAME.UNLOCK_REWARD_TOYCHEST, this._onRewardUnlocked.bind(this));
    }


    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(UserInterface.prototype, {
        
        /**
         * The debugPanel
         * @type {boolean}
         * @memberof Namespace.UserInterface#
        **/
        debugPanel: { get: function () { return this._debugPanel; } },

        isToyChestLocked: { get: function() { return Timer.elapsedTime < Config.minutesRequiredToUnlockToyChest;}},

        isTutorialCompleted : { get: function() { return this._userProfile.kaluluTalks.lesson2; }}
    });

    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################
    
    UserInterface.prototype.requestTitleCard = function requestTitleCard () {
        this._eventSystem.once(Events.GAME.GOTO_TITLE_CARD, this._onGotoTitleCard, this);
        this._eventSystem.emit(Events.COMMANDS.GOTO_TITLE_CARD_REQUEST);
    };

    UserInterface.prototype.requestBrainScreen = function requestBrainScreen () {
        this._eventSystem.once(Events.GAME.GOTO_BRAIN_SCREEN, this._onGotoBrainScreen, this);
        this._eventSystem.emit(Events.COMMANDS.GOTO_BRAIN_SCREEN_REQUEST);
    };

    UserInterface.prototype.requestToyChestScreen = function requestToyChestScreen () {
        this._eventSystem.once(Events.GAME.GOTO_TOYCHEST_SCREEN, this._onGotoToyChestScreen, this);
        this._eventSystem.once(Events.GAME.KALULU_TOYCHEST_LOCKED, this._onKaluluToyChestLocked, this);
        this._eventSystem.emit(Events.COMMANDS.GOTO_TOYCHEST_SCREEN_REQUEST);
    };

    UserInterface.prototype.requestGardenScreen = function requestGardenScreen (gardenId, delay) {
        console.log("Garden " + gardenId + " requested");
        this._eventSystem.once(Events.GAME.GOTO_GARDEN_SCREEN, this._onGotoGardenScreen, this);
        
        if (typeof delay !== "undefined") {
            var screenChangeCallback = function () {
                this._eventSystem.emit(Events.COMMANDS.GOTO_GARDEN_SCREEN_REQUEST, gardenId);
                
            }.bind(this);

            setTimeout(function () {
                
                this._screensManager.openGardenTransition(screenChangeCallback);
            }.bind(this), delay);
        }
        else {
            this._eventSystem.emit(Events.COMMANDS.GOTO_GARDEN_SCREEN_REQUEST, gardenId);
        }
    };

    UserInterface.prototype.requestLessonScreen = function requestLessonScreen (lessonNode) {
        
        this._eventSystem.once(Events.GAME.GOTO_LESSON_SCREEN, this._onGotoLessonScreen, this);
        this._eventSystem.emit(Events.COMMANDS.GOTO_LESSON_SCREEN_REQUEST, lessonNode);
    };

    UserInterface.prototype.requestMinigame = function requestMinigame (node) {
        this._eventSystem.once(Events.GAME.GOTO_ACTIVITY, this._onGotoActivity, this);
        this._eventSystem.emit(Events.COMMANDS.GOTO_ACTIVITY_REQUEST, node, this._debugPanel);
        this._eventSystem.emit(Events.COMMANDS.GOTO_ACTIVITY_REQUEST, node);
    };

    UserInterface.prototype.requestBonusMinigame = function requestBonusMinigame (data) {
        this._eventSystem.once(Events.GAME.GOTO_ACTIVITY, this._onGotoActivity, this);
        this._eventSystem.emit("BONUS_MINIGAME_REQUEST", data);
    };

    UserInterface.prototype.requestToyChestActivityScreen = function requestToyChestActivityScreen (activityType) {
        this._eventSystem.once(Events.GAME.GOTO_TOYCHEST_ACTIVITY_SCREEN, this._onGotoToyChestActivityScreen, this);
        this._eventSystem.emit(Events.COMMANDS.GOTO_TOYCHEST_ACTIVITY_SCREEN_REQUEST, activityType);
    };

    UserInterface.prototype.requestAssessment = function requestAssessment (node) {
        console.log("[UserInterface] Player requested Assessment for Chapter/Garden " + node.chapterNumber);
        this._eventSystem.emit(Events.COMMANDS.GOTO_ASSESSMENT_REQUEST, node);
    };

    UserInterface.prototype.destroy = function destroy () {
        
        this._eventSystem.off(Events.APPLICATION.MAIN_LOOP, this._renderingLoop, this);
    };

    UserInterface.prototype.openPopin = function openPopin (pPopin) {
        
        this._screensManager.openPopin(pPopin); 
    };

    UserInterface.prototype.closePopin = function closePopin (pPopin) {
        
        this._screensManager.closeCurrentPopin(pPopin);
    };



    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################


    UserInterface.prototype._init = function _init () {
        
        // Tween utils
        createjs.MotionGuidePlugin.install();

        // instanciation of members
        
        this._renderingManager = new RenderingManager();
        this._screensManager = new ScreensManager();
        this._loadingManager = new LoadingManager(this._eventSystem);
        
        // debug && tuning
        if (Config.enableTransitionsTuning || Config.enableMinigameTuning || Config.enableQAControls || !Config.skipKalulu) {
            this._debugPanel = new Dat.GUI();
            this._debugPanelFolderNames = {};
        }

        this._addDebugFolders();

        // start listening to Events
        this._eventSystem.on(Events.APPLICATION.MAIN_LOOP, this._renderingLoop, this);
        
        // debug to remove
        //this._eventSystem.once(Events.GAME.GOTO_ACTIVITY, this._onGotoActivity, this);   
        
        this._eventSystem.once(Events.GAME.GOTO_TITLE_CARD, this._onGotoTitleCard, this);
        this._eventSystem.once(Events.GAME.START_PRELOAD, this._startPreload, this);
    };

    UserInterface.prototype._renderingLoop = function _renderingLoop (frameId) {
        
        //console.log(GardenButton.notStartedGardenButton);
        // if (GardenButton.notStartedGardenButton) GardenButton.notStartedGardenButton.doHighlight();
        
        // rendering on 1 frame out of 2
        if (frameId % 2 === 0) this._renderingManager.render();
        if (this.kaluluCharacter!==undefined) this.kaluluCharacter.update();
    };

    /**
     * Returns something
     * @param paramName {Type} description of the parameter
     * @return {Type} description of the returned object
    **/
    UserInterface.prototype._startPreload = function _startPreload () {

        this._screens.graphicLoader = new GraphicLoader();

        this._eventSystem.on(Events.APPLICATION.LOAD_PROGRESS, this._onLoadProgress, this);
        this._eventSystem.once(Events.APPLICATION.LOAD_COMPLETED, this._onLoadCompleted, this);

        this._screensManager.openScreen(this._screens.graphicLoader);
    };

    UserInterface.prototype._onLoadProgress = function _onLoadProgress (loader) {
        this._screens.graphicLoader.update(loader.progress/100);
    };

    UserInterface.prototype._onLoadCompleted = function _onLoadCompleted () {
        
        this._eventSystem.off(Events.APPLICATION.LOAD_PROGRESS, this._onLoadProgress);
        this._screens.graphicLoader.update(1);
    };

    UserInterface.prototype._onGotoTitleCard = function _onGotoTitleCard () {
        SoundManager.addAmbiance("Bird", ["bird_1","bird_2","bird_3","bird_4","bird_5","bird_6","bird_7","bird_8","bird_9"]);
        SoundManager.startAmbiance("Bird");
        SoundManager.stopAllAmbiances();
        this._screens.titleCard = new TitleCard(this);
        this._screensManager.openScreen(this._screens.titleCard);
        // SoundManager.stopAllSounds();
    };


    UserInterface.prototype._onGotoBrainScreen = function _onGotoBrainScreen (chaptersProgression, userProfile) {
        //console.log(chaptersProgression);
        this._userProfile = userProfile;
        this._screensManager.prepareTransition();
        this._screens.brainScreen = new BrainScreen(this);
        this._screens.brainScreen.unlockChapters(chaptersProgression);
        this._screensManager.openScreen(this._screens.brainScreen);

        this.kaluluCharacter.kaluluButton = this._screens.brainScreen._kaluluButton;

        if (this._userProfile.kaluluTalks.brainScreen)
        {
            this.kaluluCharacter.startTalk("kalulu_intro_brainscreen", ["kalulu_tuto_brainscreen"]);
            this.kaluluCharacter.x = this.kaluluCharacter.width/2;
            this.kaluluCharacter.y = -this.kaluluCharacter.height/3;
            this._screens.brainScreen._hud.bottomLeft.addChild(this.kaluluCharacter);
            this._userProfile.kaluluTalks.brainScreen = false;
        }
        if (this._userProfile.kaluluTalks.firstTreasure && !this._userProfile.kaluluTalks.firstStar)
        {
            this.kaluluCharacter.startTalk("kalulu_tuto_firsttreasure_01", ["kalulu_tuto_firsttreasure_02"]);

            this.kaluluCharacter.x = this.kaluluCharacter.width/2;
            this.kaluluCharacter.y = -this.kaluluCharacter.height/3;
            this._screens.brainScreen._hud.bottomLeft.addChild(this.kaluluCharacter);
            this._userProfile.kaluluTalks.firstTreasure = false;
        }
    };


    UserInterface.prototype._onGotoGardenScreen = function _onGotoGardenScreen (gardenData, chaptersProgression, userProfile) {
        
        this._screens.gardenScreen = new GardenScreen(this, gardenData, chaptersProgression, userProfile);
        this._screens.gardenScreen.unlockGardens(chaptersProgression);
        this._screensManager.openScreen(this._screens.gardenScreen);
        this._screensManager.closeGardenTransition();

        this.kaluluCharacter.kaluluButton = this._screens.gardenScreen._kaluluButton;

        if (this._userProfile.kaluluTalks.gardenScreen)
        {
            this.kaluluCharacter.startTalk("kalulu_intro_gardenscreen", ["kalulu_tuto_introstep01_gardenscreen"]);

            this.kaluluCharacter.x = this.kaluluCharacter.width/2;
            this.kaluluCharacter.y = -this.kaluluCharacter.height/3;
            this._screens.gardenScreen._hud.bottomLeft.addChild(this.kaluluCharacter);
            this._userProfile.kaluluTalks.gardenScreen = false;
        }
        else if (this._dataForLesson && this._dataForLesson.isCompleted && this._userProfile.kaluluTalks.gardenLesson)
        {
            this.kaluluCharacter.x = this.kaluluCharacter.width/2;
            this.kaluluCharacter.y = -this.kaluluCharacter.height/3;
            this._screens.gardenScreen._hud.bottomLeft.addChild(this.kaluluCharacter);
            this.kaluluCharacter.startTalk("kalulu_tuto_endstep02_gardenscreen", ["kalulu_tuto_introstep03_gardenscreen"]);
            this._userProfile.kaluluTalks.gardenLesson = false;
        }

    };

    UserInterface.prototype._onGotoLessonScreen = function _onGotoLessonScreen (lessonNode) {
        this._screens.lessonScreen = new LessonScreen(this, lessonNode);
        this._screensManager.openScreen(this._screens.lessonScreen);

        this.kaluluCharacter.kaluluButton = this._screens.lessonScreen._kaluluButton;
        if (lessonNode.lessonNumber == 1 && this._userProfile.kaluluTalks.lesson1)
        {
            this.kaluluCharacter.startTalk("kalulu_intro_lessonscreen", ["kalulu_tuto_lessonscreen"]);

            this.kaluluCharacter.x = this.kaluluCharacter.width/2;
            this.kaluluCharacter.y = -this.kaluluCharacter.height/3;
            this._screens.lessonScreen._hud.bottomLeft.addChild(this.kaluluCharacter);
            this._userProfile.kaluluTalks.lesson1 = false;
        }
        else if (lessonNode.lessonNumber == 2 && this._userProfile.kaluluTalks.lesson2)
        {
            this.kaluluCharacter.startTalk("kalulu_tuto_secondlesson");

            this.kaluluCharacter.x = this.kaluluCharacter.width/2;
            this.kaluluCharacter.y = -this.kaluluCharacter.height/3;
            this._screens.lessonScreen._hud.bottomLeft.addChild(this.kaluluCharacter);
            this._userProfile.kaluluTalks.lesson2 = false;
        }
        else if (lessonNode.children[0].lessonNumber == 1 && lessonNode.children[0].isCompleted && this._userProfile.kaluluTalks.gardenLetter)
        {
            this.kaluluCharacter.x = this.kaluluCharacter.width/2;
            this.kaluluCharacter.y = -this.kaluluCharacter.height/3;
            this._screens.lessonScreen._hud.bottomLeft.addChild(this.kaluluCharacter);
            this.kaluluCharacter.startTalk("kalulu_tuto_endstep01_gardenscreen", ["kalulu_tuto_introstep02_gardenscreen"]);
            this._userProfile.kaluluTalks.gardenLetter = false;
        }
    };

    UserInterface.prototype._onGotoActivity = function _onGotoActivity (eventData) {
        console.log(eventData);
        if (eventData.shouldRemoveRenderer) this._renderingManager.removeRenderer();
        if (this._debugPanel) this._clearDebugPanelFolders();
        // SoundManager.stopAllAmbiances();
        this._eventSystem.once(Events.GAME.BACK_FROM_ACTIVITY, this._onBackFromActivity, this);
    };

    UserInterface.prototype._onBackFromActivity = function _onBackFromActivity (eventData, chaptersProgression, userProfile) {
        console.log(eventData);
        if (this._debugPanel) this._addDebugFolders();
        //SoundManager.startAmbiance("Bird");
        this._dataForLesson = eventData;
        if (!this._renderingManager.rendererIsDisplayed) this._renderingManager.addRenderer();
        if (eventData && eventData.constructor.name === "Lesson") {
            this._onGotoLessonScreen(eventData);
        }
        else if (eventData && eventData.hasOwnProperty('currentChapter')) {
            this._onGotoGardenScreen(eventData, chaptersProgression, userProfile);
        }
        else {
           console.warn("[UserInterface] not implemented");
           this._onGotoToyChestScreen();
        }
    };

    UserInterface.prototype._onGotoToyChestActivityScreen = function _onGotoToyChestActivityScreen (activityType) {
        this._screens.toyChestActivityScreen = new ToyChestActivityScreen(this, activityType);
        this._screensManager.openScreen(this._screens.toyChestActivityScreen);
    };

    UserInterface.prototype._onGotoToyChestScreen = function _onGotoToyChestScreen () {
        this._screens.toyChestScreen = new ToyChestScreen(this);
        this._screensManager.openScreen(this._screens.toyChestScreen);

        if (this._userProfile.kaluluTalks.toyChestScreen)
        {
            this.kaluluCharacter.startTalk("kalulu_intro_toychest", ["kalulu_tuto_toychest01"]);
            this.kaluluCharacter.x = 0;
            this.kaluluCharacter.y = 0;
            this._screens.toyChestScreen.addChild(this.kaluluCharacter); // j'addchild dans le toychestScreen pcq je n'ai pas de hud BL ainsi qu'un kalulubutton pour l'instant
            this._userProfile.kaluluTalks.toyChestScreen = false;
        }
    };
    
    UserInterface.prototype._onKaluluToyChestLocked = function _onKaluluToyChestLocked () {
        if (this.kaluluCharacter)
        {
            this.kaluluCharacter.parent.removeChild(this.kaluluCharacter);
            this.kaluluCharacter.stopSound();
        }

        this.kaluluCharacter.scale.set(0.5);
        this.kaluluCharacter.y -= 100;
        this.kaluluCharacter.x = 0;
        this._screens.brainScreen._toyChestButton.addChild(this.kaluluCharacter);
        this.kaluluCharacter.startTalk("kalulu_info_toychestnotavailable");
        
    };

    UserInterface.prototype._onRewardUnlocked = function _onRewardUnlocked (pRewardName) {
        this.unlockedRewards.push(pRewardName);
        if (this._userProfile.kaluluTalks.firstStar)
        {
            this.kaluluCharacter.startTalk("kalulu_tuto_firststarwon_01", ["kalulu_tuto_firststarwon_02"]);
            this.kaluluCharacter.x = this.kaluluCharacter.width/2;
            this.kaluluCharacter.y = -this.kaluluCharacter.height/3;
            this._screens.gardenScreen._hud.bottomLeft.addChild(this.kaluluCharacter);
            this._userProfile.kaluluTalks.firstStar = false;
        } 
    };

    // ##############################################################################################################################################
    // ###  DEBUG METHODS  ########################################################################################################################
    // ##############################################################################################################################################

    /**
     * Called at initialisation. Setup the appropriate groups of debug functions depending on Config.
    **/
    UserInterface.prototype._addDebugFolders = function _addDebugFolders () {
        console.log('adding debug Folders');
        if (Config.enableQAControls) {
            this._initQADebugPanel();
        }
        if (!Config.skipKalulu) {
            this._initKaluluDebugPanel();
        }
    }

    UserInterface.prototype._initQADebugPanel = function _initQADebugPanel () {

        this._debugPanelFolderNames.QA = 'QA'; // for easier cleaning of panel. see function _clearDebugPanelFolders

        this._debugPanelQA = this._debugPanel.addFolder(this._debugPanelFolderNames.QA);
        
        this.unlockUpToChapter = 1;
        this._debugPanelQA.add(this, "unlockUpToChapter").min(1).max(20).step(1).listen();
        this._debugPanelQA.add(this, "executeUnlock");

        this.requireNeuroEnergy = 10;
        this._debugPanelQA.add(this, "requireNeuroEnergy").min(0).max(300).step(1).listen();
        this._debugPanelQA.add(this, "sendRequire");
        this._debugPanelQA.open();
    };

    UserInterface.prototype._initKaluluDebugPanel = function _initKaluluDebugPanel () {
        
        this._debugPanelFolderNames.Tuto = 'Kalulu Tuto';

        this._debugPanelKalulu = this._debugPanel.addFolder(this._debugPanelFolderNames.Tuto);
        this._debugPanelKalulu.add(this, "skipKaluluOnClick");
        this._debugPanelKalulu.open();
    };
    
    UserInterface.prototype.skipKaluluOnClick = function skipKaluluOnClick() {
        this._eventSystem.emit(Events.DEBUG.SKIP_KALULU);
    };

    UserInterface.prototype._clearDebugPanelFolders = function _clearDebugPanelFolders () {
        for (var folderName in this._debugPanelFolderNames) {
            if (!this._debugPanelFolderNames.hasOwnProperty(folderName)) continue;
            this._debugPanel.removeFolder(this._debugPanelFolderNames[folderName]);
        }
    };

    UserInterface.prototype.executeUnlock = function executeUnlock () {
        this._eventSystem.emit(Events.DEBUG.UNLOCK_DEBUG, this.unlockUpToChapter);
    };

    UserInterface.prototype.sendRequire = function sendRequire () {
        this._eventSystem.emit(Events.DEBUG.UNLOCK_NEUROENERGY_DEBUG, this.requireNeuroEnergy);
    };
    
    module.exports = UserInterface;

})();