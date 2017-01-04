define([
    './swipe'
], function (
    Swipe
) {

    'use strict';

    var GRAVITY = -1100;
    var SCALE = 1;

    function Coconut(x, y, game) {
        Phaser.Group.call(this, game);

        this.eventManager = game.eventManager;

        this.origin = {};

        this.x = x;
        this.y = y;
        this.origin.x = x;
        this.origin.y = y;
        this.time = 1;
        this.flying = false;
        this.clickable = true;
        this.active = true;

        this.scale.x = SCALE;
        this.scale.y = SCALE;

        this.sprite = game.add.sprite(0, 0, 'coconut','coconut');
        this.sprite.anchor.setTo(0.5, 1);

        this.add(this.sprite);

        this.text = game.add.text(0, -10, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";
        this.text.text = "";
        this.text.fill = "white";
        this.text.fontSize = this.sprite.height / 2 * SCALE;
        this.text.anchor.setTo(0.5, 1);

        this.add(this.text);

        this.particles = game.add.group();

        for (var i = 0; i < 3 ; i++) {
            var temp = game.add.emitter(0, 0, 1);
            temp.makeParticles('coconut', 'Noix_de_coco_cassee_0' + (i + 1));
            temp.gravity = 300;
            this.particles.add(temp);
        }

        this.add(this.particles);

        this.initEvents();
        this.sprite.inputEnabled = true;
        this.swipe = new Swipe(game, this.sprite);

        this.tween = this.game.add.tween(this);
        this.tween.to({ y: y + 10 }, 450, Phaser.Easing.Default, true, 0, -1, true);

        this.flying = false;

        
    };

    Coconut.prototype = Object.create(Phaser.Group.prototype);
    Coconut.constructor = Coconut;

    Coconut.prototype.initEvents = function () {
        this.eventManager.on('pause', function () {
            this.clickable = false;
        }, this);

        this.eventManager.on('unPause', function () {
            this.clickable = true;
        }, this);
    };

    Coconut.prototype.setText = function (value) {
        this.text.text = value;
        this.sound = this.parent.game.add.audio(value);
    };

    Coconut.prototype.flyTo = function (newX, newY,time) {
        this.tween.stop();
        this.time = time;
        this.newX = newX;
        this.newY = newY;
        this.oldX = this.x;
        this.oldY = this.y;

        this.slopeX = (this.newX - this.oldX) / this.time;
        this.slopeY = (this.newY - this.oldY + (GRAVITY * Math.pow(this.time, 2)) / 2) / this.time;

        this.t = 0;

        this.flying = true;
    };

    Coconut.prototype.break = function () {
        this.tween.stop();
        for (var i = 0; i < 3; i++) {
            this.particles.children[i].start(true, 1000, null, 1);
        }

        this.sprite.visible = false;
        this.text.visible = false;

        var context = this;

        setTimeout(function () {
            context.eventManager.emit('finishedBreaking', this);
        }, this.particles.children[2].lifespan);
    };

    Coconut.prototype.moveTo = function (newX, newY, time) {
        this.flying = false;
        this.tween = this.game.add.tween(this);      
        this.tween.to({ x: newX, y: newY }, time*1000, Phaser.Easing.Default, true, 0, 0, false);
        this.tween.onComplete.addOnce(function () {            
            this.tween = this.game.add.tween(this);
            this.tween.to({ y: this.y + 10 }, 450, Phaser.Easing.Default, true, 0, -1, true);
            this.tween.start();
            this.eventManager.emit('finishedMoving', this);
        }, this);

        this.parent.game.world.bringToTop(this);
    };

    Coconut.prototype.update = function () {
        if (this.flying) {
            this.y = -GRAVITY * Math.pow(this.t, 2) / 2 + this.slopeY * this.t + this.oldY;

            this.x = this.slopeX * this.t + this.oldX;

            if (this.t > this.time) {
                this.eventManager.emit('finishedFlying', this);
                this.flying = false;
            }

            this.t += 1 / 60;
        }


        if (this.clickable && this.active) {
            this.swipe.check();
        }

        
    };

    return Coconut;


});