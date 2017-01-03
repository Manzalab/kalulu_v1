(function () {
    var fs = require ('fs');

    var graphs = require('../assets/config/letters-descriptor.json').letters;
    var painterRadius = 15;
    // console.log(typeof graphs);
    // console.log(graphs);
    var stats = {};
    var minx, maxx, miny, maxy;
    var graph, spline;

    graphs:
    for (var graphName in graphs) {
        
        graph = graphs[graphName];
        
        minx = 1000;
        maxx = 0;
        miny = 1000 ;
        maxy = 0;
        
        splines:
        for (var i = 0 ; i < graph.length ; i++) {
            
            spline = graph[i];

            points:
            for (var j = 0 ; j < spline.length ; j++) {
                var point = spline[j];
                minx = Math.min(minx, point.x);
                maxx = Math.max(maxx, point.x);
                miny = Math.min(miny, point.y);
                maxy = Math.max(maxy, point.y);
            }
        }

        stats[graphName] = {
            offsetX : -minx + painterRadius,
            offsetY : -miny + painterRadius,
            w       : maxx - minx + 2 * painterRadius,
            h       : maxy - miny + 2 * painterRadius
        };
    }

    fs.writeFileSync('../assets/config/graph-stats.json', JSON.stringify(stats));
    
    

    // console.log("min x : " + minx + "\nmax x : " + maxx + "\nmin y : " + miny + "\nmaxy : " + maxy);
})();