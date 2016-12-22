(function () {
    
    'use strict';
    
    console.log('\n#### NPM STATS\n\n');

    var WebpackEnvironment = require('../webpack_configs/WebpackEnvironment');
    var config = null;

    // Detect how npm is run and branch based on that
    switch(process.env.npm_lifecycle_event) {
        case 'stats':
            process.env.htmlTitle = "Stats Environment";
            process.env.kaluluLanguage = "english";
            config = require('../webpack_configs/webpack.config.stats.js');
        break;
        default:
            config = {};
    }

    var env = new WebpackEnvironment.Build(config);

})();