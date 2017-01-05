define([
    './coconut'
], function (
    Coconut
) {

    'use strict';

    function Monkey(x, y, king, game) {
        Phaser.Group.call(this, game);

        this.gameRef = game;

        this.x = x;
        this.y = y;
        this.timerSound = 0;
        this.clickable = true;
        this.paused = false;
        this.coconut = {};
        this.eventManager = game.eventManager;

        this.king = king;

        if (!this.king) {
            this.monkeySprite = game.add.sprite(0, 0, 'monkeyNormal', 'SINGE_Idle_noixdecoco01_0000');
            this.monkeySprite.anchor.setTo(0.5, 1);

            this.monkeySprite.animations.add('stun', Phaser.Animation.generateFrameNames('SINGE_idle_etourdi_', 0, 5, '', 4), 12, true, false);
            this.monkeySprite.animations.add('idleCoconut1', Phaser.Animation.generateFrameNames('SINGE_Idle_noixdecoco01_', 0, 5, '', 4), 11, false, false);
            this.monkeySprite.animations.add('idleCoconut2', Phaser.Animation.generateFrameNames('Singe_Idle_noixdecoco02_', 0, 5, '', 4), 11, false, false);
            this.monkeySprite.animations.add('idle1', Phaser.Animation.generateFrameNames('SINGE_Idle01_', 0, 5, '', 4), 11, false, false);
            this.monkeySprite.animations.add('idle2', Phaser.Animation.generateFrameNames('Singe_Idle02_', 0, 5, '', 4), 11, false, false);
            this.monkeySprite.animations.add('impact', Phaser.Animation.generateFrameNames('SINGE_impact_', 0, 3, '', 4), 11, false, false);
            this.monkeySprite.animations.add('throw', Phaser.Animation.generateFrameNames('SINGE_lance_', 0, 5, '', 4), 11, false, false);
            this.monkeySprite.animations.add('speak', Phaser.Animation.generateFrameNames('SINGE_prononce_', 0, 3, '', 4), 11, false, false);
            this.monkeySprite.animations.add('get', Phaser.Animation.generateFrameNames('SINGE_recupere_noixdecoco_', 0, 3, '', 4), 11, false, false);
            this.add(this.monkeySprite);

            this.stunStars = game.add.sprite(0, -this.monkeySprite.height, 'stunStars', 'etoiles_etourdi_0000');
            this.stunStars.anchor.setTo(0.5, 1);
            this.stunStars.animations.add('stun', Phaser.Animation.generateFrameNames('etoiles_etourdi_', 0, 17, '', 4), 12, true, false);
            this.stunStars.scale.x = 1.6;
            this.stunStars.scale.y = 1.6;
            this.stunStars.visible = false;
            this.add(this.stunStars);

            this.coconut.sprite = new Coconut(x - this.monkeySprite.height / 2, y - 170, game);
            this.coconut.sprite.monkeyRef = this;
            this.coconut.bool = true;
        }
        else {
            this.monkeySprite = game.add.sprite(0, 0, 'monkeyKing', 'ROISINGE_Idle01_0000');
            this.monkeySprite.anchor.setTo(0.5, 1);

            this.monkeySprite.animations.add('idle1', Phaser.Animation.generateFrameNames('ROISINGE_Idle01_', 0, 5, '', 4), 11, false, false);
            this.monkeySprite.animations.add('idle2', Phaser.Animation.generateFrameNames('ROISINGE_Idle02_', 0, 5, '', 4), 11, false, false);
            this.monkeySprite.animations.add('wrong', Phaser.Animation.generateFrameNames('ROISINGE_pas_bon_', 0, 5, '', 4), 11, false, false);
            this.monkeySprite.animations.add('right', Phaser.Animation.generateFrameNames('ROISINGE_bon_', 0, 5, '', 4), 11, false, false);
            this.monkeySprite.animations.add('get', Phaser.Animation.generateFrameNames('ROISINGE_reception_', 0, 1, '', 4), 11, false, false);
            this.monkeySprite.animations.add('look', Phaser.Animation.generateFrameNames('ROISINGE_regarde_la_lettre_', 0, 5, '', 4), 11, false, false);
            this.add(this.monkeySprite)

            this.coconut.sprite = null;
            this.coconut.bool = false;
        }

        this.monkeySprite.scale.x = 1.6;
        this.monkeySprite.scale.y = 1.6;

        this.paused = false;

        if (!this.king) {
            this.monkeySprite.inputEnabled = true;
            this.monkeySprite.events.onInputDown.add(function () {
                if (!this.paused && this.clickable && this.coconut.sprite.text.text != "")
                    if (this.timerSound <= 0) {
                        this.monkeySprite.animations.play('speak');
                        this.sounds.coconut = game.add.audio(this.coconut.sprite.text.text);
                        this.sounds.coconut.play();
                        this.timerSound = Math.floor((this.sounds.coconut.totalDuration + 0.5) * 60);
                    }
            }, this);
        }

        this.initEvents();
        this.initSounds(game);
    };

    Monkey.prototype = Object.create(Phaser.Group.prototype);
    Monkey.constructor = Monkey;

    Monkey.prototype.initSounds = function (game) {
        this.sounds = {};
        this.sounds.rdm = [];

        for (var i = 0; i < 3; i++) {
            this.sounds.rdm[i] = game.add.audio('rdm' + (i + 1));
        }
        if (!this.king) {
            this.sounds.send = game.add.audio('send');
            this.sounds.receiveHead = game.add.audio('receiveHeadCoco');
        }

        else {
            this.sounds.sendRight = game.add.audio('sendRight');
            this.sounds.sendWrong = game.add.audio('sendWrong');
        }

        this.sounds.isPlaying = false;
    }

    Monkey.prototype.initEvents = function () {

        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);
    }



    Monkey.prototype.getNewCoconut = function () {
        if (!this.king) {
            var origin = {};
            origin.x = this.coconut.sprite.origin.x;
            origin.y = this.coconut.sprite.origin.y;
            this.stunStars.animations.currentAnim.stop();
            this.stunStars.visible = false;
            if (!this.coconut.sprite.apparition.isClicked) {
                this.coconut.sprite.apparition.close(false, 0);
            }
            this.coconut.sprite.destroy();
            this.coconut.sprite = new Coconut(origin.x, origin.y, this.gameRef);
            this.coconut.sprite.monkeyRef = this;
            this.coconut.sprite.visible = false;
            this.monkeySprite.animations.play('get');
            this.monkeySprite.animations.currentAnim.onComplete.addOnce(function () {
                this.coconut.sprite.visible = true;
                this.coconut.bool = true;
                this.clickable = true;
            }, this);
        }
    }

    Monkey.prototype.update = function () {

        if (this.monkeySprite.animations.currentAnim.isFinished || !this.monkeySprite.animations.currentAnim.isPlaying) {

            var rand = Math.random();

            if (rand < 0.7)
                if (this.coconut.bool)
                    this.monkeySprite.animations.play('idleCoconut1');
                else
                    this.monkeySprite.animations.play('idle1');
            else
                if (this.coconut.bool)
                    this.monkeySprite.animations.play('idleCoconut2');
                else {
                    this.monkeySprite.animations.play('idle2');
                }

        }

        if (this.timerSound > 0) this.timerSound--;
    }

    return Monkey;


});