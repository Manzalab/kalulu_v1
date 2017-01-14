define([], function () {
    
    'use strict';
    
    function Boot (game) {
        Phaser.State.call(this);
        this.game = game;
    }

    Boot.prototype = Object.create(Phaser.State.prototype);
    Boot.prototype.constructor = Boot;

    Boot.prototype.preload = function preloadBoot() {

        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // Scaling the game for developping purposes; Feel free to remove it if you feel the need
        this.game.stage.backgroundColor = 'rgb(255, 255, 255)';
        
        this.game.load.onFileComplete.add(this._onProgress, this);
        this.game.load.onFileError.add(this._onError, this);

        this.load.image('preloaderBar', 'minigames/common/assets/images/ui/preloader-bar.png');
    };

    Boot.prototype.create = function createBootState () {

        this.game.state.start(this.game.stateNames.PRELOAD);
    };

    Boot.prototype._onProgress = function onPreloadProgress (progress, cacheKey, success, totalLoaded, totalFiles) {
        // console.log('Loading : ' + progress + '%');
    };

    Boot.prototype._onError = function onPreloadError (key, file) {
        console.error('Loading failed for asset ' + key);
        console.log(file);
    };

    Boot.prototype.shutdown = function shutdownBoot () {
        
        this.game = null;
    };

    return Boot;
});
