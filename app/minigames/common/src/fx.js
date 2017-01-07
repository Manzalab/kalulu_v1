(function () {

    'use strict';
    var Phaser = require('phaser-bundle');

    function Fx(game) {

        Phaser.Group.call(this, game);
        this.x = 0;
        this.y = 0;

        this.success = game.add.group();
        this.fail = game.add.group();

        this.success_background_01 = this.success.create(0, 0, 'fx', 'FX_01');
        this.success_background_01.anchor.setTo(0.5, 0.5);
        this.success_background_01.scale.x = 0.5;
        this.success_background_01.scale.y = 0.5;
        this.success_background_02 = this.success.create(0, 0, 'fx', 'FX_02');
        this.success_background_02.anchor.setTo(0.5, 0.5);
        this.success_background_02.scale.x = 0.5;
        this.success_background_02.scale.y = 0.5;

        this.success_particles = game.add.emitter(0, 0, 100);
        this.success_particles.makeParticles('fx', 'FX_03');
        this.success_particles.minParticleScale = 0.1;
        this.success_particles.maxParticleScale = 0.5;
        this.success_particles.gravity = 500;
        this.success.add(this.success_particles);

        this.fail_background_01 = this.fail.create(0, 0, 'fx', 'FX_04');
        this.fail_background_01.anchor.setTo(0.5, 0.5);
        this.fail_background_01.scale.x = 0.3;
        this.fail_background_01.scale.y = 0.3;
        this.fail_background_02 = this.fail.create(0, 0, 'fx', 'FX_05');
        this.fail_background_02.anchor.setTo(0.5, 0.5);
        this.fail_background_02.scale.x = 0.4;
        this.fail_background_02.scale.y = 0.4;

        this.fail_particles = game.add.emitter(0, 0, 100);
        this.fail_particles.makeParticles('fx', 'FX_06');
        this.fail_particles.minParticleScale = 0.1;
        this.fail_particles.maxParticleScale = 0.5;
        this.fail_particles.gravity = 500;
        this.fail.add(this.fail_particles);

        this.add(this.success);
        this.add(this.fail);

        this.success.alpha = 0;
        this.fail.alpha = 0;
        this.success.tween = game.add.tween(this.success);
        this.success.tween.to({ alpha: 0 }, 1000, Phaser.Easing.Default, false, 0, 0, false);
        this.fail.tween = game.add.tween(this.fail);
        this.fail.tween.to({ alpha: 0 }, 1000, Phaser.Easing.Default, false, 0, 0, false);

    }

    Fx.prototype = Object.create(Phaser.Group.prototype);
    Fx.prototype.constructor = Fx;

    Fx.prototype.hit = function (x, y, bool) {


        this.x = x;
        this.y = y;

        if (bool) {
            this.success.alpha = 1;
            this.success.tween.start();
            this.success_particles.start(true, 1000, null, 10);
        }
        else {
            this.fail.alpha = 1;
            this.fail.tween.start();
            this.fail_particles.start(true, 1000, null, 10);
        }

    };


    Fx.prototype.update = function () {

        this.success_particles.forEachAlive(function (particle) { particle.alpha = this.game.math.clamp(particle.lifespan / 400, 0, 1); }, this);
        this.fail_particles.forEachAlive(function (particle) { particle.alpha = this.game.math.clamp(particle.lifespan / 400, 0, 1); }, this);
    };

    module.exports = Fx;
})();