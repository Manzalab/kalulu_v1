(function () {
    'use strict';

    require.ensure([], function () {

        var Application = require('application/application');
        
        console.info('Kalulu Application is starting.');

        // adding 2 useful values for rotation tweens
        Math.DEG2RAD = Math.PI / 180;
        Math.RAD2DEG = 180 / Math.PI;
        
        /**
         * Capitalises the first letter of the string and returns it.
         * @return {string} the same string but first-letter is now capitalised.
        **/
        String.prototype.capitalise = function capitalise () {
            return this[0].toUpperCase() + this.substr(1);
        };


        // patchPIXI();
        patchDat();
        var app = new Application();
        app.initAndStart();
    });
})();


function patchDat () {

    Dat.GUI.prototype.removeFolder =  function removeFolder (name) {
        
        // console.log('[Dat.GUI] Trying to remove Dat.gui folder <' + name + '> : ');
        
        var folder = this.__folders[name];
        if (!folder) {
          return;
        }

        this.__ul.removeChild(folder.domElement.parentNode);
        folder.__controllers = null;
        folder.__ul = null;
        folder.domElement.parentNode.removeChild(folder.domElement);
        folder.domElement = null;

        folder = null;
        this.__folders[name] = null;
        delete this.__folders[name];
        
        // console.log(name + ' : ' + this.__folders[name]);
        
        // var removed = true;
        // for (var folderName in this.__folders) {
        //     if (!this.__folders.hasOwnProperty(folderName)) continue;
        //     if (folderName === name) {
        //         removes = false;
        //         console.log('[Dat.GUI] Error : Ther was an issue and it has revealed impossible to remove the folder <' + name + '>.');
        //     }
        // }
        // if (removed) console.log('[Dat.GUI] Success. The folder <' + name + '> has correctly been removed.');
        this.onResize();
  };
}

function patchPIXI () {
    //patching PIXI waiting for update
    PIXI3.interaction.InteractionManager.prototype.processInteractive = function (point, displayObject, func, hitTest, interactive) {
    
        if(!displayObject || !displayObject.visible) {
            return false;
        }
        
        var hit = false,
            interactiveParent = interactive = displayObject.interactive || interactive;

        if(displayObject.hitArea) {
            
            interactiveParent = false;
        }

        if(displayObject.interactiveChildren) {
            
            var children = displayObject.children;
            
            for (var i = children.length-1; i >= 0; i--){
                
                if(! hit  && hitTest){

                    hit = this.processInteractive(point, children[i], func, true, interactive );
                }
                else{
                    this.
                    processInteractive(point, children[i], func, false, false );
                }
                
            }
        }

        if(interactive){
            
            if(hitTest && !hit){  
                
                if(displayObject.hitArea){
                    displayObject.worldTransform.applyInverse(point,  this._tempPoint);
                    hit = displayObject.hitArea.contains( this._tempPoint.x, this._tempPoint.y );
                }
                
                else if(displayObject.containsPoint){
                    hit = displayObject.containsPoint(point);
                }
            }

            if(displayObject.interactive){
                func(displayObject, hit); 
            }
        }

        return hit;
    };
}