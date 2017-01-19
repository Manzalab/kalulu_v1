(function () {
    
    'use strict';
    console.log('\n#### NPM BUILD\n\n');

    var config = null;

    // Detect how npm is run and branch based on that
    switch(process.env.npm_lifecycle_event) {
        case 'buildEnglish':
            process.env.htmlTitle = "Build Environment - English Version";
            process.env.kaluluLanguage = "english";
            process.env.devtool = 'eval-source-map';
            config = require('../webpack_configs/webpack.config.build.js');
        break;
        case 'buildSwahili':
            process.env.htmlTitle = "Build Environment - Swahili Version";
            process.env.kaluluLanguage = "swahili";
            process.env.devtool = 'eval-source-map';
            config = require('../webpack_configs/webpack.config.build.js');
        break;
        case 'buildFrench':
            process.env.htmlTitle = "Build Environment - French Version";
            process.env.kaluluLanguage = "french";
            process.env.devtool = 'eval-source-map';
            config = require('../webpack_configs/webpack.config.build.js');
        break;
        case 'buildProdEnglish':
            process.env.htmlTitle = "Build Environment - English Version";
            process.env.kaluluLanguage = "english";
            process.env.productionBuild = true;
            process.env.devtool = 'cheap-source-map';
            config = require('../webpack_configs/webpack.config.build.js');
        break;
        case 'buildProdSwahili':
            process.env.htmlTitle = "Build Environment - Swahili Version";
            process.env.kaluluLanguage = "swahili";
            process.env.productionBuild = true;
            process.env.devtool = 'cheap-source-map';
            config = require('../webpack_configs/webpack.config.build.js');
        break;
        default:
            process.env.htmlTitle = "Build Environment - English Version";
            process.env.kaluluLanguage = "english";
            process.env.devtool = 'eval-source-map';
            config = require('../webpack_configs/webpack.config.build.js');
    }

    var WebpackEnvironment = require('../webpack_configs/WebpackEnvironment');

    var env = new WebpackEnvironment.Build(config);

})();