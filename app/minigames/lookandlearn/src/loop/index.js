function loop(game){
    if(game.layouts !== undefined){
        var i = 0;
        for(i; i < game.layouts.length; i++){
            if(game.layouts[i].enabled){
                game.layouts[i].update();
            }
        }
    }
}

module.exports = loop;
