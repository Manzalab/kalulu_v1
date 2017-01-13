define([
], function (
) {

    'use strict';

    var SCALE = 1;

    function Board(x, y, game) {
        Phaser.Group.call(this, game);

        

        this.x = x;
        this.y = y;

        this.scale.x = SCALE;
        this.scale.y = SCALE;

        this.sprite = game.add.sprite(0, 0, 'board');
        this.sprite.anchor.setTo(0.5, 1);

        this.add(this.sprite);

        this.text = game.add.text(-20, -20, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";
        this.text.text = "";
        this.text.fill = "white";
        this.text.fontSize = this.sprite.height / 2 * SCALE;
        this.text.anchor.setTo(0.5, 1);

        this.add(this.text);

        this.initEvents();

    };

    Board.prototype = Object.create(Phaser.Group.prototype);
    Board.constructor = Board;

    Board.prototype.initEvents = function () {
        this.game.eventManager.on('pause', function () {
        }, this);

        this.game.eventManager.on('unPause', function () {
        }, this);
    };

    Board.prototype.setText = function (value) {
        this.text.text = value;
    };

    Board.prototype.setTextMaths = function (valueArray,valueHole) {
        this.text.text = "";
        var holeIndex = 0;
        for (var i = 0; i < valueArray.length; i++) {
            if (valueArray[i].toString() == 'X') {
                if (typeof valueHole === 'undefined') this.text.text += '_ ';
                else this.text.text += valueHole + ' ';
                holeIndex = i;
            }
            else this.text.text += valueArray[i] + ' ';
        }

        return holeIndex;
    }
    

    return Board;


});