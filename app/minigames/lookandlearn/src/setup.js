define([
], function (
) {
    
    'use strict';
    
    function Setup (game) {}
    
    Setup.prototype = {

        create: function () {
            
            var rafiki = this.game.rafiki; // Rafiki is the interface for pedagogic data and the whole Kalulu game. Rafiki means "friend" in swahili.
            var params = this.game.params; // Contain all the parameters for the game.

            // params.initLocalRemediationStage();
            // var difficultyParams = rafiki.getDifficultyLevel();
            // console.log(difficultyParams);
            // params.globalLevel = difficultyParams.globalLevel; // The player's level is stored within Kalulu Player Profile.
            // params.localRemediationStage = difficultyParams.localStage; // The player's level is stored within Kalulu Player Profile.

            this.game.config.applicationParameters = rafiki.getPedagogicData(); // The global parameters contains the pedagogic data parameters.
            console.info("[Setup State] New Data gathered from Rafiki");
            console.log(this.game.config.applicationParameters);
            this.state.start('Phase1Video');
        }
    };
    
    return Setup;
});