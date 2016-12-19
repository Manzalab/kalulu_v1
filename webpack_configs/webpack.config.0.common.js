var path = require('path');
var components = require('./components.webpack.config.js');

var PATHS = {
    www : path.resolve(__dirname, '../www')
}

module.exports = components.mergeConfigs(
    
    {
        devtool : 'eval-source-map',
        output : {
            path : PATHS.www,
            publicPath : '/',
            // the [name] syntax allows to build each entry point separately in a js file named after the key in the entry object
            // the [chunkhash] syntax allows to add the chunk version hash string to the filename for better caching
            filename : '[name].[hash].js',
            chunkFilename: '[chunkhash].js'
        },

        resolve : {
            root : path.resolve(__dirname, '../app'),
            modulesDirectories : ['node_modules', 'app/modules', 'app/libs', 'app/minigames', 'app/src']
        }
    },
    // If you want to preserve possible dotfiles within your www directory, you can use path.join(PATHS.www, '*') instead of PATHS.www
    components.clean(PATHS.www)
);

// console.log('\n Common :');
// console.log(module.exports);