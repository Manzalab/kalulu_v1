define([
], function (
) {

    'use strict';

    /**
     * CollisionHandler object
	 * @class
     * @extends Phaser.Group
     * @memberof CollisionHandler
     * @param game {Phaser.Game} game instance
	**/
    function CollisionHandler(objectArray, island, game) {
        Phaser.Group.call(this, game);
        this.eventManager = game.eventManager;
        this.gameRef = game;

        this.paused = false;

        this.objects = objectArray;
        this.island = island;
        this.distances = [];

        this.initEvents();
    };

    CollisionHandler.prototype = Object.create(Phaser.Group.prototype);
    CollisionHandler.constructor = CollisionHandler;

    /**
     * init all events
     * @private
     **/
    CollisionHandler.prototype.initEvents = function () {
        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);

        this.eventManager.on('destroyTurtle', function (turtle) {
            this.destroyDistances(turtle);
        }, this);
    }

    CollisionHandler.prototype.notPresentInArray = function (object, array) {
        var temp = 0;

        for (var i = 0; i < array.length; i++) {
            if (object != array[i]) temp++;
        }
        if (temp == array.length) return true;
        else return false;
    }

    CollisionHandler.prototype.createNewDistances = function (object) {
        for (var j = 0; j < this.objects.length; j++) {
            if (object != this.objects[j]) {
                var temp = {};

                temp.oldDistance = Math.sqrt(Math.pow(object.x - this.objects[j].x, 2)
                    + Math.pow(object.y - this.objects[j].y, 2));
                temp.object1 = object;
                temp.object2 = this.objects[j];
                this.distances.push(temp);
            }
        }
    }

    CollisionHandler.prototype.destroyDistances = function (turtle) {
        for (var i = 0 ; i < this.distances.length; i++) {
            if (this.distances.object1 == turtle || this.distances.object2 == turtle) {
                this.distances.splice(i, 1);
            }
        }
    }

    CollisionHandler.prototype.collisionTurtleHandler = function (object1, object2) {
        this.eventManager.emit('collisionTurtle', object1.parent, object2.parent);
        object1.parent.hit();
        object2.parent.hit();
    }

    CollisionHandler.prototype.collisionIslandHandler = function (object1) {
        this.eventManager.emit('collisionIsland', object1.parent);
        object1.parent.hit();
    }

    /**
     * mainly used for the speed function
     * also used for the idle animation
     * @private
     **/
    CollisionHandler.prototype.update = function () {
        var objectsDone = [];

        if (!this.paused) {
            for (var i = 0; i < this.objects.length; i++) {
                if (this.objects[i].spawned)
                    this.gameRef.physics.arcade.collide(this.objects[i], this.island, this.collisionIslandHandler, null, this);

                for (var j = 0; j < this.objects.length; j++) {
                    if (this.objects[i].spawned && this.objects[j].spawned)
                        this.gameRef.physics.arcade.collide(this.objects[i], this.objects[j], this.collisionTurtleHandler, null, this);


                    if (this.objects[i] != this.objects[j] && this.notPresentInArray(this.objects[j], objectsDone)) {
                        var temp;

                        temp = Math.sqrt(Math.pow(this.objects[i].x - this.objects[j].x, 2)
                            + Math.pow(this.objects[i].y - this.objects[j].y, 2));

                        for (var k = 0; k < this.distances.length; k++) {
                            if ((this.distances[k].object1 == this.objects[i]
                                && this.distances[k].object2 == this.objects[j])
                                ||
                                (this.distances[k].object2 == this.objects[i]
                                && this.distances[k].object1 == this.objects[j])) {
                                this.distances[k].oldDistance = this.distances[k].newDistance;
                                this.distances[k].newDistance = temp;

                                if (this.distances[k].newDistance < this.distances[k].oldDistance
                                    && this.distances[k].newDistance <= 400) {
                                    objectsDone.push(this.objects[j]);
                                    if (!this.distances[k].object1.warning.warningSprite.visible)
                                        this.distances[k].object1.warning.toggle(true);
                                    if (!this.distances[k].object2.warning.warningSprite.visible)
                                        this.distances[k].object2.warning.toggle(true);
                                }
                                else {
                                    this.distances[k].object1.warning.toggle(false);
                                    this.distances[k].object2.warning.toggle(false);
                                }

                            }

                        }
                    }
                }
                objectsDone.push(this.objects[i]);
            }
        }
    }

    return CollisionHandler;


});