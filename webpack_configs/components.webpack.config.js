var fs                 = require('fs');
var webpack            = require('webpack');
var HtmlWebpackPlugin  = require('html-webpack-plugin');
var WebpackMerge       = require('webpack-merge');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin  = require('copy-webpack-plugin');


exports.mergeConfigs = function () {
    return WebpackMerge(function(target, source, key) {
        if(target instanceof Array) {
            return [].concat(target, source);
        }
        return source;
    });
}();

exports.extractBundle = function (options) {
    
    const entry = {};

    entry[options.name] = options.entries;

    return {
        // Define an entry point needed for splitting.
        entry: entry,

        plugins: [
            // Extract bundle and manifest files. Manifest is needed for reliable caching.
            new webpack.optimize.CommonsChunkPlugin({
                names: [options.name, 'manifest']
            })
        ]
    };
};

exports.minify = function() {
    return {

        devtool : 'source-map',
        
        plugins : [
            
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ]
    }
};

exports.generateHtml = function() {
    
    return {
        
        plugins: [
            
            new HtmlWebpackPlugin({
                title: process.env.htmlTitle
            })
        ]
    };
};

exports.clean = function (path) {
    return {
        plugins: [
            new CleanWebpackPlugin([path], {
                // Without `root` CleanWebpackPlugin won't point to our
                // project and will fail to work.
                root: process.cwd()
            })
        ]
    };
};

exports.getHMR = function () {
    return {
        entry : {
            main : ["webpack-dev-server/client?http://localhost:3000/", "webpack/hot/dev-server"]
        },
        devServer : {
            historyApiFallback : true,
            hot                : true,
            inline             : true
        },
        plugins: [
            // Enable multi-pass compilation for enhanced performance in larger projects. Good default.
            new webpack.HotModuleReplacementPlugin({

                multiStep: true

            })
        ]
    }
};

exports.copyAssetsForMinigames = function (minigameFolderNames, language) {
    // console.log('copy logic for language : ' + language);
    var transfers = [];
    var count = minigameFolderNames.length;
    for (var i = 0 ; i < count ; i++) {
        var folderName = minigameFolderNames[i];

        attemptCopyRequest(transfers, folderName, 'data');
        attemptCopyRequest(transfers, folderName, 'images');
        attemptCopyRequest(transfers, folderName, 'audio/sfx');
        attemptCopyRequest(transfers, folderName, 'audio/kalulu', language);
    }

    // console.log(transfers);

    return {
        plugins: [
            // Enable multi-pass compilation for enhanced performance in larger projects. Good default.
            new CopyWebpackPlugin(transfers)
        ]
    }
};





function attemptCopyRequest (array, folderName, assetsSubPath, language) {
    //console.log('testing ' + folderName + ' > ' + assetsSubPath + ' > ' + language);
    
    language = typeof language === 'undefined' ? '' : '/' + language;
    var srcPath = 'app/minigames/' + folderName + '/assets/' + assetsSubPath + language;
    var destPath = 'minigames/' + folderName + '/assets/' + assetsSubPath;
    
    if (testPathToFolder(srcPath)) array.push({ from: srcPath, to: destPath});
}

function testPathToFolder (pathToFolder) {
    var exists = true;
    try {
        fs.readdirSync(pathToFolder);
    }
    catch (e) {
        exists = false;
    }
    // var log;
    // if (exists) log = ' exists.';
    // else log = ' does not exists.';
    // console.log(pathToFolder + log);
    return exists;
}