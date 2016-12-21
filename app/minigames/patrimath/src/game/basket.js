define ([
    "../data/palette",
    "../ui/colorButton",
    "../ui/star",
    "../ui/patrick",
    "../sounds/autoPlaySounds"


    ], function(
        colors,
        ColorButton,
        Star,
        patrick,
        autoPlaySounds

        ) {

        /**
         * 
         * @class 
         * @memberof 
         * @param 
         */
        function Basket(game, gameArea){
 
            this.elements = new Phaser.Group(game);
            this.elements.addChildAt(game.add.sprite(5, 0, 'basket-left'),0);
            this.elements.addChildAt(game.add.sprite(0, 0, 'basket-middle'),1);
            this.elements.addChildAt(game.add.sprite(0, 0, 'basket-right'),2);

            this.patrick = new patrick.PatrickGame(game,this.elements.children[2]);

            if (game.state.current == "freePlay"){
                this.colorsButtons = this.elements.addChildAt(game.add.group(),3);
                this.colorsButtons.position = {x:15,y:5};
                this.colorsButtons.alreadyPlayed=false;
                for (var i=0; i< colors.palette.length;i++){
                    var posX = (i%3) * 60;
                    var posY = Math.floor(i/3) * 50;
                    new ColorButton(game, gameArea, this.colorsButtons, posX, posY, colors.palette[i]);
                }
            } else {
                this.stars = this.elements.addChildAt(game.add.group(),3);
                for (j=2;j>=0; j--){
                    new Star(game, this.stars,40+j*60, 50);
                }
            }

            this.updatePosition(game);
        };

        Basket.prototype = {

            updatePosition : function(game){
                this.elements.y = game.height - (5 + this.elements.children[0].height);

                this.elements.children[1].x = this.elements.children[0].x + this.elements.children[0].width;
                this.elements.children[1].width = game.width - (this.elements.children[0].width + this.elements.children[2].width);
                this.elements.children[2].x = game.width - (5 + this.elements.children[2].width);
            }
            ,
            evaluateStars: function(){
                starIndex = 0;
                var currentbasket = this;
                this.stars.forEach(function(star){
                    if (star.frame == 0) starIndex = currentbasket.stars.children.indexOf(star) +1 ;
                });

                return starIndex;
            }
            ,
            deleteStar : function(index){
                if(index>0){
                    this.stars.children[index-1].frame=2;
                    this.stars.children[index-1].updateCache();
                }
            }
            ,
            animateStars : function(game){
                var counter = 0;
                this.stars.forEach(function(star){
                    if (star.frame == 0) {
                        var delay=800 + 200*counter;
                        var tween = game.add.tween(star).to({x:300, y:-150*counter},delay,Phaser.Easing.Linear.None);
                        tween.onComplete.add(function(){
                            new autoPlaySounds.SoundEffects(game, 'sound-success');
                            emitter.start(true, 1000, null, 25);
                        },this);
                        tween.start();
                        game.add.tween(star).to({angle:360},delay,Phaser.Easing.Linear.None).start();
                        game.add.tween(star.scale).to({x:1.4, y:1.4},delay,Phaser.Easing.Elastic.Out).start();
                        counter++;

                        var emitter = star.addChild(game.add.emitter(0,0, 100));
                        emitter.makeParticles('star-particle');
                        emitter.scale.setTo(0.5,0.5);
                        emitter.gravity = 0;
                    }
                });  
            }
        };

        return Basket;
});



    

 