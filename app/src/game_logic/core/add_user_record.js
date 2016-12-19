define ([], function () {

    'use strict';

    /**
     * This component is to be added on a notion object.
     * It adds the behaviour of being able to save scores and look at them through a time-window
    **/
    function AddUserRecord (object) {

        object.prototype.addRecord = function addRecord (scoreObject) {
            if(!(scoreObject.hasOwnProperty("score") && scoreObject.hasOwnProperty("elapsedTime"))) {
                throw new Error("The Score Object is not correctly set up");
            }
            if (!this._userRecord) this._userRecord = [];
            this._userRecord.push(scoreObject);
            // console.log(this);
        };

        object.prototype.getRecord = function getRecord (windowSize) {
            
            windowSize = windowSize || Config.pedagogy.scoreWindowSize ;

            if (!this._userRecord) this._userRecord = [];

            var responseCount = Math.min(windowSize, this._userRecord.length);
            var index = this._userRecord.length - responseCount;
            var latestResults = this._userRecord.slice(index); // shallow copy

            var sum = 0;
            
            for (var i = 0 ; i < responseCount; i++) {
                sum += latestResults[i].score;
            }

            return responseCount > 0 ? sum/responseCount : 0;

        };

        object.prototype.getScoreData = function getScoreData () {

            return this._userRecord;
        };

        object.prototype.setScoreData = function setScoreData (savedUserRecord) {

            this._userRecord = savedUserRecord;
        };

        //TODO MOVE elsewhere : it is not related to a notion but an exercise type
        Object.defineProperties(object.prototype, {

            isReadyForLevelUp : {
                get : function () {
                    if (!this._userRecord) {
                        this._userRecord = [];
                        return false;
                    }

                    var latestIndex = this._userRecord.length - 1;
                    var firstIndexExcluded = latestIndex - Config.pedagogy.masterGamesRequiredForNextLevel;
                    for (var i = latestIndex ; i > firstIndexExcluded; i--) {
                        if (this._userRecord[i] < Config.pedagogy.scoreRequiredToMasterGame) return false;
                    }
                    return true;
                }
            }
        });
    }

    return AddUserRecord;
});