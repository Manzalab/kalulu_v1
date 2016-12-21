define ([
    './leaf',
    './grapheme'
], function (
    Leaf,
    Grapheme
) {
    'use strict';

    var LINE_SCALE = 0.4;
    var MAX_LEAVES = 4;

    function Line (x, y, game) {
        Phaser.Group.call(this, game);

        this.gameRef = game;
        this.x = x;
        this.y = y;

        this.leaves = [];
        this.initLeaves(game);
        this.graph = [];


        this.endLine = this.create(0, 0, 'lineEnd');
        this.endLine.scale.y = LINE_SCALE;

        this.line = this.create(0, 0, 'line');
        this.line.scale.y = LINE_SCALE;
        this.line.x += this.endLine.width;
        this.line.width = game.width;

        this.setSpeed(1);

        this.highLighted = false;
        this.paused = true;
        this.leafSpawnTime = 10;
        this.leafWait = 60 * this.leafSpawnTime * Math.random();
    }

    Line.prototype = Object.create(Phaser.Group.prototype);
    Line.prototype.constructor = Line;

    Line.prototype.initLeaves = function (game) {

        var rand = Math.floor(Math.random() * MAX_LEAVES);

        for (var i = 0; i < MAX_LEAVES; i++) {
            var temp;
            if (i < rand) {
                temp = new Leaf(Math.floor(Math.random() * (game.width - this.x)) + this.x, this.y, game);
                temp.spawned = true;
            }
            else {
                temp = new Leaf(game.width, this.y, game);
            }
            temp.scale.x = LINE_SCALE;
            temp.scale.y = LINE_SCALE;
            this.leaves.push(temp);
        }
    };

    Line.prototype.highlight = function (bool) {
        this.highlighted = bool;
    };

    Line.prototype.pause = function (bool) {
        this.paused = bool;
        for (var i = 0; i < MAX_LEAVES; i++) {
            this.leaves[i].pause(bool);
        }
        for (var i = 0; i < this.graph.length; i++) {
            this.graph[i].pause(bool);
        }
    };

    Line.prototype.setSpeed = function (value) {
        this.speed = value;
        for (var i = 0; i < MAX_LEAVES; i++) {
            this.leaves[i].speed = value;
        }
        for (var i = 0; i < this.graph.length; i++) {
            this.graph[i].speed = value;
        }
    };

    Line.prototype.spawnLeaf = function () {
        for (var i = 0; i < MAX_LEAVES; i++) {
            if (!this.leaves[i].spawned) {
                this.leaves[i].spawn();
                this.leaves[i].reset(this.line.width, this.y);
                return true;
            }
        }
        return false;
    };

    Line.prototype.spawnGraph = function (value) {
        var temp = new Grapheme(this.line.width, this.y, this.gameRef);
        temp.scale.x = 0.8;
        temp.scale.y = 0.8;
        temp.setText(value);
        temp.speed = this.speed;
        temp.spawn();

        this.graph.push(temp);
        return temp;
    };

    Line.prototype.destroyGraph = function () {
        var graphLength = this.graph.length;
        for (var j = 0; j < graphLength; j++) {
            
        }
    }

    Line.prototype.fadeAndDestroyGraph = function () {
        var graphLength = this.graph.length;
        for (var j = 0; j < graphLength; j++) {
            this.graph[j].tween = this.game.add.tween(this.graph[j]);
            this.graph[j].tween.to({ alpha: 0 }, 300, Phaser.Easing.Exponential.In, true, 0, 0, false);
            this.graph[j].tween.onComplete.add(function () {
                this.graph.splice(0,1);
            }, this);
        }
    }

    Line.prototype.update = function () {
        if (!this.paused) {
            this.leafWait--;

            if (this.leafWait < 0) {
                if (this.spawnLeaf()) this.leafWait = 60 * this.leafSpawnTime * Math.random();
                else this.leafWait = 0;
            }          

            if (this.x > -this.endLine.width) {
                this.x -= 1 * this.speed;
            }
        }
    };
    
    return Line; 
});