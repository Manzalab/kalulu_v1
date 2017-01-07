define([
], function (
) {
    
    'use strict';
    
    /**
     * Lillypad object
	 * @class
     * @extends Phaser.Group
     * @memberof Frogger
     * @param x {int} x position
     * @param y {int} y position
     * @param game {Phaser.Game} game instance
     * @param text {string} default ""
	 * @param scale {scale} default 1
	**/
    function Lillypad(x, y, game, text, scale) {
        if (typeof text === 'undefined') text = "";
        scale = scale || 0.5;

        Phaser.Group.call(this, game);

        this.eventManager = game.eventManager;

        this.x = x;
        this.paused = false;
        this.clickable = false;

        this.clickSprite = game.add.sprite(0, 0, 'lillypad', 'FX_Nenuphar_0000');
        this.clickSprite.anchor.setTo(0.5, 0.5);

        this.clickSprite.animations.add('click', Phaser.Animation.generateFrameNames('FX_Nenuphar_', 0, 3, '', 4), 8, false, false);
        this.clickSprite.visible = false;
        this.clickSprite.tween = this.game.add.tween(this.clickSprite);
        this.clickSprite.tween.to({ alpha: 0 }, 600, Phaser.Easing.Exponential.In, false, 0, 0, false);
        this.clickSprite.tween.onComplete.add(function () {
            this.clickSprite.visible = false;
            this.clickSprite.alpha = 1;
        }, this);

        this.add(this.clickSprite);

        this.lillypadSprite = game.add.sprite(0, 0, 'lillypad', 'Nenuphar_non_clicable');
        this.lillypadSprite.anchor.setTo(0.5, 0.5);
        this.lillypadSprite.scale.x = scale;
        this.lillypadSprite.scale.y = scale;
        this.lillypadSprite.alpha = 0;

        this.add(this.lillypadSprite);

        this.text = game.add.text(0, 0, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";
        this.text.text = text;
        this.text.fill = "black";
        this.text.fontSize = this.lillypadSprite.width / 3;
        this.text.anchor.setTo(0.5, 0.5);
        this.text.alpha = 0;

        this.add(this.text);

        this.lillypadSprite.inputEnabled = true;
        this.lillypadSprite.events.onInputDown.add(function () { // inputDown = click
            if (!this.paused)
                if (this.clickable) {
                    if (this.text.text != "") this.sounds.textSound.play();

                    this.clickable = false;
                    this.onClick();
                    this.sounds.click.play();
                    this.eventManager.emit('pause');
                    this.clickSprite.animations.currentAnim.onComplete.addOnce(function () {
                        this.eventManager.emit('clicked', this); //listened by Remediation
                    }, this);
                }
        }, this);

        this.y = y + this.lillypadSprite.height / 2

        this.initSounds(game);
        this.initEvents();
        this.fadeIn();
    }

    Lillypad.prototype = Object.create(Phaser.Group.prototype);
    Lillypad.prototype.constructor = Lillypad;

    /**
     * init all sounds
     * @private
     **/
    Lillypad.prototype.initSounds = function (game) {
        this.sounds = {};

        this.sounds.click = game.add.audio('lillypad');

        if (this.text.text != "") this.sounds.textSound = game.add.audio(this.text.text);

        this.sounds.isPlaying = false;
    }

    /**
     * click behaviour for animations and sounds
     * @private
     **/
    Lillypad.prototype.onClick = function () {
        this.clickSprite.visible = true;
        this.clickSprite.tween.start();
        this.clickSprite.animations.play('click');

    }

    /**
     * Fades out the lillypad
     * @private
     **/
    Lillypad.prototype.fadeOut = function () {
        this.lillypadSprite.tween = this.game.add.tween(this.lillypadSprite);
        this.lillypadSprite.tween.to({ alpha: 0 }, 500, Phaser.Easing.Default, true, 0, 0, false);
        this.text.tween = this.game.add.tween(this.text);
        this.text.tween.to({ alpha: 0 }, 500, Phaser.Easing.Default, true, 0, 0, false);
    }

    /**
     * Fades in the lillypad
     * @private
     **/
    Lillypad.prototype.fadeIn = function () {
        this.lillypadSprite.tween = this.game.add.tween(this.lillypadSprite);
        this.lillypadSprite.tween.to({ alpha: 1 }, 500, Phaser.Easing.Default, true, 0, 0, false);
        this.text.tween = this.game.add.tween(this.text);
        this.text.tween.to({ alpha: 1 }, 500, Phaser.Easing.Default, true, 0, 0, false);
    }

    /**
     * init all events
     * @private
     **/
    Lillypad.prototype.initEvents = function () {
        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);
    }


    /**
     * setter for the lillypad text
     * @private
     **/
    Lillypad.prototype.setText = function (value) {
        this.text.text = value;
    };

    /**
     * setter for clickable
     * @private
     **/
    Lillypad.prototype.setClickable = function (bool) {
        this.clickable = bool;
        if (bool) this.lillypadSprite.frameName = 'Nenuphar_clicable';
        else this.lillypadSprite.frameName = 'Nenuphar_non_clicable';

    };

    Lillypad.prototype.update = function () {

    };
    
    return Lillypad;
});