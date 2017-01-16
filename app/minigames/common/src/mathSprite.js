define([
], function (
) {

    'use strict';

    /**
     * MathSprite object
	 * @class
     * @extends Phaser.Group
     * @memberof Ants
     * @param x {int} x position
     * @param y {int} y position
     * @param this.game {Phaser.this.game} this.game instance
	**/

    var TEXTFONTSIZE = 75;

    function MathSprite(x, y, value, game, width, height) {
        width = width || 100;
        height = height || 100;

        Phaser.Group.call(this, game);

        this.game = this.game;
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.mathSprites = [];
        this.setValue(value);
    };

    MathSprite.prototype = Object.create(Phaser.Group.prototype);
    MathSprite.constructor = MathSprite;

    MathSprite.prototype.setValue = function (value) {
        for (var i = 0; i < this.mathSprites.length; i++) {
            this.mathSprites.splice(0, 1)[0].destroy();
        }
        //  value = value.toString();
        if (value > 0)
            if (value <= 6) {
                var mathSprite = this.game.add.sprite(this.w / 2, 0, 'maths', value);
                mathSprite.anchor.setTo(0.5, 0.5);
                mathSprite.width = this.w / 4 - 40;
                mathSprite.scale.y = mathSprite.scale.x;
                this.mathSprites.push(mathSprite);
                this.add(mathSprite);
            }
            else if (value < 10) {
                for (var i = 0 ; i < value ; i++) {
                    var mathSprite = this.game.add.sprite(i * this.w / value - 10 * value, 0, 'maths', 'dec_1');
                    mathSprite.anchor.setTo(0.5, 0.5);
                    mathSprite.width = this.w / value - 10;
                    mathSprite.scale.y = mathSprite.scale.x;
                    this.mathSprites.push(mathSprite);
                    this.add(mathSprite);
                }
            }
            else if (value < 100) {
                var dec_10 = Math.floor(value / 10);
                var dec_1 = value % 10;
                console.log(dec_10);
                for (var i = 0 ; i < dec_10 ; i++) {
                    var mathSprite = this.game.add.sprite(i * this.w / (dec_10 + dec_1) - 10 * (dec_10 + dec_1), 0, 'maths', 'dec_10');
                    mathSprite.anchor.setTo(0.5, 0.5);
                    mathSprite.width = this.w / (dec_10 + dec_1) - 10;
                    mathSprite.height = this.h - 40;
                    this.mathSprites.push(mathSprite);
                    this.add(mathSprite);
                }
                for (var i = 0 ; i < dec_1 ; i++) {
                    var mathSprite = this.game.add.sprite((i + dec_10) * this.w / (dec_10 + dec_1) - 10 * (dec_10 + dec_1), 0, 'maths', 'dec_1');
                    mathSprite.anchor.setTo(0.5, 0.5);
                    mathSprite.width = this.w / (dec_10 + dec_1) - 10;
                    mathSprite.scale.y = mathSprite.scale.x;
                    this.mathSprites.push(mathSprite);
                    this.add(mathSprite);
                }
            }
            else if (value == 100) {
                var mathSprite = this.game.add.sprite(this.w / 2, 0, 'maths', "dec_100");
                mathSprite.anchor.setTo(0.5, 0.5);
                mathSprite.width = this.w / 4 - 40;
                mathSprite.scale.y = mathSprite.scale.x;
                this.mathSprites.push(mathSprite);
                this.add(mathSprite);
            }
    }

    return MathSprite;


});