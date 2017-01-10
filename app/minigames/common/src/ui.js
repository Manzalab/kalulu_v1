(function () {

    'use strict';
    var Phaser = require('phaser-bundle');

    var BUTTON_DIM = 250;
    var BUTTON_DIM_LITTLE = 190;
    var SCORE_DIM = 130;
    var MARGE_X = 0;
    var MARGE_Y = 0;

    /**
     * Ui is in charge of the user interface
	 * @class
     * @extends Phaser.Group
     * @memberof Jellyfish
     * @param lives {int} number of lives to display
	 * @param game {Phaser.Game} game instance
	**/
    function Ui(lives, game, centralConch, replay, conch, kalulu,pause) {
        console.log("[UI] constructor called");
        kalulu = (typeof kalulu !== 'undefined') ? kalulu : true;
        centralConch = (typeof centralConch !== 'undefined') ? centralConch : true;
        replay = (typeof replay !== 'undefined') ? replay : true;
        conch = (typeof conch !== 'undefined') ? conch : true;
        pause = (typeof pause !== 'undefined') ? pause : true;

        Phaser.Group.call(this, game);

        this.features = {};
        this.features.centralConch = centralConch;
        this.features.conch = conch;
        this.features.replay = replay;
        this.features.kalulu = kalulu;
        this.features.pause = pause;

        /**
         * game.eventManager
         * @type {EventEmitter}
         **/
        this.blackBitmap = new Phaser.BitmapData(this.game, 'pause', 10, 10);
        this.blackBitmap.fill(0, 0, 0, 0.4);
        this.blackOverlay = this.create(0, 0, this.blackBitmap);
        this.blackOverlay.width = game.width;
        this.blackOverlay.height = game.height;
        this.blackOverlay.visible = true;
        // this.blackOverlay.alpha = 0.4;

        this.initScoreBar(game, lives); // the score bar located on the right of the screen

        this.initGameOverScreen(game); // the game over screen appears on top of the UI when the game ends
        this.initQuitPopup(game); // the quit popup appears when the player clicks on the quit button of the main Game UI Panel
        this.initPausePopup(game); // the pause popup appears when the player clicks on the pause button of the main Game UI Panel
        this.initGameUI(game); // the main game UI Panel, located on the left of the screen, and accessible when the game is playing (quit, conch, & kalulu buttons).

        this.initSounds(game);
        this.initEvents();
    }

    Ui.prototype = Object.create(Phaser.Group.prototype);
    Ui.prototype.constructor = Ui;

    /**
     * Initialize all ui sounds
     * @param game {Phaser.Game} game instance
     * @private
     **/
    Ui.prototype.initSounds = function initSounds(game) {
        this.sounds = {};

        this.sounds.openQuitPopup = game.add.audio('menu');
        this.sounds.validateQuit = game.add.audio('menuYes');
        this.sounds.cancelQuit = game.add.audio('menuNo');
    };

    /**
     * Initialize left menu containing the 3 buttons accessible when the game is playing
     * @param game {Phaser.Game} game instance
     **/
    Ui.prototype.initGameUI = function initGameUI(game) {

        this.gameUI = game.add.group();

        this.quitButton = game.add.button(MARGE_X, MARGE_Y, 'ui', this.onClickOnQuitPopupButton, this, 'GardenScreenButton0001.png', 'GardenScreenButton0002.png', 'GardenScreenButton0003.png', 'GardenScreenButton0004.png');
        this.quitButton.frameName = 'GardenScreenButton0004.png';
        this.quitButton.height = BUTTON_DIM;
        this.quitButton.width = BUTTON_DIM;
        this.quitButton.anchor.setTo(0, 0);
        this.gameUI.add(this.quitButton);

        this.conchButton = game.add.button(MARGE_X, (game.height + BUTTON_DIM) / 3, 'ui', this.onClickOnConchButton, this, 'ShellButton0001.png', 'ShellButton0002.png', 'ShellButton0003.png', 'ShellButton0001.png');
        this.conchButton.frameName = 'ShellButton0004.png';
        this.conchButton.height = BUTTON_DIM_LITTLE;
        this.conchButton.width = BUTTON_DIM_LITTLE;
        this.conchButton.anchor.setTo(0, 0.5);
        this.gameUI.add(this.conchButton);

        this.pauseButton = game.add.button(MARGE_X, (2 * game.height - BUTTON_DIM) / 3, 'ui', this.onClickOnPauseButton, this, 'PauseButton0001.png', 'PauseButton0002.png', 'PauseButton0003.png', 'PauseButton0004.png');
        this.pauseButton.frameName = 'PauseButton0004.png';
        this.pauseButton.height = BUTTON_DIM_LITTLE;
        this.pauseButton.width = BUTTON_DIM_LITTLE;
        this.pauseButton.anchor.setTo(0, 0.5);
        this.gameUI.add(this.pauseButton);

        this.kaluluButton = game.add.button(MARGE_X, game.height - MARGE_Y, 'ui', this.onClickOnKaluluButton, this, 'KaluluButton0001.png', 'KaluluButton0002.png', 'KaluluButton0003.png', 'KaluluButton0004.png');
        this.kaluluButton.frameName = 'KaluluButton0004.png';
        this.kaluluButton.height = BUTTON_DIM;
        this.kaluluButton.width = BUTTON_DIM;
        this.kaluluButton.anchor.setTo(0, 1);
        this.gameUI.add(this.kaluluButton);

        /** Starting central conch
         * not used in every game
         * @private
         **/
        if (this.features.centralConch) {
            this.centralConchButton = game.add.button(game.width / 2, game.height / 2, 'ui', this.onClickOnCentralConchButton, this, 'ShellBigButton0001.png', 'ShellBigButton0002.png', 'ShellBigButton0003.png', 'ShellBigButton0004.png');
            this.centralConchButton.x -= this.centralConchButton.width / 2;
            this.centralConchButton.originalX = this.centralConchButton.x;
            this.centralConchButton.originalY = this.centralConchButton.y;
            this.centralConchButton.anchor.setTo(0, 0.5);
            this.centralConchButton.visible = false;
            this.centralConchButton.inputEnabled = true;
            this.centralConchButton.originalHeight = this.centralConchButton.height;
            this.centralConchButton.originalWidth = this.centralConchButton.width;
            this.gameUI.add(this.centralConchButton);
        }

        this.add(this.gameUI);
    };

    /**
     * Initialize quit pop-up menu, which opens after a click on the GameUI quitButton
     * @param game {Phaser.Game} game instance
     **/
    Ui.prototype.initQuitPopup = function initQuitPopup(game) {

        this.quitPopup = game.add.group();
        this.quitPopup.visible = false;
        this.quitPopup.x = game.world.centerX;
        this.quitPopup.y = game.world.centerY;

        this.quitPopupBackground = this.quitPopup.create(0, 0, 'ui', 'fond_validation.png');
        this.quitPopupBackground.anchor.setTo(0.5, 0.5);
        this.quitPopupBackground.width = 1280;
        this.quitPopupBackground.height = 800;

        this.quitPopupValidateButton = game.add.button(this.quitPopupBackground.width / 2 - 30, this.quitPopupBackground.height / 2 - 20, 'ui', this.onClickOnQuitButton, this, 'TickButton0001.png', 'TickButton0002.png', 'TickButton0003.png', 'TickButton0004.png');
        this.quitPopupValidateButton.frameName = 'TickButton0001.png';
        this.quitPopupValidateButton.height = BUTTON_DIM;
        this.quitPopupValidateButton.width = BUTTON_DIM;
        this.quitPopupValidateButton.anchor.setTo(1, 1);
        this.quitPopup.add(this.quitPopupValidateButton);

        this.quitPopupCancelButton = game.add.button(-this.quitPopupBackground.width / 2 + 30, this.quitPopupBackground.height / 2 - 20, 'ui', this.onClickOnQuitPopupCancelButton, this, 'CrossButton0001.png', 'CrossButton0002.png', 'CrossButton0003.png', 'CrossButton0004.png');
        this.quitPopupCancelButton.frameName = 'CrossButton0001.png';
        this.quitPopupCancelButton.height = BUTTON_DIM;
        this.quitPopupCancelButton.width = BUTTON_DIM;
        this.quitPopupCancelButton.anchor.setTo(0, 1);
        this.quitPopup.add(this.quitPopupCancelButton);

        this.add(this.quitPopup);
    };

    /**
     * Initialize pause pop-up menu, which opens after a click on the GameUI pauseButton
     * @param game {Phaser.Game} game instance
     **/
    Ui.prototype.initPausePopup = function initPausePopup(game) {

        this.pausePopup = game.add.group();
        this.pausePopup.visible = false;
        this.pausePopup.x = game.world.centerX;
        this.pausePopup.y = game.world.centerY;

        this.pausePopupBackground = this.pausePopup.create(0, 0, 'ui', 'fond_validation.png');
        this.pausePopupBackground.anchor.setTo(0.5, 0.5);
        this.pausePopupBackground.width = 1280;
        this.pausePopupBackground.height = 800;

        this.pausePopupValidateButton = game.add.button(0, 0, 'ui', this.onClickOnPlayButton, this, 'PlayButton0001.png', 'PlayButton0002.png', 'PlayButton0003.png', 'PlayButton0001.png');
        this.pausePopupValidateButton.frameName = 'PlayButton0001.png';
        this.pausePopupValidateButton.anchor.setTo(0.5, 0.5);
        this.pausePopup.add(this.pausePopupValidateButton);

        this.add(this.pausePopup);
    };

    /**
     * Initialize right menu (aka lives)
     * @param game {Phaser.Game} game instance
     **/
    Ui.prototype.initScoreBar = function initScoreBar(game, lives) {

        this.lives = 0;
        this.scoreBar = game.add.group();
        this.scoreBar.x = game.width;
        var j = 0;
        var i = 0;
        while (lives > 0) {
            i = 0;
            while (lives > 0 && i < 8) { // 8 is the max number of icons per column
                var temp = this.scoreBar.create(-j * SCORE_DIM, SCORE_DIM * i, 'uiScoreEmpty');
                temp.anchor.setTo(1, 0);
                temp.width = SCORE_DIM;
                temp.height = SCORE_DIM;
                lives--;
                i++;
            }
            j++;
        }

        this.add(this.scoreBar);
    };

    /**
     * Initialize end pop-up menu
     * @param game {Phaser.Game} game instance
     **/
    Ui.prototype.initGameOverScreen = function initGameOverScreen(game) {

        this.gameOverScreen = game.add.group();
        this.gameOverScreen.visible = false;
        this.gameOverScreen.x = game.width;
        this.gameOverScreen.y = game.height;

        this.gameOverScreenQuitButton = game.add.button(0, 0, 'ui', this.onClickOnQuitButton, this, 'NextButton0001.png', 'NextButton0002.png', 'NextButton0003.png', 'NextButton0004.png');
        this.gameOverScreenQuitButton.frameName = 'NextButton0001.png';
        this.gameOverScreenQuitButton.height = BUTTON_DIM;
        this.gameOverScreenQuitButton.width = BUTTON_DIM;
        this.gameOverScreenQuitButton.anchor.setTo(1, 1);
        this.gameOverScreen.add(this.gameOverScreenQuitButton);

        if (this.features.replay) {
            this.gameOverScreenReplayButton = game.add.button(-BUTTON_DIM, 0, 'ui', this.onClickOnGameOverScreenReplayButton, this, 'ReplayButton0001.png', 'ReplayButton0002.png', 'ReplayButton0003.png', 'ReplayButton0004.png');
            this.gameOverScreenReplayButton.frameName = 'ReplayButton0001.png';
            this.gameOverScreenReplayButton.visible = false;
            this.gameOverScreenReplayButton.height = BUTTON_DIM;
            this.gameOverScreenReplayButton.width = BUTTON_DIM;
            this.gameOverScreenReplayButton.anchor.setTo(1, 1);
            this.gameOverScreen.add(this.gameOverScreenReplayButton);
        }

        this.add(this.gameOverScreen);
    };

    /**
     * Initialize user interface events
     **/
    Ui.prototype.initEvents = function initEvents() {

        this.game.eventManager.on('startUi', function () { // emitted by the class Kalulu. It is emitted at game start, right after Kalulu finishes its intro speech.
            this.blackOverlay.visible = true;
            this.parent.game.world.bringToTop(this.blackOverlay);
            if (this.features.centralConch) this.centralConchButton.visible = true;
            else {
                this.game.eventManager.emit('unPause');
            }
            this.kaluluButton.visible = true;
        }, this);

        this.game.eventManager.on('help', function () { // emitted when the players clicks the kalulu button
            this.kaluluButton.visible = false;
        }, this);

        this.game.eventManager.on('startGame', function () { // emitted at the very start of the game
            this.kaluluButton.visible = false;
        }, this);

        this.game.eventManager.on('offUi', function () { // emitted from various places, when we need to disable the UI
            this.parent.game.world.bringToTop(this);
            this.parent.game.world.bringToTop(this.blackOverlay);
            this.blackOverlay.visible = true;
            this.disableUiMenu();
        }, this);

        this.game.eventManager.on('success', function () {
            this.success();
        }, this);

        this.game.eventManager.on('fail', function () {
            this.fail();
        }, this);

        this.game.eventManager.on('GameOverWin', function () {
            this.kaluluButton.visible = false;
        }, this);

        this.game.eventManager.on('GameOverLose', function () {
            this.kaluluButton.visible = false;
        }, this);

        this.game.eventManager.on('GameOverWinScreen', function () {
            this.displayGameOverWinScreen();
        }, this);

        this.game.eventManager.on('GameOverLoseScreen', function () {
            this.displayGameOverLoseScreen();
        }, this);

        this.game.eventManager.on('pause', function () {
            this.disableUiMenu();
        }, this);

        this.game.eventManager.on('unPause', function () {
            this.blackOverlay.visible = false;
            this.enableUiMenu();
            this.kaluluButton.visible = true;
        }, this);
    };

    /**
     * success button function
     * @private
     **/
    Ui.prototype.success = function success() {
        this.scoreBar.children[this.lives].loadTexture('uiScoreRight', 0);
        this.lives++;
    };

    /**
     * fail button function
     * @private
     **/
    Ui.prototype.fail = function fail() {
        this.scoreBar.children[this.lives].loadTexture('uiScoreWrong', 0);
        this.lives++;
    };

    /**
     * Callback of the Quit Button of the main Game UI Panel
     * emit 'pause' event
     * @private
     **/
    Ui.prototype.onClickOnQuitPopupButton = function onClickOnQuitPopupButton() {

        this.sounds.openQuitPopup.play();
        this.blackOverlay.visible = true;
        this.parent.game.world.bringToTop(this);
        this.quitPopup.visible = !this.quitPopup.visible;
        this.game.eventManager.emit('pause');
    };

    /**
     * exit button function
     * emit 'exitGame' event; listenned by remediation script
     * @private
     **/
    Ui.prototype.onClickOnQuitButton = function onClickOnQuitButton() {

        this.sounds.validateQuit.play();
        this.quitButton.inputEnabled = false;
        this.quitPopupValidateButton.inputEnabled = false;

        this.sounds.validateQuit.onStop.addOnce(function () {
            this.sounds.validateQuit.onStop.removeAll();
            this.game.eventManager.emit('exitGame');
        }, this);
    };

    /**
     * islandCancel button function
     * emit 'unPause' event
     * @private
     **/
    Ui.prototype.onClickOnQuitPopupCancelButton = function onClickOnQuitPopupCancelButton() {

        this.sounds.cancelQuit.play();
        this.quitPopup.visible = !this.quitPopup.visible;
        this.game.eventManager.emit('unPause');
    };

    /**
     * disable all the buttons except island menu buttons
     * @private
     **/
    Ui.prototype.disableUiMenu = function disableUiMenu() {

        this.quitButton.inputEnabled = false;
        this.quitButton.frameName = 'GardenScreenButton0004.png';
        this.conchButton.inputEnabled = false;
        this.conchButton.frameName = 'ShellButton0004.png';
        this.pauseButton.inputEnabled = false;
        this.pauseButton.frameName = 'PauseButton0004.png';
        this.kaluluButton.inputEnabled = false;
        this.kaluluButton.frameName = 'KaluluButton0004.png';
    };

    /**
     * enable all the buttons except island menu buttons
     * @private
     **/
    Ui.prototype.enableUiMenu = function enableUiMenu() {

        this.quitButton.inputEnabled = true;
        this.quitButton.frameName = 'GardenScreenButton0001.png';

        this.pauseButton.inputEnabled = true;
        this.pauseButton.frameName = 'PauseButton0001.png';

        if (this.features.conch) {
            this.conchButton.inputEnabled = true;
            this.conchButton.frameName = 'ShellButton0001.png';
        }
        else {
            this.conchButton.inputEnabled = false;
            this.conchButton.frameName = 'ShellButton0004.png';
        }
        if (this.features.kalulu) {
            this.kaluluButton.inputEnabled = true;
            this.kaluluButton.frameName = 'KaluluButton0001.png';
        }
        else {
            this.kaluluButton.inputEnabled = false;
            this.kaluluButton.frameName = 'KaluluButton0004.png';
        }
        if (this.features.pause) {
            this.pauseButton.inputEnabled = true;
            this.pauseButton.frameName = 'PauseButton0001.png';
        }
        else {
            this.pauseButton.inputEnabled = false;
            this.pauseButton.frameName = 'PauseButton0004.png';
        }
    };

    /**
     * conch button function
     * emit 'playCorrectSound'; listenned by remediation script
     * @private
     **/
    Ui.prototype.onClickOnConchButton = function onClickOnConchButton() {

        this.game.eventManager.emit('playCorrectSound');
    };

    /**
     * pause button function
     * emit 'pauseButton'; listenned by remediation script
     * @private
     **/
    Ui.prototype.onClickOnPauseButton = function onClickOnPauseButton() {
        this.sounds.openQuitPopup.play();
        this.blackOverlay.visible = true;
        this.parent.game.world.bringToTop(this);
        this.pausePopup.visible = !this.pausePopup.visible;
        this.game.eventManager.emit('pause');
    };

    /**
     * pause button function
     * emit 'playButton'; listenned by remediation script
     * @private
     **/
    Ui.prototype.onClickOnPlayButton = function onClickOnPlayButton() {
        this.sounds.cancelQuit.play();
        this.pausePopup.visible = !this.pausePopup.visible;
        this.game.eventManager.emit('unPause');
    }

    /**
     * centralConch button function
     * start the centralConch movement
     * emit 'playCorrectSoundNoUnPause'; listenned by remediation script
     * @private
     **/
    Ui.prototype.onClickOnCentralConchButton = function onClickOnCentralConchButton() {
        if (this.features.centralConch) {
            this.time = 0;
            this.game.eventManager.emit('playCorrectSoundNoUnPause');
            this.moveCentralConch = true;
            this.centralConchButton.inputEnabled = false;
        }
    };

    /**
     * toucan button function
     * call kalulu for help !!
     * emit 'help'; listenned by Kalulu script
     * @private
     **/
    Ui.prototype.onClickOnKaluluButton = function onClickOnKaluluButton() {
        this.blackOverlay.visible = true;
        this.game.eventManager.emit('help');
    };

    /**
     * replay button function
     * reset lives
     * emit 'replay'; listenned by Remediation script
     * emit 'startGame'; listenned by Remediation script
     * @private
     **/
    Ui.prototype.onClickOnGameOverScreenReplayButton = function onClickOnGameOverScreenReplayButton() 
    {
        if(this.game.eventManager)
            this.game.eventManager.emit('replay'); //listened to by
        console.log("input on replay bouton");
    };

    /**
     * endGameWin function
     * only display the next button
     * @private
     **/
    Ui.prototype.displayGameOverWinScreen = function displayGameOverWinScreen() {
        this.disableUiMenu();
        this.kaluluButton.visible = false;
        this.gameOverScreen.visible = true;
        if (this.features.replay) this.gameOverScreen.children[1].visible = false;
    };

    /**
     * endGameLoose function
     * display the next button and the replay button
     * @private
     **/
    Ui.prototype.displayGameOverLoseScreen = function displayGameOverLoseScreen() {
        this.disableUiMenu();
        this.kaluluButton.visible = false;
        this.gameOverScreen.visible = true;
        console.log("displaying game over screen");
        if (this.features.replay) {
            console.log("should display replay");
            this.gameOverScreen.children[1].visible = true;
        }
    };

    /**
     * replace the centralConch on the center
     * reset lives sprites
     * @private
     **/
    Ui.prototype.reset = function reset() {
        if (this.features.centralConch) {

            this.centralConchButton.x = this.centralConchButton.originalX;
            this.centralConchButton.width = CONCH_DIM;
            this.centralConchButton.height = CONCH_DIM;
            this.centralConchButton.inputEnabled = true;

            for (var i = 0; i < this.scoreBar.children.length ; i++) {
                this.scoreBar.children[i].loadTexture('uiScoreEmpty', 0);
            }
        }
    };

    /**
     * only used for the centralConch movements
     * emit 'unPause' when done
     * @private
     **/
    Ui.prototype.update = function update() {
        if (this.features.centralConch)

            if (this.moveCentralConch) {
                if (this.centralConchButton.x > this.conchButton.x) {
                    this.centralConchButton.x = this.centralConchButton.originalX - (this.centralConchButton.originalX - this.conchButton.x) * this.time;
                    this.centralConchButton.y = this.centralConchButton.originalY - (this.centralConchButton.originalY - this.conchButton.y) * this.time;
                    this.centralConchButton.width = (BUTTON_DIM_LITTLE - this.centralConchButton.originalWidth) * this.time + this.centralConchButton.originalWidth;
                    this.centralConchButton.height = (BUTTON_DIM_LITTLE - this.centralConchButton.originalHeight) * this.time + this.centralConchButton.originalHeight;
                    this.time += 1 / 60;
                }
                else {
                    this.moveCentralConch = false;
                    this.centralConchButton.visible = false;
                    this.game.eventManager.emit('unPause');
                }
            }
    };

    Ui.prototype.destroy = function destroy() {
        this.blackBitmap.destroy();
    }

    module.exports = Ui;
})();