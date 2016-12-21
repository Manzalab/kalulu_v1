define([
    './parakeet'
], function (
    Parakeet
) {

    'use strict';

    var Branch_SCALE = 0.8;

    var Branch = function (y, orientation, arrayValue, game) {
        Phaser.Group.call(this, game);

        this.x = game.world.centerX;
        this.y = y;

        this.branch = this.create(0, 0, 'branch');

        if (orientation)
            this.branch.anchor.setTo(1, 0);

        this.branch.scale.y = Branch_SCALE;
		this.branch.scale.x = 0.4 * arrayValue.length;

        this.parakeet = [];
        this.initParakeet(orientation, arrayValue, game);

        this.highLighted = false;
        this.paused = false;
    };

    Branch.prototype = Object.create(Phaser.Group.prototype);
    Branch.prototype.constructor = Branch;

    Branch.prototype.highlight = function (bool) {
        this.highlighted = bool;
    }

    Branch.prototype.initParakeet = function (orientation, arrayValue, game) {
        var numberParakeet = arrayValue.length;
		
		

			for (var i = 0 ; i < numberParakeet; i++) {
				var temp = new Parakeet(0, this.y + 5, game);

				var x = this.x;

				if (orientation) {
					x -= this.branch.width / 2;
				}
				else x += this.branch.width / 2;
				if (numberParakeet % 2 == 0){
					if (i % 2 == 0) {
						x -= temp.parakeetSprite.width /2.5 * (i + 1);
					}
					else {
						x += temp.parakeetSprite.width / 2.5 * i

					}
				}
				else 
				{
					if (i % 2 == 0) {
						x -= temp.parakeetSprite.width /2.5 * i;
					}
					else {
						x += temp.parakeetSprite.width / 2.5 * (i +1 );

					}
	
				}

				temp.x = x;
				temp.scale.x = Branch_SCALE - 0.1;
				temp.scale.y = Branch_SCALE - 0.1;
				temp.setValue(arrayValue[i].text, arrayValue[i].value, arrayValue[i].picture);

				this.parakeet.push(temp);
			}
    }

    Branch.prototype.pause = function (bool) {
        this.paused = bool;

        for (var i = 0; i < this.parakeet.length; i++) {
            this.parakeet[i].pause(bool);
        }
    }

    Branch.prototype.update = function () {

    }

    return Branch;
});