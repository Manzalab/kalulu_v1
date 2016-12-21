(function () {
    
    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    
    /**
     * The GameStates class is a simple list of GameStates String Id
     * @class
     * @memberof Kalulu.GameLogic
     * @param parameter {Object} Description of the parameter
    **/
    function GameStates () {}


    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(GameStates.prototype, {
        
        /**
         * The string Id of the State Boot
         * @type {string}
         * @memberof Kalulu.GameLogic.GameStates#
         * @readonly
        **/
        BOOT: { get: function () { return "BOOT"; } },
        
        /**
         * The string Id of the State Preload
         * @type {string}
         * @memberof Kalulu.GameLogic.GameStates#
         * @readonly
        **/
        PRELOAD: { get: function () { return "PRELOAD"; } },
        
        /**
         * The string Id of the State Menus
         * @type {string}
         * @memberof Kalulu.GameLogic.GameStates#
         * @readonly
        **/
        MENUS: { get: function () { return "MENUS"; } },
        
        /**
         * The string Id of the State Activity
         * @type {string}
         * @memberof Kalulu.GameLogic.GameStates#
         * @readonly
        **/
        ACTIVITY: { get: function () { return "ACTIVITY"; } },
        
        /**
         * The string Id of the State MathsDebug
         * @type {string}
         * @memberof Namespace.GameStates#
         * @readonly
        **/
        // MATHS_DEBUG: { get: function () { return "MATHS_DEBUG"; } },
    });


    module.exports = new GameStates();
})();