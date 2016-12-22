/**
 * Created by Adrien on 16/08/2016.
 */
var Layout = require('./layout');

function DebugLayout(game, settings){
    Layout.call(this, game, settings);

    this.context = game.add.graphics(settings.x, settings.y);
    this.group.add(this.context);

    var that = this;
    Emitter.on(Events.DEBUG_DIRECTION, function(model, player, own){
      that.context.clear();

      that.context.beginFill("0xffffff", 1);
      that.context.drawRect(400, 700, 400, 400);
      that.context.endFill();

      that.context.lineStyle(10, '0x00ff00');
      that.context.moveTo(500, 800);
      that.context.lineTo(500 + model.x, 800 + model.y);

      that.context.lineStyle(10, '0x0000ff');
      that.context.moveTo(500, 900);
      that.context.lineTo(500 + player.x, 900 + player.y);
    });

  Emitter.on(Events.DEBUG_DERIVING, function(referentPoint, derive){
   /* that.context.beginFill("0xff00ff", 1);
    that.context.drawCircle(referentPoint.x, referentPoint.y, 15);
    that.context.endFill();*/

    that.context.lineStyle(10, '0xff0000');
    that.context.moveTo(500, 1000);
    that.context.lineTo(500 + derive.x, 1000 + derive.y);
  });
}

DebugLayout.prototype = Object.create(Layout.prototype);
DebugLayout.prototype.constructor = DebugLayout;
DebugLayout.prototype.update = function DebugLayoutUpdate(){
    Layout.prototype.update.call(this);
};

module.exports = DebugLayout;
