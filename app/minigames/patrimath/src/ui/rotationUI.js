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
        function RotationUI(game, shape, angle){
            this.sprite = shape.parent.add(game.add.sprite(shape.x+65,shape.y+65,'rotation-ui'));
            this.sprite.anchor = {x:0.5, y:0.5};
            this.sprite.angle = angle;

            this.sprite.inputEnabled =true;
            this.sprite.input.pixelPerfectOver = true;
            this.sprite.input.enableDrag(false);
            this.sprite.events.onDragStart.add( function(){this.onRotationStart(game, shape)},this);
            this.sprite.events.onDragUpdate.add( function(){this.onRotationUpdate(game, shape)},this);
            this.sprite.events.onDragStop.add( function(){this.onRotationEnd(game, shape)},this);

            this.rotationUIPosition = this.sprite.position.clone();
        };

        RotationUI.prototype = {
            onRotationStart: function(game, shape) {
                this.beginDragPosition = game.input.activePointer.position.clone();
                this.beginDir = shape.frame;
                this.beginAngle = this.sprite.angle;
            }
            ,
            onRotationUpdate: function(game, shape){
                this.sprite.position = this.rotationUIPosition.clone();
                if(this.beginDir != undefined) {
                    var origin = this.sprite.worldPosition.clone();
                    var beginPosition = this.beginDragPosition;
                    var currentPosition = game.input.activePointer.position.clone();

                    var angle = (Phaser.Point.angle(origin, currentPosition)-Phaser.Point.angle(origin, beginPosition)) * 57 ; // conversion en degrés

                    var maxDir = game.shapes[shape.key].nbDir; // ou shape.nbDir;
                    var newDir = this.beginDir + Math.floor((angle+360) / 30);

                    var newFrame = (newDir+12) % maxDir;
                    if (shape.frame != newFrame){
                        new autoPlaySounds.SoundEffects(game, 'sound-rotation');
                        shape.frame = newFrame;
                    }
                    
                    this.sprite.angle = this.beginAngle + angle ;

                    shape.updateCache();
                }
            }
            ,
            onRotationEnd: function(game, shape) {
                var angle = this.sprite.angle;
                shape.removeRotationUI(game);
                shape.addRotationUI(game, angle);
            }
        };

        return RotationUI;
});