define([
    './sentence',
    './ant',
    'common/src/fx'
], function (
    Sentence,
    Ant,
    Fx
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
    function Remediation(game) {

        Phaser.Group.call(this, game);

        this.eventManager = game.eventManager;

        this.lives = 0;
        this.stepCount = 0;
        this.consecutiveMistakes = 0;
        this.consecutiveSuccess = 0;
        this.sentences = [];
        this.ants = [];

        this.paused = false;
        this.won = false;

        this.fx = new Fx(game);
        this.initSounds(game);

        this.validateRoundButton = game.add.button(this.game.world.centerX, this.game.height, 'common/src/ui', this.onClickValidateRound, this);
        this.validateRoundButton.frameName = 'retour_valider';
        this.validateRoundButton.height = 300;
        this.validateRoundButton.width = 300;
        this.validateRoundButton.anchor.setTo(0.5, 1);
        this.validateRoundButton.visible = false;
        this.add(this.validateRoundButton);


        this.initGame();
        this.initRound(0);
        this.initEvents();

        // Debug

        if (Config.debugPanel) {

            this.debug = new Dat.GUI();

            var globalLevel = this.game.params.globalLevel;

            var infoPanel = this.debug.addFolder("Level Info");

            var generalParamsPanel = this.debug.addFolder("General Parameters");
            var globalParamsPanel = this.debug.addFolder("Global Parameters");
            this._localParamsPanel = this.debug.addFolder("Local Parameters");

            var debugPanel = this.debug.addFolder("Debug Functions");

            infoPanel.add(this.game.params, "_currentGlobalLevel").listen();
            infoPanel.add(this.game.params, "_currentLocalRemediationStage").listen();

            generalParamsPanel.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringFirstRemediation").min(1).max(5).step(1).listen();
            generalParamsPanel.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "incorrectResponseCountTriggeringSecondRemediation").min(1).max(5).step(1).listen();
            generalParamsPanel.add(this.game.params._settingsByLevel[globalLevel].generalParameters, "lives").min(1).max(5).step(1).listen();

            globalParamsPanel.add(this.game.params._settingsByLevel[globalLevel].globalRemediation, "roundsCount").min(1).max(10).step(1).listen();

            this.setLocalPanel();

            debugPanel.add(this, "AutoWin");
            debugPanel.add(this, "AutoLose");
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
        this.eventManager.on('droppedAnt', function (ant) {
            this.manageAnts(ant);
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

        this.eventManager.on('exitGame', function () {
            this.eventManager.removeAllListeners();
            this.eventManager = null;
            this.game.rafiki.close();
            this.game.destroy();
            if (this.debug) {
                this.debug.destroy();
                this.debug = null;
            }
        }, this);

        this.eventManager.on('replay', function () {
            if (Config.debugPanel) {
                document.getElementsByClassName("dg main a")[0].remove();
                this.debug = null;
            }
            this.game.state.start('Setup');
        }, this);

    };

    Remediation.prototype.closeCurrentGame = function closeCurrentGame() {
        this.deleteJellyfishes();
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
        this.lives = params.getGeneralParams().lives;
        this.triesRemaining = params.getGlobalParams().totalTriesCount;
        this.roundIndex = 0;
        this.won = false;
    };

    /**
     * Initialise parameters for the required round with data contained in this.pedagogicData
     **/
    Remediation.prototype.initRound = function initRound(roundIndex) {

        var roundData = this.game.pedagogicData.rounds[roundIndex];
        var localParams = this.game.params.getLocalParams(); // get the latest localParams (localParams can change anytime during the game following player's inputs)

        var yOffset = (this.game.height - 200) / (localParams.sentencesCount + 1);
        var xOffset = this.game.width / (localParams.sentencesCount + 1);
        for (var i = 0; i < localParams.sentencesCount; i++) {
            var words = roundData.stimuli[i].sentence.split(" ");
            this.ants.push(new Ant((i + 1) * xOffset, this.game.height, this.game, words[roundData.stimuli[i].wordIndex]));
            this.sentences.push(new Sentence(i * yOffset, yOffset, words, roundData.stimuli[i].wordIndex, this.game));
        }

        this.stepCount = 0;
    };

    Remediation.prototype.manageAnts = function (ant) {
        var origin = true;
        var localParams = this.game.params.getLocalParams();

        for (var i = 0 ; i < this.sentences.length ; i++) {
            if (ant.newY > this.sentences[i].y && ant.newY < this.sentences[i].y + this.sentences[i].screenShare && origin && this.sentences[i].associatedAnt === null) {
                origin = false;
                if (ant.associatedSentence !== null) {
                    ant.associatedSentence.associatedAnt = null;
                }
                ant.associatedSentence = this.sentences[i];
                this.sentences[i].associatedAnt = ant;
                ant.walkToSlope(this.sentences[i].words[this.sentences[i].wordIndex].x + this.sentences[i].words[this.sentences[i].wordIndex].width / 2
                    , this.sentences[i].words[this.sentences[i].wordIndex].y + this.sentences[i].y);
                this.stepCount++;
            }
        }
        if (origin) {
            if (ant.associatedSentence !== null) {
                ant.associatedSentence.associatedAnt = null;
                ant.associatedSentence = null;
                this.stepCount--;
            }
            ant.walkToSlope(ant.origin.x, ant.origin.y);
        }
        if (this.stepCount == localParams.sentencesCount) {
            var context = this;
            setTimeout(function () {
                context.validateRoundButton.visible = true;
            }, ant.time * 1000);

            this.validateRoundButton.visible = true;
        }

        this.validateRoundButton.visible = false;
    }

    Remediation.prototype.onClickValidateRound = function () {
        this.eventManager.emit("pause");
        this.validateRoundButton.visible = false;
        var success = true;
        for (var i = 0 ; i < this.sentences.length; i++) {
            if (this.sentences[i].words[this.sentences[i].wordIndex].text != this.sentences[i].associatedAnt.text.text) {
                success = false;
            }
        }
        if (success)
            this.success();
        else
            this.fail();
    }

    /**
     * Triggers onSuccess events
     **/
    Remediation.prototype.success = function () {
        this.triesRemaining--;
        this.consecutiveSuccess++;
        this.consecutiveMistakes = 0;

        this.eventManager.emit('success');

        if (this.triesRemaining > 0) {

            if (this.consecutiveSuccess % 2 === 0) { // Increment difficulty
                //this.updateRemediation(true); // TODO : implement an increase in local difficulty
                if (Config.debugPanel) this.cleanLocalPanel();
                this.game.params.increaseLocalDifficulty();
                if (Config.debugPanel) this.setLocalPanel();
            }

            var context = this;
            setTimeout(function () { // Not ideal because cannot be paused
                for (var i = 0; i < context.ants.length; i++) {
                    context.ants[i].fadeOut();
                }

                for (var i = 0; i < context.sentences.length; i++) {
                    context.sentences[i].fadeOut();
                }
                context.ants[0].tween.onComplete.add(function () {
                    context.deleteAnts();
                    context.deleteSentences();
                    context.roundIndex++;
                    context.initRound(context.roundIndex);
                    context.eventManager.emit('unPause');
                }, context);
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

        this.eventManager.emit('fail');

        if (this.lives > 0 && this.triesRemaining > 0) { // game continues, remediation can be triggered

            if (this.consecutiveMistakes === params.incorrectResponseCountTriggeringSecondRemediation) {

                this.eventManager.emit('help'); // listened by Kalulu to start the help speech; pauses the game in kalulu
                if (Config.debugPanel) this.cleanLocalPanel();
                this.game.params.decreaseLocalDifficulty();
                if (Config.debugPanel) this.setLocalPanel();
                //TODO : implement the highlight of the targetJellys
                this.consecutiveMistakes = 0; // restart the remediation
            }
            else {
                this.eventManager.once("reachedDestination", function () {
                    this.eventManager.emit("unPause");
                }, this);
            }

            for (var i = 0; i < this.ants.length ; i++) {
                this.ants[i].associatedSentence.associatedAnt = null;
                this.ants[i].associatedSentence = null;

                this.ants[i].walkToSlope(this.ants[i].origin.x, this.ants[i].origin.y);
            }

            this.stepCount = 0;
        }
        else if (this.triesRemaining === 0 && this.lives > 0) {
            this.gameOverWin();
        }
        else {
            this.gameOverLose();
        }
    };



    /**
     * deletes all ant
     * @private
     **/
    Remediation.prototype.deleteAnts = function () {
        var length = this.ants.length;
        for (var i = 0; i < length; i++) {
            this.ants.pop().destroy();
        }
    };

    /**
     * deletes all sentences
     * @private
     **/
    Remediation.prototype.deleteSentences = function () {
        var length = this.sentences.length;
        for (var i = 0; i < length; i++) {
            this.sentences.pop().destroy();
        }
    };

    /*
    Remediation.prototype.spawnJellyfish = function spawnJellyfish() {

        var localParams = this.game.params.getLocalParams();
        var globalParams = this.game.params.getGlobalParams();
        var isTargetValue, value, columnNumber, lJellyfish, j, apparition;

        // determine if we need a target or a distracter
        if (this.targetJellyfishesSpawned < localParams.minimumCorrectStimuliOnScreen && this.apparitionsCount > globalParams.jellyfishesOnScreen / 2) {
            isTargetValue = true; // we spawn a correct answer stimulus
        }
        else if (this.targetJellyfishesSpawned >= localParams.maximumCorrectStimuliOnScreen && this.apparitionsCount > globalParams.jellyfishesOnScreen / 2) {
            isTargetValue = false; // we spawn an incorrect answer stimulus
        }
        else {
            isTargetValue = Math.round(Math.random()); // we spawn an random answer stimulus (50/50)
        }

        if (isTargetValue) {
            value = this.correctResponse.value;
            //console.log("value : " + value);
        }
        else {
            if (this.falseResponsesCurrentPool.length === 0) {
                this.falseResponsesCurrentPool = this.falseResponsesCurrentPool.concat(this.falseResponses.slice(0));
                this.falseResponsesCurrentPool = this.falseResponsesCurrentPool.concat(this.falseResponses.slice(0));
                //console.log(this.falseResponsesCurrentPool);
                // we do it two times to have 2 times each false response in the pool.
            }
            value = this.falseResponsesCurrentPool.splice(Math.floor(Math.random() * this.falseResponsesCurrentPool.length), 1)[0]; // Picks a random value in all the false response values
            // console.log(this.falseResponsesCurrentPool.length + " distracters remaining in the pool");
            // console.log("value : " + value + " of type " + typeof value);
        }

        columnNumber = Math.floor(Math.random() * globalParams.columnCount) + 1;
        lJellyfish = new Jellyfish(columnNumber * this.game.width / (globalParams.columnCount + 1), this.game, value, localParams.speed);
        this.jellyfishes.push(lJellyfish);

        j = 0;
        while (this.results.rounds[0].stimuli[j].value != value) { //finds the value in the results to add one apparition
            j++;
        }
        apparition = new this.game.rafiki.StimulusApparition(isTargetValue);

        this.results.rounds[0].stimuli[j].apparitions.push(apparition);
        lJellyfish.apparition = apparition;
        this.apparitionsCount++;
        this.framesToWaitBeforeNextSpawn = localParams.respawnTime * 60;
    };
    */

    /**
     * Close the apparitions of exited jellyfishes, calls the spawner, increment frame counters
     **/
    Remediation.prototype.update = function () {

    };


    Remediation.prototype.gameOverWin = function gameOverWin() {

        this.game.won = true;
        this.sounds.winGame.play();
        this.eventManager.emit('offUi');// listened by ui

        this.sounds.winGame.onStop.add(function () {
            this.sounds.winGame.onStop.removeAll();
            this.eventManager.emit('GameOverWin');//listened by Ui (toucan = kalulu)
            this.saveGameRecord();
        }, this);
    };

    Remediation.prototype.gameOverLose = function gameOverLose() {

        this.game.won = false;
        this.sounds.loseGame.play();
        this.eventManager.emit('offUi');// listened by ui

        this.sounds.loseGame.onStop.add(function () {
            this.sounds.loseGame.onStop.removeAll();
            this.eventManager.emit('GameOverLose');// listened by ui
            this.saveGameRecord();
        }, this);
    };

    Remediation.prototype.saveGameRecord = function saveGameRecord() {
        this.game.record.close(this.game.won, this.results, this.game.params.localRemediationStage);
        this.game.rafiki.save(this.game.record);
    };

    // DEBUG
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
        this._localParamsPanel.items.param1 = this._localParamsPanel.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "sentencesCount").min(1).max(3).step(1).listen();
    };

    Remediation.prototype.AutoWin = function WinGameAndSave() {

        var apparition;
        for (var i = 0 ; i < this.results.rounds.length ; i++) {

            for (var j = 0 ; j < this.results.rounds[i].stimuli.length ; j++) {

                if (this.results.rounds[i].stimuli[j].correctResponse) {

                    for (var k = 0 ; k < this.triesRemaining ; k++) {
                        apparition = new this.game.rafiki.StimulusApparition(true);
                        apparition.close(true, 3);
                        this.results.rounds[i].stimuli[j].apparitions.push(apparition);
                    }
                }
                else {
                    for (var l = 0 ; l < 3 ; l++) {

                        apparition = new this.game.rafiki.StimulusApparition(false);
                        apparition.close(false);
                        this.results.rounds[i].stimuli[j].apparitions.push(apparition);
                    }
                }
            }
        }

        this.gameOverWin();
    };

    Remediation.prototype.AutoLose = function LoseGame() {

        var apparition;
        for (var i = 0 ; i < this.results.rounds.length ; i++) {

            for (var j = 0 ; j < this.results.rounds[i].stimuli.length ; j++) {

                if (this.results.rounds[i].stimuli[j].correctResponse) {

                    for (var k = 0 ; k < this.triesRemaining ; k++) {
                        apparition = new this.game.rafiki.StimulusApparition(true);
                        apparition.close(false);
                        this.results.rounds[i].stimuli[j].apparitions.push(apparition);
                    }
                }
                else {
                    for (var l = 0 ; l < 3 ; l++) {

                        apparition = new this.game.rafiki.StimulusApparition(false);
                        apparition.close(true, 3);
                        this.results.rounds[i].stimuli[j].apparitions.push(apparition);
                    }
                }
            }
        }

        this.gameOverLose();
    };

    return Remediation;
});