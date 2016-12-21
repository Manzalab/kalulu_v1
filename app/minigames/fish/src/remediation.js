define([
    'common/src/fx',
    './buoy',
    './background',
    './fish'
], function (
    Fx,
    Buoy,
    Background,
    Fish
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
        this.eventManager = game.eventManager;

        /**
         * wait timer for the correct response sound
         * @type {int}
         * @private
         **/
        this.paused = false;




        /**
         * GAME DESIGN & DEBUG TOOL
         * @private
        **/
        //if (this.game.kaluluInterface.debug) {

        //    this.debug = new Dat.GUI();
        //    var debugPanel = this.debug.addFolder("Debug");

        //    debugPanel.add(this, "WinGameAndSave");
        //    debugPanel.add(this, "LoseGame");
        //}       



        this.initSounds(game);

        this.initGame();
        this.initBuoys();
        if (this.game.discipline != "maths") this.fish = new Fish(game, true);
        else this.fish = new Fish(game, false);
        this.initRound();
        this.initEvents();
        this.fx = new Fx(game);
        this.newStep();
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
        this.tutorial1 = true;
        this.tutorial2 = true;
        this.roundIndex = 0;
        this.stepIndex = 0;
        this.score = 0;
        this.consecutiveMistakes = 0;
        this.won = false;

        this.triesRemaining = params.getGlobalParams().totalTriesCount;

        this.background = new Background(params.getGlobalParams().gameTimer, this.game);

        this.categories = this.game.pedagogicData.data.categories;

        this.stimuli = this.game.pedagogicData.data.stimuli;
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
        var globalParams = this.game.params.getGlobalParams();

        this.eventManager.on('timerFinished', function () {
            if (this.score >= globalParams.minimumSortedWords && this.score / (globalParams.totalTriesCount - this.triesRemaining) >= globalParams.minimumWinRatio) {
                this.sounds.winGame.play();
                this.eventManager.emit('offUi'); //listened by Ui
                this.sounds.winGame.onStop.add(function () {
                    this.sounds.winGame.onStop.removeAll();
                    this.eventManager.emit('endWin');
                }, this);
            }
            else {
                this.sounds.loseGame.play();
                this.eventManager.emit('offUi'); //listened by Ui
                this.sounds.loseGame.onStop.add(function () {
                    this.sounds.loseGame.onStop.removeAll();
                    this.eventManager.emit('endLoose');
                }, this);
            }
        }, this);

        this.eventManager.on('swipe', function (object, direction) {
            this.eventManager.emit('pause');
            if (direction == 4) {
                object.flyTo(this.buoys.left.x, this.buoys.left.y)
                this.direction = "left";
            }
            if (direction == 8) {
                object.flyTo(this.buoys.right.x, this.buoys.right.y);
                this.direction = "right";
            }
        }, this);

        this.eventManager.on('finishedFlying', function () {
            if (this.game.discipline != "maths") {
                this.stimuli[this.stepIndex][0].apparitions[this.stimuli[this.stepIndex][0].apparitions.length - 1].close(true, 0);

                if (this.direction == "right") {
                    this.stimuli[this.stepIndex][0].apparitions[this.stimuli[this.stepIndex][0].apparitions.length - 1].clickedCategory = this.buoys.right.category;
                    if (this.stimuli[this.stepIndex][0].category == this.buoys.right.category) {
                        this.success();
                    }
                    else {
                        this.fail();
                    }

                }
                else {
                    this.stimuli[this.stepIndex][0].apparitions[this.stimuli[this.stepIndex][0].apparitions.length - 1].clickedCategory = this.buoys.left.category;
                    if (this.stimuli[this.stepIndex][0].category == this.buoys.left.category) {
                        this.success();
                    }
                    else {
                        this.fail();
                    }

                }
            }
            else {
                //for (var i = 0 ; i < this.stimuli[this.stepIndex].length; i++) {
                //    this.stimuli[this.stepIndex][i].apparitions[this.stimuli[this.stepIndex][i].apparitions.length - 1].close(true, 0);
                //}

                if (this.direction == "right") {
                    if (this.buoys.right.text.text > this.buoys.left.text.text) {
                        this.success();
                    }
                    else {
                        this.fail();
                    }

                }
                else {
                    if (this.buoys.left.text.text > this.buoys.right.text.text) {
                        this.success();
                    }
                    else {
                        this.fail();
                    }

                }
            }
        }, this);

        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);

        this.eventManager.on('endGameWin', function () {
            this.endGameWin();
        }, this);

        this.eventManager.on('endGameLoose', function () {
            this.endGameLoose();
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
    };

    /**
    **/
    Remediation.prototype.initBuoys = function () {

        this.buoys = {};
        if (this.game.discipline != "maths") {
            this.buoys.left = new Buoy(true, this.categories[0], this.game);
            this.buoys.right = new Buoy(false, this.categories[1], this.game);
        }
        else {
            this.buoys.left = new Buoy(true, "maths", this.game);
            this.buoys.right = new Buoy(false, "maths", this.game);
        }
    };

    Remediation.prototype.initRound = function () {
        var roundData = this.game.pedagogicData.data.rounds[this.roundIndex];
        this.stimuli = [];

        var stepCount = roundData.steps.length;
        for (var i = 0; i < stepCount ; i++) {
            var stimuli = roundData.steps[i].stimuli;
            this.stimuli.push(stimuli);
        }

    }

    /**
    **/
    Remediation.prototype.newStep = function () {
        this.stepIndex = Math.floor(Math.random() * (this.stimuli.length));

        for (var i = 0 ; i < this.stimuli[this.stepIndex].length; i++) {
            var apparition = new this.game.rafiki.StimulusApparition(true);
            this.stimuli[this.stepIndex][i].apparitions = [];
            this.stimuli[this.stepIndex][i].apparitions.push(apparition);
        }

        if (this.game.discipline != "maths") this.fish.reset(this.stimuli[this.stepIndex][0].value);
        else {
            this.fish.reset("");
            var rand = Math.floor(Math.random() * 2);
            this.buoys.left.setText(this.stimuli[this.stepIndex][rand].value);
            this.buoys.right.setText(this.stimuli[this.stepIndex][Math.abs(rand - 1)].value);

        }
    };

    /**
     * Triggers on success events
     **/
    Remediation.prototype.success = function () {

        if (!this.tutorial1 && !this.tutorial2) {
            this.triesRemaining--;
            this.consecutiveMistakes = 0;
            this.score++;
        }
        if (this.triesRemaining > 0) {
            if (this.direction == "right") {
                this.fx.hit(this.buoys.right.x, this.buoys.right.y, true);
            }
            else {
                this.fx.hit(this.buoys.left.x, this.buoys.left.y, true);
            }
            this.sounds.right.play();
            this.sounds.right.onStop.add(function () {
                this.sounds.right.onStop.removeAll();
                this.newStep();
                if (this.tutorial1) {
                    this.tutorial1 = false;
                    this.eventManager.emit('firstTryWin');
                }
                else if (this.tutorial2) {
                    this.tutorial2 = false;
                    this.eventManager.emit('secondTryWin');
                    this.eventManager.emit('startTimer');
                }
                else
                    this.eventManager.emit('unPause');
            }, this);

        }
        else {
            var globalParams = this.game.params.getGlobalParams();
            if (this.score / (globalParams.totalTriesCount - this.triesRemaining) >= globalParams.minimumWinRatio) {
                this.gameOverWin();
            }
            else {
                this.gameOverLose();
            }
        }
    };

    /**
     * Triggers on fail events
     **/
    Remediation.prototype.fail = function () {

        if (!this.tutorial1 && !this.tutorial2) {
            this.triesRemaining--;
            this.consecutiveMistakes++;
        }

        if (this.triesRemaining > 0) {
            if (this.direction == "right") {
                this.fx.hit(this.buoys.right.x, this.buoys.right.y, false);
            }
            else {
                this.fx.hit(this.buoys.left.x, this.buoys.left.y, false);
            }
            this.sounds.wrong.play();
            this.sounds.wrong.onStop.add(function () {
                this.newStep();
                this.sounds.wrong.onStop.removeAll();
                if (this.tutorial1) {
                    this.tutorial1 = false;
                    this.eventManager.emit('firstTryLoose');
                }
                else if (this.tutorial2) {
                    this.tutorial2 = false;
                    this.eventManager.emit('secondTryLoose');
                    this.eventManager.emit('startTimer');
                }
                else this.eventManager.emit('unPause');
            }, this);
        }
        else {
            if (this.score / (globalParams.totalTriesCount - this.triesRemaining) >= globalParams.minimumWinRatio) {
                this.gameOverWin();
            }
            else {
                this.gameOverLose();
            }
        }
    };

    /**
     * lowers difficulty for next game
     **/
    Remediation.prototype.endGameLoose = function () {
        this.game.params.decreaseLocalDifficulty();
    };

    /**
     * increment difficulty for next game
     **/
    Remediation.prototype.endGameWin = function () {
        this.game.params.increaseLocalDifficulty();
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

    /**
    * Debug function to force perfect win data and exit the game
    * @private
    **/
    Remediation.prototype.WinGameAndSave = function WinGameAndSave() {

        this.won = true;

        for (var i = 0 ; i < this.stimuli.length ; i++) {
            this.stimuli[i].apparitions = [];
            this.stimuli[i].apparitions.push({
                apparitionTime: Date.now() - 2000,
                exitTime: Date.now(),
                clickedCategory: this.stimuli[i].category,
                correctResponse: true,
                clicked: true
            });
        }

        this.eventManager.emit("exitGame");
    };

    Remediation.prototype.saveGameRecord = function saveGameRecord() {
        this.game.record.close(this.game.won, this.results, this.game.params.localRemediationStage);
        this.game.rafiki.save(this.game.record);
    };

    /**
    * Debug function to force loseGame and pop up the loose UI
    * @private
    **/
    Remediation.prototype.LoseGame = function LoseGame() {

        this.won = false;

        this.eventManager.emit("endGameLoose");
    };
    return Remediation;
});