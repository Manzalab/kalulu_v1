define([
], function (
) {

    'use strict';

    function CaterpillarBody(x, y, game) {
        Phaser.Group.call(this, game);

        this.x = x;
        this.y = y;

        this.speed = 1;

        this.body = game.add.sprite(0, 0, 'caterpillar', 'Chenille_Corps_Idle01_0000');
        this.body.y -= this.body.height / 4;
        this.body.anchor.setTo(0.5, 0.5);

        this.body.animations.add('idle', Phaser.Animation.generateFrameNames('Chenille_Corps_Idle01_', 0, 5, '', 4), 15, true, false);
        this.body.animations.add('walk', Phaser.Animation.generateFrameNames('Chenille_Corps_marche_', 0, 7, '', 4), 15, true, false);

        this.add(this.body);

        this.text = game.add.text(0, -this.body.height / 4, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";
        this.text.text = "";
        this.text.fontSize = this.body.width / 3;
        this.text.anchor.setTo(0.5, 0.5);
        this.add(this.text);

        this.moving = false;
        this.paused = false;

    };

    CaterpillarBody.prototype = Object.create(Phaser.Group.prototype);
    CaterpillarBody.constructor = CaterpillarBody;

    CaterpillarBody.prototype.setText = function (value) {
        this.text.text = value;
    };

    CaterpillarBody.prototype.pause = function (bool) {
        this.paused = bool;
    };

    CaterpillarBody.prototype.moveTo = function (y, wait) {
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

    CaterpillarBody.prototype.update = function () {
        if (!this.paused) {
            this.body.animations.play('walk');
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
        else {
            this.body.animations.play('idle');
        }
    };

    return CaterpillarBody;


});