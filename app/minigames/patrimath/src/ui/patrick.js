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
        function Patrick(game){
            this.body = null;
            this.mouth =null;
            this.eyes = null;
            this.previousSoundObject= null;
        };

        Patrick.prototype = {
            blinks : function(game){
                this.eyes.animations.play('blink',10,false);
                var delay = Math.random()*3 +2;

                var localContext = this;
                game.time.events.add(Phaser.Timer.SECOND * delay, function(){localContext.blinks(game)}, this);

            }
            ,
            speaks : function(game, soundObject){
                var localContext = this;
                soundObject.onPlay.addOnce(function(){
                    game.canPlay=false;
                    if (localContext.mouth != null) localContext.mouth.animations.play('talk',8,true);
                });

                soundObject.onStop.addOnce(function(){
                    if (localContext.mouth != null) localContext.mouth.animations.stop(null,true);
                    game.canPlay = true;
                });

                this.previousSoundObject = soundObject;
            }
        };


        // Sub class of Patrick for Home Page
        function PatrickHome(game,parentGroup){
            Patrick.call(game);

            this.body = parentGroup.addChild(game.make.sprite(-450,-150,'home-patrick'));
            this.body.scale.setTo(0.6,0.6);
            this.eyes = this.body.addChild(game.make.sprite(320,80,'patrick-eyes'));
            this.eyes.scale.setTo(-1,1);
            this.eyes.animations.add('blink');
            this.mouth = this.body.addChild(game.make.sprite(300,170,'patrick-mouth'));
            this.mouth.scale.setTo(-1,1);
            this.mouth.animations.add('talk');

            this.blinks(game);
            game.patrick = this; // to create animation of patrick mouth thanks to this.speaks(game, soundObject)

            this.body.inputEnabled = true;
            this.body.events.onInputDown.add( function(){
                new autoPlaySounds.Replay(game);
            },this);
        };

        PatrickHome.prototype = Object.create(Patrick.prototype);
        PatrickHome.prototype.constructor = PatrickHome;



        // Sub class of Patrick for Game state
        function PatrickGame(game,parentGroup){
            Patrick.call(game);

            this.body = parentGroup.addChild(game.add.sprite(5,-40,'patrick'));
            this.body.scale.setTo(0.27, 0.27);
            this.mouth = this.body.addChild(game.add.sprite(217,168,'patrick-mouth'));
            this.mouth.animations.add('talk');
            this.eyes = this.body.addChild(game.add.sprite(196,80,'patrick-eyes'));
            this.eyes.animations.add('blink');

            this.blinks(game);
            game.patrick = this;

            this.body.inputEnabled = true;
            this.body.events.onInputDown.add( function(){
                new autoPlaySounds.Replay(game);
            },this);
        };

        PatrickGame.prototype = Object.create(Patrick.prototype);
        PatrickGame.prototype.constructor = PatrickGame;



        // Sub class of Patrick for win state
        function PatrickPannel(game, parentGroup){
            Patrick.call(game);

            this.body = parentGroup.addChild(game.add.sprite(0,0,'win-patrick'));
            this.body.anchor = {x:1,y:1};
            this.eyes = this.body.addChild(game.add.sprite(-173,-230,'win-patrick-eyes'));
            this.eyes.animations.add('blink');

            this.blinks(game);

            this.body.inputEnabled = true;
            this.body.events.onInputDown.add( function(){
                new autoPlaySounds.Replay(game);
            },this);
        };

        PatrickPannel.prototype = Object.create(Patrick.prototype);
        PatrickPannel.prototype.constructor = PatrickPannel;

        PatrickPannel.prototype.setHappyMouth = function(game){
                this.mouth = this.body.addChild(game.add.sprite(-153,-160,'win-patrick-mouth'));
                this.mouth.animations.add('talk');
                game.patrick = this;            
            };
        PatrickPannel.prototype.setSadMouth= function(game){
                this.mouth = this.body.addChild(game.add.sprite(-153,-160,'fail-patrick-mouth'));
                this.mouth.animations.add('talk');
                game.patrick = this;
            };



        return {
            PatrickHome : PatrickHome,
            PatrickGame : PatrickGame,
            PatrickPannel : PatrickPannel
        };

});
