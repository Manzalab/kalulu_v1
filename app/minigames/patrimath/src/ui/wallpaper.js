define ([
    ], function(
        ) {

        function Wallpaper(game, imgName){
            this.img = game.add.sprite(-10,-10, imgName);
            this.updateWallpaperSize(game);
        };

        Wallpaper.prototype = {
            updateWallpaperSize : function(game) {
                this.img.height = 1.05*game.height;
                this.img.width = 1.05*game.width;
            }
        }


return Wallpaper;

});