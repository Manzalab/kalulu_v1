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

        this.turtles = objectArray;
        this.distances = [];
        this.island = island;

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

    }

    CollisionHandler.prototype.createNewDistances = function (object) {
        for (var j = 0; j < this.turtles.length; j++) {
            if (object != this.turtles[j]) {
                var temp = {};

                temp.oldDistance = Math.sqrt(Math.pow(object.x - this.turtles[j].x, 2)
                    + Math.pow(object.y - this.turtles[j].y, 2));
                temp.turtle1 = this.turtles[j];
                temp.turtle2 = object;
                temp.originOfWarning = false;
                this.distances.push(temp);
            }
        }
    }

    CollisionHandler.prototype.resetDistances = function () {
        var length = this.distances.length;
        for (var i = 0; i < length ; i++) {
            this.distances.splice(0, 1);
        }
    }

    CollisionHandler.prototype.destroyDistances = function (turtle) {

        for (var i = 0; i < this.distances.length; i++) {
            if (this.distances[i].turtle1 == turtle || this.distances[i].turtle2 == turtle) {
                this.distances[i].turtle1.warning.toggle(false);
                this.distances[i].turtle2.warning.toggle(false);
                this.distances.splice(i, 1);
                i--;
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
            for (var i = 0; i < this.turtles.length; i++) {
                if (this.turtles[i].spawned)
                    this.gameRef.physics.arcade.collide(this.turtles[i], this.island, this.collisionIslandHandler, null, this);

                for (var j = 0; j < this.turtles.length; j++) {
                    if (this.turtles[i].spawned && this.turtles[j].spawned)
                        this.gameRef.physics.arcade.collide(this.turtles[i], this.turtles[j], this.collisionTurtleHandler, null, this);
                }
            }

            for (var i = 0 ; i < this.distances.length; i++) {

                var temp = Math.sqrt(Math.pow(this.distances[i].turtle1.x - this.distances[i].turtle2.x, 2)
                    + Math.pow(this.distances[i].turtle1.y - this.distances[i].turtle2.y, 2));

                if (temp < this.distances[i].oldDistance && temp < 400) {
                    this.distances[i].originOfWarning = true;
                        this.distances[i].turtle1.warning.toggle(true);
                        this.distances[i].turtle2.warning.toggle(true);
                }

                else {
                    if (this.distances[i].originOfWarning) {
                        this.distances[i].turtle1.warning.toggle(false);
                        this.distances[i].turtle2.warning.toggle(false);
                    }
                }

                this.distances[i].oldDistance = temp;
            }
        }
    }



    return CollisionHandler;


});