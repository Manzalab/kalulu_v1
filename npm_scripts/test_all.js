(function () {
    
    'use strict';
    console.log('\n#### NPM GLOBAL TEST\n\n');

    var config = null;

    // Detect how npm is run and branch based on that
    switch(process.env.npm_lifecycle_event) {
        case 'testAllEnglish':
            process.env.htmlTitle = "Global Test - English Version";
            process.env.kaluluLanguage = 'english';
            config = require('../webpack_configs/webpack.config.test-all.js');
            break;
        case 'testAllSwahili':
            process.env.htmlTitle = "Global Test - Swahili Version";
            process.env.kaluluLanguage = 'swahili';
            config = require('../webpack_configs/webpack.config.test-all.js');
            break;
        case 'testAllFrench':
            process.env.htmlTitle = "Global Test - French Version";
            process.env.kaluluLanguage = 'french';
            config = require('../webpack_configs/webpack.config.test-all.js');
            break;
        default:
            process.env.htmlTitle = "Global Test - English Version";
            process.env.kaluluLanguage = 'english';
            config = require('../webpack_configs/webpack.config.test-all.js');
            break;
    }

    console.log('test_all.js : ' + process.env.kaluluLanguage);
    var WebpackEnvironment = require('../webpack_configs/WebpackEnvironment');
    var env = new WebpackEnvironment.Test(config);
})();