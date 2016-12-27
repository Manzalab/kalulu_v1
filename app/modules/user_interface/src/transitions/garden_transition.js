define([
    '../utils/ui/screen'
], function (
    Screen
) {
    
    'use strict';

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    
    /**
     * The GardenTransition class is ...
     * @class
     * @extends Screen
     * @memberof Namespace (e.g. Kalulu.Remediation)
     * @param parameter {Object} Description of the parameter
    **/
    function GardenTransition () {
        
        Screen.call(this);
        this.name = "mcGardenTransition";
        this.build();

        this._leaf1 = this.getChildByName("mcLeaf1");
        this._leaf2 = this.getChildByName("mcLeaf2");
        this._leaf3 = this.getChildByName("mcLeaf3");
        this._leaf4 = this.getChildByName("mcLeaf4");

        this._angles = {
            leaf1 : 10,
            leaf2 : -10,
            leaf3 : 0,
            leaf4 : 10
        };

        this._rotations = {
            leaf1 : this._leaf1.rotation,
            leaf2 : this._leaf2.rotation,
            leaf3 : this._leaf3.rotation,
            leaf4 : this._leaf4.rotation
        };

        this._isIn = false;
        //console.log("Garden Transition created");
        if (Config.debug) kalulu.transition = this;
    }

    GardenTransition.prototype = Object.create(Screen.prototype);
    GardenTransition.prototype.constructor = GardenTransition;



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    // Object.defineProperties(GardenTransition.prototype, {
        
    //     /**
    //      * Description of the accessor
    //      * @type {boolean}
    //      * @memberof Namespace.GardenTransition#
    //     **/
    //     privateMemberAccessor: {
    //         get: function () {
    //             return this._privateMember;
    //         },
    //         set: function (value) {
    //             return null;
    //         }
    //     }
    // });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################

    GardenTransition.prototype.easeIn = function easeIn (duration, callback) {
        if (typeof duration === "undefined") duration = 3;

        var amplitude = 1.5;

        createjs.Tween.get(this._leaf1).to({rotation: Math.DEG2RAD * this._angles.leaf1}, duration * 1000, createjs.Ease.getElasticOut(amplitude,duration)).call(function () {
            this._isIn = true;
            callback();
            this.tweenOut(duration);
        }.bind(this));
        createjs.Tween.get(this._leaf2).to({rotation: Math.DEG2RAD * this._angles.leaf2}, duration * 1000, createjs.Ease.getElasticOut(amplitude,duration));
        createjs.Tween.get(this._leaf3).to({rotation: Math.DEG2RAD * this._angles.leaf3}, duration * 1000, createjs.Ease.getElasticOut(amplitude,duration));
        createjs.Tween.get(this._leaf4).to({rotation: Math.DEG2RAD * this._angles.leaf4}, duration * 1000, createjs.Ease.getElasticOut(amplitude,duration));
    };

    GardenTransition.prototype.easeOut = function easeOut (duration, callback) {

        this._callback = callback;

        // if (!this._isIn) {
        //     console.log("not In");
        //     setTimeout(this.easeOut.bind(this), 200);
        //     return;
        // }
        
        // if (typeof duration === "undefined") duration = 3;

        // var amplitude = 1.5;

        // createjs.Tween.get(this._leaf1).to({rotation: this._rotations.leaf1}, duration * 1000, createjs.Ease.getElasticIn(amplitude,duration)).call(function () {

        //     //window.onload = function () { alert("It's loaded!") }

        //     // callback();
        //     this._isIn = false;
        // }.bind(this));
        // createjs.Tween.get(this._leaf2).to({rotation: this._rotations.leaf2}, duration * 1000, createjs.Ease.getElasticIn(amplitude,duration));
        // createjs.Tween.get(this._leaf3).to({rotation: this._rotations.leaf3}, duration * 1000, createjs.Ease.getElasticIn(amplitude,duration));
        // createjs.Tween.get(this._leaf4).to({rotation: this._rotations.leaf4}, duration * 1000, createjs.Ease.getElasticIn(amplitude,duration));
    };

    GardenTransition.prototype.tweenOut = function tweenOut (duration) {
        if (!this._isIn) {
            console.log("not In");
            setTimeout(this.easeOut.bind(this), 200);
            return;
        }
        
        if (typeof duration === "undefined") duration = 3;

        var amplitude = 1.5;

        createjs.Tween.get(this._leaf1).to({rotation: this._rotations.leaf1}, duration * 1000, createjs.Ease.getElasticIn(amplitude,duration)).call(function () {

            this._callback();
            this._isIn = false;
        }.bind(this));
        createjs.Tween.get(this._leaf2).to({rotation: this._rotations.leaf2}, duration * 1000, createjs.Ease.getElasticIn(amplitude,duration));
        createjs.Tween.get(this._leaf3).to({rotation: this._rotations.leaf3}, duration * 1000, createjs.Ease.getElasticIn(amplitude,duration));
        createjs.Tween.get(this._leaf4).to({rotation: this._rotations.leaf4}, duration * 1000, createjs.Ease.getElasticIn(amplitude,duration));
    }

    /**
     * Returns something
     * @return {Type} description of the returned object
    **/
    GardenTransition.prototype.destroy = function destroy () {
        
        Screen.prototype.destroy.call(this);
        //console.log("Garden Transition destroyed");
    };

    return GardenTransition;
});