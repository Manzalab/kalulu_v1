define([
    './coconut',
    './monkey'
], function (
    Coconut,
    Monkey
) {

    'use strict';

    function Tree(king, game, monkeyNumber) {
        monkeyNumber = monkeyNumber || 0;

        Phaser.Group.call(this, game);

        this.y = game.height;

        this.king = king;

        if (!this.king) {
            this.x = game.width - 60;
            this.treeSprite = game.add.sprite(0, -50, 'tree');
            this.treeSprite.anchor.setTo(1, 1);
            this.treeSprite.scale.x = 1.7;
            this.treeSprite.scale.y = 1.7;

            this.monkey = [];
            this.initMonkeys(monkeyNumber,game);
        }
        else {
            this.x = 20;
            this.treeSprite = game.add.sprite(0, -50, 'treeKing');
            this.treeSprite.anchor.setTo(0, 1);
            this.treeSprite.scale.x = 1.7;
            this.treeSprite.scale.y = 1.7;

            this.monkey = new Monkey(this.x + this.treeSprite.width / 2, 450, this.king, game)
        }     

        this.add(this.treeSprite);


        this.paused = false;
    };

    Tree.prototype = Object.create(Phaser.Group.prototype);
    Tree.constructor = Tree;

    Tree.prototype.initMonkeys = function (monkeyNumber,game) {

        switch (monkeyNumber) {
            case 2:
                for (var i = 0; i < monkeyNumber ; i++) {
                    this.monkey.push(new Monkey(this.x - this.treeSprite.width / 2, 1040 + 280 * i, this.king, game));
                }
                break;
            case 3:
                for (var i = 0; i < monkeyNumber ; i++) {
                    this.monkey.push(new Monkey(this.x - this.treeSprite.width / 2, 760 + 280 * i, this.king, game));
                }
                break;
            case 4:
                for (var i = 0; i < monkeyNumber ; i++) {
                    this.monkey.push(new Monkey(this.x - this.treeSprite.width / 2, 480 + 280 * i, this.king, game));
                }
                break;
        }
        
    }

    return Tree;


});