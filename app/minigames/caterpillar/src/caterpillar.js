define([
    './caterpillarTail',
    './caterpillarHead',
    './caterpillarBody'
], function (
    CaterpillarTail,
    CaterpillarHead,
    CaterpillarBody
) {

    'use strict';

    function Caterpillar(x, y, game) {
        Phaser.Group.call(this, game);

        this.x = x;
        this.y = y;

        this.tail = [];
        for (var i = 0; i < 3; i++) {
            this.tail.push(new CaterpillarTail(this.x, this.y, 'Chenille_Queue0' + (i + 1) + '_0000', game));
            this.tail[i].scale.x = 0.9;
            this.tail[i].scale.y = 0.9;
        }

        this.caterpillarBody = [];
        this.caterpillarBody.push(new CaterpillarBody(this.x + this.tail[2].width / 2, this.y, game));
        this.caterpillarBody[0].scale.x = 0.9;
        this.caterpillarBody[0].scale.y = 0.9;

        this.head = new CaterpillarHead(this.x + this.caterpillarBody[0].width, this.y, game);
        this.head.scale.x = 0.9;
        this.head.scale.y = 0.9;
        this.body = this.head.body;

        this.hitArea = this.head.hitArea;
        game.physics.enable(this, Phaser.Physics.ARCADE);
        this.inputEnabled = true;

        this.moving = false;
        this.paused = false;
        this.clickable = true;

    };

    Caterpillar.prototype = Object.create(Phaser.Group.prototype);
    Caterpillar.prototype.constructor = Caterpillar;

    Caterpillar.prototype.setSpeed = function (value) {
        this.speed = value;
        this.head.speed = value;
        for (var i = 0; i < this.caterpillarBody.length; i++) {
            this.caterpillarBody[i].speed = value;
        }

        for (var i = 0; i < this.tail.length; i++) {
            this.tail[i].speed = value;
        }
    };

    Caterpillar.prototype.pause = function (bool) {
        this.paused = bool;
        this.head.pause(bool);
        for (var i = 0; i < this.caterpillarBody.length; i++) {
            this.caterpillarBody[i].pause(bool);
        }
        for (var i = 0; i < this.tail.length; i++) {
            this.tail[i].pause(bool);
        }
    };

    Caterpillar.prototype.addBody = function (value) {
        if (this.caterpillarBody.length == 1 && this.caterpillarBody[0].text.text == "") {
            this.caterpillarBody[0].setText(value);
        }
        else if (this.caterpillarBody.length < 7) {
            var temp = new CaterpillarBody(this.caterpillarBody[this.caterpillarBody.length - 1].x + this.caterpillarBody[0].width - 10, this.tail[2].y, this.game);
            temp.scale.x = 0.9;
            temp.scale.y = 0.9;
            temp.setText(value);
            temp.speed = this.speed;
            this.caterpillarBody.push(temp);
            this.head.x += this.caterpillarBody[0].width - 10;
            this.game.world.bringToTop(this.head);
        }
        else {
            var temp = new CaterpillarBody(this.caterpillarBody[this.caterpillarBody.length - 1].x, this.tail[2].y, this.game);
            for (var i = 0; i < this.caterpillarBody.length; i++) {
                this.caterpillarBody[i].x -= this.caterpillarBody[0].width - 10;
            }
            for (var i = 0; i < this.tail.length; i++) {
                this.tail[i].x -= this.caterpillarBody[0].width - 10;
            }
            temp.scale.x = 0.9;
            temp.scale.y = 0.9;
            temp.setText(value);
            temp.speed = this.speed;
            this.caterpillarBody.push(temp);
            this.game.world.bringToTop(this.head);
        }
    };

    Caterpillar.prototype.reset = function (y) {
        var temp = this.caterpillarBody.length - 1;

        for (var i = 0; i < temp; i++) {
            this.caterpillarBody.pop().destroy();
        }
        this.caterpillarBody[0].setText("");

        this.head.x = this.x + this.caterpillarBody[0].width;


        this.parent.game.world.bringToTop(this.caterpillarBody[0]);
        for (var i = 0; i < this.tail.length; i++) {
            this.parent.game.world.bringToTop(this.tail[i]);
            this.tail[i].x = this.x;
        }
        this.caterpillarBody[0].x = this.x + this.tail[2].width / 2
        this.parent.game.world.bringToTop(this.head);
        this.moveTo(y);
    };

    Caterpillar.prototype.moveTo = function (y) {
        var waitBody = 0.05;
        var waitTail = 0.03;

        this.moving = true;

        this.head.moveTo(y);
        for (var i = 0; i < this.caterpillarBody.length; i++) {
            this.caterpillarBody[this.caterpillarBody.length - 1 - i].moveTo(y, waitBody * (i + 1));
        }

        for (var i = 0; i < this.tail.length; i++) {
            this.tail[i].moveTo(y, waitTail * (i + 1) + waitBody * this.caterpillarBody.length);
        }
    };

    Caterpillar.prototype.update = function () {
        if (!this.paused)
            if (this.moving) {
                this.moving = this.tail[this.tail.length - 1].moving;
            }

        if (this.head.head.animations._anims.eat.isPlaying || this.head.head.animations._anims.spit.isPlaying) {
            this.pause(false);
        }
    };

    return Caterpillar;
});