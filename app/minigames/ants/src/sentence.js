define([
    'common/src/mathSprite'
], function (
    MathSprite
) {

    'use strict';

    /**
     * Sentence object
	 * @class
     * @extends Phaser.Group
     * @memberof sentences
     * @param x {int} x position
     * @param y {int} y position
     * @param game {Phaser.Game} game instance
     * @param text {string} text
       @param speed {speed} default 5
	 * @param scale {scale} default 1
	**/

    var TEXTFONTSIZE = 75;
    var xOffset = 300;

    function Sentence(y, height, words, wordIndex, game, picture, scale) {
        scale = scale || 1;
        picture = picture || false;

        Phaser.Group.call(this, game);

        this.game = game;
        this.associatedAnt = null;
        this.wordIndex = wordIndex;
        this.y = y;
        this.screenShare = height;
        this.eventManager = game.eventManager;
        this.paused = false;

        var lineCount = 1;
        var sentenceLength = 0;
        for (var i = 0 ; i < words.length; i++) {
            sentenceLength += words[i].length;
        }
        if (sentenceLength * TEXTFONTSIZE + xOffset > this.game.width) lineCount++;

        var yOffset = height / (lineCount + 1);
        var textY = yOffset;
        var textX = xOffset;

        this.words = [];

        for (var i = 0 ; i < words.length; i++) {
            if (textX + words[i].length * TEXTFONTSIZE > this.game.width) {
                textX = xOffset;
                textY += yOffset;
            }

            var temp = game.add.text(textX, textY, "- phaser -\nrocking with\ngoogle web fonts");
            temp.font = "Arial";
            temp.text = words[i];
            if (i == this.wordIndex) temp.visible = false;

            temp.fill = "black";
            temp.fontSize = TEXTFONTSIZE;
            temp.anchor.setTo(0, 0.5);

            this.add(temp);
            this.words.push(temp);

            textX += temp.width + TEXTFONTSIZE;
        }

        this.holeBackground = game.add.sprite(this.words[this.wordIndex].x + this.words[this.wordIndex].width / 2, this.words[this.wordIndex].y, 'hole' + Math.floor(Math.random() * 2 + 2));
        this.holeBackground.anchor.setTo(0.5, 0.5);
        //this.holeBackground.width = (this.words[this.wordIndex].text.length + 1) * TEXTFONTSIZE;
        this.holeBackground.width = 250;
        this.holeBackground.scale.y = this.holeBackground.scale.x;

        this.add(this.holeBackground);

        if (picture) {
            this.picture = new MathSprite(this.game.world.centerX - 600, this.holeBackground.y, words[0], this.game, 1000,height);

            this.add(this.picture);

            this.holeBackground.x = this.game.world.centerX + 500;
        }

        this.initEvents();
        this.alpha = 0;
        this.fadeIn();
    };

    Sentence.prototype = Object.create(Phaser.Group.prototype);
    Sentence.constructor = Sentence;



    /**
     * init all events
     * @private
     **/
    Sentence.prototype.initEvents = function () {
        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);
    }

    Sentence.prototype.fadeOut = function () {
        this.tween = this.game.add.tween(this);
        this.tween.to({ alpha: 0 }, 600, Phaser.Easing.Linear.In, true, 0, 0, false);
    }

    Sentence.prototype.fadeIn = function () {
        this.tween = this.game.add.tween(this);
        this.tween.to({ alpha: 1 }, 600, Phaser.Easing.Linear.In, true, 0, 0, false);
    }

    return Sentence;


});