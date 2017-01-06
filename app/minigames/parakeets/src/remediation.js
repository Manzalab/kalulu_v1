define([
    './nest',
    './branch',
    'dat.gui'
], function (
    Nest,
    Branch,
    Dat
) {

    'use strict';

    function Remediation(game) {
        Phaser.Group.call(this, game);

        this.game = game;
        this.paused = false;
        this.triesRemaining = 0;
        this.lives = 0;
        this.parakeetPairsRemaining = 0;
        this.clickCount = 0;
        this.consecutiveMistakes = 0;
        this.won = false;
        this.timeWithoutClick = 0;
        this.highlightedParakeet = null;

        this.eventManager = game.eventManager;
        console.log("before init");
        this.initGame();
        console.log("after init");
        this.branches = [];

        this.nest = new Nest(game.height - 100, false, game);
        console.log("after nest");
        this.wrongAnswerSprite = game.add.sprite(0, 0, 'wrong');
        this.wrongAnswerSprite.visible = false;
        this.wrongAnswerSprite.anchor.setTo(0.5, 0.5);
        this.wrongAnswerSprite.scale.x = 0.2;
        this.wrongAnswerSprite.scale.y = 0.2;
        this.wrongAnswerSprite.scale.tween = this.game.add.tween(this.wrongAnswerSprite.scale);
        this.wrongAnswerSprite.scale.tween.to({ x: 1.5, y: 1.5 }, 750, Phaser.Easing.Default, false, 0, 0, true);
        this.wrongAnswerSprite.tween = this.game.add.tween(this.wrongAnswerSprite);
        this.wrongAnswerSprite.tween.to({ alpha: 0 }, 750, Phaser.Easing.Exponential.In, false, 0, 0, false);
        console.log("before newgame");
        this.newGame(game);
        console.log("after newgame");
        this.initEvents(game);
        this.initSounds(game);

        // Debug
        if (this.game.gameConfig.globalVars) window.memory.memory = this.memory;

        if (this.game.gameConfig.debugPanel) this.setupDebugPanel();
    };

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
        this.parakeetPairsRemaining = params.getGlobalParams().parakeetPairs;

        this.won = false;
    };

    Remediation.prototype.initSounds = function (game) {
        this.sounds = {};

        this.sounds.right = game.add.audio('right');
        this.sounds.wrong = game.add.audio('wrong');
        this.sounds.winGame = game.add.audio('winGame');
        this.sounds.loseGame = game.add.audio('loseGame');
    }

    Remediation.prototype.newGame = function (game) {

        var globalParams = this.game.params.getGlobalParams();
        var localParams = this.game.params.getLocalParams();
 
        console.log(globalParams);

        var arrayStimuli = [];
        console.log(this.game.pedagogicData.data.rounds)
        var roundData = this.game.pedagogicData.data.rounds[0].steps[0];
        var roundType = roundData.type;
        console.log(roundData);
        var pairsCount = globalParams.parakeetPairs;
        console.log(this.game.discipline);
        if (this.game.discipline != "maths")
            for (var i = 0; i < pairsCount; i++) {
                var lowerCase = {};
                var upperCase = {};

                lowerCase.value = roundData.stimuli[i].value;
                lowerCase.text = roundData.stimuli[i].value.toLowerCase();
                upperCase.value = roundData.stimuli[i].value;
                upperCase.text = roundData.stimuli[i].value.toUpperCase();

                arrayStimuli.push(lowerCase);
                arrayStimuli.push(upperCase);
            }
        else {
          
            for (var i = 0; i < pairsCount; i++) {
                console.log(roundData.stimuli);
                var stimuli = roundData.stimuli[i];

                for (var j = 0; j < 2; j++) {
                    var value = {};
                    value.value = stimuli.value;
                    value.text = stimuli.value;

                    if (this.game.discipline == "maths" && roundType == "audioToNonSymbolic") value.picture = true;
                    arrayStimuli.push(value);

                }             
            }
        }
        var orientation = true;
        for (var i = 0; i < globalParams.branchesCount; i++) {
            var arrayValue = [];

            for (var j = 0 ; j < pairsCount * 2 / globalParams.branchesCount; j++) {
                var rand = Math.floor(Math.random() * arrayStimuli.length);
                arrayValue.push(arrayStimuli[rand]);
                arrayStimuli.splice(rand, 1);
            }

            var y = game.height - 200;
            y -= 100;
            y -= 150 * i;

            var temp = new Branch(y, orientation, arrayValue, game);
            orientation = !orientation;
            this.branches.push(temp);
        }

        game.world.bringToTop(this.nest);
    }

    Remediation.prototype.initEvents = function (game) {
        this.eventManager.on('pause', function () {
            this.paused = true;
        }, this);

        this.eventManager.on('unPause', function () {
            this.paused = false;
        }, this);

        this.eventManager.on('start', function () {
            var context = this;
            setTimeout(function () {
                context.returnAll();
            }, 5000);
        }, this);

        this.eventManager.on('clicked', function (parakeet) {
            this.timeWithoutClick = 0;
            this.click(parakeet);
        }, this);

        this.eventManager.on('success', function (para1, para2) {
            this.sounds.right.play();
            this.success(para1, para2);
        }, this);

        this.eventManager.on('parakeetOutOfBound', function (parakeet) {
            for (var i = 0; i < this.branches.length; i++) {
                for (var j = 0; j < this.branches[i].parakeet.length; j++) {
                    if (this.branches[i].parakeet[j] == parakeet) {
                        this.branches[i].parakeet.splice(j, 1)[0].destroy();
                        return;
                    }
                }
            }
        }, this);

        this.eventManager.on('exitGame', function () {
            this.game.rafiki.close();
            if (this.game.gameConfig.debugPanel) this.clearDebugPanel();
            this.game.destroy();
            this.eventManager.removeAllListeners();
            this.eventManager = null;
        }, this);
     
        this.eventManager.on('pause', function () {
            this.pause(true);
        }, this);

        this.eventManager.on('unPause', function () {
            this.pause(false);
        }, this);
    }

    Remediation.prototype.pause = function (bool) {
        this.paused = bool;

        for (var i = 0; i < this.branches.length; i++) {
            this.branches[i].pause(bool);
        }
    }

    Remediation.prototype.click = function (parakeet) {
        this.clickCount++;

        this.highlightedParakeet = null;

        if (this.clickCount % 2 == 0) {
            this.clickCount = 0;

            this.eventManager.emit('unClickable');
			this.eventManager.emit('pause');
            if (this.clickValue.value == parakeet.value) {
                this.eventManager.emit('success', this.clickValue, parakeet);
            }
            else {
                this.sounds.wrong.play();
                this.fail(this.clickValue, parakeet);
            }
        }
        else {
            this.clickValue = parakeet;
        }
    }

    Remediation.prototype.success = function (para1, para2) {
        this.consecutiveMistakes = 0;
        para1.parent.bringToTop(para1);
        para2.parent.bringToTop(para2);

        this.parakeetPairsRemaining--;

        if (para2.value == para1.value) {
            var temp = para1;
            para1 = para2;
            para2 = temp;
        }

        para1.happy(true);
        para2.happy(true);

        //Not great but works fine
        var context = this;

        setTimeout(function () {
            para1.flyTo(context.nest.nest.world.x - para1.parakeetSprite.width / 3, context.nest.y - para1.parakeetSprite.height / 6);

            setTimeout(function () {
                para2.flyTo(context.nest.nest.world.x + para2.parakeetSprite.width / 3, context.nest.y - para2.parakeetSprite.height / 6);

                setTimeout(function () {
                    para2.sound.play();

                }, para2.time * 1000);

                setTimeout(function () {
                    para1.flyTo(para1.parent.width * 4 / 3, para1.parent.height - 100);
                    para2.flyTo(para2.parent.width * 4 / 3, para2.parent.height);
                    context.eventManager.emit('clickable');
					context.eventManager.emit('unPause');
					if (context.parakeetPairsRemaining == 0) {
					    context.gameOverWin();
                    }
                }, para2.time * 1000 + 3000);
            }, 200);
        }, 1000);

    }

    Remediation.prototype.fail = function (para1, para2) {
        this.consecutiveMistakes++;
        this.triesRemaining--;

        this.wrongAnswerSprite.x = para2.x;
        this.wrongAnswerSprite.y = para2.y - para2.height / 2;
        this.wrongAnswerSprite.visible = true;
        this.wrongAnswerSprite.alpha = 1;
        this.parent.bringToTop(this.wrongAnswerSprite);
        this.wrongAnswerSprite.scale.tween.start();
        this.wrongAnswerSprite.tween.start();
        para1.sad(true);
        para2.sad(true);

        var context = this;
        if (this.consecutiveMistakes == this.game.params.getGeneralParams().incorrectResponseCountTriggeringFirstRemediation ) {
            for (var i = 0; i < context.branches.length; i++) {
                for (var j = 0; j < context.branches[i].parakeet.length; j++) {
                    if (this.branches[i].parakeet[j].value == para1.value && this.branches[i].parakeet[j] != para1) {
                        var temp = this.branches[i].parakeet[j];
                    }
                }
            }

            setTimeout(function () {
                para2.return(false);
                temp.return(true);
                setTimeout(function () {
                    temp.return(false);
                    para1.return(false);
                    temp.highlight.visible = true;
                    context.highlightedParakeet = temp;
                    context.eventManager.emit('clickable');
					context.eventManager.emit('unPause');
                }, 5 * 1000);
            }, 1000);
        }

        else if (this.consecutiveMistakes == this.game.params.getGeneralParams().incorrectResponseCountTriggeringSecondRemediation) {
            this.consecutiveMistakes = 0;
            setTimeout(function () {
                for (var i = 0; i < context.branches.length; i++) {
                    for (var j = 0; j < context.branches[i].parakeet.length; j++) {
                        if (context.branches[i].parakeet[j] != para1 && context.branches[i].parakeet[j] != para2) context.branches[i].parakeet[j].return(true);
                    }
                }

                context.highlightedParakeet = null;

                setTimeout(function () {
                    context.returnAll(false);
                    context.eventManager.emit('clickable');
					context.eventManager.emit('unPause');
                }, context.game.params.getLocalParams().showTime * 1000);
            }, 1000);
        }
        else {
            setTimeout(function () {
                para1.return(false);
                para2.return(false);
                context.eventManager.emit('clickable');
            }, 1000);
        }

    }


    Remediation.prototype.returnAll = function (bool) {
        for (var i = 0; i < this.branches.length; i++) {
            for (var j = 0; j < this.branches[i].parakeet.length; j++) {
                this.branches[i].parakeet[j].return(bool);
            }
        }
    }

    Remediation.prototype.tenSecRemediation = function () {
        this.paused = true;
        if (this.clickCount % 2 == 0) {
            if (!this.highlightedParakeet) {
                var context = this;

                this.eventManager.emit('unClickable');
                var rand1 = Math.floor(Math.random() * this.branches.length);
                var para = this.branches[rand1].parakeet[Math.floor(Math.random() * this.branches[rand1].parakeet.length)];
                para.return(true);

                for (var i = 0; i < this.branches.length; i++) {
                    for (var j = 0; j < this.branches[i].parakeet.length; j++) {
                        if (this.branches[i].parakeet[j].value == para.value && this.branches[i].parakeet[j] != para) {
                            var temp = this.branches[i].parakeet[j];
                        }
                    }
                }

                temp.return(true);
                setTimeout(function () {
                    temp.return(false);
                    para.return(false);
                    temp.highlight.visible = true;
                    context.highlightedParakeet = temp;
                    context.eventManager.emit('clickable');
					context.eventManager.emit('unPause');
                }, 5 * 1000);
            }
            else {
                var context = this;

                this.eventManager.emit('unClickable');
                this.highlightedParakeet.return(true);

                for (var i = 0; i < this.branches.length; i++) {
                    for (var j = 0; j < this.branches[i].parakeet.length; j++) {
                        if (this.branches[i].parakeet[j].value == this.highlightedParakeet.value && this.branches[i].parakeet[j] != this.highlightedParakeet) {
                            var temp = this.branches[i].parakeet[j];
                        }
                    }
                }
                para = this.highlightedParakeet;
                temp.return(true);
                setTimeout(function () {
                    temp.return(false);
                    para.return(false);
                    context.eventManager.emit('clickable');
					context.eventManager.emit('unPause');
                }, 5 * 1000);
            }
        }
        else {
            for (var i = 0; i < this.branches.length; i++) {
                for (var j = 0; j < this.branches[i].parakeet.length; j++) {
                    if (this.branches[i].parakeet[j].value == this.clickValue.value && this.branches[i].parakeet[j] != this.clickValue) {
                        var temp = this.branches[i].parakeet[j];
                    }
                }
            }
            this.highlightedParakeet = temp;
            temp.highlight.visible = true;
        }
    };

    Remediation.prototype.update = function () {
        if (!this.paused) {
            this.timeWithoutClick++;

            if (this.timeWithoutClick % (60 * 15) == 0) {
                this.tenSecRemediation();
            }
            else if (this.timeWithoutClick % (60 * 20) == 0)
                this.eventManager.emit('help');
        }
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

    Remediation.prototype.saveGameRecord = function saveGameRecord() {
        this.game.record.close(this.game.won, this.results, this.game.params.localRemediationStage);
        this.game.rafiki.save(this.game.record);
    };

    // DEBUG
    
    Remediation.prototype.setupDebugPanel = function setupDebugPanel () {
        console.log(this.game);
        this.debugPanel = this.game.debugPanel || new Dat.GUI(/*{ autoPlace: false }*/);
       
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

        this._debugGlobalParams.add(this.game.params._settingsByLevel[globalLevel].globalRemediation, "parakeetPairs").min(1).max(30).step(1).listen();
        this._debugGlobalParams.add(this.game.params._settingsByLevel[globalLevel].globalRemediation, "branchesCount").min(1).max(10).step(1).listen();

        this.setLocalPanel();
        // END OF SPECIFIC


        this._debugFunctions.add(this, "AutoWin");
        this._debugFunctions.add(this, "skipKalulu");
        this._debugFunctions.open();
    };


    Remediation.prototype.clearDebugPanel = function clearDebugPanel () {
        console.log("Parakeets clearing its debugPanel");
        if(this.game.debugPanel) {
            for (var folderName in this.debugFolderNames) {
                this.debugPanel.removeFolder(this.debugFolderNames[folderName]);
            }
        }
        else {
            this.debugPanel.destroy();
        }
    };


    Remediation.prototype.setLocalPanel = function setLocalPanel() {

        var globalLevel = this.game.params.globalLevel;
        var localStage = this.game.params.localRemediationStage;

        this._debugLocalParams.items = {};
        this._debugLocalParams.items.param1 = this._debugLocalParams.add(this.game.params._settingsByLevel[globalLevel].localRemediation[localStage], "showTime").min(1).max(3).step(0.5).listen();
    };

    Remediation.prototype.cleanLocalPanel = function cleanLocalPanel() {

        for (var element in this._debugLocalParams.items) {
            if (!this._debugLocalParams.items.hasOwnProperty(element)) continue;
            this._debugLocalParams.remove(this._debugLocalParams.items[element]);
        }
    };

    Remediation.prototype.AutoWin = function WinGameAndSave() {
                
        this.gameOverWin();
    };

    Remediation.prototype.skipKalulu = function skipKalulu () {
        this.eventManager.emit("skipKalulu");
    };

    return Remediation;
});