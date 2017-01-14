(function () {
    
    'use strict';
    var Emitter      = require('../tracing-logic/events/emitter');
    var Events       = require('../tracing-logic/events/events');
    var TracingFrame = require('./tracing_frame');
    var getFontRect  = require('../utils/get-font-rect');
    var graphemeSplines = require('../../assets/config/letters-descriptor').letters;

    function GraphemeButton (game, parent, data, font, callback) {

        Phaser.Group.call(this, game, parent, 'GraphemeButton_' + data.value);
        
        this._graphemeId = data.value;
        this._coords = data.rectangle;
        this._font = font;
        this._fontImage = null;
        this._body = new TracingFrame(this.game, data.value, data.rectangle);
        this.add(this._body);
        if (!callback) {
            console.error('The callback of the Grapheme Button is not a function :');
            console.log(this);
        }
        this._body.events.onInputDown.add(callback);
    }

    GraphemeButton.prototype = Object.create(Phaser.Group.prototype);
    GraphemeButton.prototype.constructor = GraphemeButton;

    function getWidthFromFont () {

    }

    GraphemeButton.prototype.easeIn = function easeIn (delay) {
        
        delay = typeof delay === 'undefined' ? 800 : delay;
        this.game.add.tween(this._body.scale).to({x: 1.0, y: 1.0}, delay, Phaser.Easing.Bounce.Out, true);
        if (this._fontImage) {
            this.game.add.tween(this._fontImage.scale).to({x: this._fontScale, y: this._fontScale}, delay, Phaser.Easing.Bounce.Out, true);
        }
    };

    GraphemeButton.prototype.draw = function drawWith (tracer) {

        this._tracer = tracer;
        // this.startTracingDelay = null;
        // this.secondsOfDelay = 0.8;
        var tracerScaleRatio = this.scaleRatio = 0.8;

        this.add(tracer.group);
        tracer.group.scale.set(tracerScaleRatio, tracerScaleRatio);
        tracer.group.position.set(this._coords.x, this._coords.y);
        

        console.log('Button ' + this._graphemeId + ' starts Tracing its Grapheme');
        this.tracingOn = true;

        Emitter.on(Events.TRIGGER_LAYOUT, this._onDrawingComplete);
        Emitter.emit(Events.NEW_LETTER, graphemeSplines[this._graphemeId], this._graphemeId);
    };

    GraphemeButton.prototype.update = function update () {
        this._tracer.update();
    }

    GraphemeButton.prototype._onDrawingComplete = function onDrawingComplete () {
        console.log('[GraphemeButton] Grapheme Complete');
    };

    GraphemeButton.prototype.printFromFont = function printFromFont () {

        // The parameters are str, x, y, fontSize, Note that y is the position of the baseline.
        var ySize = this._coords.height * 0.8;
        var path = this._font.getPath(this._graphemeId.toString(), 0, ySize, ySize);
        var rect = getFontRect(path);
        var bmp = new Phaser.BitmapData(this.game, this._graphemeId + '_fromFont', rect.x + rect.w, rect.y + rect.h);
        
        // If you just want to draw the text you can also use font.draw(ctx, text, x, y, fontSize).
        path.draw(bmp.ctx);

        var lRatioX = Math.min(1, this._coords.width, rect.w);
        var lRatioY = Math.min(1, this._coords.height, rect.h);

        this._fontScale = Math.min(lRatioX, lRatioY);

        var lImage = new Phaser.Image(this.game, this._coords.x - rect.x/2, this._coords.y - rect.y/2, bmp);
        lImage.scale.set(0, 0);
        lImage.anchor.set(0.5, 0.5);
        // window.image1 = lImage;
        this._fontImage = lImage;
        this.add(lImage);
    };

    GraphemeButton.prototype.printAfterDrawing = function printAfterDrawing (x, y) {
        
        if (!this.frozenLetters) this.frozenLetters = [];

        var letterBitmapData = new Phaser.BitmapData(this.game, 'frozenLetter' + (this.frozenLetters.length + 1), 600*this.scaleRatio, 900*this.scaleRatio);
                                // source, x, y, width, height, tx, ty, newWidth, newHeight
        letterBitmapData.copy(this.tracingLayout.bitmap, 0, 0, 600, 900, 0, 0, 600*this.scaleRatio, 900*this.scaleRatio);
        var lImage = new Phaser.Image(this.game, x, y, letterBitmapData);
        
        this.frozenLetters.push(lImage);
        this.imagePhaseStage.add(lImage);
    };

    GraphemeButton.prototype.printWithoutDrawing = function printWithoutDrawing (x, y) {
        
    };

    module.exports = GraphemeButton;
})();