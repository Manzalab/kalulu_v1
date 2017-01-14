(function () {
    'use strict';
    
    function TracingFrame (game, id, rectangle, color) {

        color = color || { r : 239, g : 241, b : 255, a : 1 };       

        this.game = game;
        this.name = 'Tracing Frame_' + id;
        this.id = id;

        this._texture = new Phaser.BitmapData(this.game, 'lettersFrame', rectangle.width, rectangle.height);
        this._texture.fill(color.r, color.g, color.b, color.a);

        Phaser.Sprite.call(this, this.game, rectangle.x, rectangle.y, this._texture);
        
        this.anchor.set(0.5, 0.5);
        this.scale.set(0, 0);
        this.inputEnabled = true;
    }

    TracingFrame.prototype = Object.create(Phaser.Sprite.prototype);
    TracingFrame.prototype.constructor = TracingFrame;

    TracingFrame.prototype.bounce = function bounce (delay) {
        
        delay = typeof delay === 'undefined' ? 800 : delay;
        
        var scaleX = this.scale.x;
        var scaleY = this.scale.y;

        this.scale.set(scaleX * 1.25, scaleY * 1.25);

        this.game.add.tween(this.scale).to({x: scaleX, y: scaleY}, delay, Phaser.Easing.Bounce.Out, true);
    };


    module.exports  = TracingFrame;
})();