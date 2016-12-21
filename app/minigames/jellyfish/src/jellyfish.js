define([
], function (
) {
    
    'use strict';
    
    /**
     * Jellyfish object
	 * @class
     * @extends Phaser.Group
     * @memberof Jellyfish
     * @param x {int} x position
     * @param game {Phaser.Game} game instance
     * @param text {string} text
       @param speed {speed} default 5
	 * @param scale {scale} default 1
	**/
    function Jellyfish(x, game, text, speed, scale) {
        
        speed = speed || 5;
        scale = scale || 1;
        
        Phaser.Group.call(this, game);
        
        this.x = x;
        this.y = game.height;
        this.speed = speed;
        this.clickable = true;
        this.paused = false;
        this.spawned = true;
        this.hasExitedScreen = false;
        this.eventManager = game.eventManager;
        
        var rand = Math.floor(Math.random() * 2 + 1);// Used only to chose between the two jellyfish graph
        
        this.jellyfishSprite = game.add.sprite(0, 0, 'jellyfish' + rand, 'Meduse_Idle_0000');
        this.jellyfishSprite.anchor.setTo(0.5, 0);
        this.jellyfishSprite.scale.x = scale;
        this.jellyfishSprite.scale.y = scale;
        
        this.jellyfishSprite.animations.add('idle', Phaser.Animation.generateFrameNames('Meduse_Idle_', 0, 5, '', 4), 8, true, false);
        this.jellyfishSprite.animations.add('hit', Phaser.Animation.generateFrameNames('Meduse_hit_', 0, 3, '', 4), 8, false, false);
        this.jellyfishSprite.animations.add('happy', Phaser.Animation.generateFrameNames('Meduse_Contente_', 0, 7, '', 4), 6, false, false);
        
        this.currentFrame = 0; // Indicates on which frame the animations is; used only for the speedFunction
        this.smooth = 0; // Since currentFrame is an int and increments slowly, we need this float to have a smoother speedFunction
        this.add(this.jellyfishSprite);
        
        /**
         * TextSprite
         * @private
         **/

        var isCapitalLetters = Math.random() < game.params.getGeneralParams().capitalLettersShare;
        this.text = game.add.text(0, this.jellyfishSprite.height / (4 + rand) - (rand - 2) * 10, "- phaser -\nrocking with\ngoogle web fonts");
        this.text.font = "Arial";
        
        this.text.text = isCapitalLetters ? text.toUpperCase() : text;
        this.text.fill = "white";
        this.text.fontSize = this.jellyfishSprite.width / 4;
        this.text.anchor.setTo(0.5, 0);
        
        this.add(this.text);
        
        this.jellyfishSprite.inputEnabled = true;
        this.jellyfishSprite.events.onInputDown.add(function () { // inputDown = click
            if (!this.paused)
                if (this.clickable) {
                    if (this.sounds.textSound) this.sounds.textSound.play();
                    
                    var rand = Math.floor(Math.random() * this.sounds.rdm.length);
                    this.sounds.rdm[rand].play();
                    
                    this.clickable = false;
                    this.paused = true;
                    this.jellyfishSprite.animations.play('hit');
                    this.eventManager.emit('pause');
                    this.jellyfishSprite.animations.currentAnim.onComplete.addOnce(function () {
                        this.eventManager.emit('clicked', this); //listened by Remediation
                    }, this);
                }
        }, this);
        
        
        this.initEvents();
        this.initSounds(game);
    }
    
    Jellyfish.prototype = Object.create(Phaser.Group.prototype);
    Jellyfish.constructor = Jellyfish;
    
    /**
     * init all sounds
     * @private
     **/
    Jellyfish.prototype.initSounds = function (game) {
        this.sounds = {};
        this.sounds.rdm = [];
        
        for (var i = 0; i < 3; i++) {
            this.sounds.rdm[i] = game.add.audio('rdm' + (i + 1));
        }
        
        if (this.text.text !== "") this.sounds.textSound = game.add.audio(this.text.text.toLowerCase());
        
        this.sounds.isPlaying = false;
    };
    
    /**
     * init all events
     * @private
     **/
    Jellyfish.prototype.initEvents = function () {
        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);
        
        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);
    };
    
    /**
     * mainly used for the speed function
     * also used for the idle animation
     * @private
     **/
    Jellyfish.prototype.update = function () {
        
        if (this.jellyfishSprite.animations.currentAnim.isFinished || !this.jellyfishSprite.animations.currentAnim.isPlaying) {
            this.jellyfishSprite.animations.play('idle');
        }
        
        if (!this.paused) {
            if (!this.clickable && this.alpha != 0.4) {
                this.alpha = 0.4;
            }
            
            // Shenanigans only used to have a more "jellyfish-like" speed curve (note from the reader : what does this comment mean ??)
            if (this.y > -this.jellyfishSprite.height) { // if the jellyfish sprite is still visible on screen
                if (this.currentFrame != parseInt(this.jellyfishSprite.animations.currentAnim.currentFrame.name[this.jellyfishSprite.animations.currentAnim.currentFrame.name.length - 1])) {
                    this.currentFrame = parseInt(this.jellyfishSprite.animations.currentAnim.currentFrame.name[this.jellyfishSprite.animations.currentAnim.currentFrame.name.length - 1]);
                    this.smooth = this.currentFrame;
                }
                
                this.smooth += this.jellyfishSprite.animations.currentAnim.delay / 1000;
                
                var speedFunction = -Math.pow(this.smooth - 3, 2) + this.speed;
                if (speedFunction > 1)
                    this.y -= speedFunction;
                else
                    this.y -= 1;
            }   
            else {
                this.spawned = false;
                this.hasExitedScreen = true;
            }
        }
    };
    
    return Jellyfish;


});