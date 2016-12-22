define([
    //'core/add_user_record'
], function (
    //AddUserRecord
) {
    
    'use strict';
    
    /**
     * The UserProfile class contains methods used to read and write UserData.
     * @class
     * @alias UserProfile
     * @memberof Kalulu.GameLogic.Core
     * @param {Object} userData - The data retrieved from storage. should contain at least id and username
     */
    function UserProfile (gameManager, userData) {
        console.info("##### [USER PROFILE] Data loaded from storage : #####");
        // console.log(userData);

        this._gameManager = gameManager;
        
        /**
         * The user's stored data
         * @type {object.<string, object>}
         * @private
         * @default null
        **/
        this._data = userData || null;

        
        // this._createSave();
        // this._data.fertilizer = 10; // FOR DEBUG
        

        this._NOT_STARTED = "NotStarted";
        this._SMALL  = "Small";
        this._MEDIUM = "Medium";
        this._LARGE  = "Large";

        if (!this._data) this._createSave();
        if (Config.enableGlobalVars) window.kalulu.userProfile = this;
    }

    //AddUserRecord(UserProfile);

    // ####################################################################################################################################
    // ###  GETTERS & SETTERS  ############################################################################################################
    // ####################################################################################################################################

    Object.defineProperties(UserProfile.prototype, {
        
        /**
         * Returns a list of unlocked status for the chapters.
         * @type {boolean[]}
         * @readonly
         * @memberof Kalulu.GameLogic.Core.UserProfile#
         */
        chaptersProgression : {
            get : function () { 
                return this.getChaptersStatus;
            }
        },

        /**
         * The User's data
         * @type {object}
         * @readonly
         * @memberof Kalulu.GameLogic.Core.UserProfile#
        **/
        data : { get: function () { return this._data; } },
        

        /**
         * The Language Module Data.
         * if set, it automaticly execute a save.
         * @type {object}
         * @memberof Kalulu.GameLogic.Core.UserProfile#
        **/
        Language : {
            get : function () { return this._data.pedagogicData.language; },
            set : function (value) {
                this._data.pedagogicData.language = value;
                this._gameManager.save();
                return this._data.pedagogicData.language;
            }
        },

        Maths : {
            get : function () { return this._data.pedagogicData.maths; },
            set : function (value) {
                this._data.pedagogicData.maths = value;
                this._gameManager.save();
                return this._data.pedagogicData.maths;
            }
        },

        minigamesRecords : {
            get : function () { return this._data.minigamesRecords; },
            set : function (value) { 
                this._data.minigamesRecords = value;
                this._gameManager.save();
                return this._data.minigamesRecords;
            }
        },

        fertilizer : {
            get : function () {return this._data.fertilizer; },
            set : function (value) {

                console.log(value);

                this._data.fertilizer = value;
                this._gameManager.save();
                return this._data.fertilizer;
            }
        },

        plantsProgression : {
            get : function () {return this._data.plantsData;},
            set : function (plant) {

                console.log("STATE : " + plant._state + " /  CHAPTER " + plant._idChapter + " / ID : " + plant._idPlant);

                this._data.plantsData[plant._idChapter-1][plant._idPlant-1] = plant._state;
                this._gameManager.save();
                return this._data.plantsData;
            }
        }
    });


    // #####################################################################################################################################
    // ###  METHODS  #######################################################################################################################
    // #####################################################################################################################################

    /**
     * Used at new player creation
     * @private
    **/
    UserProfile.prototype._createSave = function _createSave () {
        console.info("New User Save Created");
        this._data = {
            pedagogicData : {
                language : null,
                maths : null
            },
            bonusActivitiesData : null,
            fertilizer : 0,
            plantsData : null
        };
        this.getPlantsStatus();
    };


    UserProfile.prototype.save = function save () {
        this._gameManager.save();
    };


    /**
     *
    **/
    UserProfile.prototype.getChaptersStatus = function getChaptersStatus () {
        
        //var mathsPlan = this._data.pedagogicData.Maths.planData;

        var arr = [];
        for (var i = 0 ; i < 20 ; i++) {
            arr.push(false);
        }
        arr[0] = true;
        return arr;
    };

    UserProfile.prototype.getPlantsStatus = function getPlantsStatus () {
        
        //var mathsPlan = this._data.pedagogicData.Maths.planData;
        var chapterCount = 20;
        var plantCount = 5;

        this._data.plantsData = [];

        for (var chapterIndex = 0; chapterIndex < chapterCount; chapterIndex++){
            this._data.plantsData.push([]);
            for (var plantIndex = 0; plantIndex < plantCount; plantIndex++){
                this._data.plantsData[chapterIndex].push(this._NOT_STARTED);
            }
        }
    };

    UserProfile.prototype.saveResults = function saveResults (currentProgressionNode, record) {
        
        console.log(currentProgressionNode);
        console.log(record);

        if (currentProgressionNode.constructor.name === "Lecture") {
            
            for (var notionId in currentProgressionNode.targetNotions) {
                if (!currentProgressionNode.targetNotions.hasOwnProperty(notionId)) continue;
                var lNotion = currentProgressionNode.targetNotions[notionId];
                lNotion.isAvailable = true;
                currentProgressionNode.isCompleted = results.isCompleted;
            }

        }
        else {
            currentProgressionNode.discipline.processResults(currentProgressionNode, record);
        }

        this._data[currentProgressionNode.discipline.id] = currentProgressionNode.discipline.getDataForSave();
        console.log(this._data);
        this._data.chaptersProgression = this._chaptersProgression;
        //this._storage.saveUserProfile({"name" : this._name, "data" : this._data});
    };




    // ##############################################################################################################################################
    // ###  DEBUG  ##################################################################################################################################
    // ##############################################################################################################################################

    UserProfile.prototype.completeAllNodes = function completeAllNodes () {
        this.setPlanNodesTo(this.Language.plan, true);
        this.setPlanNodesTo(this.Maths.plan, true);
    };

    UserProfile.prototype.resetProfile = function resetProfile () {

        this.resetKnowledge();
        this.resetProgression();
    };
    
    UserProfile.prototype.resetProgression = function resetProgression () {

        this.setPlanNodesTo(this.Language.plan, false);
        this.setPlanNodesTo(this.Maths.plan, false);
        this._gameManager.Rafiki.unlockPlans();
    };

    UserProfile.prototype.setPlanNodesTo = function setPlanNodesTo (planData, bool) {

        for (var nodeId in planData) {
            if (!planData.hasOwnProperty(nodeId)) continue;
            planData[nodeId].isUnlocked = bool;
            planData[nodeId].isStarted = bool;
            planData[nodeId].isUnlocked = bool;
        }
    };

    UserProfile.prototype.resetKnowledge = function resetKnowledge () {

    };


    return UserProfile; 
}); 