var path              = require('path');
var fs                = require('fs');
var webpack           = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var components        = require('./components.webpack.config.js');


module.exports = components.mergeConfigs(
    
    {
        entry : {
            main : 'modules/minigame_tester_interface/src'
        },
        plugins : [
            new webpack.ProvidePlugin({ // the plugin is a wrapper for libraries and objects we need in all the modules, so we don't need to require them all the time
                Config       : 'application/config'
            }),
            new CopyWebpackPlugin([
                { from: 'app/config', to: 'config' }
            ]),
            new webpack.DefinePlugin({
              KALULU_MINIGAMES_LIST : JSON.stringify(fs.readdirSync('app/minigames'))
            })
        ]
    },
    components.copyAssetsForMinigames(fs.readdirSync('app/minigames'), process.env.kaluluLanguage),
    components.copyAssetsForModules(['language', 'maths'], process.env.kaluluLanguage),
    components.generateHtml()
);

console.log('\n Test Minigames - ' + process.env.kaluluLanguage + ' :');
console.log(process.env.kaluluLanguage);
console.log(module.exports);