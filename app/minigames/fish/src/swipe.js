/**
 * Created by flogvit on 2015-11-03.
 *
 * @copyright Cellar Labs AS, 2015, www.cellarlabs.com, all rights reserved
 * @file
 * @license MIT
 * @author Vegard Hanssen <Vegard.Hanssen@cellarlabs.com>
 *
 */

define([
], function (
) {

    /**
    * Really easy to use swipe library
    * Modified to only use swipe left and swipe right
    * @class
    **/
    function Swipe(game, object) {
        var self = this;

        
        self.DIRECTION_LEFT = 4;
        self.DIRECTION_RIGHT = 8;

        self.game = game;
        self.object = object;
        self.dragLength = 100;
        self.diagonalDelta = 50;
        self.swiping = false;
        self.direction = null;
        self.tmpDirection = null;
        self.tmpCallback = null;
        self.diagonalDisabled = false;
        self.object.inputEnabled = true;
        self.object.events.onInputDown.add(function () {
            self.swiping = true;
        });
        this.game.input.onUp.add(function () {
            self.swiping = false;
        })
    }

    Swipe.prototype.check = function () {
        if (this.direction !== null) {
            this.game.eventManager.emit('swipe', this.object.parent, direction);
            this.direction = null;
            return result;
        }
        if (!this.swiping) return null;

        if (Phaser.Point.distance(this.game.input.activePointer.position, this.game.input.activePointer.positionDown) < this.dragLength) return null;

        this.swiping = false;

        var direction = null;
        var deltaX = this.game.input.activePointer.position.x - this.game.input.activePointer.positionDown.x;
        var deltaY = this.game.input.activePointer.position.y - this.game.input.activePointer.positionDown.y;

        var deltaXabs = Math.abs(deltaX);
        var deltaYabs = Math.abs(deltaY);

        if (!this.diagonalDisabled && deltaXabs > (this.dragLength - this.diagonalDelta) && deltaYabs > (this.dragLength - this.diagonalDelta)) {
            if (deltaX > 0 && deltaY < 0) {
                direction = this.DIRECTION_RIGHT;
            } else if (deltaX < 0 && deltaY < 0) {
                direction = this.DIRECTION_LEFT;
            }
        }
        if (direction !== null) {
            this.game.eventManager.emit('swipe', this.object.parent, direction);
            return true;
        }
        return null;
    }

    return Swipe;
});
