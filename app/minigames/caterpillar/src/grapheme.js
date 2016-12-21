define ([
], function (
) {

    'use strict';

    function Grapheme (x, y, game) {
        Phaser.Group.call(this, game);

        this.gameRef = game;
        this.x = x;
        this.y = y;

        this.berry = game.add.sprite(0, 0, 'berry', 'Baie_Idle_0000');
        this.berry.y -= this.berry.height / 4;
        this.berry.anchor.setTo(0, 0.5);

        this.berry.animations.add('idle', Phaser.Animation.generateFrameNames('Baie_Idle_', 0, 5, '', 4), 10, true, false);
        this.berry.animations.play('idle');

        game.physics.enable(this.berry, Phaser.Physics.ARCADE);
        this.berry.body.setSize(this.berry.height/3, this.berry.width/3, 15, 70);
        this.body = this.berry.body;

        this.add(this.berry);


        this.text = game.add.text(this.berry.width / 2, -this.berry.height / 4, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";
        this.text.text = "";
        this.text.fontSize = this.berry.width / 4;
        this.text.anchor.setTo(0.5, 0.5);
        this.add(this.text);

        this.speed = 1;

        this.eaten = false;
        this.visible = false;
        this.spawned = false;
        this.highlighted = false;
        this.paused = false;
        this.hasExitedScreen = false;
    }

    Grapheme.prototype = Object.create(Phaser.Group.prototype);
    Grapheme.prototype.constructor = Grapheme;

    Grapheme.prototype.setText = function (value) {
        this.text.text = value;
        if (value != "") this.sound = this.gameRef.add.audio(value);
    };

    Grapheme.prototype.pause = function (bool) {
        this.paused = bool;
    };

    Grapheme.prototype.spawn = function () {
        this.visible = true;
        this.spawned = true;
        this.eaten = false;
    };

    Grapheme.prototype.reset = function (x, y) {
        this.x = x;
        this.y = y;
        this.highlight(false);
    };

    Grapheme.prototype.highlight = function (bool) {
        this.highlighted = bool;
    };

    Grapheme.prototype.update = function () {
        if (!this.paused) {

            if (this.spawned) {
                this.x-= 1*this.speed;

                if (this.x < 0 - this.width) {
                    this.spawned = false;
                    this.visible = false;
                    this.hasExitedScreen = true;
                }

                // A DEFINIR ? 
                // PEUT ETRE A BOUGER DE UPDATE VERS HIGHLIGHT
                if (this.highlighted) {

                }

            }
        }
    };

    return Grapheme;
});