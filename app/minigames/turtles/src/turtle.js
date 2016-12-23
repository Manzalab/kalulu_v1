define([
    'swipe',
    'warning'
], function (
    Swipe,
    Warning
) {

    'use strict';

    /**
     * Turtle object
	 * @class
     * @extends Phaser.Group
     * @memberof Turtle
     * @param x {int} x position
     * @param y {int} y position
     * @param angle {int} angle to the world center
     * @param game {Phaser.Game} game instance
     * @param text {string} text
       @param speed {speed} default 5
	 * @param scale {scale} default 1
	**/
    function Turtle(game, speed, text, scale) {
        text = text || "";
        speed = speed || 3;
        scale = scale || 1;

        Phaser.Group.call(this, game);

        this.gameRef = game;

        this.x = null;
        this.y = null;
        this.vAngle = null;
        this.v = speed;
        this.vx = null;
        this.vy = null;
        this.time = 1 / speed;

        this.clickable = true;
        this.paused = false;
        this.spawned = true;
        this.eventManager = game.eventManager;

        this.turtleSprite = game.add.sprite(0, 0, 'turtle', 'Tortue_nage01_0000');
        this.turtleSprite.anchor.setTo(0.5, 0.5);
        this.turtleSprite.scale.x = scale;
        this.turtleSprite.scale.y = scale;

        this.turtleSprite.animations.add('swim1', Phaser.Animation.generateFrameNames('Tortue_nage01_', 0, 7, '', 4), 8, false, false);
        this.turtleSprite.animations.add('swim2', Phaser.Animation.generateFrameNames('Tortue_nage02_', 0, 7, '', 4), 8, false, false);
        this.turtleSprite.animations.add('swimRight', Phaser.Animation.generateFrameNames('Tortue_nage_DROITE_', 0, 7, '', 4), 8, false, true);
        this.turtleSprite.animations.add('swimLeft', Phaser.Animation.generateFrameNames('Tortue_nage_GAUCHE_', 0, 7, '', 4), 8, false, true);
        this.turtleSprite.animations.add('victory', Phaser.Animation.generateFrameNames('Tortue_victory_', 0, 5, '', 4), 8, false, false);
        this.turtleSprite.animations.add('hit', Phaser.Animation.generateFrameNames('Tortue_plonge_', 0, 5, '', 4), 8, false, false);
        this.turtleSprite.animations.add('emerge', Phaser.Animation.generateFrameNames('Tortue_plonge_', 5, 0, '', 4), 8, false, false);


        this.add(this.turtleSprite)

        game.physics.enable(this.turtleSprite, Phaser.Physics.ARCADE);
        this.turtleSprite.body.setSize(this.turtleSprite.height / 2, this.turtleSprite.width / 2, this.turtleSprite.height / 4, this.turtleSprite.width / 4);
        this.body = this.turtleSprite.body;

        /**
         * TextSprite
         * @private
         **/
        this.text = game.add.text(0, 0, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";
        this.text.text = text;
        this.text.fill = "black";
        this.text.fontSize = this.turtleSprite.width / 4;
        this.text.anchor.setTo(0.5, 0.5);

        this.add(this.text);

        this.warning = new Warning(this.turtleSprite.height / 4, this.turtleSprite.width / 4, game);
        this.add(this.warning);

        this.swipe = new Swipe(game, this.turtleSprite);

        this.initEvents();
        this.initSounds(game);
    };

    Turtle.prototype = Object.create(Phaser.Group.prototype);
    Turtle.constructor = Turtle;

    /**
     * init all sounds
     * @private
     **/
    Turtle.prototype.initSounds = function (game) {
        //    this.sounds = {};
        //    this.sounds.rdm = [];

        //    for (var i = 0; i < 3; i++) {
        //        this.sounds.rdm[i] = game.add.audio('rdm' + (i + 1));
        //    }

        if (this.text.text != "") this.sounds.textSound = game.add.audio(this.text.text);

        //    this.sounds.isPlaying = false;
    }

    /**
    * init object
    * @private 
    **/
    Turtle.prototype.init = function (text) {
        text = text || "";
        this.text.text = text;

        var angle = Math.floor(Math.random() * 360);
        var xOffset = this.gameRef.width / 2 + this.turtleSprite.width / 2 - 50;
        var yOffset = this.gameRef.height / 2 + this.turtleSprite.height / 2 - 50;

        this.x = xOffset * Math.cos(toRadians(angle)) + this.gameRef.width / 2;
        this.y = -yOffset * Math.sin(toRadians(angle)) + this.gameRef.height / 2;

        this.updateAngle(angle);

        if (text != "") this.sound = this.gameRef.add.audio(text);
        this.turtleSprite.animations.play('emerge');

    }

    /**
    * update angle
    * @private
    **/
    Turtle.prototype.updateAngle = function (angle) {
        this.vAngle = angle;
        this.turtleSprite.angle = -90 - angle;

        this.vx = -this.v * Math.cos(toRadians(angle));
        this.vy = this.v * Math.sin(toRadians(angle));
    }

    /**
    * Initialize linear function between the old angle and the new angle
    * @private
    **/
    Turtle.prototype.newAngle = function (angle) {
        this.oldAngle = this.vAngle;
        this.oldAngle += 360;
        angle += 360;

        if (angle - this.oldAngle > 180) {
            this.slopeAngle = (angle - (this.oldAngle + 360)) / this.time;
        }
        else {
            this.slopeAngle = (angle - this.oldAngle) / this.time;
        }

        if (this.slopeAngle > 0) {
            this.turtleSprite.animations.play('swimLeft');
        }
        else {
            this.turtleSprite.animations.play('swimRight');
        }
        this.turning = true;
        this.t = 0;
        this.oldAngle -= 360;
    }

    /**
     * init all events
     * @private
     **/
    Turtle.prototype.initEvents = function () {
        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            if (this.spawned)
                this.paused = false;
        }, this);
    }

    /**
    *
    * @private
    **/
    Turtle.prototype.checkUserInput = function () {
        var result = this.swipe.check();

        if (result) {
            var angle = -toDegrees(Math.atan2((result.deltaY), (result.deltaX))) + 180;
            this.newAngle(angle);
        }
    }

    Turtle.prototype.hit = function () {
        this.spawned = false;
        this.paused = true;
        this.text.visible = false;
        this.turtleSprite.animations.play('hit');
        this.warning.toggle(false);
        this.turtleSprite.animations.currentAnim.onComplete.add(function () {
            this.eventManager.emit('destroyTurtle', this);
            this.visible = false;
        }, this);
    }

    /**
     * mainly used for the speed function
     * also used for the idle animation
     * @private
     **/
    Turtle.prototype.update = function () {
        if (!this.paused) {
            if (!this.turning) {
                if (this.turtleSprite.animations.currentAnim.isFinished || !this.turtleSprite.animations.currentAnim.isPlaying) {
                    var rand = Math.random();

                    if (rand < 0.7)
                        this.turtleSprite.animations.play('swim1');
                    else this.turtleSprite.animations.play('swim2');
                }
            }

            else {
                this.updateAngle(this.slopeAngle * this.t + this.oldAngle);

                if (this.t > this.time) {
                    this.turning = false;
                    this.turtleSprite.animations.play('swim1');
                }
                this.t += 1 / 60;
            }


            this.checkUserInput();
            this.x += this.vx;
            this.y += this.vy;
            this.vAngle = this.vAngle % 360;
            if (this.vAngle < 0) this.vAngle += 360;

            if (this.x < -this.turtleSprite.width / 2) {
                if ((this.vAngle <= 45 && this.vAngle >= 0) || (this.vAngle >= 315 && this.vAngle <= 360)) {
                    this.eventManager.emit('destroyTurtle', this);
                }
            }
            else if (this.x > this.gameRef.width + this.turtleSprite.width / 2 && this.vAngle <= 225 && this.vAngle >= 135) {
                this.eventManager.emit('destroyTurtle', this);
            }
            else if (this.y < -this.turtleSprite.height / 2 && this.vAngle <= 315 && this.vAngle >= 225) {
                this.eventManager.emit('destroyTurtle', this);
            }
            else if (this.y > this.gameRef.height + this.turtleSprite.height / 2 && this.vAngle <= 135 && this.vAngle >= 45) {
                this.eventManager.emit('destroyTurtle', this);
            }

        }
    }

    function toDegrees(angle) {
        return angle * (180 / Math.PI);
    }

    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    return Turtle;


});