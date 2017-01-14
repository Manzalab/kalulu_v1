(function () {

    'use strict';

    var config = require('minigames/lookandlearn/assets/config/config.json');
    
    function MinigameConfig () {

        this.gameId          = "";     // the module build will export to this foldername. lowercase for the filesystem
        this.skipKalulu      = false; // do not play kalulu speeches for faster debug. incomplete implementation
        this.skipKaluluIntro = false; // do not play kalulu speeches for faster debug. incomplete implementation
        this.skipKaluluHelp  = false; // do not play kalulu speeches for faster debug. incomplete implementation
        this.skipKaluluFinal = false; // do not play kalulu speeches for faster debug. incomplete implementation
        this.debugPanel      = false;
        this.globalVars      = false;
        this.debugPencil     = false;
        this.debugLayouts    = false;
        this.initDone        = false;
        this.disciplines     = {
            language    : "reading",
            arithmetics : "maths",
            geometry    : "geo"
        };

        this._init(config);
    }

    MinigameConfig.prototype._init = function initConfig (config) {
        
        this.gameId          = config.gameId;
        this.skipKalulu      = config.skipKalulu;
        this.skipKaluluIntro = config.skipKaluluIntro;
        this.skipKaluluHelp  = config.skipKaluluHelp;
        this.skipKaluluFinal = config.skipKaluluFinal;
        this.debugPanel      = config.debugPanel;
        this.globalVars      = config.globalVars;
        this.debugPencil     = config.debugPencil;
        this.debugLayouts    = config.debugLayouts;
        this.initDone        = true;
    };

    module.exports = new MinigameConfig();
})();



