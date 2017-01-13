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
        var length = words.length;
        if (picture) length = 1;
        for (var i = 0 ; i < length; i++) {
            if (textX + words[i].length * TEXTFONTSIZE > this.game.width) {
                textX = xOffset;
                textY += yOffset;
            }

            var temp = game.add.text(textX, textY, "- phaser -\nrocking with\ngoogle web fonts");
            temp.font = "Arial";
            if (!picture) temp.text = words[i];
            else temp.text = words;
            if (i == this.wordIndex || picture) temp.visible = false;

            temp.fill = "black";
            temp.fontSize = TEXTFONTSIZE;
            temp.anchor.setTo(0, 0.5);

            this.add(temp);
            this.words.push(temp);

            textX += temp.width + TEXTFONTSIZE;
        }
		
		var holePosX = this.words[this.wordIndex].x + this.words[this.wordIndex].width / 2;
		var holePosY = this.words[this.wordIndex].y;
	
        this.holeBackground = game.add.sprite(holePosX, holePosY, 'hole' + Math.floor(Math.random() * 2 + 2));
        this.holeBackground.anchor.setTo(0.5, 0.5);
        //this.holeBackground.width = (this.words[this.wordIndex].text.length + 1) * TEXTFONTSIZE;
        this.holeBackground.width = 250;
        this.holeBackground.scale.y = this.holeBackground.scale.x;
		
        if (picture) {
            this.picture = new MathSprite(this.game.world.centerX - 600, this.holeBackground.y, words, this.game, 1000, height);

            this.add(this.picture);

            this.holeBackground.x = this.game.world.centerX + 500;
        }
		
		this.highlight = game.add.sprite(this.holeBackground.x, this.holeBackground.y, 'fx', 'FX_02');
        this.highlight.anchor.setTo(0.5, 0.5);
        this.highlight.scale.x = 0.5;
        this.highlight.scale.y = 0.5;
        this.highlight.visible = false;
		
        this.add(this.highlight);
        this.add(this.holeBackground);

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
        this.game.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.game.eventManager.on('unPause', function () {
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