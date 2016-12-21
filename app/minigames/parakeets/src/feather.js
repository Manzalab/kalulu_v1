define([
], function (
) {

    'use strict';


    function Feather (game) {
        Phaser.Group.call(this, game);
        this.x = 0;
        this.y = 0;

        this.feathers = game.add.group();

        this.feathers_particles = game.add.emitter(0, 0, 100);
        this.feathers_particles.makeParticles('feather');
        this.feathers_particles.minParticleScale = 0.1;
        this.feathers_particles.maxParticleScale = 0.5;
        this.feathers_particles.gravity = 150;
        this.feathers.add(this.feathers_particles);

        this.add(this.feathers);
    };

    Feather.prototype = Object.create(Phaser.Group.prototype);
    Feather.prototype.constructor = Feather;

    Feather.prototype.hit = function (x, y) {
        this.x = x;
        this.y = y;

        this.feathers_particles.start(true, 700, null, 2);
    };

    Feather.prototype.fadeOut = function (sprite) {
        if (sprite.alpha > 0)
            sprite.alpha -= 0.04;
    };

    Feather.prototype.update = function () {
        this.feathers_particles.forEachAlive(function (particle) { particle.alpha = this.game.math.clamp(particle.lifespan / 400, 0, 1); }, this);
    };

    return Feather;
});