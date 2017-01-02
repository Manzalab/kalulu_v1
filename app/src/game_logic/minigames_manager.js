define([
    'dat.gui',
    './core/minigame_dst_record',
    './core/stimulus_apparition',
    './timer'
], function (
    dat,
    MinigameDstRecord,
    StimulusApparition,
    Timer
) {

    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    

    /**
     * The MinigamesManager is in charge of :
     * - starting the minigames
     * - reactivating Kalulu interface at the end of the minigimae
     * - and the most important : providing them with a simple interface for getting/savingData, and ending the minigame.
     * @class
     * @memberof Kalulu.GameLogic
    **/
    function MinigamesManager (gameManager) {

        this._gameManager = gameManager;

        this._currentExerciseSetup = null;
        this.launchers = {};

        if (Config.enableGlobalVars) {
            window.kalulu.minigamesManager = this;
            window.kalulu.Config = Config;
        }
    }



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    // Object.defineProperties(MinigamesManager.prototype, {});



    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

    /**
     * Starts an Activity and remove Kalulu Main Canvas
     * @param progressionNode {ProgressionNode} the node of the activity we want to start (i.e. a Lecture or a Minigame)
    **/
    MinigamesManager.prototype.startActivity = function startActivity (progressionNode, debugPanel) {
        console.log(progressionNode);
        // DEBUG TOOL TO REMOVE :
        if (progressionNode.discipline.id === "maths") {
            console.log("debug maths here");
            console.log(progressionNode);
        }

        this._currentProgressionNode = progressionNode;
        this._debugPanel = debugPanel;

        var functionName = 'start' + progressionNode.activityType.capitalise();
        this[functionName]();
    };

    MinigamesManager.prototype.startAssessment = function startAssessment (progressionNode, debugPanel) {
        console.log("[MinigamesManager] Starting Assessment");
        console.log(progressionNode);

        this._currentProgressionNode = progressionNode;
        this._debugPanel = debugPanel;

        var activities = progressionNode.activityType;
        
        console.log(activities);
        var functionName = 'start' + activities[0].capitalise();
        this[functionName]();
    };

    MinigamesManager.prototype.startBonusMinigame = function startBonusMinigame (debugPanel) {
        this._currentProgressionNode = null;
        var Launcher = Config.minigames.patrimath;
        console.log(Launcher);
        this._currentMinigame = new Launcher(this._getInterface(debugPanel));
    };

    MinigamesManager.prototype.startDebugActivity = function startDebugActivity (progressionNode) {

        this._currentProgressionNode = progressionNode;

        var debugInterface = this._getInterface();
        var debugPanel = new dat.GUI();

        debugPanel.add(this, "_debugGetDifficultyParams");
        debugPanel.add(debugInterface, "getPedagogicData");
        debugPanel.add(this, "_debugSave");

        return;
    };

    /**
     * Provide the interface of Kalulu for Minigames
     * @private
     * @return an object containing 3 functions ready to be called
    **/
    MinigamesManager.prototype._getInterface = function _getInterface (debugPanel, node) {

        //this._currentProgressionNode = node;

        return {
            discipline          : node ? node.discipline.type.toLowerCase() : null,
            getDifficultyLevel  : this._getDifficultyParams.bind(this),
            getPedagogicData    : this._getPedagogicData.bind(this), // We let to the discipline module the logic of providing the appropriate setup depending on the node
            latestRecord        : this._getLatestRecord(),
            save                : this._saveMiniGameData.bind(this),
            close               : this._closeMiniGame.bind(this),
            MinigameDstRecord   : MinigameDstRecord,
            StimulusApparition  : StimulusApparition,
            debugPanel          : debugPanel,
            recordResponseOnWord : function () { console.warn("Not Implemented"); },
            recordResponseOnSentence : function () { console.warn("Not Implemented"); }
        };
    };


    MinigamesManager.prototype._getDifficultyParams = function _getDifficultyParams () {
        return this._currentProgressionNode.discipline.getDifficultyParams(this._currentProgressionNode);
    };


    /**
     * Record the setup and return it.
     * @private
     * @return the activity setup
    **/
    MinigamesManager.prototype._getPedagogicData = function _getPedagogicData (params) {
        // We let to the discipline module the logic of providing the appropriate setup depending on the node :
        this._latestSetupSent = this._currentProgressionNode.discipline.getPedagogicData(this._currentProgressionNode, params);

        console.log("Pedagogic Data Received : ");
        console.log(this._latestSetupSent);

        return this._latestSetupSent;
    };

    MinigamesManager.prototype._getLatestRecord = function _getLatestRecord () {
        return this._currentProgressionNode.discipline.getLatestRecord(this._currentProgressionNode);
    };

    /**
     * Records the result of a minigame in the player's profile
     * @private
     * @param results {object} the results of the Minigame
    */
    MinigamesManager.prototype._saveMiniGameData = function _saveMiniGameData (data) {
        
        console.info("[MinigamesManager] Received request for minigame data saving");
        
        if (this._currentProgressionNode) {
            this._gameManager.Rafiki.savePedagogicResults(this._currentProgressionNode, data);
        }
        else {
            this._saveBonusGameData(data);
        }
    };

    MinigamesManager.prototype._debugGetDifficultyParams = function _debugGetDifficultyParams () {
        console.log(this._currentProgressionNode.discipline.getDifficultyParams(this._currentProgressionNode));
    };

    /**
     * Records the result of a minigame in the player's profile
     * @private
     * @param results {object} the results of the Minigame
    */
    MinigamesManager.prototype._saveBonusGameData = function _saveBonusGameData (data) {
        
        console.info("[MinigamesManager] Received request for minigame data saving");
        this._gameManager.currentPlayer.saveResults(this._currentProgressionNode, record);
    };


    /**
     * Reactivate Kalulu Canvas and reopens the current LessonScreen
     * @private
    */
    MinigamesManager.prototype._closeMiniGame = function _closeMiniGame () {
        
        this._currentMinigame = null;
        this._gameManager.onCloseActivity(this._currentProgressionNode);
        Timer.stop();
    };


    // ##############################################################################################################################################
    // ###  DEBUG METHODS  ##########################################################################################################################
    // ##############################################################################################################################################

    /**
     * Send a fake dataset to save the game as a Success
     * @private
    **/
    MinigamesManager.prototype._debugSave =  function _debugSave () {
        //console.log(this._currentProgressionNode);
        
        var activityType = this._currentProgressionNode.activityType;
        var data;

        if (activityType === "lecture") {
            data =  {
                test : 1,
                isCompleted : true,
                setup : this._latestSetupSent
            };
        }
        else {
            if (true) {
                data = {
                    key : "value"
                };
            }
        }

        this._saveMiniGameData(data);
    };

    /**
     * Force close the minigame
     * @private
    **/
    MinigamesManager.prototype._debugClose =  function _debugClose () {

        this._currentMinigame.destroy();

        var canvases = document.getElementsByClassName("canvas");
        
        if (canvases.length > 1) {
            console.log("Canvas manually removed");
            for (var i = 0 ; i < canvases.length ; i++) {
                if (canvases[i].id !== this._displayManager.mainCanvasName) {
                    document.removeChild(canvases[i]);
                }
            }
        }

        this._closeMiniGame();
    };


    MinigamesManager.prototype.launchGame = function launchGame (Launcher) {
        
        this._currentMinigame = new Launcher(this._getInterface(this._debugPanel, this._currentProgressionNode));
        this._currentProgressionNode.isStarted = true;
        Timer.start();
    };
    
    MinigamesManager.prototype.startAnts = function startAnts () {
        if (this.launchers.ants) {
            this.launchGame(this.launchers.ants);
        }
        else {
            require.ensure(['phaser-bundle'], function () {
                
                this.launchers.ants = require('ants/src');
                console.log('Look And Learn Ready');
                this.launchGame(this.launchers.ants);
                
            }.bind(this));            
        }
    };

    MinigamesManager.prototype.startCaterpillar = function startCaterpillar () {
        if (this.launchers.ants) {
            this.launchGame(this.launchers.caterpillar);
        }
        else {
            require.ensure(['phaser-bundle'], function () {
                
                this.launchers.caterpillar = require('caterpillar/src');
                console.log('Caterpillar Ready');
                this.launchGame(this.launchers.caterpillar);
                
            }.bind(this));           
        }
    };

    MinigamesManager.prototype.startCrabs = function startCrabs () {
        if (this.launchers.crabs) {
            this.launchGame(this.launchers.crabs);
        }
        else {
            require.ensure(['phaser-bundle'], function () {
                
                this.launchers.crabs = require('crabs/src');
                console.log('Crabs Ready');
                this.launchGame(this.launchers.crabs);
                
            }.bind(this));    
        }
    };

    MinigamesManager.prototype.startFish = function startFish () {
        if (this.launchers.fish) {
            this.launchGame(this.launchers.fish);
        }
        else {
            require.ensure(['phaser-bundle'], function () {
                
                this.launchers.fish = require('fish/src');
                console.log('Fish Ready');
                this.launchGame(this.launchers.fish);
                
            }.bind(this));
        }
    };

    MinigamesManager.prototype.startFrog = function startFrog () {
        if (this.launchers.frog) {
            this.launchGame(this.launchers.frog);
        }
        else {
            require.ensure(['phaser-bundle'], function () {
                
                this.launchers.frog = require('frog/src');
                console.log('Frog Ready');
                this.launchGame(this.launchers.frog);
                
            }.bind(this));
        }
    };

    MinigamesManager.prototype.startJellyfish = function startJellyfish () {
        if (this.launchers.jellyfish) {
            this.launchGame(this.launchers.jellyfish);
        }
        else {
            require.ensure(['phaser-bundle'], function () {
                
                this.launchers.jellyfish = require('jellyfish/src');
                console.log('Jellyfish Ready');
                this.launchGame(this.launchers.jellyfish);
                
            }.bind(this));
        }
    };

    MinigamesManager.prototype.startLookandlearn = function startLookAndLearn () {
        if (this.launchers.lookandlearn) {
            this.launchGame(this.launchers.lookandlearn);
        }
        else {
            require.ensure(['phaser-bundle'], function () {
                
                this.launchers.lookandlearn = require('lookandlearn/src');
                console.log('Look And Learn Ready');
                this.launchGame(this.launchers.lookandlearn);
                
            }.bind(this));
        }
    };

    MinigamesManager.prototype.startMonkeys = function startMonkeys () {
        if (this.launchers.monkeys) {
            this.launchGame(this.launchers.monkeys);
        }
        else {
            require.ensure(['phaser-bundle'], function () {
                
                this.launchers.monkeys = require('monkeys/src');
                console.log('Monkeys Ready');
                this.launchGame(this.launchers.monkeys);
                
            }.bind(this));
        }
    };

    MinigamesManager.prototype.startParakeets = function startParakeets () {
        if (this.launchers.parakeets) {
            this.launchGame(this.launchers.parakeets);
        }
        else {
            require.ensure(['phaser-bundle'], function () {
                
                this.launchers.parakeets = require('parakeets/src');
                console.log('Parakeets Ready');
                this.launchGame(this.launchers.parakeets);
                
            }.bind(this));
        }
    };

    MinigamesManager.prototype.startPatrimath = function startPatrimath () {
        if (this.launchers.patrimath) {
            this.launchGame(this.launchers.patrimath);
        }
        else {
            require.ensure(['phaser-bundle'], function () {
                
                this.launchers.patrimath = require('patrimath/src');
                console.log('Patrimath Ready');
                this.launchGame(this.launchers.patrimath);
                
            }.bind(this));
        }
    };

    MinigamesManager.prototype.startTurtles = function startTurtles () {
        if (this.launchers.turtles) {
            this.launchGame(this.launchers.turtles);
        }
        else {
            require.ensure(['phaser-bundle'], function () {
                
                this.launchers.turtles = require('turtles/src');
                console.log('Turtles Ready');
                this.launchGame(this.launchers.turtles);
                
            }.bind(this));
        }
    };

    return MinigamesManager;
});