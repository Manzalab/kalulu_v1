(function () {
    
    'use strict';

    console.log('\n#### NPM TEST CRABS\n\n');

    var WebpackEnvironment = require('../webpack_configs/WebpackEnvironment');
    var config = null;

    // Detect how npm is run and branch based on that
    switch(process.env.npm_lifecycle_event) {
        case 'testCrabsEnglish':
            process.env.htmlTitle = "Crabs Test - English";
            process.env.kaluluLanguage = "english";
            config = require('../webpack_configs/webpack.config.test-crabs-english.js');
        break;
        case 'testCrabsSwahili':
            process.env.htmlTitle = "Crabs Test - Swahili";
            process.env.kaluluLanguage = "swahili";
            config = require('../webpack_configs/webpack.config.test-crabs-swahili.js');
        break;
        default:
            config = {};
    }

    var env = new WebpackEnvironment.Test(config);

})()