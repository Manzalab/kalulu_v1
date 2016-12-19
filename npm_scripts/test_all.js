(function () {
    
    'use strict';
    
    var WebpackEnvironment = require('../webpack_configs/WebpackEnvironment');

    console.log('\n#### NPM GLOBAL TEST\n\n');



    var config = null;

    // Detect how npm is run and branch based on that
    switch(process.env.npm_lifecycle_event) {
        case 'testAll':
            process.env.htmlTitle = "Global Test";
            config = require('../webpack_configs/webpack.config.test-all.js');
        break;
        default:
            config = {};
    }

    var env = new WebpackEnvironment.Test(config);
})();