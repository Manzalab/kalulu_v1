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
        

        // this._NOT_STARTED = "NotStarted";
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

        userId : { get: function () { return this._data.userId; } },
        

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

        starMiddle : {
            get : function () {return this._data.starMiddle; },
            set : function (id) {
                this._data.starMiddle[id] = true;
                this._gameManager.save();
                return this._data.starMiddle;
            }
        },

        fertilizer : {
            get : function () {return this._data.fertilizer; },
            set : function (value) {
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
        },

        kaluluTalks : {
            get : function () { return this._data.kaluluTalks;},
            set : function (talks) {
                this._data.kaluluTalks = talks;
                this._gameManager.save();
                return this._data.kaluluTalks;
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
            userId : this._getUuid(),
            pedagogicData : {
                language : null,
                maths : null
            },
            bonusActivitiesData : null,
            starMiddle : null,
            fertilizer : 0,
            plantsData : null,
            kaluluTalks : {
                brainScreen : true,
                firstTreasure : true,
                gardenScreen : true,
                gardenLetter : true,
                gardenLesson : true,
                firstPlantEvolve : true,
                lastPlantEvolve : true,
                gardenPlant : true,
                firstStar : true,
                lesson1 : true,
                lessonGame1 : true,
                lessonGame2 : true,
                lesson2 : true,
                toyChestScreen : true,
                lastReward : ""
            }
        };
        this.getStarMiddle();
        this.getPlantsStatus();
    };

    UserProfile.prototype._getUuid = function _getUuid () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx-xxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        }) + '-' + new Date().getTime();
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

    UserProfile.prototype.getStarMiddle = function getStarMiddle () {
        var chapterCount = 20;
        this._data.starMiddle = [];

        for (var i = 1; i <= chapterCount; i++) {
            this._data.starMiddle[i] = false;
        }
    };

    UserProfile.prototype.getPlantsStatus = function getPlantsStatus () {
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

    UserProfile.prototype.unlockNeuroEnergy = function unlockNeuroEnergy(neuroEnergyValue) {
        console.log(neuroEnergyValue);
        this.fertilizer = neuroEnergyValue;
    };

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