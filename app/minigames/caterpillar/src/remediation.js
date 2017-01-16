define([
    './line',
    './caterpillar',
    'common/src/fx',
    'dat.gui',
    'common/src/popup'
], function (
    Line,
    Caterpillar,
    Fx,
    Dat,
    Popup
) {
    'use strict';

    function Remediation(game) {

        Phaser.Group.call(this, game);


        var data = this.game.pedagogicData;
        this.discipline = data.discipline;

        this.game = game;
        this.paused = true;
        this.won = false;

        this.lives = 0;
        this.consecutiveMistakes = 0;
        this.consecutiveSuccess = 0;
        this.framesToWaitBeforeNextSpawn = 0;
        this.framesToWaitBeforeNewSound = 0;
        this.berrySpawned = 0;
        this.targetBerriesSpawned = 0;
        this.distracterBerriesSpawned = 0;
        this.roundIndex = 0;
        this.stepIndex = 0;
        this.correctStepResponseApparitionsCount = 0;
        this.highlightNextSpawn = false;

        this.popup = new Popup(game);

        this.initGame();

        // Debug & Tuning
        if (this.game.gameConfig.debugPanel) {
            this.setupDebugPanel();
        }


        this.lines = [];
        this.initLines(game);

        this.initCaterpillar(game);

        this.initEvents();
        this.initSounds(game);

        this.fx = new Fx(game);

        this.initRound(this.roundIndex);
    }

    Remediation.prototype = Object.create(Phaser.Group.prototype);
    Remediation.prototype.constructor = Remediation;

    Remediation.prototype.updateGameDesignDebug = function () {
        this.setSpeed(this.game.params.getLocalParams().speed);
        this.caterpillar.setSpeed(this.game.params.getLocalParams().speed);
    };

    Remediation.prototype.initSounds = function (game) {
        this.sounds = {};

        this.sounds.right = game.add.audio('right');
        this.sounds.wrong = game.add.audio('wrong');
        this.sounds.winGame = game.add.audio('winGame');
        this.sounds.loseGame = game.add.audio('loseGame');
    };

    Remediation.prototype.initEvents = function () {
        this.game.eventManager.on('pause', function () {
            this.pause(true);
        }, this);

        this.game.eventManager.on('unPause', function () {
            this.pause(false);
        }, this);

        this.game.eventManager.on('playCorrectSound', function () {
            this.game.eventManager.emit('unPause');
            if (this.framesToWaitBeforeNewSound <= 0) {
                if (this.discipline != "maths") {
                    this.sounds.correctRoundAnswer.play();
                    this.framesToWaitBeforeNewSound = Math.floor((this.sounds.correctRoundAnswer.totalDuration + 0.5) * 60);
                }
                else {

                }
            }
        }, this);

        this.game.eventManager.on('playCorrectSoundNoUnPause', function () {
            if (this.framesToWaitBeforeNewSound <= 0) {
                if (this.discipline != "maths") {
                    this.sounds.correctRoundAnswer.play();
                    this.framesToWaitBeforeNewSound = Math.floor((this.sounds.correctRoundAnswer.totalDuration + 0.5) * 60);
                }
                else {

                }
            }
        }, this);

        this.game.eventManager.on('exitGame', function () {
            this.game.eventManager.removeAllListeners();
            this.game.eventManager = null;
            this.game.rafiki.close();
            this.game.destroy();
            if (this.game.gameConfig.debugPanel) {
                this.clearDebugPanel();
            }
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
        this.triesRemaining = params.getGlobalParams().roundsCount;
        this.lives = params.getGeneralParams().lives;

        this.won = false;
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
        if (this.discipline != "maths") {
            this.correctWord = roundData.word;
            this.sounds.correctRoundAnswer = this.game.add.audio(roundData.word.value);
            this.popup.setText(this.correctWord.value);
        }
        else {
            this.correctWord = roundData.targetSequence.value;
            this.popup.setTextMaths(this.correctWord);
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


    Remediation.prototype.pause = function (bool) {
        this.paused = bool;
        this.caterpillar.pause(bool);
        for (var i = 0; i < this.lines.length; i++) {
            this.lines[i].pause(bool);
        }
    };

    Remediation.prototype.collision = function () {

        var lLinesCount = this.lines.length;
        var lGraphemeCount;
        for (var i = 0; i < lLinesCount; i++) {
            lGraphemeCount = this.lines[i].graph.length;
            for (var j = 0; j < lGraphemeCount; j++) {
                if (!this.lines[i].graph[j].eaten && this.caterpillar.branch == this.lines[i].branch) {
                    this.game.physics.arcade.collide(this.caterpillar.head, this.lines[i].graph[j], this.collisionHandler, null, this);
                }
            }
        }
    };

    Remediation.prototype.eat = function (obj1, obj2) {
        this.caterpillar.head.eat();
        this.caterpillar.head.head.animations.currentAnim.onComplete.addOnce(function () {
            this.collisionHandler(obj1, obj2);
        }, this);
    };

    Remediation.prototype.collisionHandler = function (obj1, obj2) {
        this.game.eventManager.emit('disableUi');
        this.caterpillar.clickable = false;
        var value = obj2.parent.text.text;
        obj2.parent.apparition.close(true, 0);
        this.game.world.bringToTop(this.caterpillar.head);

        obj2.parent.eaten = true;
        this.setSpeed(1.2);

        if (value !== "") obj2.parent.sound.play();

        if (value.toString() == this.correctResponses[this.stepIndex].value.toString()) {
            this.fx.hit(this.caterpillar.head.x, this.caterpillar.head.y, true);
            this.sounds.right.play();
            this.caterpillar.head.eat();
            this.caterpillar.head.head.animations.currentAnim.onComplete.addOnce(function () {
                this.fadeAllGraph();
                this.setSpeed(this.game.params.getLocalParams().speed);
                this.game.eventManager.emit('pause');
                this.success();
                obj2.parent.visible = false;
                obj2.parent.spawned = false;
            }, this);
        }
        else {
            this.fx.hit(this.caterpillar.head.x, this.caterpillar.head.y, false);
            this.sounds.wrong.play();
            this.caterpillar.head.spit();
            this.caterpillar.head.head.animations.currentAnim.onComplete.addOnce(function () {
                this.setSpeed(this.game.params.getLocalParams().speed);
                this.game.eventManager.emit('pause');
                this.fail();
                obj2.parent.visible = false;
                obj2.parent.spawned = false;
            }, this);
        }
    };

    Remediation.prototype.success = function success() {
        this.consecutiveMistakes = 0;
        this.caterpillar.addBody(this.correctResponses[this.stepIndex].value);
        this.stepIndex++;
        this.falseStepResponsesCurrentPool = [];
        this.apparitionsCount = 0;
        this.caterpillar.clickable = true;

        this.game.eventManager.emit('offUi');

        if (this.stepIndex < this.correctResponses.length) {
            this.game.eventManager.emit('unPause');
        }
        else {
            this.popup.show(true);
            this.stepIndex = 0;
            this.roundIndex++;
            this.triesRemaining--;
            this.game.eventManager.emit('success');

            if (this.triesRemaining > 0) {

                if (this.discipline != "maths") this.sounds.correctRoundAnswer.play();
                if (this.game.gameConfig.debugPanel) this.cleanLocalPanel();
                this.game.params.increaseLocalDifficulty();
                if (this.game.gameConfig.debugPanel) this.setLocalPanel();
                var context = this;
                setTimeout(function () {
                    context.popup.show(false);
                    context.initRound(context.roundIndex);
                    context.destroyGraph();
                    context.caterpillar.reset(context.lines[1].y);
                    context.caterpillar.branch = 2;
                    context.game.eventManager.emit('playCorrectSound');
                }, 3 * 1000);
            }
            else {
                this.gameOverWin();
            }
        }

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

    Remediation.prototype.destroyGraph = function () {
        for (var i = 0; i < this.lines.length; i++) {
            this.lines[i].destroyGraph();
        }
    };

    Remediation.prototype.resetLines = function () {
        var linesLength = this.lines.length;

        for (var i = 0; i < linesLength; i++) {
            var graphLength = this.lines[0].graph.length;
            for (var j = 0; j < graphLength; j++) {
                this.lines[0].graph.pop().destroy();
            }
            var leavesLength = this.lines[0].leaves.length;
            for (var j = 0; j < leavesLength; j++) {
                this.lines[0].leaves.pop().destroy();
            }
            this.lines.splice(0, 1)[0].destroy();
        }
    };

    Remediation.prototype.fadeAllGraph = function () {
        var linesLength = this.lines.length;

        for (var i = 0; i < linesLength; i++) {
            this.lines[i].fadeAndDestroyGraph();
        }
    };

    Remediation.prototype.fail = function () {
        this.lives--;
        this.triesRemaining--;
        this.consecutiveMistakes++;
        this.game.eventManager.emit('fail');
        this.caterpillar.clickable = true;

        if (this.lives > 0 && this.triesRemaining > 0) {
            if (this.consecutiveMistakes == this.game.params.getGeneralParams().incorrectResponseCountTriggeringFirstRemediation) {
                var context = this;
                context.game.eventManager.emit('playCorrectSoundNoUnPause');//listened here; check initEvents
                context.game.eventManager.emit('offUi');

                context.popup.show(true);

                setTimeout(function () {
                    context.popup.show(false);
                    context.game.eventManager.emit('unPause');
                }, context.game.params.getGeneralParams().popupTimeOnScreen * 1000);

            }
            else if (this.consecutiveMistakes == this.game.params.getGeneralParams().incorrectResponseCountTriggeringSecondRemediation) {
                this.highlightNextSpawn = true;
                for (var i = 0; i < this.lines.length; i++) {
                    for (var j = 0; j < this.lines[i].graph.length; j++) {
                        if (this.lines[i].graph[j].text.text.toString() == this.correctResponses[this.stepIndex].value.toString()) {
                            this.lines[i].graph[j].highlight.visible = true;
                            this.highlightNextSpawn = false;
                        }
                    }
                }

                this.consecutiveMistakes = 0;
                this.game.eventManager.emit('help');
                if (this.game.gameConfig.debugPanel) this.cleanLocalPanel();
                this.game.params.decreaseLocalDifficulty();
                if (this.game.gameConfig.debugPanel) this.setLocalPanel();
            }
            else {
                this.game.eventManager.emit('playCorrectSound');
            }
        }
        else if (this.triesRemaining === 0 && this.lives > 0) {
            this.gameOverWin();
        }
        else {
            this.gameOverLose();
        }
    };

    Remediation.prototype.initLines = function (game) {

        var generalParams = this.game.params.getGeneralParams();
        var globalParams = this.game.params.getGlobalParams();
        var localParams = this.game.params.getLocalParams();

        for (var i = 0; i < globalParams.lineCount; i++) {
            var temp = new Line(175,
                (i + 1) * game.world.height / (globalParams.lineCount + 1),
                game);

            temp.line.hitArea = new Phaser.Rectangle(0,
                -game.world.height / (globalParams.lineCount + 1),
                game.world.width,
                (game.world.height / (globalParams.lineCount + 1)) * 2);

            temp.line.inputEnabled = true;
            temp.inputEnabled = true;
            temp.events = temp.line.events;

            temp.events.onInputDown.add(this.click, this);
            temp.branch = i + 1;
            temp.setSpeed(localParams.speed);
            this.lines.push(temp);
        }
    };

    Remediation.prototype.setSpeed = function (speed) {
        for (var i = 0; i < this.lines.length; i++) {
            this.lines[i].setSpeed(speed);
        }
    };

    Remediation.prototype.click = function (target, pointer) {
        if (!this.paused && this.caterpillar.clickable)
            if (target.parent.branch != this.caterpillar.branch) {
                this.caterpillar.branch = target.parent.branch;
                this.caterpillar.moveTo(target.parent.y);
            }
    };

    Remediation.prototype.initCaterpillar = function (game) {

        var generalParams = this.game.params.getGeneralParams();
        var globalParams = this.game.params.getGlobalParams();
        var localParams = this.game.params.getLocalParams();

        var line, branch;

        if (this.lines.length === 3) {
            line = 1; branch = 2;
        }
        else if (this.lines.length === 4 || this.lines.length === 5) {
            line = 2; branch = 3;
        }

        this.caterpillar = new Caterpillar(this.lines[line].x + 100, this.lines[line].y, game);
        this.caterpillar.branch = branch;
        this.caterpillar.setSpeed(generalParams.caterpillarSpeed);
    };

    Remediation.prototype.manageBerriesSpawning = function () {

        var generalParams = this.game.params.getGeneralParams();
        var globalParams = this.game.params.getGlobalParams();
        var localParams = this.game.params.getLocalParams(); // get the latest localParams (localParams can change anytime during the game following player's inputs)

        this.framesToWaitBeforeNextSpawn--;
        var berriesCountToAdd = globalParams.berriesOnScreen - this.berriesSpawned;

        var str = "--> missing " + berriesCountToAdd + "( " + this.berriesSpawned + " vs. " + globalParams.berriesOnScreen + " required)";
        //console.log(str);
        // console.info("frames before new " + this.framesToWaitBeforeNextSpawn);
        if (berriesCountToAdd === 0) {
            //console.log("engough jellies on screen");
            return;
        }
        else if (berriesCountToAdd > 0 && this.framesToWaitBeforeNextSpawn <= 0) {
            this.spawnBerry();

        }
    };

    Remediation.prototype.spawnBerry = function () {
        var localParams = this.game.params.getLocalParams();
        var globalParams = this.game.params.getGlobalParams();
        var isTargetValue, value, lineNumber, lBerry, j, apparition;

        // determine if we need a target or a distracter
        if (this.targetBerriesSpawned < localParams.minimumCorrectStimuliOnScreen && this.apparitionsCount > globalParams.berriesOnScreen / 2) {
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

        lineNumber = Math.floor(Math.random() * globalParams.lineCount);
        lBerry = this.lines[lineNumber].spawnGraph(value);
        if (isTargetValue && this.highlightNextSpawn) lBerry.highlight.visible = true;

        j = 0;
        // console.log(value);
        // console.log(lBerry);
        while (this.results.data.rounds[this.roundIndex].steps[this.stepIndex].stimuli[j].value != value) { //finds the value in the results to add one apparition
            j++;
        }
        apparition = new this.game.rafiki.StimulusApparition(isTargetValue);

        this.results.data.rounds[this.roundIndex].steps[this.stepIndex].stimuli[j].apparitions.push(apparition);
        lBerry.apparition = apparition;
        this.apparitionsCount++;
        this.framesToWaitBeforeNextSpawn = localParams.respawnTime * 60;

        for (var i = 0; i < this.caterpillar.tail.length; i++) {
            this.game.world.bringToTop(this.caterpillar.tail[i]);
        }
        for (var i = 0; i < this.caterpillar.caterpillarBody.length; i++) {
            this.game.world.bringToTop(this.caterpillar.caterpillarBody[i]);

        }
        this.game.world.bringToTop(this.caterpillar.head);

        if (isTargetValue) this.correctStepResponseApparitionsCount++;
        if (this.correctStepResponseApparitionsCount == 3 && this.game.discipline != "maths") {
            this.correctStepResponseApparitionsCount = 0;

            if (this.framesToWaitBeforeNewSound === 0 ) this.game.eventManager.emit('playCorrectSoundNoUnPause');
        }
    };

    Remediation.prototype.update = function () {

        if (this.framesToWaitBeforeNewSound > 0) this.framesToWaitBeforeNewSound--;

        if (this.paused) return;

        this.collision();

        this.berriesSpawned = 0;

        this.targetBerriesSpawned = 0;
        this.distracterBerriesSpawned = 0;
        for (var i = 0 ; i < this.lines.length ; i++) {
            this.berriesSpawned += this.lines[i].graph.length;
            for (var j = this.lines[i].graph.length - 1; j >= 0 ; j--) {

                var lBerry = this.lines[i].graph[j];

                if (lBerry.hasExitedScreen) {
                    if (!lBerry.apparition.isClicked) {
                        lBerry.apparition.close(false, 0);
                    }

                    this.lines[i].graph.splice(j, 1)[0].destroy();
                }
                else {
                    if (lBerry.apparition.isCorrect) {
                        this.targetBerriesSpawned++;
                    }
                    else {
                        this.distracterBerriesSpawned++;
                    }
                }
            }
        }

        this.manageBerriesSpawning();
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

        var generalParams = this.game.params.getGeneralParams();
        var globalParams = this.game.params.getGlobalParams();



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
        // console.log(this.game.params);
        this._debugInfo.add(this.game.params, "globalLevel").listen();
        this._debugInfo.add(this.game.params, "localRemediationStage").listen();

        this._debugGeneralParams.add(generalParams, "incorrectResponseCountTriggeringFirstRemediation").min(1).max(5).step(1).listen();
        this._debugGeneralParams.add(generalParams, "incorrectResponseCountTriggeringSecondRemediation").min(1).max(5).step(1).listen();
        this._debugGeneralParams.add(generalParams, "lives").min(1).max(5).step(1).listen();

        // SPECIFIC TO THIS GAME

        this._debugGeneralParams.add(globalParams, "berriesOnScreen").min(0).max(5).step(0.1).listen();
        this._debugGeneralParams.add(globalParams, "lineCount").min(0).max(5).step(0.1).listen();

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


    Remediation.prototype.setLocalPanel = function setLocalPanel() {

        var localParams = this.game.params.getLocalParams();

        this._debugLocalParams.items = {};
        this._debugLocalParams.items.param1 = this._debugLocalParams.add(localParams, "minimumCorrectStimuliOnScreen").min(0).max(20).step(1).listen();
        this._debugLocalParams.items.param2 = this._debugLocalParams.add(localParams, "correctResponsePercentage").min(0).max(1).step(0.1).listen();
        this._debugLocalParams.items.param2 = this._debugLocalParams.add(localParams, "berryPerLine").min(0).max(10).step(1).listen();
        this._debugLocalParams.items.param3 = this._debugLocalParams.add(localParams, "respawnTime").min(1).max(5).step(0.1).listen();
        this._debugLocalParams.items.param4 = this._debugLocalParams.add(localParams, "speed").min(1).max(20).step(0.5).listen();
        this._debugLocalParams.items.param5 = this._debugLocalParams.add(this, "updateGameDesignDebug");
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
            console.log(currentRound);
            if (this.game.pedagogicData.discipline === 'language') {
                currentRound.word.stats = {
                    apparitionTime: Date.now() - 10000,
                    exitTime: Date.now(),
                    success: true
                };
            }
            else if (this.game.pedagogicData.discipline === 'maths') {
                currentRound.targetSequence.stats = {
                    apparitionTime: Date.now() - 10000,
                    exitTime: Date.now(),
                    success: true
                };
            }

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
            if (this.game.pedagogicData.discipline === 'language') {
                currentRound.word.stats = {
                    apparitionTime: Date.now() - 20000,
                    exitTime: Date.now(),
                    success: false
                };
            }
            else if (this.game.pedagogicData.discipline === 'maths') {
                currentRound.targetSequence.stats = {
                    apparitionTime: Date.now() - 20000,
                    exitTime: Date.now(),
                    success: false
                };
            }

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