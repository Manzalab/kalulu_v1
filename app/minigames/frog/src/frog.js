define([
], function (
) {
    
    'use strict';
    
    var GRAVITY = -890;
    
    /**
     * Frog object
	 * @class
     * @extends Phaser.Group
     * @memberof Frogger
     * @param x {int} x position
     * @param y {int} y position
     * @param game {Phaser.Game} game instance
	 * @param scale {scale} default 1
	**/
    function Frog(x, y, game, scale) {
        scale = scale || 1;

        Phaser.Group.call(this, game);

        this.x = x;
        this.y = y;
        this.paused = false;
        this.front = true;
        this.time = 0.65; //12 is the number of frames of the animations;8 corresponds to the speed of the animations
        this.jumping = false;
        this.outOfScreen = false;
        

        this.frogSprite = game.add.sprite(0, 0, 'frog', 'FROGGER_Face_Idle01_0000');
        this.frogSprite.anchor.setTo(0.5, 0.5);
        this.frogSprite.scale.x = scale;
        this.frogSprite.scale.y = scale;

        this.frogSprite.animations.add('frontIdle1', Phaser.Animation.generateFrameNames('FROGGER_Face_Idle01_', 0, 5, '', 4), 8, false, false);
        this.frogSprite.animations.add('frontIdle2', Phaser.Animation.generateFrameNames('FROGGER_Face_Idle02_', 0, 5, '', 4), 8, false, false);
        this.frogSprite.animations.add('sideIdle1', Phaser.Animation.generateFrameNames('FROGGER_Cote_Idle01_', 0, 5, '', 4), 8, false, false);
        this.frogSprite.animations.add('sideIdle2', Phaser.Animation.generateFrameNames('FROGGER_Cote_Idle02_', 0, 5, '', 4), 8, false, false);
        this.frogSprite.animations.add('jump', Phaser.Animation.generateFrameNames('FROGGER_Cote_saute_', 0, 11, '', 4), 12, false, false);

        this.add(this.frogSprite)

        this.initEvents();
        this.initSounds(game);
    };

    Frog.prototype = Object.create(Phaser.Group.prototype);
    Frog.constructor = Frog;

    /**
     * init all sounds
     * @private
     **/
    Frog.prototype.initSounds = function (game) {
        this.sounds = {};
        this.sounds.idleRdm = [];
        this.sounds.jumpRdm = [];

        for (var i = 0; i < 5; i++) {
            this.sounds.idleRdm[i] = game.add.audio('idleRdm' + (i + 1));
        }
        for (var i = 0; i < 4; i++) {
            this.sounds.jumpRdm[i] = game.add.audio('jumpRdm' + (i + 1));
        }

        this.sounds.isPlaying = false;
    }

    /**
     * init all events
     * @private
     **/
    Frog.prototype.initEvents = function () {
        this.game.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.game.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);
    }

    Frog.prototype.jumpTo = function (newX, newY) {
        this.sounds.jumpRdm[Math.floor(Math.random() * this.sounds.jumpRdm.length)].play();

        this.parent.game.world.bringToTop(this);
        this.frogSprite.animations.currentAnim.stop();
        this.frogSprite.animations.play('jump');
        var context = this;
        setTimeout(function () { context.jumping = true; }, 200);
        this.newX = newX;
        this.newY = newY;
        this.oldX = this.x;
        this.oldY = this.y;

        this.slopeX = (this.newX - this.oldX) / this.time;
        this.slopeY = (this.newY - this.oldY + (GRAVITY * Math.pow(this.time, 2)) / 2) / this.time;

        this.t = 0;

    }

    /**
     * used for the idle animations
     * @private
     **/
    Frog.prototype.update = function () {
        if (!this.jumping) {
            if (this.frogSprite.animations.currentAnim.isFinished || !this.frogSprite.animations.currentAnim.isPlaying) {

                var rand = Math.random();

                if (rand < 0.7)
                    if (this.front)
                        this.frogSprite.animations.play('frontIdle1');
                    else
                        this.frogSprite.animations.play('sideIdle1');
                else
                    if (this.front)
                        this.frogSprite.animations.play('frontIdle2');
                    else {
                        this.frogSprite.animations.play('sideIdle2');
                    }
            }
            if (Math.floor(Math.random() * 120) == 1 && !this.paused) this.sounds.idleRdm[Math.floor(Math.random() * this.sounds.idleRdm.length)].play();

        }

        if (this.jumping) {


            this.y = -GRAVITY * Math.pow(this.t, 2) / 2 + this.slopeY * this.t + this.oldY;

            this.x = this.slopeX * this.t + this.oldX;

            if (this.x > this.parent.game.width) {
                this.outOfScreen = true;
            }

            if (this.outOfScreen) {
                this.x -= this.parent.game.width;
            }

            if (this.t > this.time) {
                this.jumping = false;
                this.outOfScreen = false;
            }

            this.t += 1 / 60;
        }

    }
    
    return Frog;


});