define([
], function (
) {

    'use strict';

    var SCALE = 1.5;

    function Popup(game, scale) {
        scale = scale || SCALE;

        Phaser.Group.call(this, game);

        this.x = game.world.centerX;
        this.y = game.world.centerY;

        this.scale.x = scale;
        this.scale.y = scale;

        this.sprite = game.add.sprite(0, 0, 'popup');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.add(this.sprite);

        this.text = game.add.text(0, 0, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";
        this.text.text = "";
        this.text.fill = "white";
        this.text.anchor.setTo(0.5, 0.5);

        this.add(this.text);

        this.show(false);

    };

    Popup.prototype = Object.create(Phaser.Group.prototype);
    Popup.constructor = Popup;

    Popup.prototype.show = function (bool) {
        this.visible = bool;
        if (bool) {
            this.parent.game.world.bringToTop(this);
        }
    };

    Popup.prototype.setText = function (value) {
        this.text.text = value.toString();
        this.text.fontSize = this.sprite.width / (this.text.text.length * 2);
        if (this.text.fontSize > 100) this.text.fontSize = 100;
    };

    Popup.prototype.setTextMaths = function (valueArray) {
        this.text.text = "";
        for (var i = 0; i < valueArray.length; i++) {
            this.text.text += valueArray[i] + ' ';
        }
        this.text.fontSize = this.sprite.width / (valueArray.length);
    }

    return Popup;
});