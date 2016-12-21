define ([
    "../data/palette",
    "../ui/rotationUI",
    "../sounds/autoPlaySounds"

    ], function(
        colors,
        RotationUI,
        autoPlaySounds
        ) {

        /**
         * 
         * @class 
         * @memberof 
         * @param 
         */
        function Shape(game, gameArea, shapeName){
            var posX = Math.floor(Math.random()*(game.width-310))+90 - gameArea.shapesInPlace.x;
            var posY = game.height - 150 - gameArea.shapesInPlace.y;

            Phaser.Sprite.call(this, game, -gameArea.shapesInPlace.x, posY-50, shapeName,0);
            this.tint = colors.defaultColor;

            var tweenFall = game.add.tween(this);
            var tweenSlide = game.add.tween(this);
            tweenFall.to({y:posY},200,Phaser.Easing.Bounce.Out);
            tweenSlide.to({x:posX},400,Phaser.Easing.Quadratic.Out);
            tweenFall.onComplete.add(function(){ tweenSlide.start()});
            var that = this;
            tweenSlide.onComplete.add(function(){
                that.inputEnabled = true;
                that.input.enableSnap(1, 1, false, true); 
                that.input.pixelPerfectOver = true;
                that.input.enableDrag(false, true, true);
                that.events.onInputDown.add( function(){that.onClick(game, gameArea)},that);
                that.events.onDragStop.add( function(){that.onRelease(game, gameArea)},that);
                that.originalPosition = that.position.clone();
            });

            this.rotationUI = null;

            this.nbDir = game.shapes[shapeName].nbDir;
            this.mat = game.shapes[shapeName].mat;
            this.area = game.shapes[shapeName].area;

            gameArea.shapesInPlace.add(this);
            game.world.bringToTop(gameArea.shapesInPlace);

            tweenFall.start();
        };

        Shape.prototype = Object.create(Phaser.Sprite.prototype);

        Shape.prototype.constructor = Shape;

        Shape.prototype.onClick= function(game, gameArea) {
            this.wasSelected = (this.rotationUI != null);
            gameArea.removeAllRotationUI(game);
        };

        Shape.prototype.onRelease= function(game, gameArea){
            var dist = Phaser.Point.distance(this.position, this.originalPosition);
            if (dist>5){ // considered as drag 
                if (game.state.current == "freePlay") gameArea.unableColorsButtons();
                this.endDrag(game, gameArea);
            } else { // considered as a click
              this.position.copyFrom(this.originalPosition); 
              if (game.state.current == "freePlay") {
                  var newColor = gameArea.getColorFromButtons(this);
                  if (this.tint != newColor) {
                      new autoPlaySounds.SoundEffects(game, 'sound-color');
                      this.tint = newColor;
                  }
              }
              if (!this.wasSelected) {
                  if (!gameArea.isOutOfGameAreaX(this) && !gameArea.isOutOfGameAreaY(this)) this.addRotationUI(game,0);
              }
            }
        };

        Shape.prototype.endDrag = function (game, gameArea){
            this.inputEnabled = false;
            gameArea.calculateContourMat_withoutShape(this);

            if (gameArea.isInTrashbin(this)) {
                this.deleteSprite(game, gameArea);
                if (game.state.current == "levelPlay") gameArea.compareSolutionToPattern(game);
            } else {
                if (game.state.current == "levelPlay") gameArea.store.lockStore(game,true);
                if (!gameArea.isOutOfGameAreaX(this) && !gameArea.isOutOfGameAreaY(this)){
                    var snapPos = gameArea.getSnapPosition(game, this);
                    var shapeTween = game.add.tween(this);
                    shapeTween.to({x:snapPos.x, y:snapPos.y},100,Phaser.Easing.Exponential.In);
                    shapeTween.onComplete.add(function(){this.endOfShapeTween(game,gameArea, true)}, this);
                    shapeTween.start();
                } else {
                    var shapeTween = game.add.tween(this);
                    shapeTween.to({x:this.originalPosition.x, y:this.originalPosition.y},400,Phaser.Easing.Exponential.Out);
                    shapeTween.onComplete.add(function(){this.endOfShapeTween(game,gameArea, false)}, this);
                    shapeTween.start();
                }
            }
        };

        Shape.prototype.endOfShapeTween = function(game,gameArea, inSafeArea){
            new autoPlaySounds.SoundEffects(game, 'sound-snap');
            this.inputEnabled=true;
            this.originalPosition = this.position.clone();
            if (inSafeArea){
                gameArea.contourMat.addShapeToMatrix(this.mat[this.frame], this.area[this.frame], this.x, this.y);
                this.addRotationUI(game, 0);
                if (game.state.current == "levelPlay") {
                    this.tint = gameArea.getColorFromPattern(this);
                    gameArea.compareSolutionToPattern(game);
                }
            }
        };

        Shape.prototype.deleteSprite = function(game, gameArea) {
            // gameArea.removeStar(game); 
            gameArea.store.shapeButtons[this.key].removeShape(game, gameArea, this.key);
            new autoPlaySounds.SoundEffects(game, 'sound-trashbin');
            this.destroy();
        };

        Shape.prototype.reposition= function(game, gameArea, notX, notY){
            var posX = (notX) ? this.x : Math.random()*(game.width-310)+90 - gameArea.shapesInPlace.x;
            var posY = (notY) ? this.y : game.height - 150 - gameArea.shapesInPlace.y;
            this.x = posX;
            this.y= posY;
            this.originalPosition = this.position.clone();
        };

        Shape.prototype.removeRotationUI = function(game){
            this.rotationUI.sprite.destroy();
            this.rotationUI = null;
        };

        Shape.prototype.addRotationUI = function(game, angle){
            this.rotationUI = new RotationUI(game, this, angle);
            this.bringToTop();
        };

        return Shape;
});