/**
 * This module allow to create the Brain Screen.
 * This screen is tightly coupled with the Kalulu Project : it is designed to display the 2 courses of Kalulu :
 * Swahili + Maths (or English + Maths for the jury), which are divided in 20 chapters each.
 * The Brain Screen will display the Chapters, first level of the discipline modules hierarchy we are using.
 * It must be reworked if Discipline Modules are modified.
**/
define([
    '../elements/anim_background',
    '../utils/ui/screen',
    '../utils/sound/sound_manager',
    '../elements/kalulu_character',
    'victor'
], function (
    AnimBackground,
    Screen,
    SoundManager,
    Kalulu,
    Victor
) {
    'use strict';

    function BrainScreen (interfaceManager, chaptersProgression) {
        

        Screen.call(this);
        
        this.name = "mcBrainScreen";
        this._interfaceManager = interfaceManager;
        this.build();
        
        // Reference auto-built parts :
        this._backgroundContainer = this.getChildByName("mcBrainScreenBg");
        this._background = new AnimBackground("NightGardenBg", 6);

        this._backgroundContainer.addChild(this._background);
        this._background.position.set(0,0);

        this._gardenButtons = this.getChildByName("mcButtonsContainer");
        this._childHead = this._gardenButtons.getChildByName("mcChildHead");
        this._hud = {
            topLeft : this.getChildByName("mcBrainTLHud"),
            bottomLeft : this.getChildByName("mcBrainBLHud"),
            bottom : this.getChildByName("mcBrainBHud")
        };

        this._backButton = this._hud.topLeft.getChildByName("mcBackButton");
        this._kaluluButton = this._hud.bottomLeft.getChildByName("mcKaluluButton");
        this._toyChestButton = this._hud.bottom.getChildByName("mcBurrowButton");
        this._buttonsContainerOffset = this._gardenButtons.position.clone();

        // Buttons Management :
        
        this._childHead.alpha = 0.95;
        // if (Timer.elapsedTime <20&&!Config.debug)   this._toyChestButton.alpha = 0.2;
        // else this._toyChestButton.alpha = 1;

        // Init Position for Tween Anim

        this._arrayGardenButtons = [];

        if (Config.enableGlobalVars) window.kalulu.gardenButtons = this._gardenButtons;

        this._onClickOnGardenButton = this._onClickOnGardenButton.bind(this);
        
        for (var k = this._gardenButtons.children.length-1 ; k >= 0 ; k--) {
            
            if (this._gardenButtons.children[k].name.indexOf("mcGardenButton") !== -1) {
                var lButton = this._gardenButtons.children[k];
                lButton.onClick = this._onClickOnGardenButton.bind(this);
                this._arrayGardenButtons.push(lButton);
            }
        }

        if (typeof chaptersProgression !== "undefined") {
            this.unlockChapters(chaptersProgression);
        }

        this._backButton.onClick = this._onClickOnBackButton.bind(this);
        this._kaluluButton.onClick = this._onClickOnKaluluButton.bind(this);
        this._toyChestButton.onClick = this._onClickOnToyChestButton.bind(this);


        // Transition FX :
        this._blurFilter = new PIXI3.filters.BlurFilter();
        this._blurFilter.blur = 0;
        this._background.filters = [this._blurFilter];
        this._childHead.filters = [this._blurFilter];

        // Kalulu
        this._kalulu = Kalulu;

        // Debug
        if (Config.enableGlobalVars) window.kalulu.brainScreen = this;


        // Tweens :
        this._exitTweenSettings = {
            duration : 2,
            scale    : 5,
            time     : 1000,
            blur     : 3
        };

        // Datgui
        if (Config.enableTransitionsTuning) {
            this._guiFolderName = "BrainScreen : Transition Tween";
            this._gui = this._interfaceManager.debugPanel.addFolder(this._guiFolderName);
            this._gui.add(this._exitTweenSettings, 'duration', 1, 10).step(0.5);
            this._gui.add(this._exitTweenSettings, 'scale', 1, 10).step(0.5);
            this._gui.add(this._exitTweenSettings, 'time', 10, 3000).step(10);
            this._gui.add(this._exitTweenSettings, 'blur', 0, 10).step(0.5);
        }
    }

    BrainScreen.prototype = Object.create(Screen.prototype);
    BrainScreen.prototype.constructor = BrainScreen;

    BrainScreen.prototype.unlockChapters = function unlockChapters (chaptersProgression) {
        var lUnlockedChapters = 0;
        for (var i = 0 ; i < chaptersProgression.length ; i++) {
            if (chaptersProgression[i] != "Locked"){
                lUnlockedChapters++;
                this._gardenButtons.getChildByName("mcGardenButton" + (i+1)).unlockChapter(chaptersProgression[i]);
            } 
        }
        this._unlockedChapter = lUnlockedChapters;
    };

    BrainScreen.prototype.kaluluAppearance = function kaluluAppearance () {
        

        this._kalulu.x = this._kalulu.width/2;
        this._kalulu.y = -this._kalulu.height/3 - 50;

        this._hud.bottomLeft.addChild(this._kalulu);

        var speechName = "";
        if (this._unlockedChapter>8)                            speechName = "kalulu_info_brainscreen_04";
        else if (this._interfaceManager.firstTimeOnBrainScreen) speechName = "kalulu_tuto_brainscreen";
        else if (this._interfaceManager.isTutorialCompleted)    speechName = "kalulu_info_brainscreen_02";
        else if (!this._interfaceManager.isToyChestLocked)      speechName = "kalulu_info_brainscreen_03";
        else                                                    speechName = "kalulu_info_brainscreen_01";

        this._kalulu.startTalk(speechName);
    };  

    BrainScreen.prototype.removeOnClickOnGargenButton = function removeOnClickOnGargenButton (){
        var length = this._arrayGardenButtons.length;
        var lButton;

        for(var i = length-1; i>=0; i--) {
            lButton = this._arrayGardenButtons[i];
            lButton.setModeVoid();
        }
    };


    BrainScreen.prototype.close = function close () {
        if (Config.enableTransitionsTuning) {
            this._interfaceManager.debugPanel.removeFolder(this._guiFolderName);
        }
        Screen.prototype.close.call(this);
    };



    BrainScreen.prototype._onGameStageResize = function _onGameStageResize (eventData) {
        Screen.prototype._onGameStageResize.call(this, eventData);
    };
    /**
     * Manage the transition after click on a garden button, emits the relevant events.
    **/
    BrainScreen.prototype._onClickOnGardenButton = function _onClickOnGardenButton (pEventData) {
        if (this._kalulu.isTalking) return;
        SoundManager.getSound("kalulu_leaves_transition").play();
        this.removeOnClickOnGargenButton();

        // concerned gardens
        var selectedGarden = pEventData.target;
        var nextGarden;
        if(selectedGarden.id === 20) nextGarden = this._gardenButtons.getChildByName("mcGardenButton1");
        else nextGarden = this._gardenButtons.getChildByName("mcGardenButton" + (selectedGarden.id + 1));

        // transition params
        /*var duration = 2;
        var scale = 5;*/

        var rotationVector = new Victor(nextGarden.x - selectedGarden.x, nextGarden.y - selectedGarden.y);
        var targetPosition = new PIXI3.Point(-selectedGarden.x, -selectedGarden.y);
        var targetAngle = this._gardenButtons.rotation - rotationVector.angle();

        // Place pivot on selected Garden
        this._gardenButtons.pivot = selectedGarden.position.clone();
        this._gardenButtons.position = new PIXI3.Point(selectedGarden.position.x + this._buttonsContainerOffset.x, selectedGarden.position.y + this._buttonsContainerOffset.y);
        
        // // Center Camera on selected Garden
        createjs.Tween.get(this._gardenButtons).to({x: 0, y: 0}, this._exitTweenSettings.duration * this._exitTweenSettings.time / 2, createjs.Ease.linear());

        // // Rotate until rotationVector is horizontal from left to right
        createjs.Tween.get(this._gardenButtons).to({rotation: targetAngle}, this._exitTweenSettings.duration * this._exitTweenSettings.time / 2, createjs.Ease.linear());

        // // Zoom In
        createjs.Tween.get(this.scale).to({x: this._exitTweenSettings.scale, y: this._exitTweenSettings.scale}, this._exitTweenSettings.duration * this._exitTweenSettings.time, createjs.Ease.linear());
        
        // // Blur background
        createjs.Tween.get(this._blurFilter).to({blur : this._exitTweenSettings.blur}, this._exitTweenSettings.duration * this._exitTweenSettings.time, createjs.Ease.linear());

        if (Config.tuning) this._gui.destroy();
        this._interfaceManager.requestGardenScreen(selectedGarden.id, (this._exitTweenSettings.duration/6)*1000);
    };

    BrainScreen.prototype._onClickOnBackButton = function _onClickOnBackButton (pEventData) {
        if (this._kalulu.isTalking) return;
        this._interfaceManager.requestTitleCard();
    };

    BrainScreen.prototype._onClickOnKaluluButton = function _onClickOnKaluluButton (pEventData) {
        this.kaluluAppearance();
    };

    BrainScreen.prototype._onClickOnToyChestButton = function _onClickOnToyChestButton (pEventData) {
        if (this._kalulu.isTalking) return;
        this._interfaceManager.requestToyChestScreen();
    };

    return BrainScreen;
});