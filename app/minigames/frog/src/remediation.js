define([
    './frog',
    './column',
    'common/src/fx',
    'common/src/popup'
], function (
    Frog,
    Column,
    Fx,
    Popup
) {

    'use strict';


    /**
     * Remediation is in charge of all the local Remediation and game loop
     * WARNING : PLEASE COMMENT EVERYTHING RELATED TO THE GAME DESIGN TOOL WHEN DONE
	 * @class
     * @extends Phaser.Group
     * @memberof Frogger
	 * @param game {Phaser.Game} game instance
	**/
    function Remediation(game) {
        Phaser.Group.call(this, game);


        this.game = game;
        this.paused = false;
        this.won = false;

        this.lives = 0;
        this.timeWithoutClick = 0;
        this.consecutiveMistakes = 0;
        this.consecutiveSuccess = 0;
        this.framesToWaitBeforeNewSound = 0;
        this.roundIndex = 0;
        this.stepIndex = 0;

        this.initGame();


        if (Config.globalVars) window.frogger.frogger = this.frogger;

        if (this.game.gameConfig.debugPanel) {
            this.setupDebugPanel();
        }

        this.popup = new Popup(game);

        this.initSounds(game);
        this.initEvents();
        this.initRound(this.roundIndex);

        this.rockBegining = game.add.sprite(300, game.height / 2, 'background', 'rocher');
        this.rockBegining.anchor.setTo(0.5, 0.5);
        this.rockEnd = game.add.sprite(game.width - 300, game.height / 2, 'background', 'rocher');
        this.rockEnd.anchor.setTo(0.5, 0.5);

        this.frog = new Frog(320, game.height / 2, game);

        this.frogJumpPositions = [];

        this.columns = [];
        this.initColumns(game);
        this.columns[0].enabled = true;
        this.columns[0].setVisibleText(true);
        this.fx = new Fx(game);       
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

        this.results = this.game.pedagogicData; // for convenience we reference also the pedagogicData object under the name 'results' because we will add response data directly on it.
        this.consecutiveMistakes = 0;
        this.consecutiveSuccess = 0;
        this.triesRemaining = params.getGlobalParams().totalTriesCount;
        this.lives = params.getGeneralParams().lives;

        this.won = false;
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
     * Initialise parameters for the required round with data contained in this.pedagogicData
     **/
    Remediation.prototype.initRound = function initRound(roundIndex) {

        var roundData = this.game.pedagogicData.data.rounds[roundIndex];

        this.apparitionsCount = 0;
        this.framesToWaitBeforeNextSpawn = 0;
        this.framesToWaitBeforeNewSound = 0;

        this.falseResponses = [];
        this.correctResponses = [];
        this.falseStepResponsesCurrentPool = [];
        if (this.game.discipline != "maths") {
            this.correctWord = roundData.word;
            this.sounds.correctRoundAnswer = this.game.add.audio(roundData.word.value);
        }
        else {
            this.correctWord = roundData.targetSequence.value;
        }
        var stepsLength = roundData.steps.length;

        var stimuliLength, stimulus;
        var falseStepResponses, correctStepResponses;

        for (var i = 0; i < stepsLength; i++) {
            falseStepResponses = [];
            correctStepResponses = {};
            stimuliLength = roundData.steps[i].stimuli.length;
            for (var j = 0; j < stimuliLength; j++) {
                stimulus = roundData.steps[i].stimuli[j];
                if (stimulus.correctResponse === true) {
                    correctStepResponses.value = stimulus.value;
                }

                else {
                    falseStepResponses.push(stimulus.value);
                }

                stimulus.apparitions = [];
            }
            this.falseResponses.push(falseStepResponses);
            this.correctResponses.push(correctStepResponses);
        }

        if (this.game.discipline != "maths")
            this.popup.setText(this.correctWord.value);

        else
            this.popup.setTextMaths(this.correctWord);
    };

    /**
     * 
     * @private
     **/
    Remediation.prototype.initColumns = function (game) {
        var generalParams = this.game.params.getGeneralParams();
        var globalParams = this.game.params.getGlobalParams();
        var localParams = this.game.params.getLocalParams();

        var bool = true;
        for (var i = 0; i < this.correctResponses.length; i++) {
            this.columns.push(new Column((game.width - 1024) / 2 + ((1024 / (this.correctResponses.length + 1)) * (i + 1)),
                                globalParams.lillypadsPerColumn,
                                bool,
                                this.createDataset(i),
                                game,
                                localParams.speed));
            bool = !bool;
        }
    }

    /**
     * update lillypads speed
     * @private
     **/
    Remediation.prototype.updateSpeed = function () {
        for (var i = 0; i < this.columns.length; i++) {
            this.columns[i].speed = this.gameDesign.speed;
        }
    }

    /**
     * 
     * @private
     **/
    Remediation.prototype.createDataset = function (step) {
        var localParams = this.game.params.getLocalParams();
        var globalParams = this.game.params.getGlobalParams();
        var isTargetValue, value, lineNumber, lBerry, apparition;
        var targetLillypadSpawned = 0;

        var dataset = [];
        this.falseStepResponsesCurrentPool = [];
        for (var i = 0; i < globalParams.lillypadsPerColumn + 1; i++) {
            if (targetLillypadSpawned < localParams.minimumCorrectStimuliOnColumn) {
                isTargetValue = true; // we spawn a correct answer stimulus
                targetLillypadSpawned++;
            }
            else {
                var rand = Math.random();
                if (rand < localParams.correctResponsePercentage) {
                    isTargetValue = true;
                    targetLillypadSpawned++;
                }
                else
                    isTargetValue = false;
            }

            if (isTargetValue) {
                value = this.correctResponses[step].value;
            }
            else {
                if (this.falseStepResponsesCurrentPool.length === 0) {
                    this.falseStepResponsesCurrentPool = this.falseStepResponsesCurrentPool.concat(this.falseResponses[step].slice(0));
                    this.falseStepResponsesCurrentPool = this.falseStepResponsesCurrentPool.concat(this.falseResponses[step].slice(0));
                    // we do it two times to have 2 times each false response in the pool.
                }
                value = this.falseStepResponsesCurrentPool.splice(Math.floor(Math.random() * this.falseStepResponsesCurrentPool.length), 1)[0]; // Picks a random value in all the false response values
            }

            dataset.push(value);
        }
        return dataset;
    }

    /** 
     * Initalize game events
     **/
    Remediation.prototype.initEvents = function () {
        this.game.eventManager.on('clicked', function (lillypad) {
            this.timeWithoutClick = 0;
            lillypad.apparition.close(true, 0);
            if (lillypad.text.text.toString() == this.correctResponses[this.stepIndex].value.toString()) {
                this.sounds.right.play();
                this.fx.hit(lillypad.x, lillypad.y, true);
                this.sounds.right.onStop.add(function () {
                    this.sounds.right.onStop.removeAll();
                    this.successStep(lillypad);
                }, this);
            }
            else {
                this.sounds.wrong.play();
                this.game.eventManager.emit('fail');
                this.fx.hit(lillypad.x, lillypad.y, false);
                lillypad.fadeOut();
                this.sounds.wrong.onStop.add(function () {
                    this.sounds.wrong.onStop.removeAll();
                    this.fail();
                }, this);
            }
        }, this);

        this.game.eventManager.on('help', function () {
            this.timeWithoutClick = 0;
        }, this);

        this.game.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.game.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);

        this.game.eventManager.on('apparition', function (lillypad) {
            var value = lillypad.text.text;
            var j = 0;
            while (this.results.data.rounds[this.roundIndex].steps[this.stepIndex].stimuli[j].value != value) { //finds the value in the results to add one apparition
                j++;
            }
            var apparition = new this.game.rafiki.StimulusApparition(this.results.data.rounds[this.roundIndex].steps[this.stepIndex].stimuli[j].correctResponse);

            this.results.data.rounds[this.roundIndex].steps[this.stepIndex].stimuli[j].apparitions.push(apparition);
            lillypad.apparition = apparition;
        }, this);

        this.game.eventManager.on('playCorrectSound', function () {
            this.game.eventManager.emit('unPause');
            if (this.framesToWaitBeforeNewSound <= 0 && this.game.discipline != "maths") {
                this.sounds.correctRoundAnswer.play();
                this.framesToWaitBeforeNewSound = Math.floor((this.sounds.correctRoundAnswer.totalDuration + 0.5) * 60);
            }
        }, this);

        this.game.eventManager.on('playCorrectSoundNoUnPause', function () {
            if (this.framesToWaitBeforeNewSound <= 0 && this.game.discipline != "maths") {
                this.sounds.correctRoundAnswer.play();
                this.framesToWaitBeforeNewSound = Math.floor((this.sounds.correctRoundAnswer.totalDuration + 0.5) * 60);
            }
        }, this);

        this.game.eventManager.on('exitGame', function () {
            if (this.game.gameConfig.debugPanel) this.clearDebugPanel();
            this.game.rafiki.close();
            this.game.eventManager.removeAllListeners();
            this.game.eventManager = null;
            this.game.destroy();
            console.info("Phaser Game has been destroyed");
            this.game = null;
        }, this);

        this.game.eventManager.on('replay', function () {
            if (this.game.gameConfig.debugPanel) {
                this.clearDebugPanel();
            }

            this.game.eventManager.removeAllListeners();
            this.game.eventManager = undefined;
            this.game.state.start('Setup');
        }, this);
    };

    /**
     * 
     * @private
     **/
    Remediation.prototype.successStep = function (lillypad) {
        this.consecutiveMistakes = 0;
        var positions = {};
        positions.x = lillypad.x;
        positions.y = lillypad.y;
        positions.lillypad = lillypad;
        this.frogJumpPositions.push(positions);

        this.columns[this.stepIndex].enabled = false;
        this.columns[this.stepIndex].fade(lillypad);
        this.stepIndex++;
        if (this.stepIndex < this.correctResponses.length) {
            this.columns[this.stepIndex].enabled = true;
            this.columns[this.stepIndex].setVisibleText(true);
            this.game.eventManager.emit('unPause');
        }
        else {
            this.successRound();
        }
    }

    /**
     * 
     * @private
     **/
    Remediation.prototype.successRound = function () {
        this.triesRemaining--;
        this.roundIndex++;
        this.stepIndex = 0;
        this.consecutiveSuccess++;

        if (this.triesRemaining > 0) {
            if (this.consecutiveSuccess % 2 == 0) { // Increment difficulty
                if (Config.debugPanel) this.cleanLocalPanel();
                this.game.params.increaseLocalDifficulty();
                if (Config.debugPanel) this.setLocalPanel();
            }

            this.frogJumpManager("playCorrectSound");

        }
        else {
            this.frogJumpManager("GameOverWin", true);
        }
    }

    /**
     * 
     * @private
     **/
    Remediation.prototype.frogJumpManager = function (endEvent, win) {
        var params = this.game.params.getGeneralParams();
        win = win || false

        var positions = {};
        positions.x = this.rockEnd.x + 20;
        positions.y = this.rockEnd.y;
        this.frogJumpPositions.push(positions);

        var context = this;
        for (var i = 0; i < this.frogJumpPositions.length; i++) {
            var temp = 0;
            setTimeout(function () {
                context.frog.jumpTo(context.frogJumpPositions[temp].x, context.frogJumpPositions[temp].y);
                if (temp != 0) {
                    context.frogJumpPositions[temp - 1].lillypad.onClick();
                }
                temp++;
            }, (context.frog.time + 0.3) * 1000 * (i));
        }
        setTimeout(function () {
            context.game.eventManager.emit('success');
            for (var i = 0; i < context.frogJumpPositions.length - 1; i++) {
                context.frogJumpPositions[i].lillypad.tween = context.game.add.tween(context.frogJumpPositions[i].lillypad);
                context.frogJumpPositions[i].lillypad.tween.to({ y: context.game.height / 2 }, 500, Phaser.Easing.Default, true, 0, 0, false);
            }
            if (!win) {

                context.sounds.right.play();
                context.sounds.right.onStop.add(function () {
                    context.sounds.right.onStop.removeAll();
                    if (this.game.discipline != "maths") context.sounds.correctRoundAnswer.play();                 
                }, context);
                context.game.eventManager.emit('offUi');
                context.popup.show(true);
                setTimeout(function () {
                    context.popup.show(false);
                    context.transition(endEvent);
                }, params.popupTimeOnScreen * 1000)
            }
            if (win) {
                context.sounds.right.play();
                context.sounds.right.onStop.add(function () {
                    context.sounds.right.onStop.removeAll();
                    context.sounds.correctRoundAnswer.play();
                }, context);
                context.game.eventManager.emit('offUi');
                context.popup.show(true);

                setTimeout(function () {
                    context.popup.show(false);
                    context.sounds.winGame.play();
                    context.game.eventManager.emit('offUi'); //listened by Ui
                    context.sounds.winGame.onStop.add(function () {
                        context.sounds.winGame.onStop.removeAll();
                        context.game.eventManager.emit(endEvent);//listened by Ui (toucan = kalulubutton)
                    }, this);
                }, 3000)
            }

        }, context.frogJumpPositions.length * (context.frog.time + 0.3) * 1000);
    }

    /**
     * Transition between rounds
     * @private
     **/
    Remediation.prototype.transition = function (endEvent) {
        this.frog.jumpTo(this.game.width + this.rockBegining.x + 20, this.rockBegining.y);
        for (var i = 0; i < this.frogJumpPositions.length - 1; i++) {
            this.frogJumpPositions[i].lillypad.fadeOut();
        }
        var context = this;
        setTimeout(function () {
            context.frogJumpPositions = [];
            context.deleteColumns();
            context.initRound(context.roundIndex);
            context.initColumns(context.game);
            context.columns[0].enabled = true;
            context.columns[0].setVisibleText(true);
            context.game.eventManager.emit(endEvent);
        }, (context.frog.time - 0.2) * 1000);

    }

    /**
     * 
     * @private
     **/
    Remediation.prototype.fail = function () {
        var params = this.game.params.getGeneralParams();
        this.lives--;
        this.triesRemaining--;
        this.consecutiveMistakes++;
        this.consecutiveSuccess = 0;

        if (this.lives > 0 && this.triesRemaining > 0) {
            if (this.consecutiveMistakes === params.incorrectResponseCountTriggeringFirstRemediation) { //Triggers kalulu's help + lowers difficulty

                var context = this;
                setTimeout(function () {
                    context.game.eventManager.emit('playCorrectSoundNoUnPause');//listened here; check initEvents
                    context.game.eventManager.emit('offUi');                  

                    context.popup.show(true);

                    setTimeout(function () {
                        context.popup.show(false);
                        context.game.eventManager.emit('unPause');
                    }, params.popupTimeOnScreen * 1000);

                }, 1000);

                if (Config.debugPanel) this.cleanLocalPanel();
                this.game.params.decreaseLocalDifficulty();
                if (Config.debugPanel) this.setLocalPanel();
            }
            else if (this.consecutiveMistakes === params.incorrectResponseCountTriggeringSecondRemediation) {
                for (var i = 0; i < this.columns[this.stepIndex].lillypads.length; i++) {
                    if (this.columns[this.stepIndex].lillypads[i].text.text.toString() == this.correctResponses[this.stepIndex].value.toString()) {
                        this.columns[this.stepIndex].lillypads[i].highlight.visible = true;
                    }
                }
                this.game.eventManager.emit('help'); // listened by Kalulu to start the help speech; pauses the game in kalulu
                if (Config.debugPanel) this.cleanLocalPanel();
                this.game.params.decreaseLocalDifficulty();
                if (Config.debugPanel) this.setLocalPanel();
                this.consecutiveMistakes = 0; // restart the remediation
            }
        }
        else if (this.triesRemaining === 0 && this.lives > 0) {
            this.gameOverWin();
        }
        else {
            this.gameOverLose();
        }
    }

    /**
     * 
     *@private
     **/
    Remediation.prototype.deleteColumns = function () {
        var length = this.columns.length;
        for (var i = 0; i < length; i++) {
            this.columns[0].deleteLillypads();
            this.columns.splice(0, 1)[0].destroy();
        }

    }

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

    // DEBUG



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

        // SPECIFIC
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringFirstRemediation").min(1).max(5).step(1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringSecondRemediation").min(1).max(5).step(1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "lives").min(1).max(5).step(1).listen();
        this._debugGeneralParams.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "capitalLettersShare").min(0).max(1).step(0.05).listen();

        this._debugGlobalParams.add(this.game.params._settingsByLevel[globalLevel].globalRemediation, "lillypadsPerColumn").min(1).max(5).step(1).listen();

        this.setLocalPanel();
        // END OF SPECIFIC


        this._debugFunctions.add(this, "AutoWin");
        this._debugFunctions.add(this, "AutoLose");
        this._debugFunctions.add(this, "skipKalulu");
        this._debugFunctions.open();
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
            tthis._debugLocalParams.remove(this._debugLocalParams.items[element]);
        }
    };

    Remediation.prototype.setLocalPanel = function setLocalPanel() {

        var globalLevel = this.game.params.globalLevel;
        var localStage = this.game.params.localRemediationStage;

        this._debugLocalParams.items = {};
        this._debugLocalParams.items.param1 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "minimumCorrectStimuliOnColumn").min(0).max(20).step(1).listen();
        this._debugLocalParams.items.param2 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "correctResponsePercentage").min(0).max(1).step(0.1).listen();
        this._debugLocalParams.items.param4 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "speed").min(1).max(5).step(0.5).listen();
    };

    /**
     * 
     **/
    Remediation.prototype.update = function () {
        if (this.framesToWaitBeforeNewSound > 0) this.framesToWaitBeforeNewSound--;

        if (!this.paused) {
            this.timeWithoutClick++;

            if (this.timeWithoutClick > 60 * 20) {
                this.timeWithoutClick = 0;
                this.game.eventManager.emit('help');
            }

        }
    };

    Remediation.prototype.AutoWin = function WinGameAndSave() {

        var apparitionStats;
        var roundsCount, stepsCount, stimuliCount, currentRound, currentStep, currentStimulus;

        roundsCount = this.results.data.rounds.length;

        for (var i = 0 ; i < roundsCount ; i++) {

            currentRound = this.results.data.rounds[i];
            currentRound.word.stats = {
                apparitionTime: Date.now() - 10000,
                exitTime: Date.now(),
                success: true
            };

            stepsCount = currentRound.steps.length;

            for (var j = 0 ; j < stepsCount ; j++) {

                currentStep = this.results.data.rounds[i].steps[j];
                stimuliCount = currentStep.stimuli.length;

                for (var k = 0 ; k < stimuliCount ; k++) {

                    currentStimulus = this.results.data.rounds[i].steps[j].stimuli[k];

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
        this.gameOverWin();
    };

    Remediation.prototype.AutoLose = function LoseGame() {

        var apparitionStats;
        var roundsCount, stepsCount, stimuliCount, currentRound, currentStep, currentStimulus;

        roundsCount = this.results.data.rounds.length;

        for (var i = 0 ; i < roundsCount ; i++) {

            currentRound = this.results.data.rounds[i];
            currentRound.word.stats = {
                apparitionTime: Date.now() - 20000,
                exitTime: Date.now(),
                success: false
            };

            stepsCount = currentRound.steps.length;

            for (var j = 0 ; j < stepsCount ; j++) {

                currentStep = this.results.data.rounds[i].steps[j];
                stimuliCount = currentStep.stimuli.length;

                for (var k = 0 ; k < stimuliCount ; k++) {

                    currentStimulus = this.results.data.rounds[i].steps[j].stimuli[k];

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
        this.gameOverLose();
    };

    Remediation.prototype.skipKalulu = function skipKalulu() {
        this.game.eventManager.emit("skipKalulu");
    };

    return Remediation;
});