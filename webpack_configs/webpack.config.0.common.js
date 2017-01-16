var path = require('path');
var webpack = require('webpack');

var components = require('./components.webpack.config.js');


var PATHS = {
    www : path.resolve(__dirname, '../www/')
};

module.exports = components.mergeConfigs(
    
    {
        devtool : 'eval-source-map',
        output : {
            path : PATHS.www,
            publicPath : '',
            // the [name] syntax allows to build each entry point separately in a js file named after the key in the entry object
            // the [chunkhash] syntax allows to add the chunk version hash string to the filename for better caching
            filename : '[name].[hash].js',
            chunkFilename: '[chunkhash].js'
        },

        resolve : {
            root : path.resolve(__dirname, '../app'),
            modulesDirectories : ['node_modules', 'app/assets', 'app/modules', 'app/libs', 'app/minigames', 'app/src']
        },
        module: {
            loaders: [
                { test: /\.json/, loader: 'json-loader' },
                { test: /\.csv$/, loader: 'dsv-loader', query: {delimiter :";" } }, //will load all .csv files with dsv-loader by default

            ]
        },
        plugins : [
            new webpack.DefinePlugin({
              KALULU_VERSION  : JSON.stringify(process.env.npm_package_version),
              KALULU_LANGUAGE : JSON.stringify(process.env.kaluluLanguage),
              KALULU_ENV      : process.env.productionBuild
            }),
            new webpack.ProvidePlugin({
              Phaser  : ('phaser-bundle')
            })
        ]
    },
    // If you want to preserve possible dotfiles within your www directory, you can use path.join(PATHS.www, '*') instead of PATHS.www
    components.clean(PATHS.www)
);


console.log('\n Common :');
console.log(process.env.kaluluLanguage);
console.log(module.exports);