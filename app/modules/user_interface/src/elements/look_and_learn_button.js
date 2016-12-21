define(['./activity_button'], function (ActivityButton) {
    
    'use strict';
    
    function LookAndLearnButton (parameter) {
        
        ActivityButton.call(this);
    }
    
    LookAndLearnButton.prototype = Object.create(ActivityButton.prototype);
    LookAndLearnButton.prototype.constructor = LookAndLearnButton;
    
    return LookAndLearnButton;
});