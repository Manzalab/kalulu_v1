define ([
    ], function(
        ) {

        function InstructionsSounds(game, soundName){
            game.sound.stopAll();
            game.canPlay = false;
            var helpSound = game.sound.add(soundName);
            game.patrick.speaks(game, helpSound);
            game.sound.previousMessage = helpSound;
            helpSound.play();
        };

        function HelpSounds(game, soundName, alreadyPlayed){
            this.done = alreadyPlayed;
            if (!alreadyPlayed){
                var helpSound = game.sound.add(soundName);
                if(game.canPlay){
                    game.canPlay = false;
                    game.sound.stopAll();
                    game.patrick.speaks(game ,helpSound);
                    game.sound.previousMessage = helpSound;
                    helpSound.play();
                    this.done= true;
                } 
            } 
        };

        function SoundEffects(game,soundName){
            game.sound.add(soundName).play();
        };

        function AddRemoveShape(game, shapeName, nb, add){
            game.sound.stopAll();
            game.canPlay = false;

            var suffixe = add ? "on" : "off";
            var playSoundObject = game.sound.add(shapeName+"_"+nb+"_"+suffixe);
            game.patrick.speaks(game, playSoundObject);
            playSoundObject.play();
        };

        function Replay(game) {
            if(game.canPlay){
                game.patrick.speaks(game ,game.sound.previousMessage);
                game.sound.previousMessage.play();
            } else {
                game.sound.stopAll();
                game.canPlay = true;
            }
        };


        return {
            InstructionsSounds : InstructionsSounds,
            HelpSounds : HelpSounds,
            SoundEffects : SoundEffects,
            AddRemoveShape:AddRemoveShape,
            Replay: Replay
        };
    });