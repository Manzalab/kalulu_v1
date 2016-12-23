var path              = require('path');
var fs                = require('fs');
var webpack           = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var components        = require('./components.webpack.config.js');

// TODO : add https://www.npmjs.com/package/favicons-webpack-plugin for favicons management
module.exports = components.mergeConfigs(
    {
        entry : {
            'main' : ['./app/src']
        },
        plugins : [
            new webpack.ProvidePlugin({ // the plugin is a wrapper for libraries and objects we need in all the modules, so we don't need to require them all the time
                Config       : 'application/config',
                Events       : 'application/events',
                PIXI3        : 'modules/user_interface/libs/pixi',
                createjs     : 'modules/user_interface/libs/tweenjs-0.6.2.combined',
                _            : 'underscore',
                Dat          : 'dat.gui'
            }),
            new CopyWebpackPlugin([
                { from: 'app/config', to: 'config' }
            ]),
            new webpack.PrefetchPlugin([path.resolve(__dirname, '../app/src/')], './application/application')
        ]
    },
    components.copyAssetsForMinigames(fs.readdirSync('app/minigames'), process.env.kaluluLanguage),
    components.copyAssetsForModules(['user_interface', 'language', 'maths'], process.env.kaluluLanguage),
    components.generateHtml(),
    components.minify(),
    components.extractBundle([{
        name    : 'vendor',
        entries : ['phaser-bundle', 'stats', 'eventemitter3', 'dat.gui', 'modules/user_interface/libs/pixi', 'pdfjs-dist']
    },
    {
        name    : 'minigames-common',
        entries : getCommonScriptsPaths()
    }])
);

function getCommonScriptsPaths () {
    var files = fs.readdirSync('app/minigames/common/src');
    var paths = [];
    var count = files.length;
    for (var i = 0 ; i < count ; i++) {
        paths.push('common/src/' + files[i]);
    }
    return paths;
}



console.log('\n Build :');
console.log(process.env.kaluluLanguage);
console.log(module.exports);