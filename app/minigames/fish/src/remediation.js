define([
    'common/src/fx',
    'dat.gui',
    './buoy',
    './background',
    './fish'
], function (
    Fx,
    Dat,
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
        
        /**
         * wait timer for the correct response sound
         * @type {int}
         * @private
         **/
        this.paused = false; 



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
    

    Remediation.prototype.initSounds = function (game) {
        this.sounds = {};

        this.sounds.right = game.add.audio('right');
        this.sounds.wrong = game.add.audio('wrong');
        this.sounds.winGame = game.add.audio('winGame');
        this.sounds.loseGame = game.add.audio('loseGame');
    };

    Remediation.prototype.initGame = function initGame() {

        var params = this.game.params;

        // Setting up the recording of the game for Rafiki
        this.game.record = new this.game.rafiki.MinigameDstRecord();

        this.results = this.game.pedagogicData.data; // for convenience we reference also the pedagogicData object under the name 'results' because we will add response data directly on it.
        
        if (!this.game.rafiki.latestRecord) {
            console.log("Fish Tuto Enabled");
            this.tutorial1 = true;
            this.tutorial2 = true;
        }

        this.roundIndex = 0;
        this.stepIndex = 0;
        this.score = 0;
        this.consecutiveMistakes = 0;
        this.won = false;
        this.timerFinished = false;

        this.triesRemaining = this.game.pedagogicData.data.rounds[0].steps.length;

        this.background = new Background(params.getGlobalParams().gameTimer, this.game);

        this.categories = this.game.pedagogicData.categories;
    };


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
    };


    Remediation.prototype.initEvents = function () {
        var globalParams = this.game.params.getGlobalParams();

        this.game.eventManager.on('timerFinished', function () {
            this.timerFinished = true;
            if (this.score >= globalParams.minimumSortedWords && this.score / (this.game.pedagogicData.data.rounds[0].steps.length - this.triesRemaining) >= globalParams.minimumWinRatio) {
                this.gameOverWin();
            }
            else {
                this.gameOverLose();
            }
        }, this);

        this.game.eventManager.on('swipe', function (object, direction) {
            this.game.eventManager.emit('pause');
            if (this.background.enabled) this.background.addTime(object.time);
            if (direction == 4) {
                object.flyTo(this.buoys.left.x, this.buoys.left.y);

                this.direction = "left";
            }
            if (direction == 8) {
                object.flyTo(this.buoys.right.x, this.buoys.right.y);
                this.direction = "right";
            }
        }, this);

        this.game.eventManager.on('click', function (buoy) {
            this.fish.clickable = false;
            this.game.eventManager.emit('pause');
            if (this.background.enabled) this.background.addTime(this.fish.time);
            if (buoy == this.buoys.left) {
                this.fish.flyTo(this.buoys.left.x, this.buoys.left.y);

                this.direction = "left";
            }
            else {
                this.fish.flyTo(this.buoys.right.x, this.buoys.right.y);
                this.direction = "right";
            }
        }, this);

        this.game.eventManager.on('finishedFlying', function () {
            if (this.game.discipline != "maths") {
                if(!this.tutorial1 && !this.tutorial2) {
                    var apparitions = this.stimuli[this.stepIndex][0].apparitions;
                    apparitions[apparitions.length - 1].close(true, 0);
                }

                if (this.direction == "right") {
                    if (!this.tutorial1 && !this.tutorial2) this.stimuli[this.stepIndex][0].apparitions[this.stimuli[this.stepIndex][0].apparitions.length - 1].clickedCategory = this.buoys.right.category;
                    if (this.stimuli[this.stepIndex][0].category == this.buoys.right.category) {
                        this.success();
                    }
                    else {
                        this.fail();
                    }
                }
                else {
                    if (!this.tutorial1 && !this.tutorial2) this.stimuli[this.stepIndex][0].apparitions[this.stimuli[this.stepIndex][0].apparitions.length - 1].clickedCategory = this.buoys.left.category;
                    if (this.stimuli[this.stepIndex][0].category == this.buoys.left.category) {
                        this.success();
                    }
                    else {
                        this.fail();
                    }

                }
            }
            else {
                console.log(this.buoys.right.stimuli.apparitions);
                if (this.direction == "right") {
                    // console.log(this);
                    if (!this.tutorial1 && !this.tutorial2) {
                        this.buoys.right.stimuli.apparitions[this.buoys.right.stimuli.apparitions.length - 1].close(true, 0);
                        this.buoys.left.stimuli.apparitions[this.buoys.left.stimuli.apparitions.length - 1].close(false, 0);
                    }
                    if (this.buoys.right.text.text > this.buoys.left.text.text) {
                        this.success();
                    }
                    else {
                        this.fail();
                    }

                }
                else {
                    console.log(this);
                    if (!this.tutorial1 && !this.tutorial2) {
                        this.buoys.left.stimuli.apparitions[this.buoys.left.stimuli.apparitions.length - 1].close(true, 0);
                        this.buoys.right.stimuli.apparitions[this.buoys.right.stimuli.apparitions.length - 1].close(false, 0);
                    }
                    if (this.buoys.left.text.text > this.buoys.right.text.text) {
                        this.success();
                    }
                    else {
                        this.fail();
                    }

                }
            }
        }, this);

        this.game.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.game.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);

        this.game.eventManager.on('endGameWin', function () {
            this.endGameWin();
        }, this);

        this.game.eventManager.on('endGameLoose', function () {
            this.endGameLoose();
        }, this);

        this.game.eventManager.on('exitGame', function () {
            this.game.eventManager.removeAllListeners();
            this.game.eventManager = null;
            this.game.rafiki.close();
            this.game.destroy();
        }, this);
    };


    Remediation.prototype.newStep = function () {
        // console.log("### NEW STEP");
        if (!this.tutorial1 && !this.tutorial2) {
            // console.log("new step out of tuto");
            // console.log(this.stimuli);
            this.stepIndex = Math.floor(Math.random() * (this.stimuli.length));

            for (var i = 0 ; i < this.stimuli[this.stepIndex].length; i++) {
                var apparition = new this.game.rafiki.StimulusApparition(this.stimuli[this.stepIndex][i].correctResponse);
                this.stimuli[this.stepIndex][i].apparitions = [];
                this.stimuli[this.stepIndex][i].apparitions.push(apparition);
            }
        }
        else if (this.tutorial1 && this.tutorial2) this.stepIndex = 0;
        else this.stepIndex = 1;

        if (this.game.discipline != "maths") this.fish.reset(this.stimuli[this.stepIndex][0].value);
        else {
            this.fish.reset("");
            var rand = Math.floor(Math.random() * 2);
            this.buoys.left.setText(this.stimuli[this.stepIndex][rand].value);
            this.buoys.left.stimuli = this.stimuli[this.stepIndex][rand];
            this.buoys.right.setText(this.stimuli[this.stepIndex][Math.abs(rand - 1)].value);
            this.buoys.right.stimuli = this.stimuli[this.stepIndex][Math.abs(rand - 1)];
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
                
                if (this.tutorial1) {
                    this.tutorial1 = false;
                    // console.log("Tuto 1 went to false after success");
                    this.game.eventManager.emit('firstTryWin');
                }
                else if (this.tutorial2) {
                    this.tutorial2 = false;
                    // console.log("Tuto 2 went to false after success");
                    this.game.eventManager.emit('secondTryWin');
                }
                else if (!this.timerFinished)
                    this.game.eventManager.emit('unPause');
                // console.log("About to Call New Step after success");
                this.newStep();
            }, this);

        }
        else {
            var globalParams = this.game.params.getGlobalParams();
            if (this.score / (this.game.pedagogicData.data.rounds[0].steps.length - this.triesRemaining) >= globalParams.minimumWinRatio) {
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
                
                this.sounds.wrong.onStop.removeAll();
                if (this.tutorial1) {
                    // console.log("Tuto 1 went to false after fail");
                    this.tutorial1 = false;
                    this.game.eventManager.emit('firstTryLoose');
                }
                else if (this.tutorial2) {
                    // console.log("Tuto 2 went to false after fail");
                    this.tutorial2 = false;
                    this.game.eventManager.emit('secondTryLoose');
                }
                else if(!this.timerFinished)
                    this.game.eventManager.emit('unPause');
                this.newStep();
            }, this);
        }
        else {
            var globalParams = this.game.params.getGlobalParams();
            if (this.score / (this.game.pedagogicData.data.rounds[0].steps.length - this.triesRemaining) >= globalParams.minimumWinRatio) {
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

        this.game.eventManager.emit("exitGame");
    };


    /**
    * Debug function to force loseGame and pop up the loose UI
    * @private
    **/
    Remediation.prototype.LoseGame = function LoseGame() {

        this.won = false;

        this.game.eventManager.emit("endGameLoose");
    };

    return Remediation;
});