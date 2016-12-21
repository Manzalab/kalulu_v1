define ([
    "../sounds/autoPlaySounds"

    ], function(
        autoPlaySounds
        ) {

        /**
         * 
         * @class 
         * @memberof 
         * @param 
         */
        function LevelButton(game, parentGroup, posX, posY, levelNumber, status){
            var levelStyle = {font: "30px Arial", fontWeight: "bold", fill: "#0D004C"};

            this.sprite = parentGroup.addChild(game.add.button(posX,posY,'button-level', function(){this.goToLevel(game, this)}, this, 2,1,0,1));
            this.levelNumber = levelNumber; 
            this.sprite.addChild(game.make.text(30,35,levelNumber,levelStyle));
            this.sprite.addChild(game.make.sprite(4,5,'level-status',status));
        };

        LevelButton.prototype = {
            goToLevel: function(game, item) {
                new autoPlaySounds.SoundEffects(game, 'sound-click');
                game.state.start('levelPlay',true, false, item.levelNumber);
            }
        };

        return LevelButton;
});