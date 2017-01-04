define([], function () {
    
    'use strict';
    var Phaser = require('phaser-bundle');

    var HOLE_WIDTH = 400;
    var HOLE_HEIGHT = 400;
    var CRAB_DIAMETER = HOLE_HEIGHT - 85;

    var Crab = function (x, y, durations, game) {

        Phaser.Group.call(this, game);

        this.eventManager = game.eventManager;
        this.game = game;

        y += 80;

        this.x = x;
        this.y = y;

        this.updateDurations(durations);

        this.holeUnder = this.create(0, 0, 'hole', 'hole_under');
        this.holeUnder.anchor.setTo(0.5, 0.5);
        this.holeUnder.width = HOLE_WIDTH;
        this.holeUnder.height = HOLE_HEIGHT;


        this.crab = game.add.group();
        this.crab.x = 0;
        this.crab.y = 0;
        this.crab.inputEnabled = true;

        this.crabSprite = this.crab.create(0, 0, 'crab', 'CRABE_Idle01_0000');
        this.crabSprite.anchor.setTo(0.5, 0.5);
        this.crabSprite.width = CRAB_DIAMETER;
        this.crabSprite.height = CRAB_DIAMETER;
        this.crabSprite.hitArea = new Phaser.Circle(0, 0, 340);
        this.crabSprite.inputEnabled = true;
        this.events = this.crabSprite.events;

        this.events.onInputDown.add(function () {
            if (this.clickable && !this.paused) {
                this.enabled = false;
                this.clickable = false;
                this.crabSprite.animations.play('hit');
                this.eventManager.emit('clicked', this);
            }
        }, this);

        this.crabSprite.animations.add('idle01', Phaser.Animation.generateFrameNames('CRABE_Idle01_', 0, 5, '', 4), 15, false, false);
        this.crabSprite.animations.add('idle02', Phaser.Animation.generateFrameNames('CRABE_Idle02_', 0, 5, '', 4), 15, false, false);
        this.crabSprite.animations.add('hit', Phaser.Animation.generateFrameNames('CRABE_hit_', 0, 3, '', 4), 15, false, false);
        this.crabSprite.animations.add('rotation', Phaser.Animation.generateFrameNames('CRABE_tourne_', 0, 5, '', 4), 15, false, false);

        this.text = game.add.text(0, 0, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";
        this.text.size = 20;
        this.text.anchor.setTo(0.5, 0.5);
        this.crab.add(this.text);

        this.picture = this.game.add.sprite(0, 0, 'maths');
        this.picture.height = this.crabSprite.width / 6;
        this.picture.width = this.crabSprite.height / 6;
        this.picture.anchor.setTo(0.5, 0.5);
        this.picture.visible = false;
        this.crab.add(this.picture);

        var mask = game.add.graphics(x - HOLE_WIDTH / 2, 0);
        mask.anchor.setTo(0.5, 0.5);
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, HOLE_WIDTH + 200, y - HOLE_HEIGHT / 4 - 20);
        this.crab.mask = mask;


        this.add(this.crab);


        this.holeOver = this.create(0, 40, 'hole', 'hole_over');
        this.holeOver.anchor.setTo(0.5, 0.5);
        this.holeOver.width = HOLE_WIDTH - 10;
        this.holeOver.height = HOLE_HEIGHT - 50;

        this.initEvents();

        this.initSounds(game);

        this.success = false;
        this.fail = false;
        this.enabled = false;
        this.clickable = false;
        this.displayed = false;
        this.paused = false;
        this.reset = false;
        this.countdownClickable = 0;
    };

    Crab.prototype = Object.create(Phaser.Group.prototype);
    Crab.prototype.constructor = Crab;

    Crab.prototype.initSounds = function (game) {
        this.sounds = {};
        this.sounds.claw = [];
        var temp;
        for (var i = 0; i < 13; i++) {
            if ((i + 1) >= 10) temp = i + 1;
            else temp = "0" + (i + 1);
            this.sounds.claw[i] = game.add.audio('rdm' + temp);
        }
        this.sounds.isPlaying = false;
    };

    Crab.prototype.updateDurations = function (durations) {
        this.durationApparition = durations.durationApparition;
        this.timeDisplayed = durations.timeDisplayed;
        this.durationDisappearance = durations.durationDisappearance;
    };

    Crab.prototype.initEvents = function () {
        this.eventManager.on('pause', function () {
            this.paused = true;
            
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);

        this.eventManager.on('fail', function (crab) {
            if (crab != this && this.enabled) this.reset = true;
        }, this);

        this.eventManager.on('success', function (crab) {
            if (crab != this && this.enabled) this.reset = true;
        }, this);
    };


    Crab.prototype.setValue = function (text, value, picture) {
        picture = (typeof picture !== 'undefined') ? picture : false;
        if (!picture) {
            this.text.text = text;
            this.text.visible = true;
            this.picture.visible = false;
        }
        else {
            this.text.visible = false;
            this.picture.frameName = value;
            this.picture.visible = true;
        }
    };

    Crab.prototype.resetProperties = function () {
        this.success = false;
        this.fail = false;
        this.enabled = false;
        this.clickable = false;
        this.displayed = false;
        this.countdownClickable = 0;

        this.crab.rotation = 0;
        this.crab.y = this.holeOver.y;
    };

    Crab.prototype.clawSound = function () {
        if (!this.sounds.isPlaying) {
            var rand = Math.floor(Math.random() * this.sounds.claw.length);
            this.sounds.claw[rand].play();
            this.sounds.isPlaying = true;
            this.sounds.claw[rand].onStop.addOnce(function () {
                this.sounds.isPlaying = false;
            }, this);
        }
    };

    Crab.prototype.normalAnimation = function () {
        if (this.enabled == true && this.reset == false) {

            if (this.clickable == false && this.displayed == false) {

                this.clawSound();

                this.crab.y -= (CRAB_DIAMETER - 50) / (this.durationApparition * 60);

                if (this.crab.y < -(CRAB_DIAMETER - 50)) {
                    this.clickable = true;
                    this.displayed = true;
                }
            }

            if (this.clickable == true) {
                this.countdownClickable += 1 / 60;

                if (this.countdownClickable > this.timeDisplayed) {
                    this.clickable = false;
                    this.countdownClickable = 0;
                }
            }

            if (this.clickable == false && this.displayed == true) {

                this.clawSound();

                this.crab.y += CRAB_DIAMETER / (this.durationDisappearance * 60);
                this.clickable = false;

                if (this.crab.y > 0) {
                    this.spawned = false;
                    this.displayed = false;
                    this.enabled = false;
                }
            }

        }
    };

    Crab.prototype.successAnimation = function () {
        this.enabled = false;

        if (this.crabSprite.animations.currentAnim.isFinished == true || this.crabSprite.animations.currentAnim.isPlaying == false) {
            this.crabSprite.animations.play('rotation');
        }

        this.crab.y -= CRAB_DIAMETER / (this.durationApparition * 60);
        this.crab.rotation -= 0.2;
        if (this.crab.y < -this.y - CRAB_DIAMETER) {
            this.resetProperties();
        }
    };

    Crab.prototype.failAnimation = function () {
        this.enabled = false;

        this.clawSound();

        this.crab.y += CRAB_DIAMETER / (this.durationDisappearance * 60);

        if (this.crab.y > 0) {
            this.resetProperties();
        }
    };

    Crab.prototype.resetAnimation = function () {
        this.clawSound();

        this.crab.y += CRAB_DIAMETER / (this.durationDisappearance * 60);

        if (this.crab.y >= 0) {
            this.reset = false;
            this.resetProperties();
        }
    };

    Crab.prototype.update = function () {

        if (this.crabSprite.animations.currentAnim.isFinished === true || this.crabSprite.animations.currentAnim.isPlaying === false) {
            var rand = Math.random();

            if (rand < 0.9)
                this.crabSprite.animations.play('idle01');
            else this.crabSprite.animations.play('idle02');
        }



        if (!this.paused) {
            this.normalAnimation();

            if (this.success === true) {
                this.successAnimation();
            }

            else if (this.fail === true) {
                this.failAnimation();
            }

            else if (this.reset === true) {
                this.resetAnimation();
            }
        }
    };
    return Crab;
});