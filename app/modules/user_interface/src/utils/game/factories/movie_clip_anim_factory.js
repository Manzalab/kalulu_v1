/**
 * This module is a base to be derived depending on the chosen method for animations (spritesheets or atlases)
**/
(function () {
    'use strict';

    var PIXI3       = require('../../../../libs/pixi');
    var AnimFactory = require('./anim_factory');

    var textureDigits = 4;
    var texturesDefinition = [];
    var texturesAnchor = [];
    var texturesCache = [];
    var digits = "";

    function MovieClipAnimFactory () {
        
        AnimFactory.call(this);
        this._setTextureDigits(textureDigits);
    }

    MovieClipAnimFactory.prototype = Object.create(AnimFactory.prototype);
    MovieClipAnimFactory.prototype.constructor = MovieClipAnimFactory;

    MovieClipAnimFactory.prototype.getAnim = function getAnim (state_graphic) {
        if (this._anim) this._anim.onComplete = this._onAnimComplete.bind(this);
        return this._anim;
    };

    MovieClipAnimFactory.prototype.update = function update (pId) {};

    MovieClipAnimFactory.prototype.setFrame = function setFrame (pAutoPlay, pStart) {
        
        pAutoPlay = pAutoPlay || true;
        pStart = pStart || 0;
    };

    MovieClipAnimFactory.prototype._setTextureDigits = function _setTextureDigits (pDigitsCount) {
        digits = "";
        for (var i = 0 ; i < pDigitsCount ; i++) {
            digits += "0";
        }
        textureDigits = pDigitsCount;
        return textureDigits;
    };

    MovieClipAnimFactory.prototype.addTextures = function addTextures (pTexturesJsonList) {
        
        // console.info("Adding textures to StateGraphic Cache:");
        // console.log(pTexturesJsonList);
        var lFrames = pTexturesJsonList.frames;
        
        var lId = null;
        var lNum = null;
        
        for (var lName in lFrames) {                            // ex. : "Button0001.png"
            if (!lFrames.hasOwnProperty(lName)) continue;

            lId = lName.split(".")[0];                          // ex. : Button0001
            lNum = parseInt(lId.substr(-1 * textureDigits));    // ex. : 1
            if (!isNaN(lNum)) lId = lId.substr(0, lId.length - textureDigits);
            if (!texturesDefinition[lId]) texturesDefinition[lId] = isNaN(lNum) ? 1 : lNum;
            else if (lNum > texturesDefinition[lId]) texturesDefinition[lId] = lNum;
            if (!texturesAnchor.hasOwnProperty(lId)) texturesAnchor[lId] = lFrames[lName].pivot;
        }
    };

    MovieClipAnimFactory.prototype.clearTextures = function clearTextures (pTexturesJsonList) {
        
        var lFrames = pTexturesJsonList.frames;
        
        var lId = "";
        var lNum = null;
        
        for (lId in lFrames) {
            
            if (!lFrames.hasOwnProperty(lId)) continue;
            
            lId = lId.split(".")[0];
            lNum = lId.substr(-1 * textureDigits);
            if (lNum) lId = lId.substr(0, lId.length - textureDigits);
            
            texturesDefinition[lId] = null;
            texturesAnchor[lId] = null;
            texturesCache[lId] = null;
        }
    };

    MovieClipAnimFactory.prototype.getTextures = function getTextures (pId) {
        
        if (!texturesCache[pId]) {
            var lFrames = texturesDefinition[pId];
            
            if (lFrames === 1) {
                
                texturesCache[pId] = [PIXI3.Texture.fromFrame(pId + ".png")];
            }
            else {
                
                texturesCache[pId] = [];
                
                for (var i = 1 ; i < lFrames + 1 ; i++) {
                    var frameName = pId + (digits.concat(i)).substr(-1 * textureDigits) + ".png";
                    texturesCache[pId].push(PIXI3.Texture.fromFrame(frameName));
                }
            }   
        }
        
        return texturesCache[pId];
    };

    MovieClipAnimFactory.prototype.create = function create (pId) {
        // console.log(pId);
        // console.log(this.getTextures(pId));
        this._anim = new PIXI3.extras.MovieClip(this.getTextures(pId));
        this._anim.anchor = texturesAnchor[pId];
        return this._anim;
    };

    MovieClipAnimFactory.prototype.update = function update (pId) {
        
        this._anim.textures = this.getTextures(pId);
        this._anim.anchor = texturesAnchor[pId];
    };

    MovieClipAnimFactory.prototype.setFrame = function setFrame (pAutoPlay, pStartFrame) {
        
        pAutoPlay = pAutoPlay || true;
        pStartFrame = pStartFrame || 0;

        this._anim.gotoAndStop(pStartFrame);
        if (pAutoPlay) this._anim.play();
    };

    MovieClipAnimFactory.prototype._onAnimComplete = function _onAnimComplete () {
        // console.log('anim ended');
        if (!this._anim.loop) {
            // console.log('anim ended and has no loop');
            this._hasAnimEnded = true;
        }
    };

    module.exports = MovieClipAnimFactory;

})();