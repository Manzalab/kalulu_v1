define([
    'common/src/mathSprite'
], function (
    MathSprite
) {

    'use strict';

    /**
     * Island object
	 * @class
     * @extends Phaser.Group
     * @memberof Island
     * @param game {Phaser.Game} game instance
     * @param textLength {int} 
     * @param scale {scale} default 1
	**/
    function Island(game, textLength, picture, scale) {
        scale = scale || 1;
        textLength = textLength || 4;

        Phaser.Group.call(this, game);

        this.x = game.world.centerX;
        this.y = game.world.centerY;
        this.paused = false;
        this.eventManager = game.eventManager;


        this.islandSprite = game.add.sprite(0, 0, 'island');
        this.islandSprite.anchor.setTo(0.5, 0.5);
        this.islandSprite.scale.x = scale;
        this.islandSprite.scale.y = scale;

        game.physics.enable(this.islandSprite, Phaser.Physics.ARCADE);
        this.islandSprite.body.setSize(this.islandSprite.height / 2, this.islandSprite.width / 2, this.islandSprite.height / 4, this.islandSprite.width / 4);
        this.body = this.islandSprite.body;

        this.add(this.islandSprite)

        /**
         * TextSprite
         * @private
         **/
        this.text = game.add.text(0, 0, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";
        var temp = "";
        for (var i = 0; i < textLength; i++) {
            temp += "_ ";
        }
        this.text.text = temp;
        this.text.fill = "black";
        this.text.fontSize = this.islandSprite.width / (textLength * 2);
        this.text.anchor.setTo(0.5, 0.5);

        this.add(this.text);

        if (this.game.discipline == "maths" && typeof picture!=='undefined') {
            this.picture = new MathSprite(0, -100, picture.value, game, this.islandSprite.width/2, this.islandSprite.height/2);
            this.add(this.picture);
            this.text.y += 100;
        }

        this.initEvents();
        this.initSounds(game);
    };

    Island.prototype = Object.create(Phaser.Group.prototype);
    Island.constructor = Island;

    /**
     * init all sounds
     * @private
     **/
    Island.prototype.initSounds = function (game) {
        //this.sounds = {};
        //this.sounds.rdm = [];

        //for (var i = 0; i < 3; i++) {
        //    this.sounds.rdm[i] = game.add.audio('rdm' + (i + 1));
        //}

        //if (this.text.text != "") this.sounds.textSound = game.add.audio(this.text.text);

        //this.sounds.isPlaying = false;
    }

    Island.prototype.reset = function (textLength) {
        var temp = "";
        for (var i = 0; i < textLength; i++) {
            temp += "_ ";
        }
        this.text.text = temp;
        this.text.fontSize = this.islandSprite.width / (textLength * 2);
    }

    Island.prototype.setText = function (value) {
        this.text.text = value;
    };

    /**
     * init all events
     * @private
     **/
    Island.prototype.initEvents = function () {
        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);
    }

    /**
     * mainly used for the speed function
     * also used for the idle animation
     * @private
     **/
    Island.prototype.update = function () {

    }

    return Island;


});