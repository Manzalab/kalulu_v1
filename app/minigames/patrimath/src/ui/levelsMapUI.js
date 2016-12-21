define ([
    "../sounds/autoPlaySounds",
    "../data/levels",
    "../ui/levelButton",
    "../ui/patrick"

    ], function(
        autoPlaySounds,
        levels,
        LevelButton,
        patrick
        ) {

        /**
         * 
         * @class 
         * @memberof 
         * @param 
         */
        function LevelsMapUI(game){
            this.buttons = new Phaser.Group(game);
            this.updatePosition(game);

            var levelStyle = {font: "30px Arial", fontWeight: "bold", fill: "#0D004C"};
            var levelsNumber = levels.length;

            for (var i=0; i<levelsNumber-1;i++){

                var posX = (i % 7) * 90;
                var posY = Math.floor( i / 7 ) * 90;
                var status = (i<game.savedData.length) ? game.savedData[i] : 0 ;

                new LevelButton(game, this.buttons, posX, posY, i+1, status);
            }
            
            // this.buttons.addChild.button(0,posY + 100 ,'button-import', function(){}, this, 2,1,0,1); 
        };

        LevelsMapUI.prototype = {
            updatePosition : function(game){
               this.buttons.position = {x:0.3 * game.width,y: 0.25 * game.height};
            }
            ,
            goTo: function(game, stateName) {
                new autoPlaySounds.SoundEffects(game, 'sound-click');
                game.state.start(stateName);
            }
        };

        return LevelsMapUI;
});