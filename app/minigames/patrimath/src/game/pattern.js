define ([
    "../game/contourMatrix",
    "../data/palette"

    ], function(
        ContourMatrix,
        colors

        ) {

        function Pattern(game, gameArea, levelText){
            this.shapesOfPattern = new Phaser.Group(game);
            this.patternMat = new ContourMatrix(1300,1300);

            var problem = JSON.parse(levelText);
            var pattern = problem.pattern;
            var basket = problem.basket;
            var storeEnabled = problem.storeEnabled;

            gameArea.store.unvisibleShapesButtons(game); // Unable shapes buttons

            for (var i = 0; i < pattern.length; i++) {
                this.addShapeToPattern(game, pattern[i].shape, pattern[i].anchorPoint, pattern[i].color, pattern[i].rotation);
                if (storeEnabled) gameArea.store.enableShapeButton(pattern[i].shape);
            }

            for (var i = 0; i < basket.length; i++) {
                gameArea.store.shapeButtons[basket[i].shape].addShape(game, gameArea, basket[i].shape);
                if (storeEnabled) gameArea.store.enableShapeButton(basket[i].shape);
            }

            if (!storeEnabled) gameArea.store.lockStore(game,false);

            this.updatePosition(gameArea);

        };

        Pattern.prototype = {
            addShapeToPattern: function(game, shapeName, anchorPosition, colorIndex, rotation){
                var mat = game.shapes[shapeName].mat[Number(rotation)];
                var area = game.shapes[shapeName].area[Number(rotation)];
                this.patternMat.addShapeToMatrix(mat,area, anchorPosition.x, anchorPosition.y);

                var tempSprite = this.shapesOfPattern.add(game.add.sprite(Number(anchorPosition.x), Number(anchorPosition.y), shapeName));
                tempSprite.inputEnabled = true;
                tempSprite.tint =  colors.patternColor;
                tempSprite.frame = Number(rotation);
                tempSprite.alpha = 0.3;
                tempSprite.wantedColor = (colorIndex >= 0) ? colors.palette[colorIndex] : colors.defaultColor;
            }
            ,
            updatePosition: function(gameArea){
                this.shapesOfPattern.x = gameArea.shapesInPlace.x;
                this.shapesOfPattern.y = gameArea.shapesInPlace.y;

            }
        }
        return Pattern;

});