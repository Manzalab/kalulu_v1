(function () {

    var arr, minx, maxx, miny, maxy;
    
    function getRect (path) {

        arr = path.commands;

        minx = 2000;
        maxx = 0;
        miny = 2000;
        maxy = 0;

        for (var i = 0 ; i < arr.length ; i++) {
            var pos = arr[i];
            if (!(pos.x && pos.y)) continue;

            minx = Math.min(minx, pos.x);
            maxx = Math.max(maxx, pos.x);
            miny = Math.min(miny, pos.y);
            maxy = Math.max(maxy, pos.y);
        }

        var lRect = {
            x       : minx,
            y       : miny,
            w       : maxx - minx,
            h       : maxy - miny,
            centerX : (maxx - minx) / 2,
            centerY : (maxy - miny) / 2
        };

        // console.log(lRect);
        return lRect;
    }

    module.exports = getRect;

})();