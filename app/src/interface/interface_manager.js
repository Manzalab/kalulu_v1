(function () {

    'use strict';

    var AuthoritativeSystem = require ('application/authoritative_system');
    var Events              = require ('application/events');


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    
    /**
     * The InterfaceManager class is responsible for the link between the chosen interface and the game.
     * @class
     * @extends AuthoritativeSystem
     * @memberof Namespace (e.g. Kalulu.Remediation)
     * @param parameter {Object} Description of the parameter
    **/
    function InterfaceManager (eventSystem) {
        
        AuthoritativeSystem.call(this, eventSystem, 'InterfaceManager');

        this._interface = null;
        this._isInit = false;

        require.ensure([], function () {
            var interfaceModule = require('modules/user_interface/src');
            console.log(Events);
            this._interface = new interfaceModule(eventSystem, Events);
            this._isInit = true;
            console.log('Interface Module Loaded');
        }.bind(this));
    }

    InterfaceManager.prototype = Object.create(AuthoritativeSystem.prototype);
    InterfaceManager.prototype.constructor = InterfaceManager;



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(InterfaceManager.prototype, {
        
        /**
         * Description of the accessor
         * @type {boolean}
         * @memberof Namespace.InterfaceManager#
        **/
        // privateMemberAccessor: {
        //     get: function () {
        //         return this._privateMember;
        //     },
        //     set: function (value) {
        //         return null;
        //     }
        // }
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################


    /**
     * Returns something
     * @param paramName {Type} description of the parameter
     * @return {Type} description of the returned object
    **/
    InterfaceManager.prototype.init = function init (paramName) {
        
        // code
        return null;
    };

    module.exports = InterfaceManager;

})();