define([
    '../progression/plan'
], function (
    Plan
) {
    'use strict';
    
    /**
     * The DisciplineModule class is the base class for all discipline modules.
     * 
     * @class
     * @alias DisciplineModule
     * @memberof Kalulu.GameLogic.Core
    **/
    function 
    DisciplineModule (rafiki, staticData, userProfile) { //toto
        
        //console.log(staticData);
        
        /**
         * id of the module
         * @type {string}
         * @private
        **/
        this._id = staticData.name.toLowerCase();
        
        /**
         * The User Profile
         * @type {UserProfile}
         * @private
        **/
        this._userProfile = userProfile;

        /**
         * The list of activity types for each assessment
        **/
        this._assessments = this._initAssessmentsList(staticData.assessments);

        /**
         * Reference to the plan object
         * @type {Plan}
         * @private
        **/
        this._plan = new Plan(userProfile, staticData.plan, this);

        /**
         * Reference to Rafiki, the remediation engine
         * @private
        **/
        this._rafiki = rafiki;

        /**
         * List of matrices used by the module
         * @private
        **/
        this._matrices = null;

        /**
         * The player stored difficulty level. Defaults to 3 first time.
        **/
        this._difficultyLevel = 3;

        /**
         * The global remediation parameters of the latest activity started.
        **/
        this._currentActivityParams = null;

        this._minigamesRecords = {};
    }



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(DisciplineModule.prototype, {
        
        /**
         * Returns the id of the Discipline Module
         * @type {string}
         * @memberof Kalulu.GameLogic.Core.DisciplineModule#
        **/
        id: { get: function () { return this._id; } },

        /**
         * Returns the pedagogic plan of the Discipline Module
         *
         * @type {Plan}
         * @memberof Kalulu.GameLogic.Core.DisciplineModule#
        **/
        plan: {
            get: function () {
                if (this._plan === null) {
                    console.error("[Discipline Module] Impossible to provide Plan. Please initialise DisciplineModule first.");
                    return null;
                }
                return this._plan;
            }
        },

        /**
         * Returns the list of exercise types indexed by id
         * @type {Object.<string, ExerciseType>}
         * @memberof Kalulu.GameLogic.Core.DisciplineModule#
        **/
        //exerciseTypes : { get: function () { return this._exerciseTypes; } },

        matrices : { get: function () { return this._matrices; } }
    });


    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

    /**
     * @param progressionNode {ProgressionNode} the node for which we need a setup (necessary an activity node)
     * @return {object} A populated setup object for the minigame
    **/
    DisciplineModule.prototype.getActivitySetup = function getActivitySetup (progressionNode) {
        return null;
    };

    /**
     * Unlocks the first Chapter, first Lesson and first Activity of this module's plan.
    **/
    DisciplineModule.prototype.unlockPlan = function unlockPlan () {
        this._plan.isUnlocked = true;
    };
    
    DisciplineModule.prototype.getPedagogicData = function getPedagogicData () {
        console.warn("[Discipline module] getPedagogicData to be implemented in subclass");
        return null;
    };

    /**
     * @return {Array<boolean>} for each chapter a boolean stating the availability of the Chapter (true => isUnlocked, false => !isUnlocked)
    **/
    DisciplineModule.prototype.getChaptersProgression = function getChaptersProgression () {
        var lChaptersProgression = [];
        for (var i in this._plan.children) {
            var lChapter = this._plan.children[i];
            lChaptersProgression.push(lChapter.isUnlocked);
        }
        return lChaptersProgression;
    };

    /**
     * @return {Array<Chapter>} the list of chapters for this discipline
    **/
    DisciplineModule.prototype.getChaptersData = function getChaptersData () {
        return this._plan.children;
    };

    DisciplineModule.prototype.getDifficultyParams = function getDifficultyParams (progressionNode) {
        var level, stage;

        if (this._userProfile[progressionNode.discipline.type].minigamesRecords[progressionNode.activityType]) {
            level = this._userProfile[progressionNode.discipline.type].minigamesRecords[progressionNode.activityType].globalLevel;
            stage = this._userProfile[progressionNode.discipline.type].minigamesRecords[progressionNode.activityType].localLevel;
        }
        else {
            level = 3;
            stage = 3;
        }

        return {
            globalLevel : level,
            localStage : stage
        }; 
    };

    DisciplineModule.prototype.getLatestRecord = function getLatestRecord (progressionNode) {
        var arrayRecord = this._userProfile[progressionNode.discipline.type].minigamesRecords.records;

        if(arrayRecord)
            if(arrayRecord.length > 0) return arrayRecord[arrayRecord.length - 1];
        else return null;
    };

    DisciplineModule.prototype.getNotionsForLesson = function getNotionsForLesson (lessonNumber) {
        return null;
    };

    DisciplineModule.prototype.getNotionIdsForLesson = function getNotionIdsForLesson (lessonNumber) {
        return null;
    };

    DisciplineModule.prototype.getNotionsByCumul = function getNotionsByCumul (lessonNumber) {
        return null;
    };

    DisciplineModule.prototype.getAssessmentActivity = function getAssessmentActivity (chapterNumber) {
        // console.log('[DisciplineModule] Looking for activity type for chapter ' + chapterNumber + '\'s assessment');
        // console.log(this._assessments);
        return this._assessments[chapterNumber];
    };


    // ##############################################################################################################################################
    // ###  PROVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################

    DisciplineModule.prototype._initAssessmentsList = function _initAssessmentsList (csvData) {

        var assessments = {};

        for (var i = 0 ; i < csvData.length ; i++) {
            var datarow = csvData[i];
            assessments[datarow.CHAPTER] = [datarow.MINIGAME_1, datarow.MINIGAME_2];
        }

        return assessments;

    };

    return DisciplineModule;
});