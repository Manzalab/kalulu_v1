define([
    'phaser-bundle'
], function (
    Phaser
) {
    'use strict';
    
    /**
	 * Boot is in charge of the boot options
	 * @class
     * @memberof Template
	 * @param game {Phaser.Game} game instance
	**/
    function Boot (game) { }
    
    Boot.prototype = {
        /**
	     * Load assets to be used later in the preloader
	    **/
        preload: function () {
            this.load.image('preloaderBar', 'minigames/common/assets/images/ui/preloader-bar.png');
        },

        /**
	     * Put here the scaling options you want while developing
         * For more information about scaling, see {@link http://phaser.io/docs/2.3.0/Phaser.ScaleManager.html#scaleMode}
	    **/
        create: function () {

            if (this.game.load.hasLoaded) console.info("Boot State has correctly completed loading.");
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // Scaling the game for developping purposes; Feel free to remove it if you feel the need
            this.game.stage.backgroundColor = 'rgb(255, 255, 255)';
            console.info("Boot Complete, Starting Preload...");
            this.state.start(this.game.stateNames.PRELOAD);
        }
    };
    return Boot;
});
