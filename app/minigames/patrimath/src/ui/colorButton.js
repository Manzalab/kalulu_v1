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
        function ColorButton(game, gameArea, parentGroup, posX, posY, color){
            Phaser.Button.call(this, game, posX, posY, 'button-colors', function() {
                gameArea.removeAllRotationUI(game);
                this.onColorButton(game);
            }, this.sprite, 2, 1, 0, 1);
            parentGroup.add(this);
            this.value = false;
            this.color = color;
            this.addChild(game.add.sprite(0, 0,'button-colors-picto'));
            this.children[0].tint = color;

            this.events.onInputOver.add(function(){
                var help = new autoPlaySounds.HelpSounds(game,'help-color',parentGroup.alreadyPlayed); 
                parentGroup.alreadyPlayed = help.done;
            }, this);

        };

        ColorButton.prototype = Object.create(Phaser.Button.prototype);

        ColorButton.prototype.constructor = ColorButton;

        ColorButton.prototype.onColorButton= function(game) {
            new autoPlaySounds.SoundEffects(game, 'sound-click');
            var localContext = this;
            this.parent.forEach(function (colorButton){
                if (colorButton != localContext) colorButton.setButtonValue(false);
            });
            this.setButtonValue(!this.value);
        };

        ColorButton.prototype.setButtonValue= function(value){
            this.value = value;
            this.children[0].position = value ? {x:4,y:4} : {x:0,y:0};
            if (value) this.setFrames(3, 0, 1, 0); else this.setFrames(2, 1, 0, 1);
        };

        return ColorButton;
});