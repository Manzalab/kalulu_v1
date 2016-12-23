(function () {
    
    'use strict';

    console.log('\n#### NPM TEST MINIGAMES\n\n');

    var config = null;

    // Detect how npm is run and branch based on that
    switch(process.env.npm_lifecycle_event) {
        case 'testMinigamesEnglish':
            process.env.htmlTitle = "Minigames Test - English";
            process.env.kaluluLanguage = "english";
            config = require('../webpack_configs/webpack.config.test-minigames.js');
        break;
        case 'testMinigamesSwahili':
            process.env.htmlTitle = "Minigames Test - Swahili";
            process.env.kaluluLanguage = "swahili";
            config = require('../webpack_configs/webpack.config.test-minigames.js');
        break;
        default:
            process.env.htmlTitle = "Minigames Test - English";
            process.env.kaluluLanguage = "english";
            config = require('../webpack_configs/webpack.config.test-minigames.js');
    }

    var WebpackEnvironment = require('../webpack_configs/WebpackEnvironment');

    var env = new WebpackEnvironment.Test(config);

})();