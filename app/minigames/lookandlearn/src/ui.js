define([
    './graphic_objects/kalulu'
], function (
    Kalulu
) {

    'use strict';

    var BUTTON_DIM = 250;
    var SCORE_DIM = 130;

    function Ui (lives, game, options) {
        
        Phaser.Group.call(this, game, game.stage, 'uiContainer', true);

        options = (typeof options !== 'undefined') ? options : { };
        options.isKaluluEnabled = (typeof options.isKaluluEnabled !== 'undefined') ? options.isKaluluEnabled : true;
        options.isIntroPhonemeButtonEnabled = (typeof options.isIntroPhonemeButtonEnabled !== 'undefined') ? options.isIntroPhonemeButtonEnabled : true;
        options.isReplayEnabled = (typeof options.isReplayEnabled !== 'undefined') ? options.isReplayEnabled : true;
        options.isPhonemeButtonEnabled = (typeof options.isPhonemeButtonEnabled !== 'undefined') ? options.isPhonemeButtonEnabled : true;

        this.features = options;
        this.isNextButtonEnabled = false;

        /**
         * game.eventManager
         * @type {EventEmitter}
         **/
        
        // next Button Callback
        this.doActionNext = this.doActionVoid;

        this._initGameOverScreen(game); // the game over screen appears on top of the UI when the game ends
        this._initLeftMenu(game); // the main game UI Panel, located on the left of the screen, and accessible when the game is playing (quit, conch, & kalulu buttons).
        this._initBlackOverlay();
        this._initQuitPopup(game); // the quit popup appears when the player clicks on the quit button of the main Game UI Panel
        this._initKalulu();

        this._initSounds(game);
        this.initEvents();
    }

    Ui.prototype = Object.create(Phaser.Group.prototype);
    
    Ui.prototype.constructor = Ui;


    Ui.prototype._initSounds = function initSounds (game) {
        this.sounds = {};

        this.sounds.openQuitPopup = game.add.audio('menu');
        this.sounds.validateQuit = game.add.audio('menuYes');
        this.sounds.cancelQuit = game.add.audio('menuNo');
    };

    Ui.prototype._initLeftMenu = function initLeftMenu (game) {

        this.gameUI = game.add.group(this, 'ButtonsContainer');

        this.quitButton = game.add.button(0, 0, 'ui', this.onClickOnQuitPopupButton, this, 'GardenScreenButton0001.png', 'GardenScreenButton0002.png', 'GardenScreenButton0003.png', 'GardenScreenButton0004.png');
        this.quitButton.frameName = 'GardenScreenButton0004.png';
        this.quitButton.height = BUTTON_DIM;
        this.quitButton.width = BUTTON_DIM;
        this.quitButton.anchor.setTo(0, 0);
        this.gameUI.add(this.quitButton);

        this.phonemeButton = game.add.button(0, game.height / 2, 'ui', this.onClickOnPhonemeButton, this, 'ShellButton0001.png', 'ShellButton0002.png', 'ShellButton0003.png', 'ShellButton0001.png');
        this.phonemeButton.frameName = 'ShellButton0004.png';
        this.phonemeButton.height = BUTTON_DIM;
        this.phonemeButton.width = BUTTON_DIM;
        this.phonemeButton.anchor.setTo(0, 0.5);
        this.gameUI.add(this.phonemeButton);

        this.kaluluButton = game.add.button(0, game.height, 'ui', this.onClickOnKaluluButton, this, 'KaluluButton0001.png', 'KaluluButton0002.png', 'KaluluButton0003.png', 'KaluluButton0004.png');
        this.kaluluButton.frameName = 'KaluluButton0004.png';
        this.kaluluButton.height = BUTTON_DIM;
        this.kaluluButton.width = BUTTON_DIM;
        this.kaluluButton.anchor.setTo(0, 1);
        this.gameUI.add(this.kaluluButton);


        this.nextButton = game.add.button(game.width, game.height, 'ui', this.onClickOnNextButton, this, 'NextButton0001.png', 'NextButton0002.png', 'NextButton0003.png', 'NextButton0004.png');
        this.nextButton.height = BUTTON_DIM;
        this.nextButton.width = BUTTON_DIM;
        this.nextButton.anchor.setTo(1, 1);
        this.nextButton.inputEnabled = false;
        this.nextButton.frameName = 'NextButton0004.png';
        this.gameUI.add(this.nextButton);

        /** Starting central conch
         * not used in every game
         * @private
         **/
        if (this.features.isIntroPhonemeButtonEnabled) {
            this.centralConchButton = game.add.button(game.width / 2, game.height / 2, 'ui', this.onClickOnCentralConchButton, this, 'ShellBigButton0001.png', 'ShellBigButton0002.png', 'ShellBigButton0003.png', 'ShellBigButton0004.png');
            this.centralConchButton.x -= this.centralConchButton.width / 2;
            this.centralConchButton.anchor.setTo(0, 0.5);
            this.centralConchButton.visible = false;
            this.centralConchButton.inputEnabled = true;
            this.centralConchButton.originalHeight = this.centralConchButton.height;
            this.centralConchButton.originalWidth = this.centralConchButton.width;
            this.gameUI.add(this.centralConchButton);
        }
    };

    Ui.prototype._initBlackOverlay = function initBlackOverlay () {
        
        this.blackOverlay = this.create(0, 0, 'black_overlay');
        this.blackOverlay.width = this.game.width;
        this.blackOverlay.height = this.game.height;
        this.blackOverlay.visible = true;
        this.blackOverlay.alpha = 0.4;
    };

    Ui.prototype._initKalulu = function initKalulu () {
        
        if (this.features.isKaluluEnabled && !this.game.kalulu) {
            this.kalulu = new Kalulu(this.game, this);
            this.game.kalulu = this.kalulu;
        }
    };

    Ui.prototype._initQuitPopup = function initQuitPopup (game) {

        this.quitPopup = game.add.group(this, 'QuitPopup Container');
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
    };

    Ui.prototype._initGameOverScreen = function initGameOverScreen (game) {

        this.gameOverScreen = game.add.group(this, 'GameOver Screen');
        this.gameOverScreen.visible = false;
        this.gameOverScreen.x = game.width;
        this.gameOverScreen.y = game.height;

        this.gameOverScreenQuitButton = game.add.button(0, 0, 'ui', this.onClickOnQuitButton, this, 'NextButton0001.png', 'NextButton0002.png', 'NextButton0003.png', 'NextButton0004.png');
        this.gameOverScreenQuitButton.frameName = 'NextButton0001.png';
        this.gameOverScreenQuitButton.height = BUTTON_DIM;
        this.gameOverScreenQuitButton.width = BUTTON_DIM;
        this.gameOverScreenQuitButton.anchor.setTo(1, 1);
        this.gameOverScreen.add(this.gameOverScreenQuitButton);

        if (this.features.isReplayEnabled) {
            this.gameOverScreenReplayButton = game.add.button(-BUTTON_DIM, 0, 'ui', this.onClickOnGameOverScreenReplayButton, this, 'ReplayButton0001.png', 'ReplayButton0002.png', 'ReplayButton0003.png', 'ReplayButton0004.png');
            this.gameOverScreenReplayButton.frameName = 'ReplayButton0001.png';
            this.gameOverScreenReplayButton.visible = false;
            this.gameOverScreenReplayButton.height = BUTTON_DIM;
            this.gameOverScreenReplayButton.width = BUTTON_DIM;
            this.gameOverScreenReplayButton.anchor.setTo(1, 1);
            this.gameOverScreen.add(this.gameOverScreenReplayButton);
        }
    };
    
    Ui.prototype.resetKaluluSpeeches = function resetKaluluSpeeches (step) {

        this.kalulu.resetSpeeches(step);
    };

    Ui.prototype.initEvents = function initEvents() {

        this.game.eventManager.on('startUi', function () { // emitted by the class Kalulu. It is emitted at game start, right after Kalulu finishes its intro speech.
            this.blackOverlay.visible = true;
            this.parent.game.world.bringToTop(this.blackOverlay);
            if (this.features.isIntroPhonemeButtonEnabled) this.centralConchButton.visible = true;
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

    Ui.prototype.onClickOnQuitPopupButton = function onClickOnQuitPopupButton() {

        this.sounds.openQuitPopup.play();
        this.blackOverlay.visible = true;
        this.parent.game.world.bringToTop(this);
        this.quitPopup.visible = !this.quitPopup.visible;
        this.game.eventManager.emit('pause');
        this.disableUiMenu();
    };

    Ui.prototype.onClickOnQuitButton = function onClickOnQuitButton() {

        this.sounds.validateQuit.play();
        this.quitButton.inputEnabled = false;
        this.quitPopupValidateButton.inputEnabled = false;

        this.sounds.validateQuit.onStop.addOnce(function () {
            this.sounds.validateQuit.onStop.removeAll();
            this.game.eventManager.emit('exitGame');
        }, this);
    };

    Ui.prototype.onClickOnQuitPopupCancelButton = function onClickOnQuitPopupCancelButton() {

        this.sounds.cancelQuit.play();
        this.quitPopup.visible = !this.quitPopup.visible;
        this.game.eventManager.emit('unPause');
        this.enableUiMenu();
    };

    Ui.prototype.disableUiMenu = function disableUiMenu() {

        this.quitButton.inputEnabled = false;
        this.quitButton.frameName = 'GardenScreenButton0004.png';
        this.phonemeButton.inputEnabled = false;
        this.phonemeButton.frameName = 'ShellButton0004.png';
        this.kaluluButton.inputEnabled = false;
        this.kaluluButton.frameName = 'KaluluButton0004.png';
        this.nextButton.inputEnabled = false;
        this.nextButton.frameName = 'NextButton0004.png';
    };

    Ui.prototype.enableUiMenu = function enableUiMenu() {

        this.quitButton.inputEnabled = true;
        this.quitButton.frameName = 'GardenScreenButton0001.png';

        if (this.features.isPhonemeButtonEnabled) {
            this.phonemeButton.inputEnabled = true;
            this.phonemeButton.frameName = 'ShellButton0001.png';
        }
        else {
            this.phonemeButton.inputEnabled = false;
            this.phonemeButton.frameName = 'ShellButton0004.png';
        }
        if (this.features.isKaluluEnabled) {
            this.kaluluButton.inputEnabled = true;
            this.kaluluButton.frameName = 'KaluluButton0001.png';
        }
        else {
            this.kaluluButton.inputEnabled = false;
            this.kaluluButton.frameName = 'KaluluButton0004.png';
        }
        if (this.isNextButtonEnabled) {
            this.nextButton.inputEnabled = true;
            this.nextButton.frameName = 'NextButton0001.png';
        }
        else {
            this.nextButton.inputEnabled = false;
            this.nextButton.frameName = 'NextButton0004.png';
        }
    };

    Ui.prototype.onClickOnPhonemeButton = function onClickOnPhonemeButton() {

        this.game.sound.play(this.game.gameConfig.pedagogicData.sound);
    };

    Ui.prototype.onClickOnCentralConchButton = function onClickOnCentralConchButton() {
        
        if (this.features.isIntroPhonemeButtonEnabled) {
            this.time = 0;
            this.game.eventManager.emit('playCorrectSoundNoUnPause');
            this.moveCentralConch = true;
            this.centralConchButton.inputEnabled = false;
        }
    };

    Ui.prototype.onClickOnKaluluButton = function onClickOnKaluluButton() {
        
        this.blackOverlay.visible = true;
        this.game.eventManager.emit('help');
    };

    Ui.prototype.onClickOnGameOverScreenReplayButton = function onClickOnGameOverScreenReplayButton() {
        
        this.game.eventManager.emit('replay'); //listened to by 
        // this.lives = 0;
        // this.enableUiMenu();
        // this.gameOverScreen.visible = false;
        // this.reset();
        // this.parent.game.world.bringToTop(this);
        // this.game.eventManager.emit('startGame');
    };

    Ui.prototype.displayGameOverWinScreen = function displayGameOverWinScreen() {
        
        this.disableUiMenu();
        this.kaluluButton.visible = false;
        this.gameOverScreen.visible = true;
        if (this.features.isReplayEnabled) this.gameOverScreen.children[1].visible = false;
    };

    Ui.prototype.displayGameOverLoseScreen = function displayGameOverLoseScreen() {
        
        this.disableUiMenu();
        this.kaluluButton.visible = false;
        this.gameOverScreen.visible = true;
        console.log("displaying game over screen");
        if (this.features.isReplayEnabled) {
            console.log("should display replay");
            this.gameOverScreen.children[1].visible = true;
        }
    };

    Ui.prototype.reset = function reset() {
        if (this.features.isIntroPhonemeButtonEnabled) {

            this.centralConchButton.x = this.parent.game.width / 2 - 325;
            this.centralConchButton.width = 650;
            this.centralConchButton.height = 560;
            this.centralConchButton.inputEnabled = true;

            for (var i = 0; i < this.scoreBar.children.length ; i++) {
                this.scoreBar.children[i].loadTexture('uiScoreEmpty', 0);
            }
        }
    };

    Ui.prototype.update = function update() {
        
        Phaser.Group.prototype.update.call(this);

        if (this.features.isIntroPhonemeButtonEnabled)

            if (this.moveCentralConch) {
                if (this.centralConchButton.x > this.phonemeButton.x) {
                    this.centralConchButton.x = -(this.parent.game.width / 2 - 325) * this.time + (this.parent.game.width / 2 - 325);
                    this.centralConchButton.width = (BUTTON_DIM - this.centralConchButton.originalWidth) * this.time + this.centralConchButton.originalWidth;
                    this.centralConchButton.height = (BUTTON_DIM - this.centralConchButton.originalHeight) * this.time + this.centralConchButton.originalHeight;
                    this.time += 1 / 60;
                }
                else {
                    this.moveCentralConch = false;
                    this.centralConchButton.visible = false;
                    this.game.eventManager.emit('unPause');
                }
            }
    };

    Ui.prototype.onClickOnNextButton = function onClickOnNextButton () {
        
        this.nextButtonCallback();
    };

    Ui.prototype.enableNext = function enableNext (nextState) {
        if (this.isNextButtonEnabled) {
            this.enableUiMenu();
            return;
        }
        this.nextState = nextState;
        this.assignNextButtonCallback();
        console.info("ENABLING NEXT");
        this.isNextButtonEnabled = true;
        this.game.eventManager.emit('closeStep', nextState);
        this.game.eventManager.once('nextStep', this.enableUiMenu, this);
    };
    
    Ui.prototype.assignNextButtonCallback = function assignNextButtonCallback () {
        if (typeof this.nextState === 'undefined') {
            this.nextButtonCallback = this.nextButtonQuitCallBack;
            console.info("A click on Next will quit the game now");
        }
        else {
            this.nextButtonCallback = this.nextButtonNextStateCallback;
            console.info("A click on Next will start the next phase");
        }
    };
    
    Ui.prototype.nextButtonNoCallBack = function nextButtonNoCallBack () {

        //
    };

    Ui.prototype.nextButtonQuitCallBack = function nextButtonQuitCallBack () {
        console.log("next button quit callback");
        this.game.eventManager.emit('exitGame');
    };

    Ui.prototype.quitGame = function quitGame () {

        //
    };

    Ui.prototype.nextButtonNextStateCallback = function nextButtonNextStateCallback () {
        console.info("Starting " + this.nextState);
        console.info("DISABLING NEXT");
        this.isNextButtonEnabled = false;
        this.game.state.start(this.nextState);
    };

    return Ui;
});