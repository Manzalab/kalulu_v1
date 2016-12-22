/**
 * Created by Adrien on 03/08/2016.
 */
function Pencil(style, offset){
    this.style = style;
    this.offset = offset || {x:0,y:0};

    this.applyStyle();
    this.reset();
}

Pencil.prototype.paint = function PencilPaint(sheet, dest, noOffset, position){
    sheet.lineWidth = this.lineWidth;
    sheet.lineJoin = 'round';
    sheet.lineCap = 'round';
    sheet.strokeStyle = this.strokeColor;

    sheet.beginPath();
    //sheet.lineStyle(this.lineWidth, this.strokeColor, this.alpha);
    if(noOffset){
        sheet.moveTo(this.lastPosition.x, this.lastPosition.y);
    }else{
        sheet.moveTo(this.lastPosition.x + this.offset.x, this.lastPosition.y + this.offset.y);
    }

    var x, y;
    if(position !== null && position !== undefined){
        x = position.x;
        y = position.y;
    }else{
        x = this.position.x;
        y = this.position.y;
    }

    if(noOffset){
        sheet.lineTo(x, y);
    }else{
        sheet.lineTo(x + this.offset.x, y + this.offset.y);
    }
    sheet.closePath();
    sheet.stroke();
    /*sheet.beginFill(this.strokeColor, this.alpha);
    sheet.drawCircle(x, y, this.lineWidth);
    sheet.endFill();*/

    this.lastPosition.x = x;
    this.lastPosition.y = y;

    dest.clear();
    dest.copy(sheet.canvas, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, this.alpha);
};

Pencil.prototype.startFrom = function PencilPaint(position){
    this.lastPosition.x = position.x;
    this.lastPosition.y = position.y;
};

Pencil.prototype.reset = function PencilReset(){
  this.position = {
      x: 0,
      y: 0
  };

  this.lastPosition = {
      x: 0,
      y: 0
  };
};

Pencil.prototype.goWrong = function PencilGoWrong(){
  this.strokeColor = this.wrongColor;
};

Pencil.prototype.goRight = function PencilGoRight(){
  this.strokeColor = this.goodColor;
};

Pencil.prototype.applyStyle = function PencilApplyStyle(){
    this.strokeColor = this.style.stroke ||'0xffffff';
    this.lineWidth = this.style.width || 2;
    this.alpha = this.style.alpha || 1;
    this.wrongColor = this.style.wrong || '0xff0000';
    this.goodColor = this.strokeColor;
};

module.exports = Pencil;
