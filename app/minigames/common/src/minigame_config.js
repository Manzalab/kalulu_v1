(function () {
    'use strict';

    function MinigameConfig () {

        this.gameId = "";     // the module build will export to this foldername. lowercase for the filesystem
        this.discipline = "";
        this.skipKalulu = false; // do not play kalulu speeches for faster debug. incomplete implementation
        this.skipKaluluIntro = false; // do not play kalulu speeches for faster debug. incomplete implementation
        this.skipKaluluHelp = false; // do not play kalulu speeches for faster debug. incomplete implementation
        this.skipKaluluFinal = false; // do not play kalulu speeches for faster debug. incomplete implementation
        this.debugPanel = false;
        this.globalVars = false;
    }

    // ###########################################################################
    // ###  ATTRIBUTES  ##########################################################
    // ###########################################################################

    Object.defineProperties(MinigameConfig.prototype, {

        enableGlobalVars        : { get : function () { return this._config.enableGlobalVars; }},
        stats                   : { get : function () { return this._config.stats; }},
        logGameStates           : { get : function () { return this._config.logGameStates; }},
        authoritativeSystemInfo : { get : function () { return this._config.authoritativeSystemInfo; }}
    });

    // ###########################################################################
    // ###  PUBLIC METHODS  ######################################################
    // ###########################################################################

    MinigameConfig.prototype.request = function requestMinigameConfig (path, callback) {
        
        if (path.split('.').pop() !== 'json') path = path + '/config.json';
        console.info("[MinigameConfig] Requesting config file at " + path);

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

    MinigameConfig.prototype._onStateChange = function _onStateChange () {
        if (this.httpRequest.readyState === XMLHttpRequest.DONE) {
          if (this.httpRequest.status === 200) {
            //console.info(this.httpRequest);
            this._init(JSON.parse(this.httpRequest.responseText));
            this._onRequestSuccess();
            this._onRequestSuccess = onConfigRequestSuccess;
          } else {
            this._onRequestFailure();
          }
        }
    };

    MinigameConfig.prototype._init = function initConfig (config) {
        
        console.log(config);
        this.gameId          = config.gameId;
        this.discipline      = config.discipline;
        this.skipKalulu      = config.skipKalulu;
        this.skipKaluluIntro = config.skipKaluluIntro;
        this.skipKaluluHelp  = config.skipKaluluHelp;
        this.skipKaluluFinal = config.skipKaluluFinal;
        this.debugPanel      = config.debugPanel;
        this.globalVars      = config.globalVars;
    };

    MinigameConfig.prototype._onRequestSuccess = function onConfigRequestSuccess () {
        
        console.info('MinigameConfig was properly initialised !');
    };

    MinigameConfig.prototype._onRequestFailure = function onConfigRequestFailure () {
        
        console.error('There was a problem with the MinigameConfig request.');
    };

    module.exports = MinigameConfig;
})();