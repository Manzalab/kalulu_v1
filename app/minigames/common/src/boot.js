(function () {
    'use strict';
    var Phaser = require('phaser-bundle');
    
    /**
     * Boot is in charge of the boot options
     * @class
     * @memberof Minigames.Common.Src
     * @param game {Phaser.Game} game instance
    **/
    function Boot(game) { }

    /**
     * Load assets to be used later in the preloader
    **/
    Boot.prototype.preload  = function bootPreload() {
        this.load.image('preloaderBar', 'minigames/common/assets/images/ui/preloader-bar.png');
    };

    /**
     * Put here the scaling options you want while developing
     * For more information about scaling, see {@link http://phaser.io/docs/2.3.0/Phaser.ScaleManager.html#scaleMode}
    **/
    Boot.prototype.create = function bootCreate () {
        
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // Scaling the game for developping purposes; Feel free to remove it if you feel the need
        this.game.stage.backgroundColor = 'rgb(0, 12, 71)';
        this.state.start('Preloader');
    };

    module.exports = Boot;
})();
