(function () {
    
    'use strict';

    function Debugger (game, rafiki, config) {
        
        this._gameInstance = game;
        this._rafiki = rafiki;
        this._config = config;

        if (config.globalVars) {
            console.info('Debug with global Variables enabled. Everything can be found in global variable "lookandlearn"');
            window.lookandlearn = {};
            window.lookandlearn.game = this._gameInstance;
        }

        if (config.debugPanel) {
            this._setupDebugPanel();
        }
    }


    Debugger.prototype._setupDebugPanel = function setupDebugPanel() {
        
        var debugPanel;

        if (this._rafiki.debugPanel) {
            console.info('Getting DebugPanel from Rafiki');
            debugPanel = this._rafiki.debugPanel;
            this._config.rafikiDebugPanel = true;
        }
        else {
            console.info('Creating new DebugPanel');
            debugPanel = new Dat.GUI();
            this._config.rafikiDebugPanel = false;
        }
        
        this._debugPanel = debugPanel;
        this._debugFolderNames = {
            functions: "Debug Functions"
        };

        this._debugFunctions = debugPanel.addFolder(this._debugFolderNames.functions);

        this._debugFunctions.add(this, "AutoWin");
        this._debugFunctions.add(this, "skipKalulu");
        this._debugFunctions.open();


    };

    Debugger.prototype.clearDebugPanel = function clearDebugPanel() {
        
        if (this._config.rafikiDebugPanel) {
            
            console.info("LookAndLearn Clearing DebugPanel of its folders");
            for (var folderName in this._debugFolderNames) {
                this._debugPanel.removeFolder(this._debugFolderNames[folderName]);
            }
        }
        else {
            
            console.info("LookAndLearn Destroying DebugPanel");
            this._debugPanel.destroy();
        }
    };

    Debugger.prototype.AutoWin = function AutoWin() {
        
        this._gameInstance.rafiki.save();
        this._gameInstance.eventManager.emit("exitGame");
    };

    Debugger.prototype.skipKalulu = function skipKalulu() {

        this._gameInstance.eventManager.emit("skipKalulu");
    };

    Debugger.prototype.destroy = function destroyDebugger () {
        
        this.clearDebugPanel();
        this._debugPanel = null;
        
        this._config = config;
        this._rafiki = rafiki;
        this._gameInstance = game;
    };

    module.exports = Debugger;
})();