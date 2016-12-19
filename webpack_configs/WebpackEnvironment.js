// webpack
var webpack              = require('webpack');
var WebpackDevServer     = require('webpack-dev-server');

// configs
var webpackCommonConfig = require('../webpack_configs/webpack.config.0.common.js');
var devServerConfig      = require('../webpack_configs/webpack.dev-server.config.js');
var components           = require('../webpack_configs/components.webpack.config.js');

// utils
var path                 = require('path');
var validate             = require('webpack-validator');
var express              = require('express');
var fs                   = require('fs');


module.exports = {
    Test : TestEnvironment,
    Build : BuildEnvironment
};

function TestEnvironment (webpackSpecificConfig) {
    
    this.config = validate(components.mergeConfigs(webpackCommonConfig, webpackSpecificConfig));
    console.log('\n## Test Environment Final Config :');
    console.log(this.config);
    console.log('\n\n');
    this.compiler = webpack(this.config);

    this.devServerConfig = devServerConfig;

    this.server = new WebpackDevServer(this.compiler, this.devServerConfig);

    this.server.listen(3000, 'localhost', function () {});
};


function BuildEnvironment (webpackSpecificConfig) {
    
    this.config = validate(components.mergeConfigs(webpackCommonConfig, webpackSpecificConfig));
    console.log('\n## Build Environment Final Config :');
    console.log(this.config);
    console.log('\n\n');
    this.compiler = webpack(this.config).run(onComplete);
};


// ################### Completion Callback ################

function onComplete (error, stats) {
    
    if (error) {
        console.error('uncool');
    };

    fs.writeFileSync('./stats.json', JSON.stringify(stats.toJson()));
    console.log(stats.toString());
    console.log('\n##### [WEBPACK BUILD COMPLETE] Go to localhost:3000 ####\n\n');
    serve();
}

function serve () {
    
    var app = express();
    app.use(express.static(path.resolve(__dirname, '../www')));
    app.get('/', function (){});
    app.listen(3000, function(){});
}