define([
    './lillypad'
], function (
    Lillypad
) {

    'use strict';

    /**
     * Column object
	 * @class
     * @extends Phaser.Group
     * @memberof Frogger
     * @param x {int} x position
     * @param numb {int} number of lillypads
     * @param way {bool} true = up; false = down
     * @param dataset {json object} given by remediation 
     * @param game {Phaser.Game} game instance
     * @param speed {int} speed of the lillypads
	 * @param scale {scale} default 1
	**/
    function Column(x, numb, way, dataset, game, speed, scale) {
        speed = speed || 1;
        scale = scale || 1;

        Phaser.Group.call(this, game);

        this.x = x;
        this.speed = speed;
        this.enabled = true;
        this.paused = true;
        this.way = way;
                this.dataset = dataset;

        this.lillypads = [];


        this.initLillypads(way, numb, game);
        this.initEvents();
        this.setVisibleText(false);
    };

    Column.prototype = Object.create(Phaser.Group.prototype);
    Column.constructor = Column;

    /**
     * init lillypads array
     * @private
     **/
    Column.prototype.initLillypads = function (way, numb, game) {
        this.space = game.height / numb;
        var heightRandomizer = Math.floor(Math.random() * 100);
        var lillypad;
        if (numb > 2) numb++;
        if (way) {
            for (var i = 0; i < numb; i++) {
                lillypad = new Lillypad(this.x, heightRandomizer + i * this.space, game, this.dataset[i]);
                lillypad.apparition = null;
                this.lillypads.push(lillypad);
            }
        }
        else {
            for (var i = 0; i < numb; i++) {
                lillypad = new Lillypad(this.x, game.height - heightRandomizer - i * this.space, game, this.dataset[i]);
                lillypad.apparition = null;
                this.lillypads.push(lillypad);
            }
        }
    }

    Column.prototype.deleteLillypads = function () {
        var length = this.lillypads.length;
        for (var i = 0; i < length; i++) {
            this.lillypads.pop().destroy();
        }
    }

    /**
     * 
     * @private
     **/
    Column.prototype.setVisibleText = function (bool) {
        for (var i = 0; i < this.lillypads.length; i++) {
            this.lillypads[i].text.visible = bool;
        }
    }

    /**
     * 
     * @private
     **/
    Column.prototype.fade = function (lillypad) {

        for (var i = 0; i < this.lillypads.length; i++) {
            if (this.lillypads[i] != lillypad) {
                this.lillypads[i].fadeOut();
            }
        }
    }

    /**
     * init all events
     * @private
     **/
    Column.prototype.initEvents = function () {
        this.game.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.game.eventManager.on('unPause', function () {
            if (this.enabled)
                this.paused = false;
        }, this);
    }

    /**
     * used for the idle animations
     * @private
     **/
    Column.prototype.update = function () {
        if (!this.paused) {
            for (var i = 0; i < this.lillypads.length; i++) {
                if (this.way) {
                    this.lillypads[i].y -= this.speed;
                    if (this.lillypads[i].y <= -this.lillypads[i].lillypadSprite.height) {
                        this.lillypads[i].y = this.parent.game.height + this.space / 2;
                        this.lillypads[i].lillypadSprite.alpha = 1;
                        this.lillypads[i].clicked = false;
                    }
                }
                else {
                    this.lillypads[i].y += this.speed;
                    if (this.lillypads[i].y >= this.parent.game.height + this.lillypads[i].lillypadSprite.height) {
                        this.lillypads[i].y = -this.space / 2;
                        this.lillypads[i].lillypadSprite.alpha = 1;
                        this.lillypads[i].clicked = false;
                    }
                }

                if (this.lillypads[i].y >= (this.parent.game.height - this.space) / 2
                    && this.lillypads[i].y <= (this.parent.game.height + this.space) / 2) {
                    if (!this.lillypads[i].clickable && !this.lillypads[i].clicked && this.lillypads[i].text.visible) {
                        this.lillypads[i].setClickable(true);
                        this.game.eventManager.emit('apparition', this.lillypads[i]);
                    }
                }
                else {
                    this.lillypads[i].setClickable(false);
                    if (this.lillypads[i].apparition !== null) {
                        if (!this.lillypads[i].apparition.isClicked) {
                            this.lillypads[i].apparition.close(false, 0);
                            this.lillypads[i].apparition = null;
                        }
                    }
                }
            }
        }

    }

    return Column;


});