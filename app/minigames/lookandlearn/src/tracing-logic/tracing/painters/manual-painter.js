/**
 * Created by Adrien on 08/08/2016.
 */
var Painter = require('./painter');

function ManualPainter(sheet, dest, pencil, sheetPosition, game){
    Painter.call(this, sheet, dest, pencil, game);

    this.sheetPosition = sheetPosition;
    this.pointer = game.input.mousePointer;
    this.firstPaint = true;
    this.isPainting = false;

    if(!game.device.desktop){
        this.pointer = game.input.pointer1;
    }
}
ManualPainter.prototype = Object.create(Painter.prototype);
ManualPainter.prototype.constructor = ManualPainter;

ManualPainter.prototype.checkTouch = function ManualPainterCheckTouch(){
  this.isPainting = this.pointer.isDown;

  var x, y;
  x = this.pointer.position.x - this.sheetPosition.x;
  y = this.pointer.position.y - this.sheetPosition.y;

  this.pencil.position.x = x;
  this.pencil.position.y = y;

  if(!this.isPainting){
    this.firstPaint = true;
  }
};

ManualPainter.prototype.update = function ManualPainterUpdate(canPaint, context){
    if(this.isPainting){

        var x, y;
        x = this.pointer.position.x - this.sheetPosition.x;
        y = this.pointer.position.y - this.sheetPosition.y;

        if(x >= 0 && x <= this.sheet.width && y >= 0 && y <= this.sheet.height){

            this.pencil.position.x = x;
            this.pencil.position.y = y;

            if(this.firstPaint && canPaint){
              this.firstPaint = false;
              this.pencil.startFrom({x:x,y:y});
            }

            if(canPaint){
              if(context  !== undefined){
                this.pencil.paint(context, this.dest, true);
              }else{
                this.pencil.paint(this.sheet, this.dest, true);
              }
            }

            return true;
        }
    }else{
        this.firstPaint = true;
    }

    return false;
};

ManualPainter.prototype.drawPath = function ManualPainterDrawPath(points, offset, context, dest){
  for(var i = 0; i < points.length; i++){
    this.pencil.position.x = points[i].x + offset.x;
    this.pencil.position.y = points[i].y + offset.y;

    if(i === 0){
      this.pencil.startFrom(this.pencil.position);
    }

    this.pencil.paint(context, dest, true);
  }
};

ManualPainter.prototype.reset = function ManualPainterReset(){
  this.pointer.isDown = false;
  this.firstPaint = true;
};

module.exports = ManualPainter;
