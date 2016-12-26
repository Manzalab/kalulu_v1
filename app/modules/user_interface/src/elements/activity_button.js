define(['../utils/ui/button'], function (Button) {
    
    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    

    /**
     * The ActivityButton class is the base class for the LookAndLearnButton and MinigameButtons used in the LessonScreen 
     * @class
     * @extends Button
     * @memberof Kalulu.Interface.User.Elements
     * @param activityData {Object} Description of the parameter
     * @param position {number} 0 for the center, 1, 2, 3 for the 3 parts.
     * @param clickCallback {function} Description of the parameter
    **/
    function ActivityButton () {
        
        this._LOCKED_STATE      = "locked";
        this._OPEN_STATE        = "open";
        this._IN_PROGRESS_STATE = "inprogress";
        this._COMPLETED_STATE   = "completed";

        Button.call(this);
    }

    ActivityButton.prototype = Object.create(Button.prototype);
    ActivityButton.prototype.constructor = ActivityButton;


    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(ActivityButton.prototype, {
        
        /**
         * @type {object}
         * @memberof Kalulu.Interface.User.Elements.ActivityButton#
        **/
        data: { get: function () { return this._data; }}
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################
    
    ActivityButton.prototype.setup = function setup (activityData, onClickCallback, shouldStartNow) {
        this._data = activityData;
        this._cb = onClickCallback;

        // console.log(this.constructor.name + " onClick Callback : ");
        // console.log(this.onClick);
        if (shouldStartNow) this.start();
    };

    ActivityButton.prototype.start = function start () {
        //console.log(this._data);
        if (!this._data) return;
        if (!this._data.isUnlocked)
            this._setModeLocked();
        else if (this._data.isCompleted)
            this._setModeCompleted();
        else if (this._data.isStarted)
            this._setModeInProgress();
        else
            this._setModeOpen();
        //this.addChild(this._txt);
    };

    ActivityButton.prototype._doNothing = function _doNothing () {};

    ActivityButton.prototype._setModeLocked = function _setModeLocked () {
        this._setState(this._LOCKED_STATE);
        this._anim.gotoAndStop(this._UP);
        this.onClick = this._doNothing;
    };

    ActivityButton.prototype._setModeOpen = function _setModeOpen () {
        
        this._setState(this._OPEN_STATE);
        this._anim.gotoAndStop(this._UP);
        this.onClick = this._cb;
    };

    ActivityButton.prototype._setModeInProgress = function _setModeInProgress () {
        
        this._setState(this._IN_PROGRESS_STATE);
        this._anim.gotoAndStop(this._UP);
        this.onClick = this._cb;
    };

    ActivityButton.prototype._setModeCompleted = function _setModeCompleted () {
        this._setState(this._COMPLETED_STATE);
        this._anim.gotoAndStop(this._UP);
        this.onClick = this._cb;
    };


    return ActivityButton;
});