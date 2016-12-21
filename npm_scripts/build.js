(function () {
    
    'use strict';
    
    console.log('\n#### NPM BUILD\n\n');

    var WebpackEnvironment = require('../webpack_configs/WebpackEnvironment');
    var config = null;

    // Detect how npm is run and branch based on that
    switch(process.env.npm_lifecycle_event) {
        case 'build':
            process.env.htmlTitle = "Build Environment";
            process.env.kaluluLanguage = "english";
            config = require('../webpack_configs/webpack.config.build.js');
        break;
        default:
            config = {};
    }

    var env = new WebpackEnvironment.Build(config);

})();