define([
], function (
) {

    'use strict';

    var NEST_SCALE = 0.8;

    function Nest(y, orientation, game) {
        Phaser.Group.call(this, game);

        this.x = game.world.centerX;
        this.y = y;

        this.branch = this.create(0, 0, 'branch');

        if (orientation)
            this.branch.anchor.setTo(1, 0);

        this.branch.scale.y = NEST_SCALE;

        this.nest = this.create(0, 0, 'nest');
        this.nest.anchor.setTo(0.5, 1);

        if (orientation) {
            this.nest.x -= this.branch.width / 2;
        }
        else this.nest.x += this.branch.width / 2;

        this.nest.scale.x = NEST_SCALE - 0.3;
        this.nest.scale.y = NEST_SCALE - 0.4;
    };

    Nest.prototype = Object.create(Phaser.Group.prototype);
    Nest.prototype.constructor = Nest;


    return Nest;
});