define([
], function (
) {

    'use strict';

    /**
     * Ant object
	 * @class
     * @extends Phaser.Group
     * @memberof Ants
     * @param x {int} x position
     * @param y {int} y position
     * @param game {Phaser.Game} game instance
     * @param text {string} text
       @param speed {speed} default 5
	 * @param scale {scale} default 1
	**/

    var TEXTFONTSIZE = 75;

    function Ant(x, y, game, text, speed, scale) {
        text = text || "";
        speed = speed || 7;
        scale = scale || 1;

        Phaser.Group.call(this, game);

        this.game = game;
        this.x = x - game.width;
        this.y = y - 210;
        this.origin = { x: x, y: this.y };
        this.v = speed;
        this.vx = null;
        this.vy = null;
        this.time = 1;


        this.associatedSentence = null;
        this.paused = false;
        this.walking = false;
        this.clicked = false;
        
        this.antSprite = game.add.sprite(20, 10, 'ant', 'Fourmi_Idle_0000');
        this.antSprite.anchor.setTo(0.5, 0.5);
        this.antSprite.scale.x = scale;
        this.antSprite.scale.y = scale;

        this.antSprite.animations.add('idle1', Phaser.Animation.generateFrameNames('Fourmi_Idle_', 0, 5, '', 4), 8, false, false);
        this.antSprite.animations.add('idle2', Phaser.Animation.generateFrameNames('Fourmi_Idle02_', 0, 5, '', 4), 8, false, false);
        this.antSprite.animations.add('walk1', Phaser.Animation.generateFrameNames('Fourmi_marche_', 0, 5, '', 4), 8, false, false);
        this.antSprite.animations.add('walk2', Phaser.Animation.generateFrameNames('Fourmi_marche02_', 0, 5, '', 4), 8, false, false);



        this.text = game.add.text(0, 0, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";
        this.text.text = text;
        this.text.fill = "black";
        this.text.fontSize = TEXTFONTSIZE;
        this.text.anchor.setTo(0.5, 0.5);

        this.textBackground = game.add.sprite(0, 0, 'hole1');
        this.textBackground.anchor.setTo(0.5, 0.5);
        //this.textBackground.width = (this.text.text.length + 1) * TEXTFONTSIZE;
        this.textBackground.width = 250;
        this.textBackground.scale.y = this.textBackground.scale.x;

        this.add(this.textBackground)
        this.add(this.text);
        this.add(this.antSprite);

        game.physics.enable(this.antSprite, Phaser.Physics.ARCADE);
        this.antSprite.body.setSize(this.antSprite.height / 2, this.antSprite.width / 2, this.antSprite.height / 4, this.antSprite.width / 4);
        this.body = this.antSprite.body;

        this.antSprite.inputEnabled = true;
        this.antSprite.events.onInputDown.add(function () {
            if (!this.paused) {
                this.game.world.bringToTop(this);
                this.clicked = true;
            }
        }, this);

        this.game.input.onUp.add(function () {
            if (this.clicked) {
                this.clicked = false;
                this.game.eventManager.emit("droppedAnt", this);
            }
        }, this);

        this.initEvents();
        this.initSounds(game);
        this.walkToSlope(x, this.y);
    };

    Ant.prototype = Object.create(Phaser.Group.prototype);
    Ant.constructor = Ant;

    /**
     * init all sounds
     * @private
     **/
    Ant.prototype.initSounds = function (game) {
        //    this.sounds = {};
        //    this.sounds.rdm = [];

        //    for (var i = 0; i < 3; i++) {
        //        this.sounds.rdm[i] = game.add.audio('rdm' + (i + 1));
        //    }

        //if (this.text.text != "") this.sounds.textSound = game.add.audio(this.text.text);

        //    this.sounds.isPlaying = false;
    }

    /**
     * init all events
     * @private
     **/
    Ant.prototype.initEvents = function () {
        this.game.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.game.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);
    }

    Ant.prototype.fadeOut = function () {
        this.tween = this.game.add.tween(this);
        this.tween.to({ alpha: 0 }, 600, Phaser.Easing.Linear.In, true, 0, 0, false);
    }

    /**
    *
    *@private
    **/

    Ant.prototype.walkToVectorial = function (newX, newY) {
        this.oldX = this.x;
        this.oldY = this.y;
        this.newX = newX;
        this.newY = newY;

        if (Math.abs(this.oldX - this.newX) > 50)
            this.vx = -this.v * (this.oldX - this.newX) / Math.sqrt(Math.pow(this.oldX - this.newX, 2) + Math.pow(this.oldY - this.newY, 2));
        else
            this.vx = 0;
        if (Math.abs(this.oldY - this.newY) > 50)
            this.vy = -this.v * (this.oldY - this.newY) / Math.sqrt(Math.pow(this.oldX - this.newX, 2) + Math.pow(this.oldY - this.newY, 2));
        else
            this.vy = 0;
        this.walking = true;
    }

    Ant.prototype.walkToSlope = function (newX, newY) {
        this.walking = true;
        this.newX = newX;
        this.newY = newY;
        this.oldX = this.x;
        this.oldY = this.y;

        this.slopeX = (this.newX - this.oldX) / this.time;
        this.slopeY = (this.newY - this.oldY) / this.time;

        this.t = 0;
    }

    /**
     * mainly used for the speed function
     * also used for the idle animation
     * @private
     **/
    Ant.prototype.update = function () {
        if (this.walking && !this.paused)
            if (this.vx < 0 ) this.antSprite.scale.x = -Math.abs(this.antSprite.scale.x);
            else this.antSprite.scale.x = Math.abs(this.antSprite.scale.x);

        if (this.antSprite.animations.currentAnim.isFinished || !this.antSprite.animations.currentAnim.isPlaying) {
            var rand = Math.random();

            if (!this.walking || this.paused)
                if (rand < 0.7)
                    this.antSprite.animations.play('idle1');
                else this.antSprite.animations.play('idle2');
            else {
                if (rand < 0.7)
                    this.antSprite.animations.play('walk1');
                else this.antSprite.animations.play('walk2');


            }
        }
        if (this.clicked) {
            this.walkToVectorial(this.game.input.activePointer.position.x, this.game.input.activePointer.position.y);
        }
        if (this.walking && !this.clicked) {
            this.x = this.slopeX * this.t + this.oldX;
            this.y = this.slopeY * this.t + this.oldY;

            if (this.t > this.time) {
                this.game.eventManager.emit('reachedDestination', this);
                this.walking = false;
            }

            this.t += 1 / 60;
        }
        else if (this.walking) {
            this.x += this.vx;
            this.y += this.vy;
        }

    }

    function toDegrees(angle) {
        return angle * (180 / Math.PI);
    }

    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    return Ant;


});