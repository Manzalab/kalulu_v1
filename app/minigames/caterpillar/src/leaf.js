define ([
], function (
) {

    'use strict';

    function Leaf (x, y, game) {
        Phaser.Group.call(this, game);

        this.x = x;
        this.y = y;

        this.sprite = this.create(0, 0, 'leaf');
        this.sprite.anchor.setTo(0, 0);

        this.speed = 1;
        this.spawned = false;
        this.paused = false;
    }

    Leaf.prototype = Object.create(Phaser.Group.prototype);
    Leaf.prototype.constructor = Leaf;

    Leaf.prototype.reset = function (x, y) {
        this.x = x;
        this.y = y;
    };

    Leaf.prototype.spawn = function () {
        this.spawned = true;
    };

    Leaf.prototype.pause = function (bool) {
        this.paused = bool;
    };

    Leaf.prototype.update = function () {
        if (!this.paused)
            if (this.spawned) {
                this.x -= 1 * this.speed;

                if (this.x < -this.sprite.width) {
                    this.spawned = false;
                }
            }
    };

    return Leaf;
});