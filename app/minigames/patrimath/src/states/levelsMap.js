define ([
    "../ui/wallpaper",
    "../ui/navigationMenu",
    "../ui/levelsMapUI",
    "../sounds/autoPlaySounds"
    ], function(
        Wallpaper,
        NavigationMenu,
        LevelsMapUI,
        autoPlaySounds
        ) {

        /**
         * Load all assets before the game starts 
         * @class 
         * @memberof Patrimath
         * @param {Phaser.Game} game
         */
        function LevelsMapState(){};

        LevelsMapState.prototype = {
            create : function (){
                this.wallpaper = new Wallpaper(this.game, 'background-home');
                this.navigationMenu = new NavigationMenu(this.game);
                this.ui = new LevelsMapUI(this.game);
                new autoPlaySounds.InstructionsSounds(this.game, "welcome-levelsMap");

                var localContext = this;
                this.game.scale.setResizeCallback(function () {
                    localContext.wallpaper.updateWallpaperSize(localContext.game);
                    localContext.navigationMenu.updatePosition(localContext.game);
                    localContext.ui.updatePosition(localContext.game);
                }, this.game);
            }
        };

        return LevelsMapState;
});