var path              = require('path');
var webpack           = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var components        = require('./components.webpack.config.js');

// TODO : add https://www.npmjs.com/package/favicons-webpack-plugin for favicons management
console.log(path.resolve(__dirname, '../app/src'));
module.exports = components.mergeConfigs(
    {
        entry : {
            'main' : ['./app/src']
        },
        plugins : [
            new webpack.ProvidePlugin({ // the plugin is a wrapper for libraries and objects we need in all the modules, so we don't need to require them all the time
                Config       : 'application/config'
            }),
            new CopyWebpackPlugin([
                { from: 'app/config', to: 'config' }
            ]),
            new webpack.PrefetchPlugin([path.resolve(__dirname, '../app/src/')], './application/application')
        ]
    },
    components.copyAssetsForMinigames(['common', 'crabs'], process.env.kaluluLanguage),
    components.generateHtml(),
    components.minify(),
    components.extractBundle({
        name    : 'vendor',
        entries : ['phaser-bundle', 'stats', 'eventemitter3', 'dat.gui']
    })
);

console.log('\n Build :');
console.log(module.exports);