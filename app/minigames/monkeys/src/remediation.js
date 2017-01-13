define([
    './tree',
    'common/src/fx',
    './board',
    'dat.gui'
], function (
    Tree,
    Fx,
    Board,
    Dat
) {
    'use strict';

    /**
     * Remediation is in charge of all the local Remediation and game loop
	 * @class
     * @extends Phaser.Group
     * @memberof Cocolision
	 * @param game {Phaser.Game} game instance
	**/
    function Remediation(game) {
        Phaser.Group.call(this, game);

        
        var data = this.game.pedagogicData;
        this.discipline = data.discipline;

        this.game = game;
        this.paused = false;
        this.won = false;

        this.lives = 0;
        this.triesRemaining = 0;
        this.consecutiveMistakes = 0;
        this.consecutiveSuccess = 0;
        this.framesToWaitBeforeNewSound = 0;
        this.roundIndex = 0;
        this.stepIndex = 0;
        this.timeWithoutClick = 0;

        this.initGame();

        if (this.game.gameConfig.globalVars) window.cocolision.cocolision = this.cocolision;


        if (this.game.gameConfig.debugPanel) {

            this.setupDebugPanel();
        }

        this.initSounds(game);
        this.initEvents();

        this.trees = [];
        this.initTrees(game);

        this.board = new Board(550, game.height - 50, game);

        this.initRound(this.roundIndex);
        console.log(this.sequence)
        if (this.game.discipline == 'maths') this.sequence.numberIndex = this.board.setTextMaths(this.sequence.sequence);
        this.setTexts();
        this.fx = new Fx(game);
    };

    Remediation.prototype = Object.create(Phaser.Group.prototype);
    Remediation.prototype.constructor = Remediation;

    /** 
     * Initalize game sounds
     **/
    Remediation.prototype.initSounds = function (game) {
        this.sounds = {};

        this.sounds.right = game.add.audio('right');
        this.sounds.wrong = game.add.audio('wrong');
        this.sounds.winGame = game.add.audio('winGame');
        this.sounds.loseGame = game.add.audio('loseGame');
    }

    /** 
     * Initalize game events
     **/
    Remediation.prototype.initEvents = function () {
        this.game.eventManager.on('pause', function () {
        }, this);

        this.game.eventManager.on('help', function () {
            this.timeWithoutClick = 0;
        }, this);

        this.game.eventManager.on('unPause', function () {
        }, this);    

        this.game.eventManager.on('playCorrectSound', function () {
            this.game.eventManager.emit('unPause');
            if (this.game.discipline != "maths")
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

        this.game.eventManager.on('swipe', function (object) {
            this.timeWithoutClick = 0;
            this.game.eventManager.emit('pause');
            object.apparition.close(true, 0);
            object.flyTo(this.trees.kingTree.monkey.x, this.trees.kingTree.monkey.y - 40, 1.4);
            object.clickable = false;
            object.monkeyRef.clickable = false;
            object.monkeyRef.coconut.bool = false;
            object.monkeyRef.monkeySprite.animations.play('throw');
            object.monkeyRef.sounds.send.play();
            object.monkeyRef.sounds.rdm[Math.floor(Math.random() * object.monkeyRef.sounds.rdm.length)].play();

            var context = this;

            setTimeout(function () {
                context.trees.kingTree.monkey.monkeySprite.animations.play('get');
                object.moveTo(context.trees.kingTree.monkey.x - context.trees.kingTree.monkey.monkeySprite.height / 3, context.trees.kingTree.monkey.y - context.trees.kingTree.monkey.monkeySprite.height / 2, 0.3);
                context.trees.kingTree.monkey.monkeySprite.animations.currentAnim.onComplete.addOnce(function () {
                    context.trees.kingTree.monkey.monkeySprite.animations.play('look');
                    context.trees.kingTree.monkey.monkeySprite.animations.currentAnim.onComplete.addOnce(function () {
                        context.handler(object);
                    }, context);
                }, context);

            }, object.time * 1000 - 2 * 60);

        }, this);

        this.game.eventManager.on('exitGame', function () {
            if (this.game.gameConfig.debugPanel) this.clearDebugPanel();
            console.info("clearDebugPanel ok");
            this.game.rafiki.close();
            console.info("rafiki closed");
            this.game.eventManager.removeAllListeners();
            console.info("removeAllListeners ok");
            this.game.eventManager = null;
            console.info("eventManager null");
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
     * Initialise parameters for the required round with data contained in this.pedagogicData
     **/
    Remediation.prototype.initRound = function initRound(roundIndex) {
         console.log(this.game.pedagogicData.data.rounds);
        var roundData = this.game.pedagogicData.data.rounds[roundIndex];

        this.apparitionsCount = 0;
        this.framesToWaitBeforeNextSpawn = 0;
        this.framesToWaitBeforeNewSound = 0;

        this.falseResponses = [];
        this.correctResponses = [];
        this.falseStepResponsesCurrentPool = [];
        if (this.game.discipline != "maths") {
            console.log(roundData);
            this.correctWord = roundData.word;
            this.sounds.correctRoundAnswer = this.game.add.audio(roundData.word.value);
        }
        else {
            this.sequence = roundData.targetSequence;
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
    };

    Remediation.prototype.setTexts = function () {
        var localParams = this.game.params.getLocalParams();
        var globalParams = this.game.params.getGlobalParams();
        var isTargetValue, value, apparition, j, randMonkey;
        var targetCoconutSpawned = 0;

        var selectedMonkey = [];
        for (var i = 0; i < globalParams.monkeyOnScreen; i++) {
            selectedMonkey.push(i);
        }

        this.falseStepResponsesCurrentPool = [];
        for (var i = 0; i < globalParams.monkeyOnScreen; i++) {
            if (targetCoconutSpawned < localParams.minimumCorrectStimuliOnColumn) {
                isTargetValue = true; // we spawn a correct answer stimulus
                targetCoconutSpawned++;
            }
            else {
                var rand = Math.random();
                if (rand < localParams.correctResponsePercentage) {
                    isTargetValue = true;
                    targetCoconutSpawned++;
                }
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

            randMonkey = selectedMonkey.splice(Math.floor(Math.random() * selectedMonkey.length), 1)[0];

            this.trees.normalTree.monkey[randMonkey].coconut.sprite.setText(value);

            j = 0;
            while (this.results.data.rounds[this.roundIndex].steps[this.stepIndex].stimuli[j].value != value) { //finds the value in the results to add one apparition
                j++;
            }
            apparition = new this.game.rafiki.StimulusApparition(isTargetValue);

            this.results.data.rounds[this.roundIndex].steps[this.stepIndex].stimuli[j].apparitions.push(apparition);
            this.trees.normalTree.monkey[randMonkey].coconut.sprite.apparition = apparition;
        }
    };

    Remediation.prototype.handler = function (object) {
        var value = object.text.text;
        var j = 0;
        if (value != "") object.sound.play();

        if (value.toString() == this.correctResponses[this.stepIndex].value.toString()) {
            this.trees.kingTree.monkey.monkeySprite.animations.play('right');
            this.trees.kingTree.monkey.sounds.sendRight.play();
            object.tween.stop();
            if (this.game.discipline != 'maths') object.moveTo(this.board.x + this.stepIndex * (this.board.text.fontSize - 40), this.game.height - 100, 0.7);
            else object.moveTo(this.board.x - (Math.floor(this.board.text.text.length / 2) - this.sequence.numberIndex) * (this.board.text.fontSize - 40), this.game.height - 100, 0.7);
            this.game.eventManager.once('finishedMoving', function () {
                object.break();
                if (this.game.discipline != 'maths') this.board.text.text += this.correctResponses[this.stepIndex].value;
                else {
                    this.board.setTextMaths(this.sequence.sequence, this.correctResponses[this.stepIndex].value);
                    }
                this.game.eventManager.once('finishedBreaking', function () {
                    this.sounds.right.play();
                    this.success();
                }, this);
            }, this);

        }
        else {
            this.trees.kingTree.monkey.monkeySprite.animations.play('wrong');
            this.trees.kingTree.monkey.sounds.sendWrong.play();
            object.active = false;
            object.flyTo(object.origin.x, object.origin.y, 1);
            this.game.eventManager.once('finishedFlying', function () {
                object.monkeyRef.sounds.receiveHead.play();
                object.monkeyRef.monkeySprite.animations.play('impact');
                object.monkeyRef.monkeySprite.animations.currentAnim.onComplete.addOnce(function () {
                    object.monkeyRef.monkeySprite.animations.play('stun');
                    object.monkeyRef.stunStars.animations.play('stun');
                    object.monkeyRef.stunStars.visible = true;
                }, object);
                this.sounds.wrong.play();
                this.fail();
            }, this);

        }
    };

    Remediation.prototype.success = function () {
        this.consecutiveMistakes = 0;
        this.stepIndex++;
        this.consecutiveSuccess++;

        if (this.stepIndex < this.correctResponses.length) {
            this.getNewCoconuts();
            this.game.eventManager.emit('unPause');
        }
        else {
            this.stepIndex = 0;
            this.roundIndex++;
            this.triesRemaining--;
            this.game.eventManager.emit('success');
            if (this.triesRemaining > 0) {
                if (this.game.discipline === 'language') this.sounds.correctRoundAnswer.play();
                if (this.game.gameConfig.debugPanel) this.cleanLocalPanel();
                this.game.params.increaseLocalDifficulty();
                if (this.game.gameConfig.debugPanel) this.setLocalPanel(); var context = this;
                setTimeout(function () {
                    context.initRound(context.roundIndex);
                    context.board.text.text = "";
                    if (context.game.discipline == 'maths') {
                        context.sequence.numberIndex = context.board.setTextMaths(context.sequence.sequence);
                    }
                    context.getNewCoconuts();
                    context.game.eventManager.emit('playCorrectSound');
                }, 3 * 1000);
            }
            else {
                this.gameOverWin();
            }
        }

    };

    Remediation.prototype.fail = function () {
        var params = this.game.params.getGeneralParams();
        this.lives--;
        this.triesRemaining--;
        this.consecutiveMistakes++;
        this.consecutiveSuccess = 0;
        this.game.eventManager.emit('fail');

        console.log(this.lives)
        console.log(this.triesRemaining)

        if (this.lives > 0 && this.triesRemaining > 0) {
            if (this.consecutiveMistakes === params.incorrectResponseCountTriggeringFirstRemediation) { //Triggers kalulu's help + lowers difficulty

                var context = this;
                setTimeout(function () {
                    context.game.eventManager.emit('playCorrectSound');//listened here; check initEvents
                }, 1000);

                if (this.game.gameConfig.debugPanel) this.cleanLocalPanel();
                this.game.params.decreaseLocalDifficulty();
                if (this.game.gameConfig.debugPanel) this.setLocalPanel();
            }
            else if (this.consecutiveMistakes === params.incorrectResponseCountTriggeringSecondRemediation) {
                for (var i = 0; i < this.trees.normalTree.monkey.length; i++) {
                    if (this.correctResponses[this.stepIndex].value.toString() == this.trees.normalTree.monkey[i].coconut.sprite.text.text.toString()) {
                        this.trees.normalTree.monkey[i].coconut.sprite.highlight.visible = true;
                    }
                }
                this.game.eventManager.emit('help'); // listened by Kalulu to start the help speech; pauses the game in kalulu
                if (this.game.gameConfig.debugPanel) this.cleanLocalPanel();
                this.game.params.decreaseLocalDifficulty();
                if (this.game.gameConfig.debugPanel) this.setLocalPanel();
                this.consecutiveMistakes = 0; // restart the remediation
            }
        }
        else if (this.triesRemaining === 0 && this.lives > 0) {
            this.gameOverWin();
        }
        else {
            console.log("?")
            this.gameOverLose();
        }
    };

    Remediation.prototype.getNewCoconuts = function () {
        for (var i = 0; i < this.trees.normalTree.monkey.length; i++) {
            this.trees.normalTree.monkey[i].getNewCoconut();
        }
        this.setTexts();
    };

    Remediation.prototype.initTrees = function (game) {
        var globalParams = this.game.params.getGlobalParams();

        this.trees = {};

        this.trees.kingTree = new Tree(true, game);
        this.trees.normalTree = new Tree(false, game, globalParams.monkeyOnScreen);
    };


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

    Remediation.prototype.gameOverWin = function gameOverWin() {

        this.game.won = true;
        this.sounds.winGame.play();
        this.game.eventManager.emit('offUi');// listened by ui

        this.sounds.winGame.onStop.add(function () {
            this.sounds.winGame.onStop.removeAll();
            this.game.eventManager.emit('GameOverWin');//listened by Ui
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
            this.debugPanel = this.game.debugPanel || new Dat.GUI();

            var globalLevel = this.game.params.globalLevel;

            this.debugFolderNames = {
                info      : "Level Info",
                general   : "General Parameters",
                global    : "Global Parameters",
                local     : "Local Parameters",
                functions : "Debug Functions",
            };

            var infoPanel = this.debugPanel.addFolder(this.debugFolderNames.info);

            var generalParamsPanel = this.debugPanel.addFolder(this.debugFolderNames.general);
            var globalParamsPanel = this.debugPanel.addFolder(this.debugFolderNames.global);
            this._localParamsPanel = this.debugPanel.addFolder(this.debugFolderNames.local);

            this.debugFunctions = this.debugPanel.addFolder(this.debugFolderNames.functions);

            infoPanel.add(this.game.params, "_currentGlobalLevel").listen();
            infoPanel.add(this.game.params, "_currentLocalRemediationStage").listen();


            generalParamsPanel.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringFirstRemediation").min(1).max(5).step(1).listen();
            generalParamsPanel.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringSecondRemediation").min(1).max(5).step(1).listen();
            generalParamsPanel.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "lives").min(1).max(5).step(1).listen();
            generalParamsPanel.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "capitalLettersShare").min(0).max(1).step(0.05).listen();

            globalParamsPanel.add(this.game.params._settingsByLevel[globalLevel].globalRemediation, "monkeyOnScreen").min(1).max(4).step(1).listen();

            this.setLocalPanel();

            this.debugFunctions.add(this, "AutoWin");
            this.debugFunctions.add(this, "AutoLose");
            this.debugFunctions.add(this, "skipKalulu");
            this.debugFunctions.open();
    };

    Remediation.prototype.clearDebugPanel = function clearDebugPanel() {
        console.log("Monkeys clearing its debugPanel");
        if(this.game.debugPanel) {
            for (var folderName in this.debugFolderNames) {
                this.debugPanel.removeFolder(this.debugFolderNames[folderName]);
            }
        }
        else {
            this.debugPanel.destroy();
        }
    };



    Remediation.prototype.cleanLocalPanel = function cleanLocalPanel() {

        for (var element in this._localParamsPanel.items) {
            if (!this._localParamsPanel.items.hasOwnProperty(element)) continue;
            this._localParamsPanel.remove(this._localParamsPanel.items[element]);
        }
    };

    Remediation.prototype.setLocalPanel = function setLocalPanel() {

        var globalLevel = this.game.params.globalLevel;
        var localStage = this.game.params.localRemediationStage;

        this._localParamsPanel.items = {};
        this._localParamsPanel.items.param1 = this._localParamsPanel.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "minimumCorrectStimuliOnColumn").min(0).max(20).step(1).listen();
        this._localParamsPanel.items.param2 = this._localParamsPanel.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "correctResponsePercentage").min(0).max(1).step(0.1).listen();
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
                stimuliCount = currentsteps.stimuli.length;

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