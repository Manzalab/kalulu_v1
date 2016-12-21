define ([
    "../sounds/autoPlaySounds",
    "../ui/patrick"

    ], function(
        autoPlaySounds,
        patrick
        ) {

        /**
         * 
         * @class 
         * @memberof 
         * @param 
         */
        function HomeUI(game){
            this.buttons = new Phaser.Group(game);
            this.updatePosition(game);

            new patrick.PatrickHome(game, this.buttons);

            var goToLevelsMapButton =this.buttons.addChild(game.add.button(-150,0, 'button-goTo-levelmode', function() {this.goTo(game,'levelsMap')}, this,  2,1, 0, 1 ));
            goToLevelsMapButton.events.onInputOver.add(function() {new autoPlaySounds.HelpSounds(game, 'help-levelMode',false)}, this);
            
            var goToFreeModeButton = this.buttons.addChild(game.add.button(150,0, 'button-goTo-freemode', function() {this.goTo(game,'freePlay')}, this,  2,1, 0, 1 ));
            goToFreeModeButton.events.onInputOver.add(function () {new autoPlaySounds.HelpSounds(game, 'help-freeMode',false)},this);
            
        };

        HomeUI.prototype = {
            updatePosition : function(game){
               this.buttons.position = {x:0.5 * game.width,y: 0.5 * game.height};
            }
            ,
            goTo: function(game, stateName) {
                new autoPlaySounds.SoundEffects(game, 'sound-click');
                game.state.start(stateName);
            }
        };

        return HomeUI;
});