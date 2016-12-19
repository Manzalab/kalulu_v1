(function () {
    
    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    
    /**
     * The AuthoritativeSystem class is the base class for all the systems that can emit events via the Application EventSystem
     * @class
     * @memberof Application
     * @param eventSystem {EventEmitter} the Application EventSystem
     * @param systemName {string} the system name
    **/
    function AuthoritativeSystem (eventSystem, systemName) {
        
        if (typeof eventSystem === 'undefined') {
            throw new Error("[AuthoritativeSystem] Unable to create AuthoritativeSystem without an EventSystem. Please provide eventSystem in the superclass constructor call.");
        }

        if (typeof systemName !== 'string') {
            throw new Error("[AuthoritativeSystem] Unable to create AuthoritativeSystem without a system name");
        }
        
        /**
         * the Object to use as Event System
         * @type {EventEmitter}
         * @private
        **/
        this._eventSystem = eventSystem;

        /**
         * the name of the system
         * @type {string}
         * @private
        **/
        this._name = systemName;

        if (Config.authoritativeSystemInfo) {
            console.log("[AuthoritativeSystem] New " + this._name + " Created");
            console.log(this._eventSystem);
        }
    }

    Object.defineProperties(AuthoritativeSystem.prototype, {
        
        /**
         * System Name
         * @type {string}
         * @readonly
         * @memberof Application.AuthoritativeSystem#
        **/
        name: { get: function () { return this._name; } }
    });

    module.exports = AuthoritativeSystem;
})();