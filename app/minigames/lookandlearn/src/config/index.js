var staticCallback = null;

function MinigameConfig () {

    this.gameId = "";     // the module build will export to this foldername. lowercase for the filesystem
    this.skipKalulu = false; // do not play kalulu speeches for faster debug. incomplete implementation
    this.skipKaluluIntro = false; // do not play kalulu speeches for faster debug. incomplete implementation
    this.skipKaluluHelp = false; // do not play kalulu speeches for faster debug. incomplete implementation
    this.skipKaluluFinal = false; // do not play kalulu speeches for faster debug. incomplete implementation
    this.debugPanel = false;
    this.globalVars = false;
    this.initDone = false;
    this.disciplines = {
        language : "reading",
        arithmetics : "maths",
        geometry : "geo"
    };
}

MinigameConfig.prototype.requestMinigameConfig = function requestMinigameConfig (callback) {
    
    console.info("[Minigame Look And Learn] Requesting config file");
    staticCallback = callback;
    this.httpRequest = new XMLHttpRequest();

    if (!this.httpRequest) {
      alert('Giving up =( Cannot create an XMLHTTP instance');
      return false;
    }

    this.httpRequest.onreadystatechange = this.onStateChange.bind(this);
    this.httpRequest.open('GET', 'minigames/lookandlearn/assets/config/config.json');
    this.httpRequest.send();
};

MinigameConfig.prototype.onStateChange = function onStateChange () {
    if (this.httpRequest.readyState === XMLHttpRequest.DONE) {
      if (this.httpRequest.status === 200) {
        console.info(this.httpRequest);
        this.init(JSON.parse(this.httpRequest.responseText));
      } else {
        console.error('There was a problem with the request.');
      }
    }
};

MinigameConfig.prototype.init = function init (config) {
    console.log(config);
    this.gameId          = config.gameId;
    this.skipKalulu      = config.skipKalulu;
    this.skipKaluluIntro = config.skipKaluluIntro;
    this.skipKaluluHelp  = config.skipKaluluHelp;
    this.skipKaluluFinal = config.skipKaluluFinal;
    this.debugPanel      = config.debugPanel;
    this.globalVars      = config.globalVars;
    this.debugPencil     = config.debugPencil;
    this.initDone        = true;
    staticCallback();
};

module.exports = new MinigameConfig();