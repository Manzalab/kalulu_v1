define ([
    "../game/shape",
    "../sounds/autoPlaySounds",
    "../data/palette"

    ], function(
        Shape,
        autoPlaySounds,
        colors

        ) {

        function NavigationButton(game, gameArea, levelNum, parentMenu, buttonName, position){
            this.alreadyPlayed = false;
            switch (buttonName) {
                case 'buttonHome':
                    this.name = 'button-home';
                    this.action = function() {this.goTo(game, 'menu')};
                    this.instructions = "";
                break;
                case 'buttonLevelsMap':
                    this.name = 'button-back';
                    this.action = function(){this.goTo(game, 'levelsMap')};
                    this.instructions = "";
                break;
                case 'buttonMute':
                    this.name = 'button-mute';
                    this.action = function(){this.toggleMute(this.button,game)};
                    this.instructions = "";
                break;
                case 'buttonPrint':
                    this.name = 'button-print';
                    this.action = function(){this.pdf(game)};
                    this.instructions = "help-print";
                break;
                case 'buttonExport':
                    this.name = 'button-export';
                    this.action = function(){this.exportProblem(gameArea)};
                    this.instructions = "";
                break;
                case 'buttonDebug':
                    this.name = 'button-colors';
                    this.action = function(){this.toggleDebug(game)};
                    this.instructions = "";
                break;
                case 'buttonRetry': 
                    this.name = 'button-retry';
                    this.action = function() {this.retry(game, levelNum)};
                    this.instructions = "";
                break;
            }

            this.button = game.make.button( - (position*50 + 18), 10, this.name, this.action, this, 2, 1, 0, 1);
            var that = this;
            this.button.events.onInputOver.add(function() {
                if (that.instructions != ""){
                    var help = new autoPlaySounds.HelpSounds(game, that.instructions, that.alreadyPlayed);
                    that.alreadyPlayed = help.done;
                }
            });
            
            parentMenu.addChild(this.button);
                    
            // Check the value of the mute function to update the mute button
            if(buttonName == "buttonMute" && game.sound.mute) this.button.setFrames(3, 0, 1, 0);
        };

        NavigationButton.prototype = {
            goTo: function(game, stateName) {
                new autoPlaySounds.SoundEffects(game, 'sound-click');
                game.state.start(stateName);
            }, 

            toggleMute: function(item, game){
                game.sound.mute = !game.sound.mute;
                if (game.sound.mute) {
                    item.setFrames(3, 0, 1, 0);
                } else {
                    new autoPlaySounds.SoundEffects(game, 'sound-click');
                    item.setFrames(2, 1, 0, 1);
                }
            }, 

            pdf : function(game){
                var pdf = new jsPDF('l','cm','a4');
                pdf.addHTML(document.body,function() { pdf.output('datauri'); });
                pdf.save(game.name + '.pdf');
            }, 

            exportProblem : function(gameArea){
                var problem = {};
                problem.pattern=[];
                problem.basket=[];
                problem.storeEnabled=true;

                gameArea.shapesInPlace.forEach(function(shape){
                    if (shape instanceof  Shape){
                        if (!gameArea.isOutOfGameAreaX(shape) && !gameArea.isOutOfGameAreaY(shape)){
                            problem.pattern.push({shape:shape.key, color:colors.palette.indexOf(shape.tint), rotation:shape.frame, anchorPoint:{x:shape.x, y:shape.y}});
                        } else {
                            problem.basket.push({shape:shape.key /*, color:colors.palette.indexOf(shape.tint), rotation:shape.frame*/ });
                        }
                    }
                });

                //Open a pop-up to save the json file
                window.open().document.write(JSON.stringify(problem));
            }, 

            toggleDebug: function(game){
                game.scale.startFullScreen(false);
                // (game.language == "fr") ? game.language="test" : game.language="fr";
            },

            retry: function(game, levelNum){
                new autoPlaySounds.SoundEffects(game, 'sound-click');
                game.state.restart(true, false, levelNum);
            }
        }

        return NavigationButton;
});