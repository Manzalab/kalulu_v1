define([
], function (
) {

    'use strict';

    /**
     * Background object
	 * @class
     * @extends Phaser.Group
     * @memberof Bilan
     * @param game {Phaser.Game} game instance   
	**/
    function Background(time, game) {
        Phaser.Group.call(this, game);

        this.gameRef = game;
        this.paused = false;
        this.enabled = false;
        this.time = time;
        this.addedTime = 0;
        this.pace = 1 / 60;
        this.eventManager = game.eventManager;

        this.backgroundBottom = game.add.sprite(game.world.centerX, game.world.centerY, 'BackgroundBottom');
        this.backgroundBottom.anchor.setTo(0.5, 0.5);
        this.backgroundBottom.width = game.width;
        this.backgroundBottom.height = game.height;

        this.add(this.backgroundBottom)

        this.sun = game.add.sprite(0, 0, 'sun');
        this.sun.anchor.setTo(0.5, 0.5);

        this.sun.x = 550;
        this.sun.y = 440;

        this.add(this.sun)

        this.backgroundTop = game.add.sprite(game.world.centerX, game.world.centerY, 'BackgroundTop');
        this.backgroundTop.anchor.setTo(0.5, 0.5);
        this.backgroundTop.width = game.width;
        this.backgroundTop.height = game.height;

        this.add(this.backgroundTop)

        //this.boat = game.add.sprite(game.world.centerX, game.world.centerY, 'boat', 'Bateau_Idle_0000');
        //this.boat.anchor.setTo(0.5, 0.5);

        //this.boat.animations.add('idle', Phaser.Animation.generateFrameNames('Bateau_Idle_', 0, 11, '', 4), 6, true, true);
        //this.boat.animations.play('idle');

        //this.add(this.boat)

        this.initEvents();
        this.sunTrajectory(1600, 340);
    };

    Background.prototype = Object.create(Phaser.Group.prototype);
    Background.constructor = Background;

    /**
     * init all events
     * @private
     **/
    Background.prototype.initEvents = function () {
        this.eventManager.on('startTimer', function () {
            this.enabled = true;
        }, this);

        //this.eventManager.on('pause', function () {
        //    this.paused = true;
        //}, this);

        //this.eventManager.on('unPause', function () {
        //    this.paused = false;
        //}, this);

    }

    Background.prototype.addTime = function (addedTime) {
        this.addedTime += addedTime;
        var remainingTime = this.time - this.t + this.addedTime * 60 * this.pace;
        var framesToFinish = remainingTime * 60;
        this.pace = (remainingTime - this.addedTime * 60 * this.pace) / framesToFinish;
    };

    Background.prototype.sunTrajectory = function (endX, endY) {
        this.endX = endX;
        this.endY = endY;
        this.oldX = this.sun.x;
        this.oldY = this.sun.y;
        this.slopeX = (this.endX - this.oldX) / this.time;
        this.gravity = -2 * (this.oldY - this.sun.height) / (Math.pow(this.time / 2, 2));
        this.slopeY = (this.endY - this.oldY + (this.gravity * Math.pow(this.time, 2)) / 2) / this.time;
        this.t = 0;
    };

    /**
     * used for the idle animation
     * @private
     **/
    Background.prototype.update = function () {
        if (this.enabled)
            if (!this.paused) {

                this.sun.y = -this.gravity * Math.pow(this.t, 2) / 2 + this.slopeY * this.t + this.oldY;
                this.sun.x = this.slopeX * this.t + this.oldX;
                if (this.t > this.time) {
                    this.enabled = false;
                    this.eventManager.emit('timerFinished');
                }
                this.t += this.pace;
            }
    }

    return Background;
});