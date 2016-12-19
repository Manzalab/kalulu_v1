(function () {
    'use strict';

    function Config () {}

    // ###########################################################################
    // ###  ATTRIBUTES  ##########################################################
    // ###########################################################################

    Object.defineProperties(Config.prototype, {

        enableGlobalVars        : { get : function () { return this._config.enableGlobalVars; }},
        stats                   : { get : function () { return this._config.stats; }},
        logGameStates           : { get : function () { return this._config.logGameStates; }},
        authoritativeSystemInfo : { get : function () { return this._config.authoritativeSystemInfo; }}
    });

    // ###########################################################################
    // ###  PUBLIC METHODS  ######################################################
    // ###########################################################################

    Config.prototype.request = function requestConfig (path, callback) {
        
        if (path.split('.').pop() !== 'json') path = path + '/config.json';
        console.info("[Config] Requesting config file at " + path);

        this._onRequestSuccess = callback;
        this.httpRequest = new XMLHttpRequest();

        if (!this.httpRequest) {
          alert('Giving up =( Cannot create an XMLHTTP instance');
          return false;
        }

        this.httpRequest.onreadystatechange = this._onStateChange.bind(this);
        this.httpRequest.open('GET', path);
        this.httpRequest.send();
    };

    // ###########################################################################
    // ###  PRIVATE METHODS  #####################################################
    // ###########################################################################

    Config.prototype._onStateChange = function _onStateChange () {
        if (this.httpRequest.readyState === XMLHttpRequest.DONE) {
          if (this.httpRequest.status === 200) {
            //console.info(this.httpRequest);
            this._init(JSON.parse(this.httpRequest.responseText));
            this._onRequestSuccess();
          } else {
            this._onRequestFailure();
          }
        }
    };

    Config.prototype._init = function initConfig (config) {
        
        this._config = config;
    };

    Config.prototype._onRequestSuccess = function onConfigRequestSuccess () {
        
        console.info('Config was properly initialised !');
    }

    Config.prototype._onRequestFailure = function onConfigRequestFailure () {
        
        console.error('There was a problem with the Config request.');
    }

    module.exports = new Config();
})();