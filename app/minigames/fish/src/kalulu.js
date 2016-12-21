define([
], function (
) {

    'use strict';

    /**
     * Kalulu is in charge of the kalulu animations and audio
	 * @class
     * @extends Phaser.Group
     * @memberof Jellyfish
	 * @param game {Phaser.Game} game instance
	**/
    function Kalulu(game) {
        Phaser.Group.call(this, game);

        /**
         * game.eventManager  
	     * @type {EventEmitter}
         * @private
	    **/
        this.eventManager = game.eventManager;

        /**
         * All kalulu's sounds  
	     * @type {Phaser.Audio}
	    **/
        this.sounds = {};

        this.sounds.intro = game.add.audio('kaluluIntro');
        this.sounds.firstTryIntro = game.add.audio('kaluluFirstTryIntro');
        this.sounds.firstTryWin = game.add.audio('kaluluFirstTryWin');
        this.sounds.firstTryLoose = game.add.audio('kaluluFirstTryLoose');
        this.sounds.secondTryWin = game.add.audio('kaluluSecondTryWin');
        this.sounds.secondTryLoose = game.add.audio('kaluluSecondTryLoose');
        this.sounds.endWin = game.add.audio('kaluluEndWin');
        this.sounds.endLoose = game.add.audio('kaluluEndLoose');
        this.sounds.on = game.add.audio('kaluluOn');
        this.sounds.off = game.add.audio('kaluluOff');

        /**
         * Sprite host of kalulu's animations
	     * @type {Phaser.Sprite}
	    **/
        this.kaluluSprite = game.add.sprite(0, 1500, 'kaluluIntro');
        this.kaluluSprite.anchor.x = 0;
        this.kaluluSprite.anchor.y = 1;
        this.kaluluSprite.visible = false;

        this.kaluluSprite.animations.add('introAnim', Phaser.Animation.generateFrameNames('Kalulu_Apparition_', 0, 15, '', 4), 15, false, false);

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
        this.createKaluluEvent("startGame", "firstTryIntro", this.sounds.intro);
        this.createKaluluEvent("firstTryIntro", "unPause", this.sounds.firstTryIntro);
        this.createKaluluEvent("firstTryWin", "unPause", this.sounds.firstTryWin);
        this.createKaluluEvent("firstTryLoose", "unPause", this.sounds.firstTryLoose);
        this.createKaluluEvent("secondTryWin", "unPause", this.sounds.secondTryWin);
        this.createKaluluEvent("secondTryLoose", "unPause", this.sounds.secondTryLoose);
        this.createKaluluEvent("GameOverWin", "GameOverWinScreen", this.sounds.endWin);
        this.createKaluluEvent("GameOverLose", "GameOverLoseScreen", this.sounds.endLoose);
    }

    Kalulu.prototype.createKaluluEvent = function (entryEventName, endEventName, sound) {

        this.eventManager.on(entryEventName, function () {
            this.eventManager.emit('help');
            this.eventManager.emit('offUi');
            this.eventManager.emit('pause');
            this.sounds.on.play();
            this.parent.bringToTop(this.kaluluSprite);
            this.kaluluSprite.visible = true;
            this.kaluluSprite.loadTexture('kaluluIntro', 0);
            this.kaluluSprite.animations.add('introAnim', Phaser.Animation.generateFrameNames('Kalulu_Apparition_', 0, 15, '', 4), 15, false, false);
            this.kaluluSprite.animations.play('introAnim');
            this.kaluluSprite.animations.currentAnim.onComplete.addOnce(function () {
                this.kaluluSprite.loadTexture('kaluluIdle1', 0);
                this.kaluluSprite.animations.add('idleAnim1', Phaser.Animation.generateFrameNames('Kalulu_Attente01_', 0, 11, '', 4), 15, false, false);
                this.kaluluSprite.animations.play('idleAnim1');
            }, this);
            this.sounds.on.onStop.addOnce(function () {
                sound.play();
                this.speaking = true;
                sound.onStop.addOnce(function () {
                    this.sounds.off.play();
                    this.speaking = false;
                    this.kaluluSprite.loadTexture('kaluluOutro', 0);
                    this.kaluluSprite.animations.add('outroAnim', Phaser.Animation.generateFrameNames('Kalulu_Disparition_', 0, 11, '', 4), 15, false, false);
                    this.kaluluSprite.animations.play('outroAnim');
                    this.kaluluSprite.animations.currentAnim.onComplete.addOnce(function () {
                        this.kaluluSprite.visible = false;
                        this.eventManager.emit(endEventName);
                    }, this);
                }, this);
            }, this);
        }, this);

    }

    /**
     * Animation loop when speaking
     **/
    Kalulu.prototype.update = function () {
        if (this.speaking) {
            if ((this.kaluluSprite.animations.currentAnim.isFinished
                || !this.kaluluSprite.animations.currentAnim.isPlaying)) {

                var rand = Math.random();

                if (rand < 0.7) {
                    this.kaluluSprite.loadTexture('kaluluSpeaking1', 0);
                    this.kaluluSprite.animations.add('speakingAnim1', Phaser.Animation.generateFrameNames('Kalulu_Parle01_', 0, 11, '', 4), 15, false, false);
                    this.kaluluSprite.animations.play('speakingAnim1');
                }

                else {
                    this.kaluluSprite.loadTexture('kaluluSpeaking2', 0);
                    this.kaluluSprite.animations.add('speakingAnim2', Phaser.Animation.generateFrameNames('Kalulu_Parle02_', 0, 11, '', 4), 15, false, false);
                    this.kaluluSprite.animations.play('speakingAnim2');
                }
            }
        }
    }

    return Kalulu;
});