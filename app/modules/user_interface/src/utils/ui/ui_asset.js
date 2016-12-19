define([
    '../game/state_graphic',
    '../game/factories/movie_clip_anim_factory'
], function (
    StateGraphic,
    MovieClipAnimFactory
) {
    
    'use strict';
    
    /**
     * The UIAsset class is used to instanciate simple ui elements
     * @class
     * @extends StateGraphic
     * @memberof Namespace (e.g. Kalulu.Remediation)
     * @param parameter {Object} Description of the parameter
    **/
    function UIAsset (assetName) {
        
        StateGraphic.call(this);
        this._assetName = assetName;
        this._factory = new MovieClipAnimFactory();
        this._setState(this._DEFAULT_STATE);
    }

    UIAsset.prototype = Object.create(StateGraphic.prototype);
    UIAsset.prototype.constructor = UIAsset;

    return UIAsset;
});