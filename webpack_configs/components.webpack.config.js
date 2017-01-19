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

exports.extractBundle = function (optionsArray) {
    var entry = {};
    var config = {};
    var names = [];

    for (var i = 0 ; i < optionsArray.length ; i++) {
        
        var options = optionsArray[i];

        entry[options.name] = options.entries;

        names.push(options.name);
    }

    names.reverse();
    names.push('manifest');

    return {
            // Define an entry point needed for splitting.
            entry: entry,

            plugins: [
                // Extract bundle and manifest files. Manifest is needed for reliable caching.
                new webpack.optimize.CommonsChunkPlugin({
                    names: names,
                    minChunks: Infinity
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
                title: process.env.htmlTitle,
                template : './webpack_configs/index.template.ejs'
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

exports.copyCommonAssets = function (language) {

    var ignore = [
        'swahili/**/*',
        'english/**/*',
        'french/**/*'
    ];

    return {
        plugins: [
            // Enable multi-pass compilation for enhanced performance in larger projects. Good default.
            new CopyWebpackPlugin([
                { from: 'app/assets/images',                    to: 'assets/images',    ignore : ignore },
                { from: 'app/assets/images/'+ language + '/',   to: 'assets/images'                     },
                { from: 'app/assets/pdf',                       to: 'assets/pdf',       ignore : ignore },
                { from: 'app/assets/pdf/'   + language + '/',   to: 'assets/pdf'                        },
                { from: 'app/assets/data/',                     to: 'assets/data',      ignore : ignore },
                { from: 'app/assets/data/'  + language + '/',   to: 'assets/data'                       },
                { from: 'app/assets/video/',                    to: 'assets/video',     ignore : ignore },
                { from: 'app/assets/video/' + language + '/',   to: 'assets/video'                      }
            ])
        ]
    };
};

exports.copyCordova = function () {

    return {
        plugins: [
            // Enable multi-pass compilation for enhanced performance in larger projects. Good default.
            new CopyWebpackPlugin([
                { from: 'app/src/cordova.js', to: '' }
            ])
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
        attemptCopyRequest('minigames', transfers, folderName, 'config');
        attemptCopyRequest('minigames', transfers, folderName, 'audio');
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
        attemptCopyRequest('modules', transfers, folderName, 'data', undefined, true);
        attemptCopyRequest('modules', transfers, folderName, 'images', undefined, true);
        attemptCopyRequest('modules', transfers, folderName, 'images', language, true);
        attemptCopyRequest('modules', transfers, folderName, 'sounds', undefined, true);
        attemptCopyRequest('modules', transfers, folderName, 'sounds', language, true);
        attemptCopyRequest('modules', transfers, folderName, 'video', undefined, true);
        attemptCopyRequest('modules', transfers, folderName, 'video', language, true);
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
    var ignore = [];
    if (typeof language === 'undefined') {
        language = '';
        ignore = [
            'swahili/**/*',
            'english/**/*',
            'french/**/*'
        ];
    }
    else {
        language = '/' + language;
    }

    mergeAssets = typeof mergeAssets === 'undefined' ? false : mergeAssets;

    var srcPath = 'app/' + category + '/' + folderName + '/assets/' + assetsSubPath + language;
    var destPath = '';
    
    if(mergeAssets) {
        destPath = 'assets/' + assetsSubPath + '/' + folderName;
    }
    else {
        destPath = category + '/' + folderName + '/assets/' + assetsSubPath;
        if (assetsSubPath.indexOf('kalulu') === -1) ignore.push('kalulu/**/*');
    }
    console.log('\n\nTesting Path <' + srcPath + '> to copy to <' + destPath + '>, ignoring ' + ignore + '\n');
    if (testPathToFolder(srcPath)) array.push({ from: srcPath, to: destPath, ignore : ignore});
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