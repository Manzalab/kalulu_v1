/**
 * Created by Adrien on 03/08/2016.
 */
function Painter(sheet, dest, pencil, game){
    this.sheet = sheet;
    this.dest = dest;
    this.pencil = pencil;
    this.game = game;
}

Painter.prototype.clear = function PainterClear(){
    this.sheet.clearRect(0, 0, this.dest.width, this.dest.height);
    this.dest.clear();
    this.dest.copy(this.sheet.canvas);
};

module.exports = Painter;
