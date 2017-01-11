define([
    './jellyfish',
    'common/src/fx',
    'dat.gui'
], function (
    Jellyfish,
    Fx,
    Dat
) {
    'use strict';

    /**
     * Remediation is in charge of all the local Remediation and game loop
     * WARNING : PLEASE COMMENT EVERYTHING RELATED TO THE GAME DESIGN TOOL WHEN DONE
	 * @class
     * @extends Phaser.Group
     * @memberof Jellyfish
	 * @param game {Phaser.Game} game instance
	**/
    function Remediation (game) {
        
        Phaser.Group.call(this, game);
        
        this.eventManager = game.eventManager;

        // parameters reset
        this.lives = 0;
        this.consecutiveMistakes = 0;
        this.consecutiveSuccess = 0;
        this.timeWithoutClick = 0;
        this.framesToWaitBeforeNextSpawn = 0;
        this.framesToWaitBeforeNewSound = 0;
        this.jellyfishes = [];
        this.jellyfishesSpawned = 0;
        this.targetJellyfishesSpawned = 0;
        this.distracterJellyfishesSpawned = 0;
        
        this.paused = false;
        this.won = false;

        // Initialisation
        this.fx = new Fx(game);
        this.initSounds(game);

        this.initGame();
        this.initRound(0);
        this.initEvents();

        // Debug & Tuning
        if (this.game.gameConfig.globalVars) window.jellyfishes.jellyfishes = this.jellyfishes;

        if (this.game.gameConfig.debugPanel) {
            this.setupDebugPanel();
        }
    }

    Remediation.prototype = Object.create(Phaser.Group.prototype);
    Remediation.prototype.constructor = Remediation;

    /**
     * Initialize game sounds
     * @private
     **/
    Remediation.prototype.initSounds = function (game) {
        this.sounds = {};

        this.sounds.right = game.add.audio('right');
        this.sounds.wrong = game.add.audio('wrong');
        this.sounds.winGame = game.add.audio('winGame');
        this.sounds.loseGame = game.add.audio('loseGame');
        this.sounds.roundsSounds = [];
    };

    /** 
     * Initalize game events
     **/
    Remediation.prototype.initEvents = function () {
        
        this.eventManager.on('clicked', function (jellyfish) {
            // console.log("clicked");
            // console.log(jellyfish);
            this.timeWithoutClick = 0;
            this.addClick(jellyfish);
            this.paused = true;
            this.game.world.bringToTop(this.fx);

            if (jellyfish.apparition.isCorrect) {
                this.eventManager.emit('success'); //listenned by Ui
                this.fx.hit(jellyfish.x, jellyfish.y + jellyfish.jellyfishSprite.height / 2, true);
                this.sounds.right.play();
                this.success();
                jellyfish.jellyfishSprite.animations.play('happy'); //listenned by Jellyfish
            }
            else {
                this.eventManager.emit('fail');//listenned by Ui
                this.fx.hit(jellyfish.x, jellyfish.y + jellyfish.jellyfishSprite.height / 2, false);
                this.sounds.wrong.play();
                this.fail();
            }
        }, this);

        this.eventManager.on('playCorrectSound', function () {
            this.eventManager.emit('unPause'); //listenned by Ui and Jellyfish

            if (this.framesToWaitBeforeNewSound <= 0) {
                this.sounds.correctResponse.play();
                this.framesToWaitBeforeNewSound = Math.floor((this.sounds.correctResponse.totalDuration + 0.5) * 60);
            }
        }, this);

        this.eventManager.on('playCorrectSoundNoUnPause', function () {
            if (this.framesToWaitBeforeNewSound <= 0) {
                this.sounds.correctResponse.play();
                this.framesToWaitBeforeNewSound = Math.floor((this.sounds.correctResponse.totalDuration + 0.5) * 60);
            }
        }, this);

        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);

        // this.eventManager.on('endGameLoose', function () {
        //     this.endGameLoose();
        // }, this);

        this.eventManager.on('exitGame', function () {
            if (this.game.gameConfig.debugPanel) this.clearDebugPanel();
            this.game.rafiki.close();
            this.eventManager.removeAllListeners();
            this.eventManager = null;
            this.game.destroy();
            console.info("Phaser Game has been destroyed");
            this.game = null;
        }, this);

        this.eventManager.on('replay', function () {
            if (this.game.gameConfig.debugPanel) {
                this.clearDebugPanel();
            }
            
            this.game.eventManager.removeAllListeners();
            this.game.eventManager = undefined;            
            this.game.state.start('Setup');
        }, this);
    };

    Remediation.prototype.closeCurrentGame = function closeCurrentGame () {
        this.deleteJellyfishes();
    };

    /**
     * Init a new game with remediation parameters from Rafiki.
    **/
	Remediation.prototype.initGame = function initGame () {
        
        var params = this.game.params;

        // Setting up the recording of the game for Rafiki
        this.game.record = new this.game.rafiki.MinigameDstRecord();

        this.results = this.game.pedagogicData; // for convenience we reference also the pedagogicData object under the name 'results' because we will add response data directly on it.
        this.consecutiveMistakes = 0;
        this.consecutiveSuccess = 0;
        this.triesRemaining = params.getGlobalParams().totalTriesCount;
        this.lives = params.getGeneralParams().lives;

        this.won = false;
    };

    /**
     * Initialise parameters for the required round with data contained in this.pedagogicData
     **/
    Remediation.prototype.initRound = function initRound (roundIndex) {
        
        var roundData = this.game.pedagogicData.data.rounds[roundIndex];
        this.roundType = roundData.steps[0].type;
        this.apparitionsCount = 0;
        this.framesToWaitBeforeNextSpawn = 0;
        this.framesToWaitBeforeNewSound = 0;
        
        this.falseResponses = [];
        this.falseResponsesCurrentPool = [];
        this.correctResponse = {};

        var length = roundData.steps[0].stimuli.length;
        var stimulus;
        for (var i = 0; i < length; i++) {
            stimulus = roundData.steps[0].stimuli[i];
            if (stimulus.correctResponse === true) {
                if (this.game.discipline != "maths") this.sounds.correctResponse = this.game.add.audio(stimulus.value.toLowerCase());
                else this.sounds.correctResponse = this.game.add.audio(stimulus.value);
                this.correctResponse.value = stimulus.value;
            }

            else {
                this.falseResponses.push(stimulus.value);
            }

            stimulus.apparitions = [];
        }

    };

    /**
     * WARNING : only for ONE rounds games
     **/
    Remediation.prototype.addClick = function (jellyfish) {
        jellyfish.apparition.close(true, 0); // TODO : 0 to be replaced by the elapsedTime of the customTimer.

    };

    /**
     * Triggers onSuccess events
     **/
    Remediation.prototype.success = function () {
        
        this.triesRemaining--;
        this.consecutiveSuccess++;
        this.consecutiveMistakes = 0;

        if (this.triesRemaining > 0) {
            if (this.consecutiveSuccess % 2 === 0) { // Increment difficulty
                
                if (this.game.gameConfig.debugPanel) this.cleanLocalPanel();
                this.game.params.increaseLocalDifficulty();
                if (this.game.gameConfig.debugPanel) this.setLocalPanel();
            }

            var context = this;
            setTimeout(function () { // Not ideal because cannot be paused
                context.eventManager.emit('unPause');
            }, 1500);

        }
        else {
            this.gameOverWin();
        }
    };

    /**
     * Triggers on fail events
     **/
    Remediation.prototype.fail = function () {
        var params = this.game.params.getGeneralParams();
        this.lives--;
        this.triesRemaining--;
        this.consecutiveMistakes++;
        this.consecutiveSuccess = 0;

        if (this.lives > 0 && this.triesRemaining > 0) { // game continues, remediation can be triggered
            
            if (this.consecutiveMistakes === params.incorrectResponseCountTriggeringFirstRemediation) { //Triggers kalulu's help + lowers difficulty
                
                var context = this;
                setTimeout(function () {
                    context.eventManager.emit('playCorrectSound');//listened here; check initEvents
                }, 1000);
                
                if (this.game.gameConfig.debugPanel) this.cleanLocalPanel();
                this.game.params.decreaseLocalDifficulty();
                if (this.game.gameConfig.debugPanel) this.setLocalPanel();
            }
            else if (this.consecutiveMistakes === params.incorrectResponseCountTriggeringSecondRemediation) {
                
                this.eventManager.emit('help'); // listened by Kalulu to start the help speech; pauses the game in kalulu
                if (this.game.gameConfig.debugPanel) this.cleanLocalPanel();
                this.game.params.decreaseLocalDifficulty();
                if (this.game.gameConfig.debugPanel) this.setLocalPanel();
                //TODO : implement the highlight of the targetJellys
                this.consecutiveMistakes = 0; // restart the remediation
            }
        }
        else if (this.triesRemaining === 0 && this.lives > 0) {
            this.gameOverWin();
        }
        else {
            this.gameOverLose();
        }
    };



    /**
     * deletes all jellyfishes
     * @private
     **/
    Remediation.prototype.deleteJellyfishes = function () {
        var length = this.jellyfishes.length;
        for (var i = 0; i < length; i++) {
            this.jellyfishes.pop().destroy();
        }
    };

    /**
     * spawn jellyfishes
     * Check gameDesign settings
     **/
    Remediation.prototype.manageJellyfishesSpawning = function manageJellyfishesSpawning () {
        
        var generalParams = this.game.params.getGeneralParams();
        var globalParams = this.game.params.getGlobalParams();
        var localParams = this.game.params.getLocalParams(); // get the latest localParams (localParams can change anytime during the game following player's inputs)

        this.framesToWaitBeforeNextSpawn--;
        var jellyfishesCountToAdd = globalParams.jellyfishesOnScreen - this.jellyfishesSpawned;

        var str = "--> missing " + jellyfishesCountToAdd + "( "+ this.jellyfishesSpawned + " vs. " + globalParams.jellyfishesOnScreen + " required)";
        // console.log(str);
        // console.info("frames before new " + this.framesToWaitBeforeNextSpawn);
        if (jellyfishesCountToAdd === 0) {
            console.log("engough jellies on screen");
            return;
        }
        else if (jellyfishesCountToAdd > 0 && this.framesToWaitBeforeNextSpawn <= 0) {

            this.spawnJellyfish();
            
        }
    };

    Remediation.prototype.spawnJellyfish = function spawnJellyfish () {
        
        var localParams = this.game.params.getLocalParams();
        var globalParams = this.game.params.getGlobalParams();
        var isTargetValue, columnNumber, lJellyfish, j, apparition;
        var value = {};

        // determine if we need a target or a distracter
        if (this.targetJellyfishesSpawned < localParams.minimumCorrectStimuliOnScreen && this.apparitionsCount > globalParams.jellyfishesOnScreen/2) {
            isTargetValue = true; // we spawn a correct answer stimulus
        }
        else if (this.targetJellyfishesSpawned >= localParams.maximumCorrectStimuliOnScreen && this.apparitionsCount > globalParams.jellyfishesOnScreen/2) {
            isTargetValue = false; // we spawn an incorrect answer stimulus
        }
        else {
            isTargetValue = Math.round(Math.random()); // we spawn an random answer stimulus (50/50)
        }

        if (isTargetValue) {
            value.text = this.correctResponse.value;
            //console.log("value : " + value);
        }
        else {
            if (this.falseResponsesCurrentPool.length === 0) {
                this.falseResponsesCurrentPool = this.falseResponsesCurrentPool.concat(this.falseResponses.slice(0));
                this.falseResponsesCurrentPool = this.falseResponsesCurrentPool.concat(this.falseResponses.slice(0));
                //console.log(this.falseResponsesCurrentPool);
                // we do it two times to have 2 times each false response in the pool.
            }
            value.text = this.falseResponsesCurrentPool.splice(Math.floor(Math.random() * this.falseResponsesCurrentPool.length), 1)[0]; // Picks a random value in all the false response values
            // console.log(this.falseResponsesCurrentPool.length + " distracters remaining in the pool");
            // console.log("value : " + value + " of type " + typeof value);
        }

        columnNumber = Math.floor(Math.random() * globalParams.columnCount) + 1;

        if (this.game.discipline == "maths" && this.roundType == "audioToNonSymbolic") value.picture = true;
        else value.picture = false;
        lJellyfish = new Jellyfish(columnNumber * this.game.width / (globalParams.columnCount + 1), this.game, value, localParams.speed);
        this.jellyfishes.push(lJellyfish);

        j = 0;
        console.log(this.results);
        while (this.results.data.rounds[0].steps[0].stimuli[j].value != value.text) { //finds the value in the results to add one apparition
            j++;
        }
        apparition = new this.game.rafiki.StimulusApparition(isTargetValue);

        this.results.data.rounds[0].steps[0].stimuli[j].apparitions.push(apparition);
        lJellyfish.apparition = apparition;
        this.apparitionsCount++;
        this.framesToWaitBeforeNextSpawn = localParams.respawnTime * 60;
    };

    /**
     * Close the apparitions of exited jellyfishes, calls the spawner, increment frame counters
     **/
    Remediation.prototype.update = function () {
        
        if (this.framesToWaitBeforeNewSound > 0) this.framesToWaitBeforeNewSound--;

        if (this.paused) return;

        this.jellyfishesSpawned = this.jellyfishes.length;
        this.targetJellyfishesSpawned = 0;
        this.distracterJellyfishesSpawned = 0;

        for (var i = this.jellyfishesSpawned - 1; i >= 0 ; i--) {
            
            var lJelly = this.jellyfishes[i];

            if (lJelly.hasExitedScreen) {
                if(!lJelly.apparition.isClicked) {
                    lJelly.apparition.close(false, 0);
                }
                
                this.jellyfishes.splice(i, 1)[0].destroy();
            }
            else {
                if (lJelly.apparition.isCorrect) {
                    this.targetJellyfishesSpawned++;
                }
                else {
                    this.distracterJellyfishesSpawned++;
                }
            }
        }

        this.timeWithoutClick++;

        if (this.timeWithoutClick > 60 * 20) {
            this.timeWithoutClick = 0;
            this.eventManager.emit('help');
        }

        // var str = "####\n"+
        // "+ " + this.targetJellyfishesSpawned + "\n" +
        // "+ " + this.distracterJellyfishesSpawned + "\n" +
        // "= " + this.jellyfishesSpawned;
        // console.log(str);

        this.manageJellyfishesSpawning();
    };


    Remediation.prototype.gameOverWin = function gameOverWin () {
        
        this.game.won = true;
        this.sounds.winGame.play();
        this.eventManager.emit('offUi');// listened by ui

        this.sounds.winGame.onStop.add(function () {
            this.sounds.winGame.onStop.removeAll();
            this.eventManager.emit('GameOverWin');//listened by Ui (toucan = kalulu)
            this.saveGameRecord();
        }, this);
    };

    Remediation.prototype.gameOverLose = function gameOverLose () {
        
        this.game.won = false;
        this.sounds.loseGame.play();
        this.eventManager.emit('offUi');// listened by ui

        this.sounds.loseGame.onStop.add(function () {
            this.sounds.loseGame.onStop.removeAll();
            this.eventManager.emit('GameOverLose');// listened by ui
            this.saveGameRecord();
        }, this);
    };

    Remediation.prototype.saveGameRecord = function saveGameRecord () {
        this.game.record.close(this.game.won, this.results, this.game.params.localRemediationStage);
        this.game.rafiki.save(this.game.record);
    };

    // DEBUG

    Remediation.prototype.setupDebugPanel = function setupDebugPanel () {
        if (this.game.debugPanel) {
            this.debugPanel = this.game.debugPanel;
            this.rafikiDebugPanel = true;
        }
        else {
            this.debugPanel = new Dat.GUI();
            this.rafikiDebugPanel = false;
        }

        var globalLevel = this.game.params.globalLevel;

        this.debugFolderNames = {
            info      : "Level Info",
            general   : "General Parameters",
            global    : "Global Parameters",
            local     : "Local Parameters",
            functions : "Debug Functions",
        };
        
        this._debugInfo          = this.debugPanel.addFolder(this.debugFolderNames.info);
        this._debugGeneralParams = this.debugPanel.addFolder(this.debugFolderNames.general);
        this._debugGlobalParams  = this.debugPanel.addFolder(this.debugFolderNames.global);
        this._debugLocalParams   = this.debugPanel.addFolder(this.debugFolderNames.local);
        this._debugFunctions     = this.debugPanel.addFolder(this.debugFolderNames.functions);
        
        this._debugInfo.add(this.game.params, "_currentGlobalLevel").listen();
        this._debugInfo.add(this.game.params, "_currentLocalRemediationStage").listen();

        // SPECIFIC TO THIS GAME
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringFirstRemediation").min(1).max(5).step(1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringSecondRemediation").min(1).max(5).step(1).listen();

        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "lives").min(1).max(5).step(1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "capitalLettersShare").min(0).max(1).step(0.05).listen();

        this._debugGlobalParams.add(this.game.params._settingsByLevel[globalLevel].globalRemediation, "jellyfishesOnScreen").min(1).max(30).step(1).listen();
        this._debugGlobalParams.add(this.game.params._settingsByLevel[globalLevel].globalRemediation, "columnCount").min(1).max(10).step(1).listen();

        this.setLocalPanel();
        // END OF SPECIFIC


        this._debugFunctions.add(this, "AutoWin");
        this._debugFunctions.add(this, "AutoLose");
        this._debugFunctions.add(this, "skipKalulu");
        this._debugFunctions.open();
    };

    Remediation.prototype.clearDebugPanel = function clearDebugPanel () {
        if(this.rafikiDebugPanel) {
            this.debugPanel.removeFolder(this.debugFolderNames.info);
            this.debugPanel.removeFolder(this.debugFolderNames.general);
            this.debugPanel.removeFolder(this.debugFolderNames.global);
            this.debugPanel.removeFolder(this.debugFolderNames.local);
            this.debugPanel.removeFolder(this.debugFolderNames.functions);
        }
        else {
            this.debugPanel.destroy();
        }
    };

    Remediation.prototype.cleanLocalPanel = function cleanLocalPanel () {

        for (var element in this._debugLocalParams.items) {
            if (!this._debugLocalParams.items.hasOwnProperty(element)) continue;
            this._debugLocalParams.remove(this._debugLocalParams.items[element]);
        }
    };

    Remediation.prototype.setLocalPanel = function setLocalPanel () {
        
        var globalLevel = this.game.params.globalLevel;
        var localStage = this.game.params.localRemediationStage;
        
        this._debugLocalParams.items = {};
        this._debugLocalParams.items.param1 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "minimumCorrectStimuliOnScreen").min(0).max(20).step(1).listen();
        this._debugLocalParams.items.param2 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "maximumCorrectStimuliOnScreen").min(0).max(20).step(1).listen();
        this._debugLocalParams.items.param3 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "respawnTime").min(1).max(5).step(0.1).listen();
        this._debugLocalParams.items.param4 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "speed").min(1).max(20).step(0.5).listen();
    };

    Remediation.prototype.AutoWin = function WinGameAndSave () {

        var apparition;
        for (var i = 0 ; i < this.results.data.rounds.length ; i++) {
            
            for (var j = 0 ; j < this.results.data.rounds[i].steps[0].stimuli.length ; j++) {
                
                if (this.results.data.rounds[i].steps[0].stimuli[j].correctResponse) {
                    
                    for (var k = 0 ; k < this.triesRemaining ; k++) {
                        apparition = new this.game.rafiki.StimulusApparition(true);
                        apparition.close(true, 3);
                        if (!this.results.data.rounds[i].steps[0].stimuli[j].apparitions) this.results.data.rounds[i].steps[0].stimuli[j].apparitions = [];
                        this.results.data.rounds[i].steps[0].stimuli[j].apparitions.push(apparition);
                    }
                }
                else {
                    for (var l = 0 ; l < 3 ; l++) {

                        apparition = new this.game.rafiki.StimulusApparition(false);
                        apparition.close(false);
                        if (!this.results.data.rounds[i].steps[0].stimuli[j].apparitions) this.results.data.rounds[i].steps[0].stimuli[j].apparitions = [];
                        this.results.data.rounds[i].steps[0].stimuli[j].apparitions.push(apparition);
                    }
                }
            }
        }

        this.gameOverWin();
    };
	
	Remediation.prototype.AutoLose = function LoseGame() {

        var apparition;
        for (var i = 0 ; i < this.results.data.rounds.length ; i++) {
            
            for (var j = 0 ; j < this.results.data.rounds[i].steps[0].stimuli.length ; j++) {
                
                if (this.results.data.rounds[i].steps[0].stimuli[j].correctResponse) {
                    
                    for (var k = 0 ; k < this.triesRemaining ; k++) {
                        apparition = new this.game.rafiki.StimulusApparition(true);
                        apparition.close(false);
                        if (!this.results.data.rounds[i].steps[0].stimuli[j].apparitions) this.results.data.rounds[i].steps[0].stimuli[j].apparitions = [];
                        this.results.data.rounds[i].steps[0].stimuli[j].apparitions.push(apparition);
                    }
                }
                else {
                    for (var l = 0 ; l < 3 ; l++) {

                        apparition = new this.game.rafiki.StimulusApparition(false);
                        apparition.close(true, 3);
                        if (!this.results.data.rounds[i].steps[0].stimuli[j].apparitions) this.results.data.rounds[i].steps[0].stimuli[j].apparitions = [];
                        this.results.data.rounds[i].steps[0].stimuli[j].apparitions.push(apparition);
                    }
                }
            }
        }

        this.gameOverLose();
    };
    
    Remediation.prototype.skipKalulu = function skipKalulu() {
        this.eventManager.emit("skipKalulu");
    };

    return Remediation;
});