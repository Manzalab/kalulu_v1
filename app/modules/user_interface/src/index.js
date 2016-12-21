(function () {
    
    'use strict';

    // var createjs             = require ('../libs/tweenjs-0.6.2.combined').createjs;

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
         * Description of the accessor
         * @type {boolean}
         * @memberof Namespace.UserInterface#
        **/
        // privateMemberAccessor: {
        //     get: function () {
        //         return this._privateMember;
        //     },
        //     set: function (value) {
        //         return null;
        //     }
        // }
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
        console.log(createjs);
        createjs.MotionGuidePlugin.install();

        // instanciation of members
        
        this._renderingManager = new RenderingManager();
        this._screensManager = new ScreensManager();
        this._loadingManager = new LoadingManager(this._eventSystem);
        
        
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

    UserInterface.prototype._onGotoActivity = function _onGotoActivity (eventData) {
        console.log(eventData);
        if (eventData.shouldRemoveRenderer) this._renderingManager.removeRenderer();
        // SoundManager.stopAllAmbiances();
        this._eventSystem.once(Events.GAME.BACK_FROM_ACTIVITY, this._onBackFromActivity, this);
    };

    module.exports = UserInterface;

})();