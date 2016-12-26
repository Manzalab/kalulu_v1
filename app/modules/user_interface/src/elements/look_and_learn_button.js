define(['./activity_button'], function (ActivityButton) {
    
    'use strict';
    
    function LookAndLearnButton (parameter) {
        
        ActivityButton.call(this);
    }
    
    LookAndLearnButton.prototype = Object.create(ActivityButton.prototype);
    LookAndLearnButton.prototype.constructor = LookAndLearnButton;
    
    LookAndLearnButton.prototype.start = function start() {
    	this._setState(this._DEFAULT_STATE);
    	this._anim.gotoAndStop(this._UP);
        this.onClick = this._cb;

        this.addChild(this._txt);
    }

    return LookAndLearnButton;
});