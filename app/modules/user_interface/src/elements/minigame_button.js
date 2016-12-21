define(['./activity_button'], function (ActivityButton) {
    
    'use strict';
    
    function MinigameButton (parameter) {
        
        ActivityButton.call(this);
    }
    
    MinigameButton.prototype = Object.create(ActivityButton.prototype);
    MinigameButton.prototype.constructor = MinigameButton;
    

    MinigameButton.prototype.setup = function setup (activityData, onClickCallback, shouldStartNow) {
        
        this.setText(activityData.activityType);
        ActivityButton.prototype.setup.apply(this, arguments);
    };  


    return MinigameButton;
});