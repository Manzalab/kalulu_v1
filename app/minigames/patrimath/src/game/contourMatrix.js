define ([

    ], function(

        ) {

        /**
         * 
         * @class 
         * @memberof 
         * @param 
         */
        function ContourMatrix(maxX,maxY){
            this.mat = new Array(maxY);
            for (var i = 0; i < maxY; i++) {
                this.mat[i] = new Array(maxX);
                for (var j = 0; j < maxX; j++) {
                    this.mat[i][j] = 0;
                }
            }
            
            this.area=0;
        };

        ContourMatrix.prototype = {
            contourAddition : function(a,b){
                var res;
                if (a==3 || b == 3){
                    res =3;
                } else if (a==2 || b==2){
                    res = (a==2 && b==2) ? 1 : 2;
                } else {
                    res = (a==0 && b==0) ? 0 : 1;
                }
                return res;
            }
            ,
            matContourAddition : function(otherContourMat){
                matA = this.mat;
                matB = otherContourMat.mat;

                if (matA.length == matB.length && matA[0].length == matB[0].length) {
                    var maxX = matA[0].length;
                    var maxY = matA.length;

                    var res = new ContourMatrix(maxX,maxY);
                    for (i=0;i<maxY;i++){
                        for (j=0; j<maxX; j++){
                            res.mat[i][j] = this.contourAddition(matA[i][j], matB[i][j]);
                        }
                    } 
                }
                return res;
            }
            ,
            // add shape matrix to a bigger one
            addShapeToMatrix : function(shapeMat, shapeArea, shapeX, shapeY){

                var originX = Math.floor(shapeX);
                var originY = Math.floor(shapeY);
                var sizeX = shapeMat[0].length;
                var sizeY = shapeMat.length;

                for (i = 0; i< sizeY;i ++){
                    for (j=0; j < sizeX; j++) {
                        var pixel1 = this.mat[i+originY][j+originX];
                        var pixel2 = shapeMat[i][j];
                        this.mat[i+originY][j+originX] = this.contourAddition(pixel1,pixel2);
                    }
                }

                this.area = this.area + shapeArea;
            }
            ,
            matContourComparison : function(otherContourMat){
                var error = {pixels :0, area:0};

                for (var i=0; i< this.mat.length; i++){
                    for(var j=0; j<this.mat[0].length; j++){
                        if (this.mat[i][j] != otherContourMat.mat[i][j]) {
                            error.pixels ++;
                        }
                    }
                }

                error.area = Math.abs(this.area - otherContourMat.area);

                return error;
            }
        };

        return ContourMatrix;
});