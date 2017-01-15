define([
    'common/src/fx',
    'dat.gui',
    './turtle',
    './island',
    './collisionHandler',
    'common/src/popup'
], function (
    Fx,
    Dat,
    Turtle,
    Island,
    CollisionHandler,
    Popup
) {

    'use strict';

    /**
     * Remediation is in charge of all the local Remediation and game loop
	 * @class
     * @extends Phaser.Group
     * @memberof Jellyfish
	 * @param game {Phaser.Game} game instance
	**/
    function Remediation(game) {
        Phaser.Group.call(this, game);


        this.game = game;
        this.won = false;
        this.paused = false;
        this.consecutiveMistakes = 0;
        this.consecutiveSuccess = 0;
        this.lives = 0;
        this.highlightGoodResponses = false;
        /**
         * respawn timer
         * @type {int} 
         * @private
         **/
        this.framesToWaitBeforeNextSpawn = 0;

        this.timeWithoutClick = 0;

        /**
         * framesToWaitBeforeNextSpawn timer for the correct response sound
         * @type {int}
         * @private
         **/
        this.framesToWaitBeforeNewSound = 0;

        this.roundIndex = 0;
        this.stepIndex = 0;

        this.popup = new Popup(game);

        this.initGame();


        this.turtles = [];

        this.fx = new Fx(game);

        this.initSounds(game);
        this.initRound(this.roundIndex);
        if (this.game.discipline == 'maths') {
            var picture = {};

            picture.value = this.correctWord.value;
        }
        this.island = new Island(game, this.correctResponses.length, picture);

        this.collisionHandler = new CollisionHandler(this.turtles, this.island, game);


        this.initEvents();

        if (this.game.gameConfig.debugPanel) {
            this.setupDebugPanel();
        }

    }

    Remediation.prototype = Object.create(Phaser.Group.prototype);
    Remediation.prototype.constructor = Remediation;

    /**
    * Init a new game with remediation parameters from Rafiki.
   **/
    Remediation.prototype.initGame = function initGame() {

        var params = this.game.params;

        // Setting up the recording of the game for Rafiki
        this.game.record = new this.game.rafiki.MinigameDstRecord();

        this.results = this.game.pedagogicData.data; // for convenience we reference also the pedagogicData object under the name 'results' because we will add response data directly on it.
        this.consecutiveMistakes = 0;
        this.consecutiveSuccess = 0;
        this.triesRemaining = params.getGlobalParams().totalTriesCount;
        this.lives = params.getGeneralParams().lives;

        this.won = false;
    };

    /**
     * Initialise parameters for the required round with data contained in this.pedagogicData
     **/
    Remediation.prototype.initRound = function initRound(roundIndex) {

        var roundData = this.game.pedagogicData.data.rounds[roundIndex];

        this.apparitionsCount = 0;
        this.correctStepResponseApparitionsCount = 0;
        this.framesToWaitBeforeNextSpawn = 0;
        this.framesToWaitBeforeNewSound = 0;

        this.falseResponses = [];
        this.correctResponses = [];
        this.falseStepResponsesCurrentPool = [];
        if (roundData.target != null)
            this.correctWord = roundData.target.value;
        else
            this.correctWord = roundData.word.value;
        this.sounds.correctRoundAnswer = this.game.add.audio(this.correctWord);
        var stepsLength = roundData.steps.length;

        var stimuliLength, stimulus;
        var falseStepResponses, correctStepResponses;

        for (var i = 0; i < stepsLength; i++) {
            falseStepResponses = [];
            correctStepResponses = {};
            stimuliLength = roundData.steps[i].stimuli.length;
            for (var j = 0; j < stimuliLength; j++) {
                stimulus = roundData.steps[i].stimuli[j];
                console.log(stimulus)
                if (stimulus.correctResponse === true) {
                    correctStepResponses.value = stimulus.value;
                    correctStepResponses.sound = this.game.add.audio(stimulus.value);
                }

                else {
                    falseStepResponses.push(stimulus.value);
                }

                stimulus.apparitions = [];
            }
            this.falseResponses.push(falseStepResponses);
            this.correctResponses.push(correctStepResponses);
        }
        this.popup.setText(this.correctWord);
    };

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
    };

    /** 
     * Initalize game events
     **/
    Remediation.prototype.initEvents = function () {

        this.game.input.onDown.add(function () {
            this.timeWithoutClick = 0;
        }, this);

        this.game.eventManager.on('destroyTurtle', function (turtle) {
            this.collisionHandler.destroyDistances(turtle);
            for (var i = 0 ; i < this.turtles.length; i++) {
                if (this.turtles[i] === turtle) {
                    if (!this.turtles[i].apparition.isClicked) this.turtles[i].apparition.close(false, 0);
                    this.turtles[i].warning.destroy();
                    this.turtles.splice(i, 1)[0].destroy();
                }
            }
        }, this);

        this.game.eventManager.on('playCorrectSound', function () {
            this.game.eventManager.emit('unPause');
            if (this.framesToWaitBeforeNewSound <= 0) {
                this.sounds.correctRoundAnswer.play();
                this.framesToWaitBeforeNewSound = Math.floor((this.sounds.correctRoundAnswer.totalDuration + 0.5) * 60);
            }
        }, this);

        this.game.eventManager.on('playCorrectSoundNoUnPause', function () {
            if (this.framesToWaitBeforeNewSound <= 0) {
                this.sounds.correctRoundAnswer.play();
                this.framesToWaitBeforeNewSound = Math.floor((this.sounds.correctRoundAnswer.totalDuration + 0.5) * 60);
            }
        }, this);

        this.game.eventManager.on("pause", function () {
            this.paused = true;
        }, this);

        this.game.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);

        this.game.eventManager.on('collisionTurtle', function (turtle1, turtle2) {
            this.collisionTurtle(turtle1, turtle2);
        }, this);

        this.game.eventManager.on('collisionIsland', function (turtle, island) {
            this.collisionIsland(turtle, island);
        }, this);

        this.game.eventManager.on('exitGame', function () {
            if (this.game.gameConfig.debugPanel) {
                this.clearDebugPanel();
            }
            this.game.eventManager.removeAllListeners();
            this.game.eventManager = null;
            this.game.rafiki.close();
            this.game.destroy();
        }, this);

        this.game.eventManager.on('replay', function () {
            if (this.game.gameConfig.debugPanel) {
                this.clearDebugPanel();
            }
            this.game.eventManager.removeAllListeners();
            this.game.eventManager = null;
            this.game.state.start('Setup');
        }, this);
    };

    Remediation.prototype.collisionTurtle = function (turtle1, turtle2) {
        turtle1.apparition.close(true, 0);
        turtle2.apparition.close(true, 0);

        this.sounds.wrong.play();
        this.fx.hit((turtle1.x + turtle2.x) / 2, (turtle1.y + turtle2.y) / 2, false);
        //this.game.eventManager.emit("pause");
        //this.fail();
    };

    Remediation.prototype.collisionIsland = function (turtle1, island) {
        var value = turtle1.text.text;
        turtle1.apparition.close(true, 0);

        if (value !== "") turtle1.sound.play();



        if (value == this.correctResponses[this.stepIndex].value) {
            this.sounds.right.play();
            this.resetTurtles();
            this.game.eventManager.emit("pause");
            this.fx.hit(turtle1.x, turtle1.y, true);
            this.success();
            this.highlightGoodResponses = false;
        }
        else {
            this.sounds.wrong.play();
            this.game.eventManager.emit("pause");
            this.fx.hit(turtle1.x, turtle1.y, false);
            this.fail();
        }
    };

    /**
     * Triggers on success events
     **/
    Remediation.prototype.success = function () {
        this.consecutiveMistakes = 0;
        this.falseStepResponsesCurrentPool = [];
        this.correctStepResponseApparitionsCount = 0;
        this.stepIndex++;

        var temp = "";
        for (var i = 0; i < this.stepIndex; i++) {
            if (this.game.discipline != "maths") temp += this.correctResponses[i].value + " ";
            else {
                var tempValue = this.correctResponses[i].value
                if (tempValue > 10)
                    tempValue /= 10;
                temp += tempValue + " ";
            }
        }
        for (var i = this.stepIndex; i < this.correctResponses.length; i++) {
            temp += "_ ";
        }

        this.island.setText(temp);

        if (this.stepIndex < this.correctResponses.length) {
            this.game.eventManager.emit('unPause');
        }
        else {
            this.stepIndex = 0;
            this.roundIndex++;
            this.triesRemaining--;
            this.game.eventManager.emit('success');
            if (this.triesRemaining > 0) {
                var context = this;
                setTimeout(function () {
                    context.sounds.correctRoundAnswer.play();
                    if (context.game.gameConfig.debugPanel) context.cleanLocalPanel();
                    context.game.params.increaseLocalDifficulty();
                    if (context.game.gameConfig.debugPanel) context.setLocalPanel();
                    context.game.eventManager.emit('offUi');
                    context.popup.show(true);

                    setTimeout(function () {
                        context.popup.show(false);
                        context.initRound(context.roundIndex);
                        context.island.reset(context.correctResponses.length);
                        if (context.game.discipline == 'maths') context.island.picture.setValue(context.correctWord.value);
                        context.game.eventManager.emit('playCorrectSound');
                    }, context.game.params.getGeneralParams().popupTimeOnScreen * 1000);
                }, 1000);
            }
            else {
                this.gameOverWin();
            }
        }

    };

    Remediation.prototype.resetTurtles = function () {
        this.collisionHandler.resetDistances();
        for (var i = 0 ; i < this.turtles.length; i++) {
            this.turtles[i].hit();
        }
    }

    /**
     * Triggers on fail events
     **/
    Remediation.prototype.fail = function () {
        this.lives--;
        this.triesRemaining--;
        this.consecutiveMistakes++;
        this.game.eventManager.emit('fail');

        if (this.lives > 0 && this.triesRemaining > 0) {
            if (this.consecutiveMistakes == this.game.params.getGeneralParams().incorrectResponseCountTriggeringFirstRemediation) {
                var context = this;
                this.sounds.wrong.play();
                this.sounds.wrong.onStop.add(function () {
                    this.sounds.wrong.onStop.removeAll();
                    this.sounds.correctRoundAnswer.play();
                }, context);
                this.game.eventManager.emit('offUi');
                this.popup.show(true);
                setTimeout(function () {
                    context.popup.show(false);
                    context.game.eventManager.emit('unPause');
                }, this.game.params.getGeneralParams().popupTimeOnScreen * 1000)
            }

            else if (this.consecutiveMistakes == this.game.params.getGeneralParams().incorrectResponseCountTriggeringSecondRemediation) {
                this.consecutiveMistakes = 0;
                this.game.eventManager.emit('help');
                this.highlightGoodResponses = true;
                this.HighlightAllGoodResponses();
                if (this.game.gameConfig.debugPanel)
                    this.cleanLocalPanel();
                this.game.params.decreaseLocalDifficulty();
                if (this.game.gameConfig.debugPanel)
                    this.setLocalPanel();
            }
            else {
                this.game.eventManager.emit('unPause');
                //this.game.eventManager.emit('playCorrectSound');
            }
        }
        else if (this.triesRemaining === 0 && this.lives > 0) {
            this.gameOverWin();
        }
        else {
            this.gameOverLose();
        }
    };

    Remediation.prototype.manageTurtlesSpawning = function () {

        var generalParams = this.game.params.getGeneralParams();
        var globalParams = this.game.params.getGlobalParams();
        var localParams = this.game.params.getLocalParams(); // get the latest localParams (localParams can change anytime during the game following player's inputs)

        this.framesToWaitBeforeNextSpawn--;
        var turtlesCountToAdd = globalParams.turtlesOnScreen - this.turtlesSpawned;

        var str = "--> missing " + turtlesCountToAdd + "( " + this.turtlesSpawned + " vs. " + globalParams.turtlesOnScreen + " required)";

        if (turtlesCountToAdd === 0) {
            //console.log("engough turtles on screen");
            return;
        }
        else if (turtlesCountToAdd > 0 && this.framesToWaitBeforeNextSpawn <= 0) {
            this.spawnTurtle();

        }
    };
    Remediation.prototype.HighlightAllGoodResponses = function () {
        for (var i = 0 ; i < this.turtles.length; i++) {
            if (this.turtles[i].text.text == this.correctResponses[this.stepIndex].value)
                this.turtles[i].highlight.visible = true;
        }
    }


    Remediation.prototype.spawnTurtle = function () {
        var localParams = this.game.params.getLocalParams();
        var globalParams = this.game.params.getGlobalParams();
        var isTargetValue, value, lTurtle, j, apparition;

        // determine if we need a target or a distracter
        if (this.targetturtlesSpawned < localParams.minimumCorrectStimuliOnScreen && this.apparitionsCount > globalParams.turtlesOnScreen / 2) {
            isTargetValue = true; // we spawn a correct answer stimulus
        }
        else {
            var rand = Math.random();
            if (rand < localParams.correctResponsePercentage)
                isTargetValue = true;
            else
                isTargetValue = false;
        }

        if (isTargetValue) {
            value = this.correctResponses[this.stepIndex].value;
        }
        else {
            if (this.falseStepResponsesCurrentPool.length === 0) {
                this.falseStepResponsesCurrentPool = this.falseStepResponsesCurrentPool.concat(this.falseResponses[this.stepIndex].slice(0));
                this.falseStepResponsesCurrentPool = this.falseStepResponsesCurrentPool.concat(this.falseResponses[this.stepIndex].slice(0));
                // we do it two times to have 2 times each false response in the pool.
            }
            value = this.falseStepResponsesCurrentPool.splice(Math.floor(Math.random() * this.falseStepResponsesCurrentPool.length), 1)[0]; // Picks a random value in all the false response values
        }

        lTurtle = new Turtle(this.game, localParams.speed);
        this.collisionHandler.createNewDistances(lTurtle);
        lTurtle.init(value);
        this.turtles.push(lTurtle);


        j = 0;
        while (this.results.rounds[this.roundIndex].steps[this.stepIndex].stimuli[j].value != value) { //finds the value in the results to add one apparition
            j++;
        }
        apparition = new this.game.rafiki.StimulusApparition(isTargetValue);

        this.results.rounds[this.roundIndex].steps[this.stepIndex].stimuli[j].apparitions.push(apparition);
        lTurtle.apparition = apparition;
        this.apparitionsCount++;
        if (isTargetValue) this.correctStepResponseApparitionsCount++;


        this.framesToWaitBeforeNextSpawn = localParams.respawnTime * 60;
        this.game.eventManager.emit('newTurtle');

        if (this.highlightGoodResponses)
            this.HighlightAllGoodResponses();
    };

    Remediation.prototype.gameOverWin = function gameOverWin() {

        this.game.won = true;
        this.sounds.winGame.play();
        this.game.eventManager.emit('offUi');// listened by ui

        this.sounds.winGame.onStop.add(function () {
            this.sounds.winGame.onStop.removeAll();
            this.game.eventManager.emit('GameOverWin');//listened by Ui (toucan = kalulu)
            this.saveGameRecord();
        }, this);
    };

    Remediation.prototype.gameOverLose = function gameOverLose() {

        this.game.won = false;
        this.sounds.loseGame.play();
        this.game.eventManager.emit('offUi');// listened by ui

        this.sounds.loseGame.onStop.add(function () {
            this.sounds.loseGame.onStop.removeAll();
            this.game.eventManager.emit('GameOverLose');// listened by ui
            this.saveGameRecord();
        }, this);
    };

    Remediation.prototype.saveGameRecord = function saveGameRecord() {
        this.game.record.close(this.game.won, this.results, this.game.params.localRemediationStage);
        this.game.rafiki.save(this.game.record);
    };

    /**
     * Used mainly for timers purposes
     * might change the "for" by an event in jellyfish script
     **/
    Remediation.prototype.update = function () {
        if (this.framesToWaitBeforeNewSound > 0) this.framesToWaitBeforeNewSound--;

        if (this.paused) return;

        this.turtlesSpawned = this.turtles.length;

        this.targetTurtlesSpawned = 0;
        this.distracterTurtlesSpawned = 0;

        for (var i = 0; i < this.turtles.length ; i++) {

            var lTurtle = this.turtles[i];

            if (lTurtle.apparition.isCorrect) {
                this.targetTurtlesSpawned++;
            }
            else {
                this.distracterTurtlesSpawned++;
            }

        }

        this.manageTurtlesSpawning();

        if (this.correctStepResponseApparitionsCount == 3) {
            this.correctStepResponseApparitionsCount = 0;

            if (this.framesToWaitBeforeNewSound === 0) this.correctResponses[this.stepIndex].sound.play();
        }

        this.timeWithoutClick++;

        if (this.timeWithoutClick > 60 * 20) {
            this.timeWithoutClick = 0;
            this.game.eventManager.emit('help');
        }

    };

    Remediation.prototype.setupDebugPanel = function setupDebugPanel() {
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

        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringFirstRemediation").min(1).max(5).step(1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringSecondRemediation").min(1).max(5).step(1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "lives").min(1).max(5).step(1).listen();

        this._debugGlobalParams.add(this.game.params._settingsByLevel[globalLevel].globalRemediation, "turtlesOnScreen").min(1).max(5).step(1).listen();

        this.setLocalPanel();

        this._debugFunctions.add(this, "AutoWin");
        this._debugFunctions.add(this, "AutoLose");
        this._debugFunctions.add(this, "skipKalulu");
    };

    Remediation.prototype.setLocalPanel = function setLocalPanel() {

        var globalLevel = this.game.params.globalLevel;
        var localStage = this.game.params.localRemediationStage;

        this._debugGlobalParams.items = {};
        this._debugGlobalParams.items.param1 = this._debugGlobalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "minimumCorrectStimuliOnScreen").min(0).max(20).step(1).listen();
        this._debugGlobalParams.items.param2 = this._debugGlobalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "correctResponsePercentage").min(0).max(1).step(0.1).listen();
        this._debugGlobalParams.items.param3 = this._debugGlobalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "respawnTime").min(1).max(5).step(0.1).listen();
        this._debugGlobalParams.items.param4 = this._debugGlobalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "speed").min(1).max(20).step(0.5).listen();


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

    Remediation.prototype.AutoWin = function WinGameAndSave() {

        var apparitionStats;
        var roundsCount, stepsCount, stimuliCount, currentRound, currentStep, currentStimulus;

        roundsCount = this.results.rounds.length;

        for (var i = 0 ; i < roundsCount ; i++) {

            currentRound = this.results.rounds[i];
            currentRound.word.stats = {
                apparitionTime: Date.now() - 10000,
                exitTime: Date.now(),
                success: true
            };

            stepsCount = currentRound.steps.length;

            for (var j = 0 ; j < stepsCount ; j++) {

                currentStep = this.results.rounds[i].steps[j];
                stimuliCount = currentStep.stimuli.length;

                for (var k = 0 ; k < stimuliCount ; k++) {

                    currentStimulus = this.results.rounds[i].steps[j].stimuli[k];

                    apparitionStats = {
                        apparitionTime: Date.now() - 3000,
                        exitTime: Date.now(),
                        correctResponse: false,
                        clicked: false
                    };

                    if (currentStimulus.correctResponse) {
                        apparitionStats.correctResponse = true;
                        apparitionStats.clicked = true;
                    }

                    currentStimulus.apparitions = [apparitionStats];
                }
            }
        }

        this.won = true;
        this.game.eventManager.emit("exitGame");
    };

    Remediation.prototype.AutoLose = function LoseGame() {

        var apparitionStats;
        var roundsCount, stepsCount, stimuliCount, currentRound, currentStep, currentStimulus;

        roundsCount = this.results.rounds.length;

        for (var i = 0 ; i < roundsCount ; i++) {

            currentRound = this.results.rounds[i];
            currentRound.word.stats = {
                apparitionTime: Date.now() - 20000,
                exitTime: Date.now(),
                success: false
            };

            stepsCount = currentRound.steps.length;

            for (var j = 0 ; j < stepsCount ; j++) {

                currentStep = this.results.rounds[i].steps[j];
                stimuliCount = currentStep.stimuli.length;

                for (var k = 0 ; k < stimuliCount ; k++) {

                    currentStimulus = this.results.rounds[i].steps[j].stimuli[k];

                    apparitionStats = {
                        apparitionTime: Date.now() - 3000,
                        exitTime: Date.now(),
                        correctResponse: false,
                        clicked: true
                    };

                    if (currentStimulus.correctResponse) {
                        apparitionStats.correctResponse = true;
                        apparitionStats.clicked = false;
                    }

                    currentStimulus.apparitions = [apparitionStats];
                }
            }
        }

        this.won = false;
        this.game.eventManager.emit('exitGame');
    };

    Remediation.prototype.skipKalulu = function skipKalulu() {

        this.game.eventManager.emit("skipKalulu");
    };

    return Remediation;
});