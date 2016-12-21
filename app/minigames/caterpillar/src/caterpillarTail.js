define([
], function (
) {

    'use strict';

    function CaterpillarTail(x, y, spriteName, game) {
        Phaser.Group.call(this, game);

        this.x = x;
        this.y = y;

        this.speed = 1;

        this.tail = this.create(0, 0, 'caterpillarTail', spriteName);
        this.tail.y -= this.tail.height / 4;
        this.tail.anchor.setTo(0.5, 0.5);

        this.moving = false;
        this.paused = false;

    };

    CaterpillarTail.prototype = Object.create(Phaser.Group.prototype);
    CaterpillarTail.constructor = CaterpillarTail;

    CaterpillarTail.prototype.setText = function (value) {
        this.text.text = value;
    };

    CaterpillarTail.prototype.pause = function (bool) {
        this.paused = bool;
    };

    CaterpillarTail.prototype.moveTo = function (y, wait) {
        this.wait = wait * 60;
        this.newY = y;
        this.diffY = this.y - this.newY;
        this.moving = true;

        if (this.newY < this.y) {
            this.up = true;
        }
        else {
            this.up = false;
        }
    };

    CaterpillarTail.prototype.update = function () {
        if (!this.paused) {
            if (this.moving) {
                if (this.wait > 0) {
                    this.wait--;
                }
                if (this.wait <= 0) {
                    if (this.up) {
                        this.diffY -= 1 * this.speed;
                        this.y -= 1 * this.speed;
                        if (this.diffY <= 0) {
                            this.moving = false;
                        }
                    }
                    else if (!this.up) {
                        this.diffY += 1 * this.speed;
                        this.y += 1 * this.speed;
                        if (this.diffY >= 0) {
                            this.moving = false;
                        }
                    }

                }
            }
        }
    };

    return CaterpillarTail;
});