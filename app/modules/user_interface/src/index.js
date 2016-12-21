(function () {
    
    'use strict';

    var Dat                  = require ('dat.gui');

    var SoundManager         = require ('./utils/sound/sound_manager');
    var GameLoader           = require ('./utils/loader/game_loader');
    var LoadEventType        = require ('./utils/events/load_event_type');
    var MovieClipAnimFactory = require ('./utils/game/factories/movie_clip_anim_factory');
    var UIBuilder            = require ('./utils/ui/ui_builder');

    var RenderingManager     = require ('./rendering_manager');
    var ScreensManager       = require ('./screens_manager');
    var LoadingManager       = require ('./loading_manager');

    var GraphicLoader        = require ('./screens/graphic_loader');
    var TitleCard            = require ('./screens/title_card');
    var BrainScreen          = require ('./screens/brain_screen');
    var GardenScreen         = require ('./screens/garden_screen');
    var LessonScreen         = require ('./screens/lesson_screen');


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

        /**
         * A lists of screen instances by Name
         * @type {Object.<string, Screen>}
         * @private
        **/
        this._screens = {};

        this._init();
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
        debugPanel: { get: function () { return this._debugPanel; } }
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
        if (Config.enableQAControls) {
            this._eventSystem.emit(Events.COMMANDS.GOTO_ACTIVITY_REQUEST, node, this._debugPanel);
        }
        else {
            this._eventSystem.emit(Events.COMMANDS.GOTO_ACTIVITY_REQUEST, node);
        }
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
        if (Config.enableTransitionsTuning || Config.enableMinigameTuning || Config.enableQAControls) {
            this._debugPanel = new Dat.GUI();
        }

        if (Config.enableQAControls) {
            this._initQADebugPanel();
        }
        // start listening to Events
        this._eventSystem.on(Events.APPLICATION.MAIN_LOOP, this._renderingLoop, this);
        
        // debug to remove
        this._eventSystem.once(Events.GAME.GOTO_ACTIVITY, this._onGotoActivity, this);   
        
        this._eventSystem.once(Events.GAME.GOTO_TITLE_CARD, this._onGotoTitleCard, this);
        this._eventSystem.once(Events.GAME.START_PRELOAD, this._startPreload, this);
    };

    UserInterface.prototype._renderingLoop = function _renderingLoop (frameId) {
        
        //console.log(GardenButton.notStartedGardenButton);
        // if (GardenButton.notStartedGardenButton) GardenButton.notStartedGardenButton.doHighlight();
        
        // rendering on 1 frame out of 2
        if (frameId % 2 === 0) this._renderingManager.render();
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
    };


    UserInterface.prototype._onGotoBrainScreen = function _onGotoBrainScreen (chaptersProgression) {
        //console.log(chaptersProgression);
        this._screensManager.prepareTransition();
        this._screens.brainScreen = new BrainScreen(this);
        this._screens.brainScreen.unlockChapters(chaptersProgression);
        this._screensManager.openScreen(this._screens.brainScreen);
    };


    UserInterface.prototype._onGotoGardenScreen = function _onGotoGardenScreen (gardenData, chaptersProgression, userProfile) {
        //console.log(chaptersProgression);
        this._screens.gardenScreen = new GardenScreen(this, gardenData, chaptersProgression, userProfile);
        this._screens.gardenScreen.unlockGardens(chaptersProgression);
        this._screens.gardenScreen.unlockBonusPath(userProfile);
        this._screensManager.openScreen(this._screens.gardenScreen);
        this._screensManager.closeGardenTransition();
    };

    UserInterface.prototype._onGotoLessonScreen = function _onGotoLessonScreen (lessonNode) {
        this._screens.lessonScreen = new LessonScreen(this, lessonNode);
        this._screensManager.openScreen(this._screens.lessonScreen);
    };

    UserInterface.prototype._onGotoActivity = function _onGotoActivity (eventData) {
        console.log(eventData);
        if (eventData.shouldRemoveRenderer) this._renderingManager.removeRenderer();
        // SoundManager.stopAllAmbiances();
        this._eventSystem.once(Events.GAME.BACK_FROM_ACTIVITY, this._onBackFromActivity, this);
    };

    UserInterface.prototype._onBackFromActivity = function _onBackFromActivity (eventData, chaptersProgression) {
        console.log(eventData);
        //SoundManager.startAmbiance("Bird");
        if (!this._renderingManager.rendererIsDisplayed) this._renderingManager.addRenderer();
        if (eventData && eventData.constructor.name === "Lesson") {
            this._onGotoLessonScreen(eventData);
        }
        else if (eventData && eventData.hasOwnProperty('currentChapter')) {
            this._onGotoGardenScreen(eventData, chaptersProgression);
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
    };

    UserInterface.prototype._onKaluluToyChestLocked = function _onKaluluToyChestLocked () {
        if (this._kaluluCharacter)
        {
            this._screens.brainScreen._toyChestButton.removeChild(this._kaluluCharacter);
            this._kaluluCharacter = null;
            this._kaluluSound.stop();
        }

        this._kaluluCharacter = new KaluluCharacter();
        this._kaluluCharacter.scale.set(0.5);
        this._kaluluCharacter.y -= 100;
        this._screens.brainScreen._toyChestButton.addChild(this._kaluluCharacter);
        this._kaluluCharacter.startTalk();
        this._kaluluSound = SoundManager.getSound("kaluluLocked");
        setTimeout(function(){this._kaluluSound.play();}.bind(this), 1000);
        this._kaluluSound.on( "end", function()
        {
            this._kaluluCharacter.disappear();
        }.bind(this));
    };


    // ##############################################################################################################################################
    // ###  DEBUG METHODS  ########################################################################################################################
    // ##############################################################################################################################################

    UserInterface.prototype._initQADebugPanel = function _initQADebugPanel () {
        this._debugPanelQAName = "QA";
        this._debugPanelQA = this._debugPanel.addFolder(this._debugPanelQAName);

        this.unlockUpToChapter = 1;
        this._debugPanelQA.add(this, "unlockUpToChapter").min(1).max(20).step(1).listen();
        this._debugPanelQA.add(this, "executeUnlock");
    };

    UserInterface.prototype._clearQADebugPanel = function _initQADebugPanel () {
        this._debugPanel.removeFolder(this._debugPanelQAName);
    };

    UserInterface.prototype.executeUnlock = function executeUnlock () {
        this._eventSystem.emit("UNLOCK_DEBUG", this.unlockUpToChapter);
    };


    module.exports = UserInterface;

})();