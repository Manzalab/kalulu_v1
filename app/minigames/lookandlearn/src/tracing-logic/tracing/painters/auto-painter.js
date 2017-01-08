/**
 * Created by Adrien on 03/08/2016.
 */
var Painter = require('./painter');

function AutoPainter(sheet, dest, pencil, game){
    Painter.call(this, sheet, dest, pencil, game);
    this.path = null;
    this.currentStep = this.index = 0;

    this.waitingFrame = 0;
    this.frameSkip = 3;
}

AutoPainter.prototype = Object.create(Painter.prototype);
AutoPainter.prototype.constructor = AutoPainter;

AutoPainter.prototype.setup = function AutoPainterSetup(model){
    this.path = model;
    this.prepareStep();
};

AutoPainter.prototype.reset = function AutoPainterReset(){
    this.finished = false;
    this.path = null;
    this.currentStep = this.index = 0;
};

AutoPainter.prototype.update = function AutoPainterUpdate(){
    console.log('tracing');
    if(!this.finished && this.path != null && this.waitingFrame <= 0){
        if(this.waitForEnd === true){
            console.log('finished');
            this.finished = true;
            this.waitForEnd = false;
        }
        else if(this.index < this.path[this.currentStep].length){
            var x = this.path[this.currentStep][this.index].x;
            var y = this.path[this.currentStep][this.index].y;

            this.pencil.position.x = x;
            this.pencil.position.y = y;
            this.pencil.paint(this.sheet, this.dest);

            var skipSize = 1;
            for(var i = this.index; i < this.path[this.currentStep].length; i++){
                var x2 = this.path[this.currentStep][i].x;
                var y2 = this.path[this.currentStep][i].y;

                var dist = distance({x:x,y:y},{x:x2,y:y2});

                if(dist <= 20){
                    skipSize++;
                }

                if(skipSize + this.index >= this.path[this.currentStep].length){
                    skipSize = this.path[this.currentStep].length - this.index - 1;
                    if(skipSize <= 0){
                        skipSize = 1;
                    }
                }
            }

            this.waitingFrame = this.frameSkip;
            this.index += skipSize;
        }else{
            this.currentStep++;

            if(this.currentStep >= this.path.length){
                this.waitForEnd = true;
                console.log('waiting for end');
                this.waitingFrame = this.frameSkip*20;
            }else{
                this.waitingFrame = this.frameSkip*10;

                this.prepareStep();
            }
        }
    }

    this.waitingFrame--;
};

AutoPainter.prototype.prepareStep = function AutoPainterPrepareStep(){
    this.index = 0;
    this.pencil.startFrom({x: this.path[this.currentStep][this.index].x, y: this.path[this.currentStep][this.index].y});
    this.update();
};

function distance(p1, p2) {
    return (p1.x - p2.x) * (p1.x - p2.x) +
      (p1.y - p2.y) * (p1.y - p2.y);
}

module.exports = AutoPainter;
