define([
    'language/src',
    'maths/src'
], function (
    LanguageModule,
    MathsModule
) {
    'use strict';



    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    /**
     * The Rafiki is in charge of managing the learning curve proposed to the player for the loaded disciplines.
     * By analysing the previous results of a player, it will generate adapted sets of exercises to allow better progression.
     * It serves :
     * - the global progression of a player
     * - adapted sets of stimuli to exercise the player on notions described in the discipline module
     * It also stores and analyse the results of previous minigames for subsequent remediation.
     *
     * @class
     * @param config {object} the kalulu config containing the pedagogic metadata
     * @memberof Kalulu.GameLogic
    **/
    function Rafiki (gameManager, userProfile) {
        
        this._gameManager = gameManager;

        /**
         * The score treshold below which a notion is considered "to revise". It is a constant.
         * 
         * @type {number}
         * @private
         * @default
        **/
        //this._TRESHOLD_FOR_REVISION = Config.pedagogy.tresholdForRevision;
        
        /**
         * The user profile to use for remediation
         * @type {UserProfile}
         * @private
        **/
        this._currentUserProfile = userProfile;

        /**
         * The interface to access static Language Data
         * @type {LanguageModule}
         * @private
        **/
        this._languageModule = new LanguageModule(this, userProfile);

        /**
         * The interface to access static Mathematics Data
         * @type {DisciplineModule}
         * @private
        **/
        this._mathsModule = new MathsModule(this, userProfile);
    }



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(Rafiki.prototype, {

        /**
         * The UserProfile of the current player.
         * @type {UserProfile}
         * @memberof Kalulu.GameLogic.Rafiki#
        **/
        currentUserProfile:              { get: function () { return this._currentUserProfile; } },

        /**
         * The Language Interface
         * @type {LanguageModule}
         * @memberof Kalulu.GameLogic.Rafiki#
        **/
        Language :                  { get: function () { return this._languageModule; } },

        /**
         * The Language Interface
         * @type {LanguageModule}
         * @memberof Kalulu.GameLogic.Rafiki#
        **/
        Maths :                     { get: function () { return this._mathsModule; } },

        /**
         * The treshold score under which a notion must be revised by player
         * @type {number}
         * @memberof Kalulu.GameLogic.Rafiki#
        **/
        TRESHOLD_FOR_REVISION :     { get : function () { return this._TRESHOLD_FOR_REVISION; } }
    });



    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

    Rafiki.prototype.getChaptersProgression = function getChaptersProgression () {

        var languageChaptersCount = this._languageModule.plan.children.length;
        var mathsChaptersCount = this._mathsModule.plan.children.length;
        
        var count = Math.max(languageChaptersCount, mathsChaptersCount);

        var languageChapter;
        var mathsChapter;

        var chaptersProgression = [];
        for (var i = 0 ; i < count ; i++) {
            languageChapter = this._languageModule.plan.children[i];
            mathsChapter = this._mathsModule.plan.children[i];

            //mathsChapter = languageChapter; // for debug

            
            if (languageChapter && mathsChapter) {
                
                if (languageChapter.isCompleted && mathsChapter.isCompleted)chaptersProgression.push("Completed");
                else if (!languageChapter.isUnlocked && !mathsChapter.isUnlocked) chaptersProgression.push("Locked");
                else if ((languageChapter.isUnlocked || mathsChapter.isUnlocked) && (!languageChapter.isStarted || !mathsChapter.isStarted)) chaptersProgression.push("NotStarted");
                else chaptersProgression.push("InProgress");
            }
            else chaptersProgression.push("Locked");
        }

        // Pour le test
        // for(i = 0; i<count; i++) chaptersProgression[i] = "InProgress";
        // chaptersProgression[0] = "Completed";
        // chaptersProgression[1] = "InProgress";
        // chaptersProgression[2] = "NotStarted";
        //
        
        console.log(chaptersProgression);
        return chaptersProgression;
    };

    /**
     * Returns the pedagogic data of each module for all chapters.
    **/
    Rafiki.prototype.getChaptersData = function getChaptersData () {
        return {
            language    : this._languageModule.getChaptersData(),
            maths       : this._mathsModule.getChaptersData()
        };
    };


    /**
     * Save the results of a minigame
    **/
    Rafiki.prototype.savePedagogicResults = function savePedagogicResults (currentProgressionNode, data) {
        console.log(data);
        var lastRecord;
        if (data) {
            lastRecord = {
                elapsedTime : data.endTime - data.startTime,
                hasWon : data.hasWon,
                finalLocalStage : data.finalLocalStage
            };
        }
        else lastRecord = {};
        
        if(this._currentUserProfile[currentProgressionNode.discipline]) {
            this._currentUserProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType].localLevel = lastRecord.finalLocalStage;
            this._currentUserProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType].records.push(lastRecord);
        }
        
        if (currentProgressionNode.constructor.name === "Lecture") {
            currentProgressionNode.isCompleted = true;
            for (var i = 0 ; i < currentProgressionNode.targetNotions.length ; i++) {
                currentProgressionNode.targetNotions[i].isAvailable = true;
            }
        }
        else {
            currentProgressionNode.discipline.processResults(currentProgressionNode, data);
        }

        // this._currentUserProfile[currentProgressionNode.discipline.type] = currentProgressionNode.discipline.getDataForSave();
        // console.log(this._data);
        // this._data.chaptersProgression = this._chaptersProgression;
        //this._storage.saveUserProfile({"name" : this._name, "data" : this._data});
    };





    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################



    // ##############################################################################################################################################
    // ###  DEBUG  ##################################################################################################################################
    // ##############################################################################################################################################

    /**
     * Unlock the firsts chapters, lessons and activities of each plan
    **/
    Rafiki.prototype.unlockPlans = function unlockPlans () {
        this.Maths.unlockPlan();
        this.Language.unlockPlan();
    };

    /**
     * Unlock all nodes until the last activity of required lessons
    **/
    Rafiki.prototype.unlockAllNodesUpToChapter = function unlockAllNodesUpToChapter (chapterNumber) {
        this.Language.plan.unlockAllNodesUpToChapter(chapterNumber);
        this.Maths.plan.unlockAllNodesUpToChapter(chapterNumber);
    };

    return Rafiki;
});