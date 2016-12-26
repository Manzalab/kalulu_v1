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


    return MinigameButton;
});