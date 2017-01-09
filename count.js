var fs = require('fs');

fs.readdirSync(__dirname + '/app')



function countFiles (path) {
    

    console.log();

    var count = {
        'js' : 0,
        'wav' : 0,
        'ogg' : 0,
        'png' : 0,
        'jpg' : 0,
        'json' : 0
    };

    var list = fs.readdirSync(path);

    for (var i = 0 ; i < list.length ; i++) {
        var fileName = list[i];
        if (fileName.indexOf('.') !== -1) {
            var parts = filename.split('.');
            ext = parts[parts.length - 1];
            switch ex
        }
        else {
            countFiles(path + fileName + '/');
        }
    }

}


countFiles(__dirname + '/app/');