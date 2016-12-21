(function () {
    'use strict';

    var AuthoritativeSystem = require('application/authoritative_system');
    var Events              = require('application/events');
    var GameStates          = require('./game_states');
    var MinigamesManager    = require('./minigames_manager');
    var Rafiki              = require('./rafiki');
    var Timer               = require('./timer');
    var UserProfile         = require('./core/user_profile');

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    
    /**
     * The GameManager class is in charge of coordinating events emisssion throughout the flow of the game
     * @class
     * @extends AuthoritativeSystem
     * @memberof GameLogic
    **/
    function GameManager (eventSystem) {

        if (Config.enableGlobalVars) window.kalulu.gameManager = this;

        AuthoritativeSystem.call(this, eventSystem, 'GameManager');

        /**
         * Rafiki is responsible for managing the pedagogic modules.
         * @type {Rafiki}
         * @private
        **/
        this._rafiki = null;


        /**
         * The string id of the current state
         * @type {string}
         * @private
        **/
        this._currentState = null;

        /**
         * The current userProfile
         * @type {UserProfile}
         * @private
        **/
        this._currentUserProfile = null;  

        // STATES INIT FUNCTIONS
        this._states = {};
        this._states[GameStates.BOOT]       = this._initBootState.bind(this);
        this._states[GameStates.PRELOAD]    = this._initPreloadState.bind(this);
        this._states[GameStates.MENUS]      = this._initMenuState.bind(this);
        this._states[GameStates.ACTIVITY]   = this._initActivityState.bind(this);
        // this._states[GameStates.MATHS_DEBUG]= this._initMathsDebugState.bind(this);

        this._eventSystem.once(Events.COMMANDS.BOOT_STATE_REQUEST, this._onBootStateRequest, this);
    }

    GameManager.prototype = Object.create(AuthoritativeSystem.prototype);
    GameManager.prototype.constructor = GameManager;


    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(GameManager.prototype, {
        
        /**
         * The Rafiki Object
         * @type {Rafiki}
         * @readonly
         * @memberof Kalulu.GameLogic.GameManager#
        **/
        Rafiki : {
            get : function () { return this._rafiki; }
        }
    });



    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

    /**
     * Set the current state to the requested state and emits a State Init Event
     * @param stateId {String} the unique id of the state
    **/
    GameManager.prototype.setState = function setState (stateId) {
        
        if (!GameStates[stateId]) {
            throw new Error ("[GameManager] The required state <" + stateId + "> does not exist.");
        }
        if (stateId === this._currentState) return;
        this._currentState = stateId;
        this._states[stateId]();
    };

    GameManager.prototype.save = function save () {
        this._eventSystem.emit(Events.APPLICATION.SET_SAVE, this._currentUserProfile.data);
    };

    /**
     * DOES NOT WORK WHEN BACK FROM ASSESSMENT
    **/
    GameManager.prototype.onCloseActivity = function onCloseActivity (progressionNode) {
        
        if(progressionNode) {
            this.setState(GameStates.MENUS);
            console.log("next node : " + progressionNode.nextNode().constructor.name);
            console.log("next node's parent : " + progressionNode.nextNode().parent.constructor.name);
            var nextScreenName = progressionNode.nextNode().parent.constructor.name;
            var nextNode = progressionNode.nextNode().parent;
            if (nextScreenName === "Lesson") {
                this._eventSystem.emit(Events.GAME.BACK_FROM_ACTIVITY, nextNode);
            }
            else if (nextScreenName === "Chapter") {
                var pedagogicData = {
                    currentChapter : nextNode.chapterNumber,
                    data : this._rafiki.getChaptersData(),
                };
                this._eventSystem.emit(Events.GAME.BACK_FROM_ACTIVITY, pedagogicData, this._rafiki.getChaptersProgression());
            }
            this.save();
        }
        else {
           this._eventSystem.emit(Events.GAME.BACK_FROM_ACTIVITY);
        }

        console.info("Minigame should have closed itself now");
    };

    GameManager.prototype.destroy = function destroy () {

    };



    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################
    
    // #### GAME INITIALISATION

    GameManager.prototype._initGame = function _initGame () {
        
        
        this._minigamesManager = new MinigamesManager(this);

        this._eventSystem.once(Events.APPLICATION.SAVED_DATA_SENT, this._initRemediation, this);
        
        this._eventSystem.emit(Events.APPLICATION.GET_SAVE, 'UserData');

        if (Config.enableQAControls) {
            this._eventSystem.on("UNLOCK_DEBUG", this._onDebugUnlockRequest, this);
        }
    };
    
    GameManager.prototype._initRemediation = function _initRemediation (userData) {
        
        this._currentUserProfile = new UserProfile(this, userData);
        
        this._rafiki = new Rafiki(this, this._currentUserProfile);
    };


    // #### STATES

    // ## BOOT STATE
    GameManager.prototype._onBootStateRequest = function _onBootStateRequest () {
        if (Config.logGameStates) console.log('[GameManager] BootState Request received.');
        this.setState(GameStates.BOOT);
    };

    GameManager.prototype._initBootState = function _initBootState () {
        if (Config.logGameStates) console.info('[GameManager] Setting State Boot');
        this._eventSystem.emit(Events.GAME.START_BOOT, this._onBootCompleted.bind(this));
    };

    GameManager.prototype._onBootCompleted = function _onBootCompleted () {
        if (Config.logGameStates) console.log('[GameManager] BootState ending...');
        this.setState(GameStates.PRELOAD);
    };


    // ## PRELOAD STATE
    GameManager.prototype._initPreloadState = function _initPreloadState () {
        if (Config.logGameStates) console.info('[GameManager] Setting State Preload');
        this._eventSystem.once(Events.APPLICATION.LOAD_COMPLETED, this._onPreloadCompleted, this);
        this._eventSystem.emit(Events.GAME.START_PRELOAD);
    };

    GameManager.prototype._onPreloadCompleted = function _onPreloadCompleted () {
        
        this._initGame();
        this.setState(GameStates.MENUS);
        //this.setState(GameStates.MATHS_DEBUG);// DEBUG MODE
    };


    // ## MENUS STATE
    GameManager.prototype._initMenuState = function _initMenuState () {
        if (Config.logGameStates) console.info('[GameManager] Setting State Menus');
        this._eventSystem.on(Events.COMMANDS.GOTO_TITLE_CARD_REQUEST, this._onTitleCardRequest, this);
        this._eventSystem.on(Events.COMMANDS.GOTO_BRAIN_SCREEN_REQUEST, this._onBrainScreenRequest, this);
        this._eventSystem.on(Events.COMMANDS.GOTO_GARDEN_SCREEN_REQUEST, this._onGardenScreenRequest, this);
        this._eventSystem.on(Events.COMMANDS.GOTO_LESSON_SCREEN_REQUEST, this._onLessonScreenRequest, this);
        this._eventSystem.on(Events.COMMANDS.GOTO_TOYCHEST_SCREEN_REQUEST, this._onToyChestScreenRequest, this);
        this._eventSystem.on(Events.COMMANDS.GOTO_TOYCHEST_ACTIVITY_SCREEN_REQUEST, this._onToyChestActivityScreenRequest, this);
        this._eventSystem.on(Events.COMMANDS.GOTO_ACTIVITY_REQUEST, this._onActivityRequest, this);
        // this._onToyChestScreenRequest();
        this._onTitleCardRequest();
    };

    GameManager.prototype._initActivityState = function _initActivityState () {
        if (Config.logGameStates) console.info('[GameManager] Setting State Activity');
        this._eventSystem.off(Events.COMMANDS.GOTO_TITLE_CARD_REQUEST, this._onTitleCardRequest, this);
        this._eventSystem.off(Events.COMMANDS.GOTO_BRAIN_SCREEN_REQUEST, this._onBrainScreenRequest, this);
        this._eventSystem.off(Events.COMMANDS.GOTO_GARDEN_SCREEN_REQUEST, this._onGardenScreenRequest, this);
        this._eventSystem.off(Events.COMMANDS.GOTO_LESSON_SCREEN_REQUEST, this._onLessonScreenRequest, this);
        this._eventSystem.off(Events.COMMANDS.GOTO_TOYCHEST_SCREEN_REQUEST, this._onToyChestScreenRequest, this);
        this._eventSystem.off(Events.COMMANDS.GOTO_TOYCHEST_ACTIVITY_SCREEN_REQUEST, this._onToyChestActivityScreenRequest, this);
        this._eventSystem.off(Events.COMMANDS.GOTO_ACTIVITY_REQUEST, this._onActivityRequest, this);
        this._eventSystem.emit(Events.GAME.GOTO_ACTIVITY, {shouldRemoveRenderer : true});
    };
    
    GameManager.prototype._onTitleCardRequest = function _onTitleCardRequest () {
        this.setState(GameStates.MENUS);
        this._eventSystem.emit(Events.GAME.GOTO_TITLE_CARD);
    };


    GameManager.prototype._onBrainScreenRequest = function _onBrainScreenRequest (username) {
        this.setState(GameStates.MENUS);
        
        this._eventSystem.once(Events.COMMANDS.GOTO_TOYCHEST_SCREEN_REQUEST, this._onToyChestScreenRequest, this);
        this._eventSystem.emit(Events.GAME.GOTO_BRAIN_SCREEN, this._rafiki.getChaptersProgression());
    };

    GameManager.prototype._initMathsDebugState = function _initMathsDebugState () {
        
        this._eventSystem.on(Events.COMMANDS.GOTO_TITLE_CARD_REQUEST, this._onTitleCardRequest, this);
        this._eventSystem.on(Events.COMMANDS.GOTO_BRAIN_SCREEN_REQUEST, this._onBrainScreenRequest, this);
        this._eventSystem.on(Events.COMMANDS.GOTO_GARDEN_SCREEN_REQUEST, this._onGardenScreenRequest, this);
        this._eventSystem.on(Events.COMMANDS.GOTO_LESSON_SCREEN_REQUEST, this._onLessonScreenRequest, this);
        this._eventSystem.on(Events.COMMANDS.GOTO_ACTIVITY_REQUEST, this._onActivityRequest, this);

        this._initDisciplineDebug();
    };

    GameManager.prototype._initDisciplineDebug = function _initDisciplineDebug (userData) {
        
        console.log('initDisciplineDebug');
        console.log(this._rafiki.getChaptersData().maths);

        var node = this._rafiki.getChaptersData().maths[0].children[0].children[1];

        console.log(node);

        this._minigamesManager.startDebugActivity(node);
        this._eventSystem.emit(Events.GAME.GOTO_ACTIVITY, {shouldRemoveRenderer : true});
    };

    GameManager.prototype._onGardenScreenRequest = function _onGardenScreenRequest (chapterId) {
        var pedagogicData = {
            currentChapter : chapterId,
            data : this._rafiki.getChaptersData(),
        };
        this.setState(GameStates.MENUS);
        this._eventSystem.emit(Events.GAME.GOTO_GARDEN_SCREEN, pedagogicData, this._rafiki.getChaptersProgression(), this._currentUserProfile);
    };

    GameManager.prototype._onLessonScreenRequest = function _onLessonScreenRequest (lessonNode) {
        this.setState(GameStates.MENUS);
        this._eventSystem.emit(Events.GAME.GOTO_LESSON_SCREEN, lessonNode);
    };

    GameManager.prototype._onToyChestScreenRequest = function _onToyChestScreenRequest () {
        this._eventSystem.off('BONUS_MINIGAME_REQUEST', this._onBonusMinigameRequest, this);
        if (Timer.elapsedTime < Config.minutesRequiredToUnlockToyChest && !Config.enableQAControls) {
            console.log("[GameManager] Play "+ (Config.minutesRequiredToUnlockToyChest - Timer.elapsedTime) + " minutes more to unlock this content");
            this._eventSystem.emit(Events.GAME.KALULU_TOYCHEST_LOCKED);
            return;
        }
        this.setState(GameStates.MENUS);
        this._eventSystem.emit(Events.GAME.GOTO_TOYCHEST_SCREEN);
    };

    GameManager.prototype._onToyChestActivityScreenRequest = function _onToyChestActivityScreenRequest (activityType) {
        this.setState(GameStates.MENUS);
        this._eventSystem.once('BONUS_MINIGAME_REQUEST', this._onBonusMinigameRequest, this);
        this._eventSystem.emit(Events.GAME.GOTO_TOYCHEST_ACTIVITY_SCREEN, activityType);
    };

    GameManager.prototype._onActivityRequest = function _onActivityRequest (activityNode, debugPanel) {
        this._minigamesManager.startActivity(activityNode, debugPanel);
        this.setState(GameStates.ACTIVITY);
        this._eventSystem.emit(Events.GAME.GOTO_ACTIVITY, {shouldRemoveRenderer : true});
    };

    GameManager.prototype._onBonusMinigameRequest = function _onBonusMinigameRequest () {
        console.log('listened to bonus minigame request');
        this._minigamesManager.startBonusMinigame();
        this.setState(GameStates.ACTIVITY);
        this._eventSystem.emit(Events.GAME.GOTO_ACTIVITY, {shouldRemoveRenderer : true});
    };


    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################

    GameManager.prototype._onDebugUnlockRequest = function _onDebugUnlockRequest (eventData) {
        console.info("UNLOCKING REQUEST RECEIVED");
        this._rafiki.unlockAllNodesUpToChapter(eventData);
        
    };

    module.exports = GameManager;
})();