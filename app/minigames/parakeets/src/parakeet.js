define([
    './feather',
    'common/src/mathSprite'
], function (
    Feather,
    MathSprite
) {

    'use strict';

    var GRAVITY = -890;

    function Parakeet(x, y, game) {
        Phaser.Group.call(this, game);

        this.game = game;
        
        this.x = x;
        this.y = y;
        this.feather = new Feather(game);

        this.value = "";


        this.parakeetSprite = game.add.sprite(0, 0, 'parakeet', 'PERRUCHE1_face_Idle01_0000');
        this.parakeetSprite.anchor.setTo(0.5, 1);

        this.parakeetSprite.animations.add('backIdle', Phaser.Animation.generateFrameNames('PERRUCHE1_dos_Idle01_', 0, 5, '', 4), 15, false, false);
        this.parakeetSprite.animations.add('frontIdle01', Phaser.Animation.generateFrameNames('PERRUCHE1_face_Idle01_', 0, 5, '', 4), 15, false, false);
        this.parakeetSprite.animations.add('frontIdle02', Phaser.Animation.generateFrameNames('PERRUCHE1_face_Idle02_', 0, 5, '', 4), 15, false, false);
        this.parakeetSprite.animations.add('happy', Phaser.Animation.generateFrameNames('PERRUCHE1_face_contente_', 0, 7, '', 4), 15, true, false);
        this.parakeetSprite.animations.add('sad', Phaser.Animation.generateFrameNames('PERRUCHE1_face_triste_', 0, 5, '', 4), 15, false, false);
        this.parakeetSprite.animations.add('fly', Phaser.Animation.generateFrameNames('PERRUCHE1_face_vole01_', 0, 7, '', 4), 15, true, false);
        this.parakeetSprite.animations.add('rotate', Phaser.Animation.generateFrameNames('PERRUCHE1_tourne_', 0, 2, '', 4), 15, false, false);
        this.parakeetSprite.animations.play('frontIdle01');

        this.parakeetSprite.hitArea = new Phaser.Circle(0, -this.parakeetSprite.height / 2, this.parakeetSprite.height);
        this.parakeetSprite.inputEnabled = true;
        this.events = this.parakeetSprite.events;

        this.events.onInputDown.add(function () {
            console.log("parakeetsClickable: " + this.clickable);
            if (this.clickable) {
                this.clickable = false;
                this.sounds.click[Math.floor(Math.random() * (this.sounds.click.length))].play();
                this.return(true);
                this.sound.play();
                this.game.eventManager.emit('clicked', this);
            }
        }, this);

        this.highlight = game.add.sprite(0, -this.parakeetSprite.height / 2, 'fx', 'FX_02');
        this.highlight.anchor.setTo(0.5, 0.5);
        this.highlight.scale.x = 0.9;
        this.highlight.scale.y = 0.9;
        this.highlight.visible = false;
        this.add(this.highlight);

        this.add(this.parakeetSprite);


        this.text = game.add.text(0, -this.parakeetSprite.height / 5, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";

        this.text.width = 500;
        this.text.scale.y = this.text.scale.x;
        this.text.text = "";
        this.text.anchor.setTo(0.5, 1);
        this.add(this.text);

        this.initSounds(game);
        this.initEvents();

        this.front = true;
        this.time = 1.7;
        this.flying = false;
        this.clickable = false;
		this.animCanSetClickable = true;
        this.paused = false;

    };

    Parakeet.prototype = Object.create(Phaser.Group.prototype);
    Parakeet.prototype.constructor = Parakeet;

    Parakeet.prototype.initEvents = function () {
        this.game.eventManager.on('unClickable', function () {
			console.log("parakeets: unClickable");
            this.clickable = false;
			this.animCanSetClickable = false;
        }, this);

        this.game.eventManager.on('clickable', function () {
			console.log("parakeets: clickable");
            if (!this.front)
				this.animCanSetClickable = true;
				console.log("parakeets: clickable record anim");
                this.parakeetSprite.animations.currentAnim.onComplete.addOnce(function () {
                    this.clickable = this.animCanSetClickable;
					console.log("parakeets: clickable end anim: clickable = " + this.clickable);
                }, this);
        }, this);

        this.game.eventManager.on('pause', function () {
            this.clickable = false;
			console.log("parakeets: pause: clickable = false");
        }, this);

        this.game.eventManager.on('unPause', function () {
			console.log("parakeets: unPause");
            if (!this.front)
			{
				console.log("parakeets: unPause: clickable = true");
				this.clickable = true;
			}
        }, this);

        this.game.eventManager.on('clicked', function () {
            if (this.highlight.visible) this.highlight.visible = false;
        }, this);
    }

    Parakeet.prototype.initSounds = function (game) {
        this.sounds = {};
        this.sounds.click = [];

        for (var i = 0; i < 4; i++) {
            this.sounds.click[i] = game.add.audio('rdm' + (i + 1));
        }

        this.sounds.fly = game.add.audio('fly');
        this.sounds.turn = game.add.audio('turn');
    }

    Parakeet.prototype.setValue = function (text, value, picture) {
        picture = (typeof picture !== 'undefined') ? picture : false;

        if (value != "") this.sound = this.game.add.audio(value);
        this.value = value;
        if (!picture) {
            this.text.text = text;
        }
        else {
            this.picture = this.game.add.sprite(0, -this.parakeetSprite.height / 5, 'maths', value.toString());
            this.picture.height = this.parakeetSprite.width / 3;
            this.picture.scale.x = this.picture.scale.y;
            this.picture.anchor.setTo(0.5, 1);
            this.add(this.picture);
        }
    };
	Parakeet.prototype.isVisible = function ()	{
		return this.front;
	};

    Parakeet.prototype.pause = function (bool) {
        this.paused = bool;
    };

    Parakeet.prototype.fly = function (bool) {
        if (bool) {
            this.parakeetSprite.animations.play('fly');
        }
        else {
            this.parakeetSprite.animations.stop();
        }
    };

    Parakeet.prototype.happy = function (bool) {
        if (bool) {
            this.parakeetSprite.animations.currentAnim.onComplete.addOnce(function () { this.parakeetSprite.animations.play('happy'); }, this);
        }
        else {
            this.parakeetSprite.animations.stop();
        }
    };

    Parakeet.prototype.flyTo = function (newX, newY) {
        this.fly(true);
        this.newX = newX;
        this.newY = newY;
        this.oldX = this.x;
        this.oldY = this.y;

        this.slopeX = (this.newX - this.oldX) / this.time;
        this.slopeY = (this.newY - this.oldY + (GRAVITY * Math.pow(this.time, 2)) / 2) / this.time;

        this.t = 0;

        this.flying = true;
    };

    Parakeet.prototype.sad = function (bool) {
        if (bool) {
            this.parakeetSprite.animations.currentAnim.onComplete.addOnce(function () { this.parakeetSprite.animations.play('sad'); }, this);
        }
        else {
            this.parakeetSprite.animations.stop();
        }
    };

    Parakeet.prototype.return = function (bool, clickable) {
        if (typeof clickable === 'undefined') clickable = true;
        this.front = bool;

        this.parakeetSprite.animations.play('rotate');
        if (!bool)
            this.parakeetSprite.animations.currentAnim.onComplete.addOnce(function () {
                this.clickable = clickable;
            }, this);
        else
            this.clickable = false;
        this.parent.game.world.bringToTop(this.feather);
        this.feather.hit(this.x, this.y - this.parakeetSprite.height / 4);
        this.sounds.turn.play();

        var context = this;
        if (bool)
            setTimeout(function () {
                context.text.visible = bool;
                if (typeof context.picture !== "undefined") context.picture.visible = bool;
            }, 180);
        else {
            this.text.visible = bool;
            if (typeof this.picture !== 'undefined') this.picture.visible = bool;
        }
    };

    Parakeet.prototype.update = function () {
        if (this.highlight.visible) {
            this.highlight.rotation += 0.01;
        }


        if (this.parakeetSprite.animations.currentAnim.isFinished || !this.parakeetSprite.animations.currentAnim.isPlaying) {
            if (this.front) {

                var rand = Math.random();

                if (rand < 0.9)
                    this.parakeetSprite.animations.play('frontIdle01');
                else this.parakeetSprite.animations.play('frontIdle02');
            }
            else {
                this.parakeetSprite.animations.play('backIdle');
            }
        }

        if (this.flying) {

            if (!this.sounds.fly.isPlaying) {
                this.sounds.fly.play();
            }

            this.y = -GRAVITY * Math.pow(this.t, 2) / 2 + this.slopeY * this.t + this.oldY;
            this.y = 15 * Math.sin(15 * this.t) + this.y;

            this.x = this.slopeX * this.t + this.oldX;

            if (this.t > this.time) {
                this.flying = false;
                this.fly(false);
                this.parakeetSprite.animations.play('happy');
            }

            this.t += 1 / 60;
        }

        if (this.x - this.parakeetSprite.width / 2 >= this.game.width || this.x <= 0) {
            this.game.eventManager.emit('parakeetOutOfBound', this);
        }
    };

    return Parakeet;
});