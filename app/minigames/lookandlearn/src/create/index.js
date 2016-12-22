var loadLayouts = require('../layouts');
var Phaser = require('phaser-bundle');

function create(context, game, config){
    context.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    if(context.game.device.desktop){
        context.pageAlignHorizontally = true;
    }else{
        context.scale.forceLandscape = true;
    }

    loadLayouts(game, config);
    Emitter.emit(Events.TRIGGER_LAYOUT, -1);

    context.stage.backgroundColor = '#ffffff';

    var progression = new Tracing.ProgressionHandler(config.progression, game);
    progression.load(function(){
      progression.setSeries(config.applicationParameters);
    });
}

module.exports = create;
