define ([
    "../game/store",
    "../game/basket",
    "../game/pannel",
    "../game/pattern",
    "../game/contourMatrix",
    "../data/palette"
], function(
    Store,
    Basket,
    Pannel,
    Pattern,
    ContourMatrix,
    colors
) {

        /**
         * 
         * @class 
         * @memberof 
         * @param 
         */
        function GameArea(game, levelNum, levelText, width, height){
            this.width = width;
            this.height = height;
            this.safeArea = game.add.sprite(0,0, 'gameArea');

            this.shapesInPlace = new Phaser.Group(game);

            this.store= new Store(game, this);
            this.basket= new Basket(game, this);
            this.winPannel= new Pannel(game, levelNum);
            
            this.contourMat= [];

            this.updatePosition(game);

            if (game.state.current == "levelPlay") this.pattern = new Pattern(game, this, levelText);
        };

        GameArea.prototype = {
            updatePosition : function(game){
                this.safeArea.x= 0.5 * (game.width + 200 - this.width);
                this.safeArea.y = 0.5* (game.height - 150 - this.height);
                this.shapesInPlace.x=this.safeArea.x - 130;
                this.shapesInPlace.y =this.safeArea.y - 130;

                this.store.updatePosition(game);
                this.basket.updatePosition(game);
                this.winPannel.updatePosition(game);
                if (this.pattern !=null) this.pattern.updatePosition(this);
            }
            , 
            isOutOfGameAreaX : function(shape){
                return (shape.x < 0 || shape.x > this.width+100 || shape.x <0);
            }
            ,
            isOutOfGameAreaY : function(shape){
                return (shape.y < 0 || shape.y > this.height+100 || shape.y<0);
            }
            ,
            isInTrashbin: function(shape){
                return (this.store.bin.inputEnabled && Phaser.Rectangle.intersects(shape.getBounds(),this.store.bin.getBounds()));
            }
            ,
            unableColorsButtons : function (){
                this.basket.colorsButtons.forEach(function(colorButton){
                    colorButton.setButtonValue(false);
                });
            }
            ,
            getColorFromButtons : function (shape){
                var color = shape.tint;
                this.basket.colorsButtons.forEach(function(colorButton){
                    if (colorButton.value) color = colorButton.color;
                });
                return color;
            }
            ,
            evaluateInPlaceShapes : function(shapeName){
                var res =0;

                this.shapesInPlace.forEach(function(shape){
                    if (shape.key == shapeName) res ++;
                });
                return res;
            }
            ,
            removeAllRotationUI: function(game){
                this.shapesInPlace.forEach(function(shape){
                    if (shape.rotationUI != null) shape.removeRotationUI(game);
                });
            }
            ,
            calculateContourMat_withoutShape: function(shape){
                
                this.contourMat = new ContourMatrix(1300,1300);
                var localgamearea = this;
                this.shapesInPlace.forEach(function(currentShape){
                    if (currentShape != shape) {
                        localgamearea.contourMat.addShapeToMatrix(currentShape.mat[currentShape.frame], currentShape.area[currentShape.frame], currentShape.x, currentShape.y);
                    }
                });
            }
            ,
            getSnapPosition: function(game, shape){
                if (game.state.current == "levelPlay"){
                    var contourSnapMat = this.contourMat.matContourAddition(this.pattern.patternMat);
                } else {
                    var contourSnapMat = this.contourMat;
                }   

                var criteria = 0;
                var criteriaTemp = 0;
                var range_i = 15; // intensity of the snap effect
                var range_j = 15; 
                var i_init = shape.y;
                var j_init = shape.x;
                var i_opt = shape.y; // to store the best position we have found for tempSprite
                var j_opt = shape.x;
                var i_temp;
                var j_temp;

                for (var i = 0; i < range_i * 2; i++) {
                    for (var j = 0; j < range_j * 2; j++) {
                        i_temp = i_init + (i - range_i);
                        j_temp = j_init + (j - range_j);
                        criteriaTemp = this.calculateCommonContours(game, contourSnapMat.mat, shape, i_temp, j_temp);
                        if ((i == 0) && (j == 0)) { // 1st iteration
                            criteria = criteriaTemp;
                        }
                        if (criteriaTemp > criteria) {
                            criteria = criteriaTemp;
                            i_opt = i_temp;
                            j_opt = j_temp;
                        } else {
                            if (criteriaTemp == criteria) {
                                if (Phaser.Point.distance(i_init, j_init, i_temp, j_temp) < Phaser.Point.distance(i_init, j_init, i_opt, j_opt)) {
                                    i_opt = i_temp;
                                    j_opt = j_temp;
                                }
                            }
                        }
                    }
                }

                return {x: j_opt, y:i_opt};
            }
            ,
            calculateCommonContours: function(game, snapMat, shape, i,j){
                var matShape = shape.mat[shape.frame];
                var nbPixels = matShape.length;
                var res = 0;
                for (var ii = 0; ii < nbPixels; ii++) {
                    for (var jj = 0; jj < nbPixels; jj++) {
                        if (matShape[ii][jj] == 2 && snapMat[i + ii][j + jj] == 2) {
                            res++;
                        } else if (matShape[ii][jj] == 3 && snapMat[i + ii][j + jj] == 3) {
                            res = res + 2;
                        }
                    }
                }
                return res;
            }
            ,
            getColorFromPattern : function(shape){
                var color = colors.defaultColor;
                this.pattern.shapesOfPattern.forEach(function(patternShape){
                    if (patternShape.key == shape.key){
                        if (patternShape.x == shape.x && patternShape.y == shape.y) {
                            if (patternShape.frame == shape.frame){
                                color= patternShape.wantedColor;
                            }
                        }
                    }
                });

                if (color == colors.defaultColor){
                    var inPixels=0;
                    var matShape = shape.mat[shape.frame];
                    for (var i = 0; i < matShape.length; i++) {
                        for (var j = 0; j < matShape[0].length; j++) {
                            if (matShape[i][j] == 1) {
                                if (this.pattern.patternMat.mat[shape.y+i][shape.x+j] != 0) {
                                    inPixels ++;
                                }
                            }
                        }
                    }
                    var errorMargin = shape.area[shape.frame] * 0.85;
                    if (inPixels > errorMargin) color = colors.palette[Math.floor(Math.random() * colors.palette.length)];
                }

                return color;
            }
            ,
            compareSolutionToPattern: function (game){
                if (!this.winPannel.isDisplayed()){
                    var error = this.pattern.patternMat.matContourComparison(this.contourMat);
                    var errorMargin = Math.floor(this.pattern.patternMat.area*0.05);

                    if (error.pixels < errorMargin && error.area < errorMargin) {
                        this.removeAllRotationUI(game);
                        var starIndex = this.basket.evaluateStars();
                        this.winPannel.showPannel(game, starIndex);
                        this.winPannel.saveResult(game, starIndex);
                        this.basket.animateStars(game);
                    }
                }
            }
            ,
            removeStar: function(game){
                if (!this.winPannel.isDisplayed() /*&& !this.store.firstChance*/) {
                    var starIndex = this.basket.evaluateStars();
                    this.basket.deleteStar(starIndex);
                    if (starIndex-1 == 0) this.winPannel.showPannel(game, 0);
                }
            }
        };

        return GameArea;
});