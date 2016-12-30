/**
 * This module is in charge of
 * 
**/
define([
    '../utils/ui/button',
    '../utils/events/mouse_event_type',
    '../utils/loader/game_loader'
], function (
    Button,
    MouseEventType,
    Loader
) {
    'use strict';

    var notStartedGardenButton;

    function GardenButton (description, assetName) {
        
        this._description = description;
        this._assetName = assetName.split("_")[0] + "_" + assetName.split("_")[1];

        this._NOT_STARTED = "NotStarted";
        this._IN_PROGRESS = "InProgress";
        this._COMPLETED   = "Completed";
        this._LOCKED      = "Locked";

        this._id          = parseInt(this._assetName.split("_")[1], 10);
        this._lockedStyle = { font : "40px Arial bold", fill : "#FFFFFF", align : "center" };
        this._isLocked    = false;

        Button.call(this);

        this._dimensions = {
            width  : this.width,
            height : this.height
        };

        if (Config.displayGardenIdsOnBrainScreen) this.setText(this._id);
        this.addChild(this._txt);

        //console.log(this);
    }

    GardenButton.prototype = Object.create(Button.prototype);
    GardenButton.prototype.constructor = GardenButton;
    
    Object.defineProperty(GardenButton.prototype, "id", { get: function () { return this._id; } });
    Object.defineProperty(GardenButton, "notStartedGardenButton", {get: function() {return notStartedGardenButton;} });

    GardenButton.prototype.start = function start(){
        this.setModeLocked();

        //console.log("START");
    };

    GardenButton.prototype.doHighlight = function doHighlight () {
        var speed = 3;

        this._rectangle.x += speed;
        this._rectangle.y += speed;

        if(this._rectangle.y >= 0) {
            this._rectangle.x = 0;
            this._rectangle.y = -300;
        }
    };

    GardenButton.prototype.setModeNotStarted = function setModeNotStarted () {
        this._setState(this._NOT_STARTED);

        //console.log(this);

        //var mask = new PIXI3.Sprite(this._anim._texture);
        
        if(this._id < 10) this._stringId = "0" + this._id;
        else this._stringId = this.id;

        var mask = PIXI3.Sprite.fromImage(Config.url(Config.imagesPath + "user_interface/garden_buttons/GardenButton_" + this._id + ".png"));
        this.parent.addChild(mask);
        var container = new PIXI.Container();
        this.parent.addChild(container);

        mask.x = this.x;
        mask.y = this.y;

        mask.anchor.x = 0.5;
        mask.anchor.y = 0.5;

        container.x = this.x;
        container.y = this.y;

        this._rectangle = new PIXI.Graphics();
        this._rectangle.beginFill(0xFFFFFF, 0.5);
        this._rectangle.drawRect(0, 0, 70, 400);
        this._rectangle.endFill();

        this._rectangle.rotation = 45;

        this._rectangle.x = 0;
        this._rectangle.y = -300;

        container.addChild(this._rectangle);
        container.mask = mask;
        this.doHighlight();

        notStartedGardenButton = this;

        //console.log("NOT STARTED");
    };

    GardenButton.prototype.setModeInProgress = function setModeInProgress () {
        this._setState(this._IN_PROGRESS);

        //console.log("IN PROGRESS");
    };

    GardenButton.prototype.setModeCompleted = function setModeCompleted () {
        this._setState(this._COMPLETED);

        //console.log("COMPLETED");
    };

    GardenButton.prototype.setModeLocked = function setModeLocked () {
        if (this._isLocked) return;

        this._setState(this._LOCKED);

        //console.log("LOCKED");

        this._anim.gotoAndStop(this._DISABLED);
        this._txt.style = this._lockedStyle;
        this._isLocked = true;
        this.interactive = false;
        // console.info("[GardenButton] Chapter " + this._id + " locked.");
    };

    GardenButton.prototype.unlockChapter = function unlockChapter (state) {
        if (!this._isLocked) return;

        if(state == this._NOT_STARTED) this.setModeNotStarted();
        else if(state == this._IN_PROGRESS) this.setModeInProgress();
        else if(state == this._COMPLETED) this.setModeCompleted();

        this._anim.gotoAndStop(this._UP);
        this._txt.style = this._upStyle;

        this._isLocked = false;
        this.interactive = true;
        // console.info("[GardenButton] Chapter " + this._id + " unlocked.");
    };

    // GardenButton.prototype.onClick = function onClick (pEvent) {
    //  console.log("[GardenButton] Chapter " + this._id + " has been clicked");
    // };



    return GardenButton;
});