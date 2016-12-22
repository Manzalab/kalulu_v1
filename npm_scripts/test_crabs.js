(function () {
    
    'use strict';

    console.log('\n#### NPM TEST CRABS\n\n');

    var config = null;
    process.env.kaluluMinigame = "crabs";

    // Detect how npm is run and branch based on that
    switch(process.env.npm_lifecycle_event) {
        case 'testCrabsEnglish':
            process.env.htmlTitle = "Crabs Test - English";
            process.env.kaluluLanguage = "english";
            config = require('../webpack_configs/webpack.config.test-crabs.js');
        break;
        case 'testCrabsSwahili':
            process.env.htmlTitle = "Crabs Test - Swahili";
            process.env.kaluluLanguage = "swahili";
            config = require('../webpack_configs/webpack.config.test-crabs.js');
        break;
        default:
            config = {};
    }

    var WebpackEnvironment = require('../webpack_configs/WebpackEnvironment');

    var env = new WebpackEnvironment.Test(config);

})();