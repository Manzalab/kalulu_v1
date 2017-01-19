(function () {
    'use strict';

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    
    /**
     * The MinigameParameters class is ...
     * @class
     * @param data {object} the list of setups for this game
    **/
    function MinigameParameters (data) {

        this._data = data;
        this._settingsByLevel = {};
        this._currentGlobalLevel = null;
        this._currentLocalRemediationStage = 3;

        // INIT LOGIC
        for (var i = 1 ; i <= 5 ; i++ ) { // for each level
            
            var lSettings = {
                generalParameters : {},
                globalRemediation : {},
                localRemediation : {}
            };

            lSettings.name = "level_" + i;
            Object.assign(lSettings.generalParameters, data.baseConfig.generalParameters);
            Object.assign(lSettings.globalRemediation, data.baseConfig.globalRemediation);
            
            var parameterName;

            var gR = data.levels[i-1].globalRemediation;
            var lR = data.levels[i-1].localRemediation;
            
            for (parameterName in gR) {

                if (!gR.hasOwnProperty(parameterName)) continue;
                lSettings.globalRemediation[parameterName] = gR[parameterName];
            }

            for (var stage = 1; stage <= 5 ; stage++) {
                lSettings.localRemediation[stage] = {};
                Object.assign(lSettings.localRemediation[stage], data.baseConfig.localRemediation);
                
                for (parameterName in lR) {
                    if (!lR.hasOwnProperty(parameterName)) continue;
                    var spread = (lR[parameterName].max - lR[parameterName].min)/4;
                    lSettings.localRemediation[stage][parameterName] = lR[parameterName].min + (stage - 1) * spread;
                }
            }
    
            this._settingsByLevel[i] = lSettings;
        }

        //console.log(this._settingsByLevel);
    }

    // ##############################################################################################################################################
    // ###  GETTERS/SETTERS  ########################################################################################################################
    // ##############################################################################################################################################

    Object.defineProperties(MinigameParameters.prototype, {
        /**
         * the level of difficulty for GLOBAL remediation parameters. Accepted values are integers of the interval [1-5].
         * Values that are not numbers after parseInt(value, 10) will be discarded. Values outside the interval [1-5] will be constrained to interval.
         * @type {number}
         * @memberof Namespace.MinigameParameters#
        **/
        globalLevel: {
            get: function () { return this._currentGlobalLevel; },
            set: function (value) {
                value = parseInt(value, 10);
                if (isNaN(value)) return null;
                value = (Math.max(Math.min(value, 5), 1));
                this._currentGlobalLevel = value;
                return this._currentGlobalLevel;
            }
        },
        localRemediationStage : {
            get : function () { return this._currentLocalRemediationStage; },
            set: function (value) {
                value = parseInt(value, 10);
                if (isNaN(value)) return null;
                value = (Math.max(Math.min(value, 5), 1));
                this._currentLocalRemediationStage = value;
                return this._currentLocalRemediationStage;
            } }
    });


    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################

    /**
     * Returns the data for a minigame setup depending on the difficulty level required
     * @param levelNumber {Type} the levelNumber we want the setup for
     * @return {object.<string, string>} a setup object
    **/
    MinigameParameters.prototype.getGlobalParams = function getGlobalParams () {
        return this._settingsByLevel[this.globalLevel].globalRemediation;
    };
    
    /**
     * Returns the data for a minigame setup depending on the difficulty level required
     * @param levelNumber {Type} the levelNumber we want the setup for
     * @return {object.<string, string>} a setup object
    **/
    MinigameParameters.prototype.getLocalParams = function getLocalParams () {
        return this._settingsByLevel[this.globalLevel].localRemediation[this._currentLocalRemediationStage];
    };

    MinigameParameters.prototype.getGeneralParams = function getGeneralParams () {
        return this._settingsByLevel[this.globalLevel].generalParameters;
    };
    
    MinigameParameters.prototype.increaseLocalDifficulty = function increaseLocalDifficulty () {
        if (++this._currentLocalRemediationStage > 5) this._currentLocalRemediationStage = 5;
        //##console.info("Current Local Remediation Stage : " + this._currentLocalRemediationStage + " of global level " + this._currentGlobalLevel);
    };

    MinigameParameters.prototype.decreaseLocalDifficulty = function decreaseLocalDifficulty () {
        if (--this._currentLocalRemediationStage < 1) this._currentLocalRemediationStage = 1;
        //##console.info("Current Local Remediation Stage : " + this._currentLocalRemediationStage + " of global level " + this._currentGlobalLevel);
    };    

    MinigameParameters.prototype.initLocalRemediationStage = function initLocalRemediationStage () {
        this._currentLocalRemediationStage = 3;
    };

    module.exports = MinigameParameters;
})();