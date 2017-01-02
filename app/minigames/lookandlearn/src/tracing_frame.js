(function () {
    'use strict';
    
    function TracingFrame (game, x, y, width, height, color) {

        color = color || { r : 255, g : 255, b : 255, a : 1 };       

        this.game = game;
        this._texture = new Phaser.BitmapData(this.game, 'lettersFrame', width, height);
        this._texture.fill(color.r, color.g, color.b, color.a);

        Phaser.Sprite.call(this, this.game, x, y, this._texture);
        // this.lettersFrame = new Phaser.Sprite(this.game, x, y, this._texture);
        this.name = "Tracing Frame";
        this.anchor.set(0.5, 0.5);
        this.scale.set(0, 0);
    }

    TracingFrame.prototype = Object.create(Phaser.Sprite.prototype);
    TracingFrame.prototype.constructor = TracingFrame;


    TracingFrame.prototype.easeIn = function easeIn (delay) {
        
        delay = typeof delay === 'undefined' ? 800 : delay;

        this.game.add.tween(this.scale).to({x: 1.0, y: 1.0}, delay, Phaser.Easing.Bounce.Out, true);
    };

    TracingFrame.prototype.bounce = function bounce (delay) {
        
        delay = typeof delay === 'undefined' ? 800 : delay;
        
        var scaleX = this.scale.x;
        var scaleY = this.scale.y;

        this.scale.set(scaleX * 1.25, scaleY * 1.25);

        this.game.add.tween(this.scale).to({x: scaleX, y: scaleY}, delay, Phaser.Easing.Bounce.Out, true);
    };


    module.exports  = TracingFrame;
})();