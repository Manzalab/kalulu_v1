define([
    'phaser-bundle'
], function (
    Phaser
) {
    
    'use strict';
    
    /**
     * Kalulu is in charge of the kalulu animations and audio
	 * @class
     * @extends Phaser.Group
     * @memberof Jellyfish
	 * @param game {Phaser.Game} game instance
	**/
    function Kalulu(game, parent) {

        Phaser.Group.call(this, game, parent, 'Kalulu');
        
        /**
         * game.eventManager  
	     * @type {EventEmitter}
         * @private
	    **/
                
        /**
         * All kalulu's sounds  
	     * @type {Phaser.Audio}
	    **/
        this.sounds = {};       

        this.sounds.intro = game.add.audio('kaluluIntro');
        this.sounds.help = game.add.audio('kaluluHelp');
        this.sounds.end = game.add.audio('kaluluGameOverWin');
        this.sounds.on = game.add.audio('kaluluOn');
        this.sounds.off = game.add.audio('kaluluOff');
        
        /**
         * Sprite host of kalulu's animations
	     * @type {Phaser.Sprite}
	    **/
        this.kaluluSprite = game.add.sprite(0, 1500, 'kaluluIntro', undefined, this);
        this.kaluluSprite.anchor.x = 0;
        this.kaluluSprite.anchor.y = 1;
        this.kaluluSprite.visible = false;

        var introFrames = Phaser.Animation.generateFrameNames('Kalulu_Apparition_',   0, 15, '', 4);
        this.kaluluSprite.animations.add('introAnim', introFrames, 15, false, false);
        
        this.kaluluSprite.loadTexture('kaluluSpeaking1', 0);
        var speaking1Frames = Phaser.Animation.generateFrameNames('Kalulu_Parle01_',      0, 11, '', 4);
        this.kaluluSprite.animations.add('speakingAnim1', speaking1Frames, 15, false, false);
        
        this.kaluluSprite.loadTexture('kaluluSpeaking2', 0);
        var speaking2Frames = Phaser.Animation.generateFrameNames('Kalulu_Parle02_',      0, 11, '', 4);
        this.kaluluSprite.animations.add('speakingAnim2', speaking2Frames, 15, false, false);
        
        this.kaluluSprite.loadTexture('kaluluIdle1', 0);
        var idleFrames = Phaser.Animation.generateFrameNames('Kalulu_Attente01_',      0, 11, '', 4);
        this.kaluluSprite.animations.add('idleAnim1', idleFrames, 15, false, false);
        
        this.kaluluSprite.loadTexture('kaluluOutro', 0);
        var outroFrames = Phaser.Animation.generateFrameNames('Kalulu_Disparition_',      0, 11, '', 4);
        this.kaluluSprite.animations.add('outroAnim',       outroFrames, 15, false, false);
        
        /**
         * speaking state
	     * @type {boolean}
         * @private
	    **/
        this.speaking = false;
        
        /**
         * idle state
	     * @type {boolean}
         * @private
	    **/
        this.idle = false;
        
        this.initEvents();
    }
    
    Kalulu.prototype = Object.create(Phaser.Group.prototype);
    Kalulu.prototype.constructor = Kalulu;
    

    Kalulu.prototype.resetSpeeches = function resetSpeeches () {
        this.sounds.intro = this.game.add.audio('kaluluIntro');
        this.sounds.help = this.game.add.audio('kaluluHelp');
        this.sounds.gameOverWin = this.game.add.audio('kaluluGameOverWin');
        this.sounds.gameOverLose = this.game.add.audio('kaluluGameOverLose');
    };
    /**
	 * Initialize all Kalulu events
     * 
	 * On 'startGame', play animations and intro sound; emit :
     * - 'pause'
     * - 'startUi' when all animations and sounds completed; listened by UI
     * 
     * On 'help', play animations and help sound; emit :
     * - 'pause'
     * - 'offUi'; listened by UI
     * - 'unPause' when all animations and sounds completed
     * 
     * On 'toucanWin', play animations and end sound; emit :
     * - 'pause'
     * - 'endGameWin' when all animations and sounds completed ; listened by UI
	**/
    Kalulu.prototype.initEvents = function () {
        
        this.game.eventManager.on('startGame', this.playIntroSequence, this);
        this.game.eventManager.on('help', this.playHelpSequence, this);
        this.game.eventManager.on('GameOverWin', this.onGameOverWin, this);
        this.game.eventManager.on('closeStep', this.onCloseStep, this);
        this.game.eventManager.on('skipKalulu', this.skip, this);
    };

    /**
     * Animation loop when speaking
     **/
    Kalulu.prototype.update = function () {

        if (this.speaking) {
            if ((this.kaluluSprite.animations.currentAnim.isFinished ||
                !this.kaluluSprite.animations.currentAnim.isPlaying)) {
                
                var rand = Math.random();
                
                if (rand < 0.7) {
                    this.kaluluSprite.loadTexture('kaluluSpeaking1', 0);
                    this.kaluluSprite.animations.play('speakingAnim1');
                }

                else {
                    this.kaluluSprite.loadTexture('kaluluSpeaking2', 0);
                    this.kaluluSprite.animations.play('speakingAnim2');
                }
            }
        }
    };

    Kalulu.prototype.playIntroSequence = function playIntroSequence () {

        if (!this.game.tutoEnabled || this.game.gameConfig.skipKalulu || this.game.gameConfig.skipKaluluIntro) {
            // console.info("[Kalulu] Skipping Intro Speech due to debug configuration");
            this.game.eventManager.emit('pause');
            this.game.eventManager.emit('startUi');
            this.game.eventManager.emit('introSequenceComplete');
            return;
        }

        this.isPlayingIntroSequence = true;
        this.game.eventManager.emit('pause');
        this.game.eventManager.emit('offUi');
        this.sounds.currentSound = this.sounds.on;
        this.sounds.on.play();
        
        this.kaluluSprite.visible = true;
        this.kaluluSprite.loadTexture('kaluluIntro', 0);
        this.kaluluSprite.animations.play('introAnim');
        
        this.kaluluSprite.animations.currentAnim.onComplete.addOnce(function () {
            this.kaluluSprite.loadTexture('kaluluIdle1', 0);
            this.kaluluSprite.animations.play('idleAnim1');
        }, this);

        this.sounds.on.onStop.addOnce(function () {
            this.sounds.currentSound = this.sounds.intro;
            this.sounds.intro.play();
            this.speaking = true;
            this.sounds.intro.onStop.addOnce(function () {
                this.sounds.currentSound = this.sounds.off;
                this.sounds.off.play();
                this.speaking = false;
                this.kaluluSprite.loadTexture('kaluluOutro', 0);
                this.kaluluSprite.animations.play('outroAnim');
                this.kaluluSprite.animations.currentAnim.onComplete.addOnce(function () {
                    this.kaluluSprite.visible = false;
                    this.isPlayingIntroSequence = false;
                    this.game.eventManager.emit('startUi');
                    this.game.eventManager.emit('introSequenceComplete');
                }, this);
            }, this);
        }, this);
    }

    Kalulu.prototype.playHelpSequence = function playHelpSequence () { // emitted on click on kalulu button in the main game UI
        
        if (this.game.gameConfig.skipKalulu || this.game.gameConfig.skipKaluluHelp) {
            // console.info("[Kalulu] Skipping Help Speech due to debug configuration");
            this.game.eventManager.emit('pause');
            this.game.eventManager.emit('offUi');
            this.game.eventManager.emit('unPause');
            return;
        }

        this.isPlayingHelpSequence = true;

        this.game.eventManager.emit('pause');
        this.game.eventManager.emit('offUi');
        this.sounds.currentSound = this.sounds.on;
        this.sounds.on.play();
        
        this.kaluluSprite.visible = true;
        this.kaluluSprite.loadTexture('kaluluIntro', 0);
        this.kaluluSprite.animations.play('introAnim');
        
        this.kaluluSprite.animations.currentAnim.onComplete.addOnce(function () {
            this.kaluluSprite.loadTexture('kaluluIdle1', 0);
            this.kaluluSprite.animations.play('idleAnim1');
        }, this);
        
        this.sounds.on.onStop.addOnce(function () {
            this.sounds.currentSound = this.sounds.help;
            this.sounds.help.play();
            this.speaking = true;
            
            this.sounds.help.onStop.addOnce(function () {
                this.sounds.currentSound = this.sounds.off;
                this.sounds.off.play();
                this.speaking = false;
                this.kaluluSprite.loadTexture('kaluluOutro', 0);
                this.kaluluSprite.animations.play('outroAnim');
                this.kaluluSprite.animations.currentAnim.onComplete.addOnce(function () {
                    this.kaluluSprite.visible = false;
                    this.game.eventManager.emit('unPause');
                }, this);
            }, this);
        }, this);
    };

    Kalulu.prototype.onGameOverWin = function onGameOverWin () {
        // console.log("Kalulu is about to speak for a Final Win");
        this.gameOver(true);
    };

    Kalulu.prototype.onGameOverLose = function onGameOverLose () {
        // console.log("Kalulu is about to speak for a Final Lose");
        this.gameOver(false);
    };

    // launch kalulu final speech, depending on the result of the game
    Kalulu.prototype.gameOver = function gameOver (isWin) {
        
        this.playingFinalSpeech = true;
        
        this.finalResult = isWin;
        if (this.game.gameConfig.skipKalulu || this.game.gameConfig.skipKaluluFinal) {
            this.game.eventManager.emit('pause');
            if (isWin) this.game.eventManager.emit('GameOverWinScreen'); // remediation reacts by launching its GameOverWin Script
            else this.game.eventManager.emit('GameOverLoseScreen'); // remediation reacts by launching its GameOverLose Script
            return;
        }
        this.game.eventManager.emit('pause'); // ui react by disabling the menu, jellyfishes pause, and remediation pause
        this.sounds.currentSound = this.sounds.on;
        this.sounds.on.play();
        
        this.kaluluSprite.visible = true;
        this.kaluluSprite.loadTexture('kaluluIntro', 0);
        this.kaluluSprite.animations.play('introAnim');
        
        this.kaluluSprite.animations.currentAnim.onComplete.addOnce(function () {
            this.kaluluSprite.loadTexture('kaluluIdle1', 0);
            this.kaluluSprite.animations.play('idleAnim1');
        }, this);
        
        this.sounds.on.onStop.addOnce(function () {
            var lSound;
            if (isWin) lSound = this.sounds.gameOverWin;
            else lSound = this.sounds.gameOverLose;
            this.sounds.currentSound = lSound;
            lSound.play();
            this.speaking = true;
            lSound.onStop.addOnce(function () {
                this.sounds.currentSound = this.sounds.off;
                this.sounds.off.play();
                this.speaking = false;
                
                this.kaluluSprite.loadTexture('kaluluOutro', 0);
                this.kaluluSprite.animations.play('outroAnim');
                
                this.kaluluSprite.animations.currentAnim.onComplete.addOnce(function () {
                    this.kaluluSprite.visible = false;
                    if (isWin) {
                        // console.log("Kalulu finished to speak, about to request GameOver WinScreen");
                        this.game.eventManager.emit('GameOverWinScreen'); // listened by UI to display GameOver Screen
                    } 
                    else {
                        // console.log("Kalulu finished to speak, about to request GameOver LoseScreen");
                        this.game.eventManager.emit('GameOverLoseScreen'); // listened by UI to display GameOver Screen
                    }
                }, this);
            }, this);
        }, this);
    };

    Kalulu.prototype.onCloseStep = function onCloseStep (nextState) {
        
        // console.log(nextState);
        this.isClosingStep = true;

        if (this.game.gameConfig.skipKalulu || this.game.gameConfig.skipKaluluFinal) {
            this.game.eventManager.emit('nextStep');
            return;
        }
        this.game.eventManager.emit('pause'); // ui react by disabling the menu, jellyfishes pause, and remediation pause
        this.game.eventManager.emit('offUi'); // ui react by disabling the menu, jellyfishes pause, and remediation pause
        this.sounds.currentSound = this.sounds.on;
        this.sounds.on.play();
        
        this.kaluluSprite.visible = true;
        this.kaluluSprite.loadTexture('kaluluIntro', 0);
        this.kaluluSprite.animations.play('introAnim');
        
        this.kaluluSprite.animations.currentAnim.onComplete.addOnce(function () {
            this.kaluluSprite.loadTexture('kaluluIdle1', 0);
            this.kaluluSprite.animations.play('idleAnim1');
        }, this);
        
        this.sounds.on.onStop.addOnce(function () {
            var lSound = this.sounds.end;
            this.sounds.currentSound = lSound;
            lSound.play();
            this.speaking = true;
            lSound.onStop.addOnce(function () {
                this.sounds.currentSound = this.sounds.off;
                this.sounds.off.play();
                this.speaking = false;
                
                this.kaluluSprite.loadTexture('kaluluOutro', 0);
                this.kaluluSprite.animations.play('outroAnim');
                
                this.kaluluSprite.animations.currentAnim.onComplete.addOnce(function () {
                    this.kaluluSprite.visible = false;
                    // console.log("Kalulu finished to speak, about to request nextStep");
                    this.game.eventManager.emit('unPause');
                    this.game.eventManager.emit('nextStep'); // listened by UI to display GameOver Screen
                }, this);
            }, this);
        }, this);
    };

    Kalulu.prototype.skip = function skip () {
        this.sounds.currentSound.stop();
        this.kaluluSprite.animations.currentAnim.stop();
        this.speaking = false;
        this.kaluluSprite.visible = false;

        if (this.isPlayingIntroSequence) {
            this.isPlayingIntroSequence = false;
            this.game.eventManager.emit('introSequenceComplete');
        }

        if (this.playingFinalSpeech) {
            if (this.finalResult) this.game.eventManager.emit('GameOverWinScreen');
            else this.game.eventManager.emit('GameOverLoseScreen');
        }
        else {
            this.game.eventManager.emit('startUi');
        }
    };
    return Kalulu;
});