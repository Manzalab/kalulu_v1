var fs                 = require('fs');
var webpack            = require('webpack');
var HtmlWebpackPlugin  = require('html-webpack-plugin');
var WebpackMerge       = require('webpack-merge');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin  = require('copy-webpack-plugin');

exports.mergeConfigs = WebpackMerge;
/*function () {
    return WebpackMerge(function(target, source, key) {
        if(target instanceof Array) {
            return [].concat(target, source);
        }
        return source;
    });
}();*/

exports.extractBundle = function (options) {
    
    var entry = {};

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
                },
                mangle : false
            })
        ]
    };
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
    };
};

exports.copyAssetsForMinigames = function (minigameFolderNames, language) {
    // console.log('copy logic for language : ' + language);
    var transfers = [];
    var count = minigameFolderNames.length;
    for (var i = 0 ; i < count ; i++) {
        var folderName = minigameFolderNames[i];

        attemptCopyRequest('minigames', transfers, folderName, 'data');
        attemptCopyRequest('minigames', transfers, folderName, 'images');
        attemptCopyRequest('minigames', transfers, folderName, 'audio/sfx');
        attemptCopyRequest('minigames', transfers, folderName, 'audio/kalulu', language);
    }

    // console.log(transfers);

    return {
        plugins: [
            // Enable multi-pass compilation for enhanced performance in larger projects. Good default.
            new CopyWebpackPlugin(transfers)
        ]
    };
};

exports.copyAssetsForModules = function (moduleFolderNames, language) {
    
    var transfers = [];
    var count = moduleFolderNames.length;
    for (var i = 0 ; i < count ; i++) {
        var folderName = moduleFolderNames[i];
        console.log('copy logic for module : ' + folderName);
        attemptCopyRequest('modules', transfers, folderName, 'data', language, true);
        attemptCopyRequest('modules', transfers, folderName, 'images', language, true);
        attemptCopyRequest('modules', transfers, folderName, 'sounds', language, true);
    }

    console.log(transfers);

    return {
        plugins: [
            // Enable multi-pass compilation for enhanced performance in larger projects. Good default.
            new CopyWebpackPlugin(transfers)
        ]
    };
};



function attemptCopyRequest (category, array, folderName, assetsSubPath, language, mergeAssets) {
    //console.log('testing ' + folderName + ' > ' + assetsSubPath + ' > ' + language);
    
    language = typeof language === 'undefined' ? '' : '/' + language;
    mergeAssets = typeof mergeAssets === 'undefined' ? false : mergeAssets;

    var srcPath = 'app/' + category + '/' + folderName + '/assets/' + assetsSubPath + language;
    var destPath = '';
    
    if(mergeAssets) {
        destPath = 'assets/' + assetsSubPath + '/' + folderName;
    }
    else {
        destPath = category + '/' + folderName + '/assets/' + assetsSubPath;
    }
    console.log('\n\nTesting Path <' + srcPath + '> to copy to <' + destPath + '\n');
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