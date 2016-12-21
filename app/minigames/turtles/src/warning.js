define([
    './swipe'
], function (
    Swipe
) {

    'use strict';

    /**
     * Warning object
	 * @class
     * @extends Phaser.Group
     * @memberof Warning
     * @param x {int} x position
     * @param y {int} y position
     * @param angle {int} angle to the world center
     * @param game {Phaser.Game} game instance
	 * @param scale {scale} default 1
	**/
    function Warning(x, y, game, scale) {
        scale = scale || 0.4;

        Phaser.Group.call(this, game);

        this.gameRef = game;
        this.eventManager = game.eventManager;
        this.paused = false;

        this.x = x;
        this.y = y;

        this.warningSprite = game.add.sprite(0, 0, 'warning');
        this.warningSprite.anchor.setTo(0.5, 0.5);
        this.warningSprite.scale.x = scale;
        this.warningSprite.scale.y = scale;

        this.add(this.warningSprite)

        this.warningSprite.tween = this.game.add.tween(this.warningSprite);
        this.warningSprite.tween.to({ alpha: 0 }, 600, Phaser.Easing.Linear.In, true, 0, -1, true);

        this.warningSprite.visible = false;
        this.initEvents();
    };

    Warning.prototype = Object.create(Phaser.Group.prototype);
    Warning.constructor = Warning;

    Warning.prototype.destroy = function () {
        delete this;
    }

    Warning.prototype.toggle = function (bool) {
        this.warningSprite.visible = bool;
    }

    Warning.prototype.updatePosition = function (x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * init all events
     * @private
     **/
    Warning.prototype.initEvents = function () {
        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);
    }

    Warning.prototype.update = function () {

    }

    return Warning;

});