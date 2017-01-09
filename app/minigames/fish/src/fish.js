define([
    './swipe'
], function (
    Swipe
) {

    'use strict';

    var GRAVITY = -1700;

    /**
     * Fish object
	 * @class
     * @extends Phaser.Group
     * @memberof Bilan
     * @param text {string} text
     * @param game {Phaser.Game} game instance   
	 * @param scale {scale} default 1
	**/
    function Fish(game, text, scale) {
        text = text || false;
        scale = scale || 1;

        Phaser.Group.call(this, game);

        this.gameRef = game;
        this.x = game.world.centerX;
        this.y = game.height * 2 / 3;
        this.clickable = true;
        this.paused = false;
        this.time = 1.5;
        this.flying = false;

        this.eventManager = game.eventManager;

        this.fishSprite = game.add.sprite(0, 0, 'fish', 'Poisson_Idle1_0000');
        this.fishSprite.y += this.fishSprite.height / 2;
        this.fishSprite.anchor.setTo(0.5, 0.5);
        this.fishSprite.scale.x = scale;
        this.fishSprite.scale.y = scale;

        this.fishSprite.animations.add('idle1', Phaser.Animation.generateFrameNames('Poisson_Idle1_', 0, 3, '', 4), 7, false, false);
        this.fishSprite.animations.add('idle2', Phaser.Animation.generateFrameNames('Poisson_Idle2_', 0, 3, '', 4), 7, false, false);
        this.fishSprite.animations.add('jump', Phaser.Animation.generateFrameNames('Poisson_Saute_', 0, 0, '', 4), 5, true, false);
        this.fishSprite.animations.add('rotate', Phaser.Animation.generateFrameNames('Poisson_Tourne_', 0, 0, '', 4), 5, true, false);

        this.add(this.fishSprite)

        /**
         * TextSprite
         * @private
         **/
        if (text) {
            this.text = game.add.text(0, this.fishSprite.height / 3 + 20, "- phaser -\nrocking with\ngoogle web fonts");
            this.text.font = "Arial";
            this.text.text = "";
            this.text.fill = "black";
            this.text.fontSize = this.fishSprite.width / 8;
            this.text.anchor.setTo(0.5, 0.5);

            this.add(this.text);
        }

        this.swipe = new Swipe(game, this.fishSprite);

        this.initEvents();
        this.tween = this.game.add.tween(this);
        this.tween.to({ y: this.gameRef.height * 2 / 3 }, 550, Phaser.Easing.Linear.In, false, 0, 0, false);
        //this.initSounds(game);
    };

    Fish.prototype = Object.create(Phaser.Group.prototype);
    Fish.constructor = Fish;

    /**
     * init all sounds
     * @private
     **/
    Fish.prototype.initSounds = function (game) {
        this.sounds = {};
        this.sounds.rdm = [];

        for (var i = 0; i < 3; i++) {
            this.sounds.rdm[i] = game.add.audio('rdm' + (i + 1));
        }

        if (typeof this.text !== 'undefined' && this.text.text != "") this.sounds.textSound = game.add.audio(this.text.text);

        this.sounds.isPlaying = false;
    }

    /**
     * init all events
     * @private
     **/
    Fish.prototype.initEvents = function () {

        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);

        this.eventManager.on('swipe', function () {
            this.clickable = false;
        }, this);
    }

    Fish.prototype.flyTo = function (newX, newY) {
        this.gameRef.world.bringToTop(this);
        this.fishSprite.scale.tween = this.gameRef.add.tween(this.fishSprite.scale);
        if (typeof this.text !== 'undefined') this.text.visible = false;

        if (newX < this.x) {
            this.fishSprite.scale.x = -1;
            this.fishSprite.scale.tween.to({ x: -0.4, y: 0.4 }, this.time * 1000, Phaser.Easing.Default, true, 0, 0, false);

        }
        else {
            this.fishSprite.scale.tween.to({ x: 0.4, y: 0.4 }, this.time * 1000, Phaser.Easing.Default, true, 0, 0, false);
        }

        this.fishSprite.animations.play('jump');

        this.newX = newX;
        this.newY = newY - this.fishSprite.height / 2;
        this.oldX = this.x;
        this.oldY = this.y;
        this.slopeX = (this.newX - this.oldX) / this.time;
        this.slopeY = (this.newY - this.oldY + (GRAVITY * Math.pow(this.time, 2)) / 2) / this.time;
        this.t = 0;
        this.flying = true;
    };

    Fish.prototype.reset = function (text) {
        text = text || "";

        this.fishSprite.alpha = 1;
        this.fishSprite.angle = 0;
        this.fishSprite.animations.play('idle1');
        this.fishSprite.scale.x = 1;
        this.fishSprite.scale.y = 1;
        if (typeof this.text !== 'undefined') {
            this.text.visible = true;
            this.text.text = text;
        }
        this.x = this.gameRef.world.centerX;
        this.y = this.gameRef.height;
        this.tween.start();
        this.tween.onComplete.addOnce(function () {
            this.clickable = true;
        }, this);
    };

    /**
     * used for the idle animation
     * @private
     **/
    Fish.prototype.update = function () {

        if (this.fishSprite.animations.currentAnim.isFinished || !this.fishSprite.animations.currentAnim.isPlaying) {
            var rand = Math.random();
            if (rand < 0.7)
                this.fishSprite.animations.play('idle1');
            else
                this.fishSprite.animations.play('idle2');
        }

        if (this.clickable && !this.paused) {
            this.swipe.check();
        }

        if (this.flying) {
            if (this.t > 0.8) {
                this.fishSprite.animations.play('rotate');
                if (this.newX < this.oldX) {
                    this.fishSprite.angle -= 10;
                }
                else {
                    this.fishSprite.angle += 10;
                }
            }

            this.y = -GRAVITY * Math.pow(this.t, 2) / 2 + this.slopeY * this.t + this.oldY;
            this.x = this.slopeX * this.t + this.oldX;
            if (this.t > this.time) {
                this.flying = false;
                this.eventManager.emit('finishedFlying', this);
                this.fishSprite.alphaTween = this.gameRef.add.tween(this.fishSprite);
                this.fishSprite.alphaTween.to({ alpha: 0 }, 100, Phaser.Easing.Default, true, 0, 0, false);
            }
            this.t += 1 / 60;
        }
    }

    return Fish;
});