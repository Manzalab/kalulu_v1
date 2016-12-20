define([
    '../utils/ui/button',
    './kalulu_character'
], function (
    Button,
    KaluluCharacter
) {
    
    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    

    /**
     * The PlayButtonTC class is ...
     * @class
     * @extends Button
     * @memberof Namespace (e.g. Kalulu.Remediation)
     * @param parameter {Object} Description of the parameter
    **/
    function PlayButtonTC (description) {
        // console.log(description);
        // console.log(arguments);
        var kalulu = description.components.mcKalulu;
        this._kaluluCharacter = new KaluluCharacter();
        this._kaluluCharacter.position.set(kalulu.x, kalulu.y);
        // this._kaluluCharacter.interactive = false;
        
        Button.call(this);
        // console.log(description);
    }

    PlayButtonTC.prototype = Object.create(Button.prototype);
    PlayButtonTC.prototype.constructor = PlayButtonTC;



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(PlayButtonTC.prototype, {
        
        /**
         * Description of the accessor
         * @type {boolean}
         * @memberof Namespace.PlayButtonTC#
        **/
        privateMemberAccessor: {
            get: function () {
                return this._privateMember;
            },
            set: function (value) {
                return null;
            }
        }
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################


    /**
     * Returns something
     * @param paramName {Type} description of the parameter
     * @return {Type} description of the returned object
    **/
    PlayButtonTC.prototype.start = function start () {
        
        Button.prototype.start.call(this);

        this.addChild(this._kaluluCharacter);
        this._kaluluCharacter.start();
    };

    return PlayButtonTC;
});