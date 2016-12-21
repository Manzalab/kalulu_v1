define ([
], function (
) {

    'use strict';

     function CaterpillarHead (x, y, game) {
        Phaser.Group.call(this, game);

        this.x = x;
        this.y = y;

        this.head = game.add.sprite(0, 0, 'caterpillar', 'Chenille_Tete_Idle01_0000');
        this.head.y -= this.head.height / 2;
        this.head.anchor.setTo(0, 0.5);

        this.head.animations.add('idle01', Phaser.Animation.generateFrameNames('Chenille_Tete_Idle01_', 0, 5, '', 4), 10, false, false);
        this.head.animations.add('idle02', Phaser.Animation.generateFrameNames('Chenille_Tete_Idle02_', 0, 5, '', 4), 10, false, false);
        this.head.animations.add('spit', Phaser.Animation.generateFrameNames('Chenille_Tete_crache_', 0, 5, '', 4), 8, false, false);
        this.head.animations.add('eat', Phaser.Animation.generateFrameNames('Chenille_Tete_mange_', 0, 5, '', 4), 8, false, false);

        game.physics.enable(this.head, Phaser.Physics.ARCADE);
        this.head.body.setSize(50, this.head.height / 4, this.head.width / 4, this.head.height / 2);
        this.body = this.head.body;

        this.add(this.head);

        this.moving = false;
        this.paused = false;

    };

    CaterpillarHead.prototype = Object.create(Phaser.Group.prototype);
    CaterpillarHead.constructor = CaterpillarHead;

    CaterpillarHead.prototype.pause = function (bool) {
        this.paused = bool;
    };

    CaterpillarHead.prototype.eat = function () {
        this.head.animations.play('eat');
    };

    CaterpillarHead.prototype.spit = function () {
        this.head.animations.play('spit');
    };

    CaterpillarHead.prototype.moveTo = function (y) {
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

    CaterpillarHead.prototype.update = function () {
        if (this.head.animations.currentAnim.isFinished || !this.head.animations.currentAnim.isPlaying) {
            this.head.animations.play('idle0' + (Math.floor(Math.random() * 2) + 1));
        }

        if (!this.paused) {
            if (this.moving) {
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
    };


    return CaterpillarHead;
});
