/**
 * This module returns the TitleCard class constructor.
**/
define([
    '../elements/anim_background',
    '../utils/ui/screen',
    '../utils/events/mouse_event_type',
    '../utils/events/touch_event_type',
    '../utils/sound/sound_manager',
    'dat.gui'
], function (
    AnimBackground,
    Screen,
    MouseEventType,
    TouchEventType,
    SoundManager,
    Dat
) {

    'use strict';
    
    /**
     * The TitleCard Class.
     * 
     * @class
     * @extends Screen
     * @memberof Kalulu.Interface.User.Screens
    **/
    function TitleCard (userInterface) {

        if (Config.enableGlobalVars) window.kalulu.TitleCard = this;
        
        Screen.call(this);
        this._userInterface = userInterface;
        this.name = "mcTitleCard";
        this.build();

        this._backgroundContainer = this.getChildByName("mcTitleCardBg");
        this._background = new AnimBackground("NightGardenBg", 6);

        this._backgroundContainer.addChild(this._background);
        this._background.position.set(0,0);

        this._playButton = this.getChildByName("mcPlayButton");
        this._playButton.once("click", this.onClick.bind(this));

        // PlayButton Tween Config
        // for (var i = 0; i < this.children.length ; i++) {
        //     console.log(this.children[i]);
        // }
        this._blSnappedContainer = this.getChildByName("mcBLHud");
        this._target = this._blSnappedContainer.getChildByName("mcTargetPosition");
        this._targetPosition = new PIXI3.Point(this._target.parent.x + this._target.x, this._target.parent.y + this._target.y);

        this._targetScale = 190/this._playButton.width; // 190 is the button final size
        this._tweenDuration = 1;
        this._tweenControlPoint = new PIXI3.Point(this._targetPosition.x, -500);
        this._tweenDestinationPoint = new PIXI3.Point(this._targetPosition.x, this._targetPosition.y);

        // DEBUG
        if (Config.enableTransitionsTuningControls) {

            this._guiFolderName = "TitleCard : Play Button Tween";
            this._gui = this._userInterface.debugPanel.addFolder(this._guiFolderName);
            this._durationGui = this._gui.addFolder("Duration");
            this._durationGui.add(this, '_tweenDuration').min(0).max(2).step(0.1).listen();
            this._ctrlPointGui = this._gui.addFolder("Control Point");
            this._ctrlPointGui.add(this._tweenControlPoint, 'x').min(-1215).max(+1215).step(1).listen();
            this._ctrlPointGui.add(this._tweenControlPoint, 'y').min(-768).max(+768).step(1).listen();
            this._destPointGui = this._gui.addFolder("DestinationPoint");
            this._destPointGui.add(this._tweenDestinationPoint, 'x').min(-1215).max(+1215).step(1).listen();
            this._destPointGui.add(this._tweenDestinationPoint, 'y').min(-768).max(+768).step(1).listen();
            this._curveGui = this._gui.addFolder("Redraw Curve");
            this._curveGui.add(this, '_redrawTweenCurve');
            
            this.debugCtrlPoint = new PIXI3.Graphics();
            this.debugCtrlPoint.beginFill(0x0000FF, 1);
            this.debugCtrlPoint.drawCircle(0, 0, 40);
            this.debugCtrlPoint.position = this._tweenControlPoint;
            this.addChild(this.debugCtrlPoint);

            this.debugDestPoint = new PIXI3.Graphics();
            this.debugDestPoint.beginFill(0x00FF00, 1);
            this.debugDestPoint.drawCircle(0, 0, 40);
            this.debugDestPoint.position = this._tweenDestinationPoint;
            this.addChild(this.debugDestPoint);

            this.debugCurve = new PIXI3.Graphics();
            this.addChild(this.debugCurve);
            this._redrawTweenCurve();
        }
    }

    TitleCard.prototype = Object.create(Screen.prototype);
    TitleCard.prototype.constructor = TitleCard;

    TitleCard.prototype.onClick = function onClick (pEventData) {
        if (this._userInterface.kaluluCharacter.isTalking)
        {        
            this._playButton.once("click", this.onClick.bind(this));
            return;
        } 
        this._userInterface.kaluluCharacter.clearRepeat();
        SoundManager.getSound("kalulu_end_startscreen").play();
        
        // SoundManager.addAmbiance("Bird", ["bird_1","bird_2","bird_3","bird_4","bird_5","bird_6","bird_7","bird_8","bird_9"]);
        // SoundManager.startAmbiance("Bird");
        
        createjs.Tween.get(this._playButton.scale).to({x: this._targetScale, y: this._targetScale}, this._tweenDuration * 1000, createjs.Ease.linear());

        // var oldGuide = {
        //     guide : {
        //         path: [
        //             0, 0,
        //             0, -460, -520, -460,
        //             -1000, -460, -1040, 200,
        //             -1040, 200, -this._background.width/2 + this._playButton.width * this._guiControls.scale/2 + this._guiControls.margeX, this._background.height/2 - this._playButton.height * this._guiControls.scale/2 - this._guiControls.margeY
        //         ]
        //     }
        // };

        var guide = {
            guide : {
                path: [
                    0, 0,
                    this._tweenControlPoint.x, this._tweenControlPoint.y,
                    this._tweenDestinationPoint.x, this._tweenDestinationPoint.y
                ]
            }
        };

        createjs.Tween.get(this._playButton).to(guide, this._tweenDuration * 1000).wait(100).call(this._requestBrainScreen.bind(this));
    };

    TitleCard.prototype.close = function close () {
        if (Config.enableTransitionsTuningControls) {
            this._userInterface.debugPanel.removeFolder(this._guiFolderName);
        }
        Screen.prototype.close.call(this);
    };

    TitleCard.prototype._requestBrainScreen = function _requestBrainScreen () {
            this._userInterface.requestBrainScreen();
    };

    TitleCard.prototype._onGameStageResize = function _onGameStageResize (eventData) {
        Screen.prototype._onGameStageResize.call(this, eventData);
        
        this._targetPosition.set(this._target.parent.x + this._target.x, this._target.parent.y + this._target.y);
        this._tweenControlPoint.set(this._targetPosition.x, -500);
        this._tweenDestinationPoint.set(this._targetPosition.x, this._targetPosition.y);
        if (Config.enableTransitionsTuningControls) {
            this._redrawTweenCurve();
        }
    };

    TitleCard.prototype._redrawTweenCurve = function _redrawTweenCurve () {
        
        this.debugCurve.clear();
        this.debugCurve.endFill();
        this.debugCurve.lineStyle(0, 0xF000FF, 0);
        this.debugCurve.moveTo(0,0);

        this.debugCurve.beginFill(0x000000, 0);
        this.debugCurve.lineStyle(10, 0xF000FF, 1);
        this.debugCurve.quadraticCurveTo(this._tweenControlPoint.x, this._tweenControlPoint.y, this._tweenDestinationPoint.x, this._tweenDestinationPoint.y);
        
        this.debugCurve.endFill();
    };

    return TitleCard;
});