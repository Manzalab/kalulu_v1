define([
], function (
) {

    'use strict';

    /**
     * Buoy object
	 * @class
     * @extends Phaser.Group
     * @memberof Bilan
     * @param side {bool} left or right ; true = right  
     * @param category {string}
     * @param game {Phaser.Game} game instance   
	**/
    function Buoy(side, category, game) {
        Phaser.Group.call(this, game);

        this.game = game;
                this.y = game.height / 2.5;

        if (side) {
            this.x = game.width / 5;
            this.buoy = game.add.sprite(0, 0, 'buoyRed', 'Balise_rouge_idle_0000');
            this.buoy.anchor.setTo(0.5, 0.5);

            this.buoy.animations.add('idle', Phaser.Animation.generateFrameNames('Balise_rouge_idle_', 0, 5, '', 4), 6, true, true);

        }
        else {
            this.x = 4 * game.width / 5;
            this.buoy = game.add.sprite(0, 0, 'buoyGreen', 'Balise_verte_idle_0000');
            this.buoy.anchor.setTo(0.5, 0.5);
            this.buoy.animations.add('idle', Phaser.Animation.generateFrameNames('Balise_verte_idle_', 0, 5, '', 4), 6, true, true);
        }

        this.buoy.animations.play('idle');
        this.add(this.buoy)

        if (category == "maths") {
            this.text = game.add.text(0, -this.buoy.height/2, "- phaser -\nrocking with\ngoogle web fonts");
            this.text.font = "Arial";
            this.text.text = "";
            this.text.fill = "black";
            this.text.fontSize = this.buoy.width / 2;
            this.text.anchor.setTo(0.5, 0.5);

            this.add(this.text);
        }
        this.category = category;

        this.initEvents();
    };

    Buoy.prototype = Object.create(Phaser.Group.prototype);
    Buoy.constructor = Buoy;

    /**
     * init all events
     * @private
     **/
    Buoy.prototype.initEvents = function () {
        this.game.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.game.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);

    }

    /**
    *
    *@private
    **/
    Buoy.prototype.setText = function (value) {
        if (typeof this.text !== 'undefined') {
            this.text.text = value;
        }
    }

    /**
     * used for the idle animation
     * @private
     **/
    Buoy.prototype.update = function () {

    }

    return Buoy;
});