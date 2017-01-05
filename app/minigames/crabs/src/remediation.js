(function () {
    'use strict';

    var Phaser = require('phaser-bundle');
    var Crab = require('./crab');
    var Fx = require('common/src/fx');
    var Dat = require('dat.gui');

    // CONSTRUCTOR
    var Remediation = function (game) {

        Phaser.Group.call(this, game);

        this.game = game;
        this.eventManager = game.eventManager;

        // Initialisation

        this.fx = new Fx(game);
        this.initSounds(game);

        this.initGame();
        console.log("game"+this.game)
        console.log("Current Round"+this.currentRound)
        this.initRound(this.currentRound);
        this.initEvents();

        this.initCrabs(game);

        // Debug & Tuning
        if (this.game.gameConfig.debugPanel) {
            this.setupDebugPanel();
        }
    };

    Remediation.prototype = Object.create(Phaser.Group.prototype);
    Remediation.prototype.constructor = Remediation;

    // METHODS

    Remediation.prototype.initSounds = function (game) {
        this.sounds = {};

        this.sounds.right = game.add.audio('right');
        this.sounds.wrong = game.add.audio('wrong');
        this.sounds.winGame = game.add.audio('winGame');
        this.sounds.loseGame = game.add.audio('loseGame');
        this.sounds.correctRoundAnswer = null;
    };

    Remediation.prototype.initGame = function initGame() {

        var params = this.game.params;

        // Setting up the recording of the game for Rafiki
        this.game.record = new this.game.rafiki.MinigameDstRecord();

        this.results = this.game.pedagogicData; // for convenience we reference also the pedagogicData object under the name 'results' because we will add response data directly on it.

        this.consecutiveMistakes = 0;
        this.consecutiveSuccess = 0;

        this.framesToWaitBeforeNextSpawn = 0;
        this.timerCorrectResponse = 0;
        this.timeWithoutClick = 0;

        this.highlightNextSpawn = false;

        this.totalRounds = params.getGlobalParams().roundsCount;
        this.currentRound = 0;
        this.lives = params.getGeneralParams().lives; // this will decrease at each failed click. Game ends when reach 0.
        this.triesRemaining = this.totalRounds; // this will decrease at each click, successful or not. Game ends when reach 0.

        this.paused = false;
        this.won = false;

        this.crabs = [];
        console.log("Lives remaining : " + this.lives);
    };

    Remediation.prototype.initRound = function initRound(roundIndex) {
        console.log(this.game.pedagogicData);
        var roundData = this.game.pedagogicData.data.rounds[roundIndex];
        console.log(roundData);
        this.apparitionsCount = 0;
        this.framesToWaitBeforeNextSpawn = 0;
        this.framesToWaitBeforeNewSound = 0;
        this.targetCrabsEnabled = 0;
        this.crabEnabled = 0;

        this.falseResponses = [];
        this.falseResponsesCurrentPool = [];
        this.correctResponse = {};

        var length = roundData.steps[0].stimuli.length;
        var stimulus;

        for (var i = 0; i < length; i++) {
            stimulus = roundData.steps[0].stimuli[i];
            if (stimulus.correctResponse === true) {
                this.sounds.correctRoundAnswer = this.game.add.audio(stimulus.value.toString().toLowerCase());
                console.log("adding target sound");
                console.log(this.sounds.correctRoundAnswer);
                this.correctResponse.value = stimulus.value;
                if (this.game.discipline == "maths") {
                    this.correctResponse.alternativeValue = stimulus.alternative;
                    this.correctResponse.alternativePicture = stimulus.alternativePicture;
                }
            }

            else {
                var falseReponse = {};

                falseReponse.value = stimulus.value;
                if (this.game.discipline == "maths") {
                    falseReponse.alternativeValue = stimulus.alternative;
                    falseReponse.alternativePicture = stimulus.alternativePicture;
                }

                this.falseResponses.push(falseReponse);
            }

            stimulus.apparitions = [];
        }
        console.log("Lives remaining : " + this.lives);
    };

    Remediation.prototype.initEvents = function () {
        this.eventManager.on('clicked', this.onClickOnCrab, this);

        this.eventManager.on('playCorrectSound', function () {
            this.eventManager.emit('unPause');
            if (this.timerCorrectResponse <= 0) {
                this.sounds.correctRoundAnswer.play();
                this.timerCorrectResponse = Math.floor((this.sounds.correctRoundAnswer.totalDuration + 0.5) * 60);
            }
        }, this);

        this.eventManager.on('playCorrectSoundNoUnPause', function () {
            if (this.timerCorrectResponse <= 0) {
                this.sounds.correctRoundAnswer.play();
                this.timerCorrectResponse = Math.floor((this.sounds.correctRoundAnswer.totalDuration + 0.5) * 60);
            }
        }, this);

        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);

        this.eventManager.on('help', function () {
            this.highlightNextSpawn = true;
            for (var i = 0; i < this.crabs.length; i++) {
                if (this.crabs[i].isCorrectResponse) {
                    this.crabs[i].highlight.visible = true;
                }
            }
        }, this);

        

        this.eventManager.on('exitGame', function () {
            this.eventManager.removeAllListeners();
            this.eventManager = null;
            this.game.rafiki.close();
            if (this.game.gameConfig.debugPanel) this.clearDebugPanel();
            this.game.destroy();
        }, this);

        this.eventManager.on('replay', this.onClickOnReplay, this);
    };

    Remediation.prototype.initCrabs = function (game) {

        var holesCountByRow;
        var generalParams = this.game.params.getGeneralParams();
        var globalParams = this.game.params.getGlobalParams();
        var localParams = this.game.params.getLocalParams();

        switch (globalParams.holesCount) {
            case 3:
                holesCountByRow = [1, 2];
                break;
            case 5:
                holesCountByRow = [2, 3];
                break;
            case 7:
                holesCountByRow = [3, 4];
                break;
            case 9:
                holesCountByRow = [2, 3, 4];
                break;
            default:
                console.error('Required Holes Count is not valid. Please select a value from the following : [3, 5, 7, 9]');
                break;
        }

        for (var i = 0; i < holesCountByRow.length; i++) {
            for (var j = 0; j < holesCountByRow[i]; j++) {
                var durations = {};
                durations.timeDisplayed = localParams.apparitionsDuration;
                durations.durationApparition = generalParams.crabAppearanceAnimDuration;
                durations.durationDisappearance = generalParams.crabDisappearanceAnimDuration;
                var crab = new Crab((j + 1) * game.width / (holesCountByRow[i] + 1),
                    ((i + 1) * game.height / (holesCountByRow.length + 1)) + 100,
                    durations,
                    game);
                this.crabs.push(crab);
            }
        }
    };

    Remediation.prototype.deleteCrabs = function () {
        var length = this.crabs.length;
        for (var i = 0 ; i < length ; i++) {
            this.crabs.pop().destroy();
        }
    };
    Remediation.prototype.onClickOnCrab = function (crab) {
        this.timeWithoutClick = 0;
        this.triesRemaining--;
        console.log("tries remaining :" + this.triesRemaining);
        crab.apparition.close(true, 1000); // @TODO : ADD CUSTOM TIMER FOR ELAPSED TIME
        this.paused = true;
        this.game.world.bringToTop(this.fx);

        if (crab.isCorrectResponse) {
            this.eventManager.emit('success', crab);
            this.fx.hit(crab.crabSprite.world.x, crab.crabSprite.world.y, true);
            this.sounds.right.play();
            this.success();
            crab.success = true;
        }
        else {
            this.eventManager.emit('fail', crab);
            this.fx.hit(crab.crabSprite.world.x, crab.crabSprite.world.y, false);
            this.sounds.wrong.play();
            this.fail();
            crab.fail = true;
        }
    };

    Remediation.prototype.success = function () {

        this.currentRound++;
        this.consecutiveSuccess++;
        this.consecutiveMistakes = 0;
        console.log("new current round :" + (this.currentRound + 1) + " of " + this.totalRounds);
        console.log("consecutiveSuccess :" + this.consecutiveSuccess);
        console.log("consecutiveMistakes :" + this.consecutiveMistakes);

        if (this.triesRemaining > 0) {
            if (this.consecutiveSuccess % 2 === 0) {
                if (this.game.gameConfig.debugPanel) this.cleanLocalPanel();
                this.game.params.increaseLocalDifficulty();
                if (this.game.gameConfig.debugPanel) this.setLocalPanel();
            }


            setTimeout(function () {
                this.initRound(this.currentRound);
                this.eventManager.emit('playCorrectSound');
            }.bind(this), 500);
        }
        else {
            this.gameOverWon();
        }
    };

    Remediation.prototype.fail = function () {

        this.lives--;
        console.log("Lives remaining : " + this.lives);
        this.consecutiveMistakes++;
        this.consecutiveSuccess = 0;

        if (this.lives > 0) {
            if (this.triesRemaining > 0) {
                if (this.consecutiveMistakes % 2 === 0) {
                    this.eventManager.emit('help');                    
                    if (this.game.gameConfig.debugPanel) this.cleanLocalPanel();
                    this.game.params.decreaseLocalDifficulty();
                    if (this.game.gameConfig.debugPanel) this.setLocalPanel();
                }
                else {
                    this.eventManager.emit('playCorrectSound');
                }
            }
            else {
                this.gameOverWon();
            }
        }
        else {
            this.gameOverLose();
        }
    };


    Remediation.prototype.manageCrabsAppearances = function manageCrabsAppearances() {
        this.framesToWaitBeforeNextSpawn--;

        var localParams = this.game.params.getLocalParams();
        var crabsToSpawn = localParams.maxCrabsOnScreen - this.crabEnabled;

        if (crabsToSpawn > 0 && this.framesToWaitBeforeNextSpawn <= 0) {
            this.spawnCrab();
        }
    };

    Remediation.prototype.spawnCrab = function spawnCrab() {
        var localParams = this.game.params.getLocalParams();
        var isTargetValue, randomCrab, j, apparition;
        var value = {};

        // controlled random to determine if the crab should be a target or a distractor
        if (this.targetCrabsEnabled < localParams.minimumCorrectStimuliOnScreen) {
            isTargetValue = true;
        }
        else if (this.targetCrabsEnabled >= localParams.maximumCorrectStimuliOnScreen) {
            isTargetValue = false;
        }
        else {
            isTargetValue = Math.round(Math.random()) === 0 ? false : true;
        }

        // determination of value
        if (isTargetValue) {
            value.value = this.correctResponse.value;
            value.text = this.correctResponse.value;
            if (this.game.discipline == "maths") {
                if (Math.random() <= localParams.mathsAlternativePercentage) {
                    value.text = this.correctResponse.alternativeValue;
                    if (Math.random() <= localParams.mathsAlternativePicturePercentage) value.alternativePicture = this.correctResponse.alternativePicture;
                }
            }
        }
        else {
            if (this.falseResponsesCurrentPool.length === 0) {
                this.falseResponsesCurrentPool = this.falseResponsesCurrentPool.concat(this.falseResponses.slice(0));
                this.falseResponsesCurrentPool = this.falseResponsesCurrentPool.concat(this.falseResponses.slice(0));
                // we do it two times to have 2 times each false response in the pool.
            }
            var falseResponse = this.falseResponsesCurrentPool.splice(Math.floor(Math.random() * this.falseResponsesCurrentPool.length), 1)[0];
            value.value = falseResponse.value; // Picks a random value in all the false response values
            value.text = falseResponse.value;
            if (this.game.discipline == "maths") {
                if (Math.random() <= localParams.mathsAlternativePercentage) {
                    value.text = falseResponse.alternativeValue;
                    if (Math.random() <= localParams.mathsAlternativePicturePercentage) value.alternativePicture = falseResponse.alternativePicture;
                }
            }
        }
        console.log(this.falseResponsesCurrentPool,this.correctResponse)

        var disabledCrabs = this.getDisabledCrabs();
        randomCrab = disabledCrabs[Math.floor(Math.random() * this.getDisabledCrabs().length)];
        randomCrab.enabled = true;
        randomCrab.setValue(value.text, value.value, value.alternativePicture);
        randomCrab.isCorrectResponse = isTargetValue;
        if (this.highlightNextSpawn && isTargetValue) {
            randomCrab.highlight.visible = true;
            this.highlightNextSpawn = false;
        }

        j = 0;
        console.log(this.results);
        while (this.results.data.rounds[this.currentRound].steps[0].stimuli[j].value != value.value) { //finds the value in the results to add one apparition
            j++;
        }
        apparition = new this.game.rafiki.StimulusApparition(isTargetValue);

        this.results.data.rounds[this.currentRound].steps[0].stimuli[j].apparitions.push(apparition);
        randomCrab.apparition = apparition;
        this.apparitionsCount++;

        this.framesToWaitBeforeNextSpawn = localParams.respawnTime * 60;
    };

    Remediation.prototype.getDisabledCrabs = function getDisabledCrabs() {
        var disabledCrabs = [];
        for (var i = 0 ; i < this.crabs.length ; i++) {
            if (!this.crabs[i].enabled) disabledCrabs.push(this.crabs[i]);
        }
        return disabledCrabs;
    };



    Remediation.prototype.updateRemediation = function (bool) {

        //bool = true => success
        //bool = false => failed

        if (bool) {
            if (this.save.difficulty < 4) {
                this.save.difficulty++;
                this.loadGameDesign();
            }
        }

        else {
            if (this.save.difficulty > 0) {
                this.save.difficulty--;
                this.loadGameDesign();
            }
        }

        for (var i = 0; i < this.crabs.length; i++) {
            var durations = {};
            durations.timeDisplayed = this.gameDesign.timeDisplayed;
            durations.durationApparition = this.gameDesign.durationApparition;
            durations.durationDisappearance = this.gameDesign.durationDisappearance;
            this.crabs[i].updateDurations(durations);
        }
    };

    Remediation.prototype.update = function () {
        if (this.timerCorrectResponse > 0) this.timerCorrectResponse--;

        if (!this.paused) {
            this.manageCrabsAppearances();
            this.timeWithoutClick++;

            if (this.timeWithoutClick > 60 * 20) {
                this.timeWithoutClick = 0;
                this.eventManager.emit('help');
            }

        }
    };


    Remediation.prototype.gameOverWon = function gameOverWon() {
        this.game.won = true;
        this.sounds.winGame.play();
        this.eventManager.emit('offUi');// listened by ui to disble UI Buttons and add a black overlay

        this.sounds.winGame.onStop.add(function () {
            this.sounds.winGame.onStop.removeAll();
            this.eventManager.emit('GameOverWin'); // listened by UI to disable kaluluButton and by Kalulu to start final Speech
            this.saveGameRecord();
        }, this);
    };

    Remediation.prototype.gameOverLose = function gameOverLose() {
        this.game.won = false;
        this.sounds.loseGame.play();
        this.eventManager.emit('offUi');// listened by ui to disble UI Buttons and add a black overlay

        this.sounds.loseGame.onStop.add(function () {
            this.sounds.loseGame.onStop.removeAll();
            this.eventManager.emit('GameOverLose'); // listened by UI to disable kaluluButton and by Kalulu to start final Speech
            this.saveGameRecord();
        }, this);
    };

    Remediation.prototype.saveGameRecord = function saveGameRecord() {
        this.game.record.close(this.game.won, this.results, this.game.params.localRemediationStage);
        this.game.rafiki.save(this.game.record);
    };

    Remediation.prototype.onClickOnReplay = function onClickOnReplay() {

        if (this.game.gameConfig.debugPanel) {
            document.getElementsByClassName("dg main a")[0].remove();
            this.debug = null;
        }
        this.game.state.start('Setup');
    };


    // DEBUG

    Remediation.prototype.setupDebugPanel = function setupDebugPanel() {
        console.log("Crabs Setupping debug Panel");
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
            info: "Level Info",
            general: "General Parameters",
            global: "Global Parameters",
            local: "Local Parameters",
            functions: "Debug Functions",
        };

        this._debugInfo = this.debugPanel.addFolder(this.debugFolderNames.info);
        this._debugGeneralParams = this.debugPanel.addFolder(this.debugFolderNames.general);
        this._debugGlobalParams = this.debugPanel.addFolder(this.debugFolderNames.global);
        this._debugLocalParams = this.debugPanel.addFolder(this.debugFolderNames.local);
        this._debugFunctions = this.debugPanel.addFolder(this.debugFolderNames.functions);

        this._debugInfo.add(this.game.params, "_currentGlobalLevel").listen();
        this._debugInfo.add(this.game.params, "_currentLocalRemediationStage").listen();

        // SPECIFIC TO THIS GAME
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "crabAppearanceAnimDuration").min(0).max(5).step(0.1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "crabDisappearanceAnimDuration").min(0).max(5).step(0.1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "secondsOfPauseAfterCorrectResponse").min(0).max(5).step(0.1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "secondsOfPauseAfterIncorrectResponse").min(0).max(5).step(0.1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringFirstRemediation").min(1).max(5).step(1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringSecondRemediation").min(2).max(6).step(1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "missedCorrectStimuliCountTriggeringPermanentHelp").min(1).max(6).step(1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "idleTimeTriggeringPermanentHelp").min(0).max(120).step(1).listen();

        this._debugGlobalParams.add(this.game.params._settingsByLevel[globalLevel].globalRemediation, "holesCount").min(3).max(9).step(1).listen();

        this.setLocalPanel();
        // END OF SPECIFIC

        this._debugFunctions.add(this, "AutoWin");
        this._debugFunctions.add(this, "AutoLose");
        this._debugFunctions.add(this, "skipKalulu");
    };

    Remediation.prototype.clearDebugPanel = function clearDebugPanel() {
        if (this.rafikiDebugPanel) {
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

    Remediation.prototype.cleanLocalPanel = function cleanLocalPanel() {

        for (var element in this._debugLocalParams.items) {
            if (!this._debugLocalParams.items.hasOwnProperty(element)) continue;
            this._debugLocalParams.remove(this._debugLocalParams.items[element]);
        }
    };

    Remediation.prototype.setLocalPanel = function setLocalPanel() {

        var globalLevel = this.game.params.globalLevel;
        var localStage = this.game.params.localRemediationStage;

        this._debugLocalParams.items = {};
        this._debugLocalParams.items.param1 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "apparitionsDuration").min(0).max(5).step(0.1).listen();
        this._debugLocalParams.items.param2 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "maxCrabsOnScreen").min(0).max(20).step(1).listen();
        this._debugLocalParams.items.param3 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "minimumCorrectStimuliOnScreen").min(1).max(20).step(1).listen();
        this._debugLocalParams.items.param4 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "maximumCorrectStimuliOnScreen").min(1).max(20).step(1).listen();
        this._debugLocalParams.items.param5 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "respawnTime").min(0).max(5).step(0.1).listen();
    };

    Remediation.prototype.AutoWin = function AutoWin() {

        var apparition;
        for (var i = 0 ; i < this.results.data.rounds.length ; i++) {

            for (var j = 0 ; j < this.results.data.rounds[i].steps[0].stimuli.length ; j++) {
                if (!this.results.data.rounds[i].steps[0].stimuli[j].apparitions) this.results.data.rounds[i].steps[0].stimuli[j].apparitions = [];
                if (this.results.data.rounds[i].steps[0].stimuli[j].correctResponse) {
                    var length = Math.ceil(this.triesRemaining / this.results.data.rounds.length);
                    for (var k = 0 ; k < length; k++) {
                        apparition = new this.game.rafiki.StimulusApparition(true);
                        apparition.close(true, 3);
                        this.results.data.rounds[i].steps[0].stimuli[j].apparitions.push(apparition);
                    }
                }
                else {
                    for (var l = 0 ; l < 3 ; l++) {
                        apparition = new this.game.rafiki.StimulusApparition(false);
                        apparition.close(false);
                        this.results.data.rounds[i].steps[0].stimuli[j].apparitions.push(apparition);
                    }
                }
            }
        }

        this.gameOverWon();
    };

    Remediation.prototype.AutoLose = function AutoLose() {

        var apparition;
        for (var i = 0 ; i < this.results.data.rounds.length ; i++) {

            for (var j = 0 ; j < this.results.data.rounds[i].steps[0].stimuli.length ; j++) {
                if (!this.results.data.rounds[i].steps[0].stimuli[j].apparitions) this.results.data.rounds[i].steps[0].stimuli[j].apparitions = [];
                if (this.results.data.rounds[i].steps[0].stimuli[j].correctResponse) {
                    var length = Math.ceil(this.triesRemaining / this.results.data.rounds.length);
                    for (var k = 0 ; k < length; k++) {
                        apparition = new this.game.rafiki.StimulusApparition(true);
                        apparition.close(false);
                        this.results.data.rounds[i].steps[0].stimuli[j].apparitions.push(apparition);
                    }
                }
                else {
                    for (var l = 0 ; l < 3 ; l++) {

                        apparition = new this.game.rafiki.StimulusApparition(false);
                        apparition.close(true, 3);
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

    module.exports = Remediation;
})();