define(['./activity_button'], function (ActivityButton) {
    
    'use strict';
    
    function MinigameButton (parameter) {
        
        ActivityButton.call(this);
    }
    
    MinigameButton.prototype = Object.create(ActivityButton.prototype);
    MinigameButton.prototype.constructor = MinigameButton;
    

    MinigameButton.prototype.setup = function setup (activityData, onClickCallback, shouldStartNow) {
        this.setText(activityData.activityType);
        this._assetName += this._txt.text.charAt(0).toUpperCase() + this._txt.text.slice(1);
        ActivityButton.prototype.setup.apply(this, arguments);
    };  

    // FOR DEBUG
    // MinigameButton.prototype._mouseOver = function _mouseOver (pEventData) {
    //     this._setModeInProgress();
    // };
    // MinigameButton.prototype._mouseOut = function _mouseOut (pEventData) {
    //     this._setModeCompleted();
    // };
    //
    
    return MinigameButton;
});