define ([
    "../ui/wallpaper",
    "../ui/navigationMenu",
    "../game/gameArea",
    "../sounds/autoPlaySounds",
    "../data/levels"
    ], function(
        Wallpaper,
        NavigationMenu,
        GameArea,
        autoPlaySounds,
        levels
        ) {

        /**
         * Load all assets before the game starts 
         * @class 
         * @memberof Patrimath
         * @param {Phaser.Game} game
         */
        function PlayState(){};

        PlayState.prototype = {
            init : function (levelNum){
                this.levelNum = levelNum;
                this.levelText = (this.game.state.current == "levelPlay") ? levels[levelNum] : "";  
            }
            ,
            create : function (){
                this.wallpaper = new Wallpaper(this.game, 'background-game');
                this.gameArea = new GameArea(this.game, this.levelNum, this.levelText, 900,600);
                this.navigationMenu = new NavigationMenu(this.game, this.levelNum, this.gameArea);
                new autoPlaySounds.InstructionsSounds(this.game, "welcome-"+ this.game.state.current);

                var localContext = this;
                this.game.scale.setResizeCallback(function () {
                    localContext.wallpaper.updateWallpaperSize(localContext.game);
                    localContext.navigationMenu.updatePosition(localContext.game);
                    localContext.gameArea.updatePosition(localContext.game);
                }, this.game);
            }
        };

        return PlayState;
});