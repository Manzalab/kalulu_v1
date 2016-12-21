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
 * Created by flogvit on 2015-11-03.
 *
 * @copyright Cellar Labs AS, 2015, www.cellarlabs.com, all rights reserved
 * @file
 * @license MIT
 * @author Vegard Hanssen <Vegard.Hanssen@cellarlabs.com>
 *
 */


    function Swipe(game, object) {
        var self = this;

        self.eventManager = game.eventManager;

        self.DIRECTION_UP = 1;
        self.DIRECTION_DOWN = 2;
        self.DIRECTION_LEFT = 4;
        self.DIRECTION_RIGHT = 8;
        self.DIRECTION_UP_RIGHT = 16;
        self.DIRECTION_UP_LEFT = 32;
        self.DIRECTION_DOWN_RIGHT = 64;
        self.DIRECTION_DOWN_LEFT = 128;

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

        self.game.input.onUp.add(function () {
            self.swiping = false;
        })
    }


    Swipe.prototype.check = function () {
        if (this.direction !== null) {
            var result = { x: 0, y: 0, direction: this.direction };
            this.direction = null;
            return result;
        }
        if (!this.swiping) return null;

        if (Phaser.Point.distance(this.game.input.activePointer.position, this.game.input.activePointer.positionDown) < this.dragLength) return null;

        this.swiping = false;

        var direction = null;
        var deltaX = this.game.input.activePointer.position.x - this.game.input.activePointer.positionDown.x;
        var deltaY = this.game.input.activePointer.position.y - this.game.input.activePointer.positionDown.y;

        var result = {
            x: this.game.input.activePointer.positionDown.x,
            y: this.game.input.activePointer.positionDown.y,
            deltaX: deltaX,
            deltaY: deltaY
        };

        var deltaXabs = Math.abs(deltaX);
        var deltaYabs = Math.abs(deltaY);

        if (!this.diagonalDisabled && deltaXabs > (this.dragLength - this.diagonalDelta) && deltaYabs > (this.dragLength - this.diagonalDelta)) {
            if (deltaX > 0 && deltaY > 0) {
                direction = this.DIRECTION_DOWN_RIGHT;
            } else if (deltaX > 0 && deltaY < 0) {
                direction = this.DIRECTION_UP_RIGHT;
            } else if (deltaX < 0 && deltaY > 0) {
                direction = this.DIRECTION_DOWN_LEFT;
            } else if (deltaX < 0 && deltaY < 0) {
                direction = this.DIRECTION_UP_LEFT;
            }
        } else if (deltaXabs > this.dragLength || deltaYabs > this.dragLength) {
            if (deltaXabs > deltaYabs) {
                if (deltaX > 0) {
                    direction = this.DIRECTION_RIGHT;
                } else if (deltaX < 0) {
                    direction = this.DIRECTION_LEFT;
                }
            } else {
                if (deltaY > 0) {
                    direction = this.DIRECTION_DOWN;
                } else if (deltaY < 0) {
                    direction = this.DIRECTION_UP;
                }
            }
        }
        if (direction !== null) {
            result['direction'] = direction;
            return result;
        }
        return null;
    }

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = Swipe;
        }
    }

    return Swipe;
});