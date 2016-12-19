(function () {
    'use strict';
    
    function Setup (game) {}
    
    Setup.prototype = {

        create: function () {
            
            var rafiki = this.game.rafiki; // Rafiki is the interface for pedagogic data and the whole Kalulu game. Rafiki means "friend" in swahili.
            var params = this.game.params; // Contain all the parameters for the game.

            params.initLocalRemediationStage();
            var difficultyParams = rafiki.getDifficultyLevel();
            console.log(difficultyParams);
            params.globalLevel = difficultyParams.globalLevel; // The player's level is stored within Kalulu Player Profile.
            params.localRemediationStage = difficultyParams.localStage; // The player's level is stored within Kalulu Player Profile.

            this.game.pedagogicData = rafiki.getPedagogicData(params.getGlobalParams()); // The global parameters contains the pedagogic data parameters.
            console.info("[Setup State] New Data gathered from Rafiki");
            this.state.start('Game');
        }
    };
    
    module.exports = Setup;
})();