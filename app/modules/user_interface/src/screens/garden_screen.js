/**
 * A screen module can only define dependencies toward ext.libs, SoundManager, ScreensManager, and the eventual children popins.
 * This module host the definition of the Object GardenScreen, which can be instantiated and added on stage.
 * The Chapter screen displays the content of a chapter, in the case of Kalulu, every Chapter contains
 * a few Lessons (1 to 4) for each discipline, displayed on a separate Path.
**/
define([
    'utils/game/state_graphic',
    'utils/ui/screen',
    'utils/events/mouse_event_type',
    'utils/events/touch_event_type',
    'utils/sound/sound_manager',
    'interface/screens_manager',
    'interface/user/elements/lesson_dot',
    'utils/ui/button',
    'interface/user/popins/activities_menu'
], function (
    StateGraphic,
    Screen,
    MouseEventType,
    TouchEventType,
    SoundManager,
    ScreensManager,
    LessonDot,
    Button,
    ActivitiesMenu
) {

    'use strict';

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    /**
     * A screen showing a chapter.
     * @constructor
     * @extends Screen
     * @param {Object} pSetup - The data required to setup the screen : {
     *      chapterIndex                : the number of the chapter,
     *      languagePathLessons         : array containing the lessonsData for the language path, 
     *      mathsPathLessonsCount       : array containing the lessonsData for the maths path
     * }
    **/
    function GardenScreen (interfaceManager, chaptersData, chaptersProgression, userProfile) {
        
        if (Config.enableKaluluGlobalDebug) window.kalulu.gardenScreen = this;

        Screen.call(this);
        
        this.modalImage = "blue_bg.png";

        if (Config.enableKaluluGlobalDebug) window.kalulu.gardenScreen = this;

        this._chaptersProgression;
        this._data = chaptersData;
        this._interfaceManager = interfaceManager;
        this.name="mcGardenScreen";
        this.build();
        
        // Reference the built elements
        this._background = this.getChildByName("mcGardenScreenBackground");
        
        this._gardensContainer = this.getChildByName("mcGardensContainer");

        this._gardens = {};

        var length = this._gardensContainer.children.length;
        var lGarden;
        for (var i = 0 ; i < length ; i++) {
            lGarden = this._gardensContainer.children[i];

            this._gardens[lGarden.name.split("Garden")[1]] = lGarden;
        }
        //console.log(this._gardens);
        this._gardensCount = _.size(this._gardens);

        this._backButton = this.getChildByName("mcGardenTLHud").getChildByName("mcBackButton");
        this._kaluluButton = this.getChildByName("mcGardenBLHud").getChildByName("mcKaluluButton");
        this._magicBag = this.getChildByName("mcGardenTRHud").getChildByName("mcMagicBag");

        // Plant & BonusPath
        this._plants = [];
        this._bonusPathA = [];
        this._bonusPathB = [];

        var lChildren;
        for(var chapterIndex = 1; chapterIndex <= length; chapterIndex++){
            lGarden = this._gardens[chapterIndex];

            this._plants[chapterIndex] = [];

            for (var k = 0 ; k < lGarden.children.length ; k++) {
                lChildren = lGarden.children[k];

                if(lChildren.name != null){
                    if(lChildren.name.indexOf("mcPlant") !== -1) this._plants[chapterIndex][lChildren.name.split("_")[2]] = lChildren;
                    else if(lChildren.name.indexOf("mcBonusPathA") !== -1) this._bonusPathA[chapterIndex] = lChildren;
                    else if(lChildren.name.indexOf("mcBonusPathB") !== -1) this._bonusPathB[chapterIndex] = lChildren;
                }
            }
        }

        // back
        this._backButton.onClick = this._onClickOnBackButton.bind(this);
        this._kaluluButton.onClick = this._onClickOnKaluluButton.bind(this);
        this._magicBag.onClick = this._onClickOnMagicBagButton.bind(this);

        
    }

    GardenScreen.prototype = Object.create(Screen.prototype);
    GardenScreen.prototype.constructor = GardenScreen;

    GardenScreen.prototype.unlockGardens = function unlockGardens (chaptersProgression) {
        var lGarden;
        this._chaptersProgression = chaptersProgression
        for (var i = 1 ; i <= chaptersProgression.length ; i++) {
            lGarden = this._gardens[i];

            if (chaptersProgression[i-1] != "Locked") {
                if(i == this._data.currentChapter) this._focusGarden(i); // /!\ Ne surtout pas modifié cette ligne et celle du dessus en une seule /!\
            }
            else {
                lGarden.setInteractive(false);
                lGarden.children[0].setModeDisabled();
                lGarden.children[0].setInteractive(false);
            }
        }
    };

    GardenScreen.prototype.unlockPlants = function unlockPlants(userProfile) {

        var lengthChapter = this._plants.length;
        var lengthPlant;
        var lGarden;
        var lPlant;

        for(var chapterIndex = 1; chapterIndex < lengthChapter; chapterIndex++){
            lengthPlant = this._plants[chapterIndex].length;

            for (var plantIndex = 1 ; plantIndex < lengthPlant ; plantIndex++) {
                lPlant = this._plants[chapterIndex][plantIndex];

                lPlant.setSaveState(userProfile.plantsProgression[chapterIndex-1][plantIndex-1]);
                lPlant.setUserReference(userProfile);
                lPlant.setGardenScreenReference(this);
            }
        }

        this._createFertilizerText();
        this.fertilizerText = userProfile.fertilizer;
    }

    GardenScreen.prototype.unlockBonusPath = function unlockBonusPath(userProfile) {
        var pathIndex = 1;
        var index = 2;

        for(var children in userProfile.Language.plan) {
            if(children == "lesson" + index){
                if(userProfile.Language.plan[children].isCompleted) this._bonusPathA[pathIndex].setModeOn();
                //if(!userProfile.Language.plan[children].isCompleted) this._bonusPathA[pathIndex].setModeOn(); // FOR DEBUG

                if(index==16 || index==17 || index==36) index++;
                else index += 2;

                pathIndex++;
            }
        }

        pathIndex = 1;
        index = 2;
        for(children in userProfile.Maths.plan) {
            if(children == "lesson" + index){
                if(userProfile.Maths.plan[children].isCompleted) this._bonusPathB[pathIndex].setModeOn();
                //if(!userProfile.Maths.plan[children].isCompleted) this._bonusPathB[pathIndex].setModeOn(); // FOR DEBUG

                if (index>=35) index += 2;
                else index += 3;

                if(index==8 || index==23) index --;
                else if(index==10 || index==28) index++;

                pathIndex++;
            }
        }
    }

    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(GardenScreen.prototype, {
        fertilizerText : {
            get : function () {return this._magicBag._txt.text},
            set : function (value) {
                this._magicBag._txt.text = value+"";
                return this._magicBag._txt.text;
            }
        }
    });


    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

    GardenScreen.prototype.destroy = function destroy () {
        
        Screen.prototype.destroy.call(this);
        
        // for (var childName in this.lessonsContainer.children) {
            
        //     if (!this.lessonsContainer.children.hasOwnProperty(childName)) continue;
        //     var lChild = this.lessonsContainer.children[childName];
        //     lChild.off(MouseEventType.MOUSE_OVER, this.onMouseOver, this);
        //     lChild.off(MouseEventType.MOUSE_OUT, this.onMouseOut, this);
        // }
    };



    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################

    GardenScreen.prototype._createFertilizerText = function _createFertilizerText () {
        this._magicBag._txt = new PIXI3.Text("", { font : "40px Arial", fill : "#000000", align : "center" });
        this._magicBag._txt.anchor.set(0.5, 0.5);
        this._magicBag._txt.x -= this._magicBag.width;
        this._magicBag.addChild(this._magicBag._txt);
    }

    // GardenScreen.prototype.drawPath = function drawPath () {
        
    //     var lPath = new PIXI3.Graphics();
    //     lPath.lineStyle(20, 0xD6D6AD, 1);
    //     lPath.moveTo(20, 20);
    //     lPath.bezierCurveTo(20, 300, 400, 300, 400, 20);
    //     lPath.bezierCurveTo(400, -180, 50, -180, 50, 20);
    //     lPath.lineStyle(0, 0xFFFFFFF, 0);
        
    //     this.addChild(lPath);
    // };


    GardenScreen.prototype._focusGarden = function _focusGarden (targetGardenId) {
        this._focusedGarden = this._gardens[targetGardenId];

        this._focusedGarden.setInteractive(false);
        this._focusedGarden.children[0].setModeEnabled();
        this._focusedGarden.children[0].setInteractive(false);

        this._gardensContainer.x = -this._focusedGarden.x;

        this._manageSlidingNavigation(targetGardenId);
        this._focusedGarden.draw(this._data.data.language[targetGardenId - 1], this._data.data.maths[targetGardenId - 1]);
    };

    GardenScreen.prototype._slideToGarden = function _slideToGarden (eventData) {
        var targetGardenId = eventData.target.id;

        createjs.Tween.get(this._gardensContainer).to({x: this._getGardensContainerTargetX(targetGardenId)}, 1000, createjs.Ease.quartInOut).call(function () {
            this._manageSlidingNavigation(targetGardenId);
        }.bind(this));

        this._focusedGarden.undraw();
        this._removeSlideFunctions();
        //this._manageSlidingNavigation(targetGardenId);
    };

    GardenScreen.prototype._getGardensContainerTargetX = function _getGardensContainerTargetX (targetGardenId) {
        var offset = this._gardens[targetGardenId].x - this._focusedGarden.x;
        return this._gardensContainer.x - offset;
    };

    GardenScreen.prototype._manageSlidingNavigation = function _manageSlidingNavigation (targetGardenId) {
        // console.log("Starting to Manage Navigation around Garden " + targetGardenId);
        
        this._registerFocusAndNeighbours(targetGardenId);
        this._assignSlideFunctionsToNeighbourGardens(targetGardenId);
        this._focusedGarden.draw(this._data.data.language[targetGardenId - 1], this._data.data.maths[targetGardenId - 1]);
    };

    GardenScreen.prototype._removeSlideFunctions = function _removeSlideFunctions () {
        if (this._gardenLeftToFocus) {
            this._gardenLeftToFocus.setInteractive(false);
            this._gardenLeftToFocus.children[0].setInteractive(false);
        }

        if (this._gardenRightToFocus) {
            this._gardenRightToFocus.setInteractive(false);
            this._gardenRightToFocus.children[0].setInteractive(false);
        }
    };

    GardenScreen.prototype._registerFocusAndNeighbours = function _registerFocusAndNeighbours (targetGardenId) {
        
        // LEFT
        if (targetGardenId > 1) {
            this._gardenLeftToFocus = this._gardens[targetGardenId - 1];
            // console.log("Garden " + (targetGardenId - 1) + " assigned as Left Garden");
        }
        else {
            this._gardenLeftToFocus = null;
        }
        
        // FOCUS
        this._focusedGarden = this._gardens[targetGardenId];

        // RIGHT
        if (targetGardenId < this._gardensCount) {
            this._gardenRightToFocus = this._gardens[targetGardenId + 1];
            // console.log("Garden " + (targetGardenId + 1) + " assigned as Right Garden");
        }
        else {
            this._gardenRightToFocus = null;
        }
    };

    GardenScreen.prototype._assignSlideFunctionsToNeighbourGardens = function _assignSlideFunctionsToNeighbourGardens (targetGardenId) {

        if (this._gardenLeftToFocus) {
            this._gardenLeftToFocus.setInteractive(true);
            this._gardenLeftToFocus.children[0].setInteractive(true);
            this._gardenLeftToFocus.onClick = this._slideToGarden.bind(this);
            // console.log("Left Garden has been set Interactive");
        }

        this._focusedGarden.setInteractive(false);
        this._focusedGarden.children[0].setInteractive(false);

        if (this._gardenRightToFocus && this._chaptersProgression[targetGardenId] != "Locked") {
            this._gardenRightToFocus.setInteractive(true);
            this._gardenRightToFocus.children[0].setInteractive(true);
            this._gardenRightToFocus.onClick = this._slideToGarden.bind(this);
            // console.log("Right Garden has been set Interactive");
        }
    };

    GardenScreen.prototype._onClickOnBackButton = function _onClickOnBackButton (eventData) {
        
        SoundManager.getSound("click").play();
        this._interfaceManager.requestBrainScreen();
    };

    GardenScreen.prototype._onClickOnKaluluButton = function _onClickOnKaluluButton (eventData) {
        
        SoundManager.getSound("click").play();
        console.log("[GardenScreen] Kalulu Button click received. Not yet Implemented");
    };

    GardenScreen.prototype._onClickOnMagicBagButton = function _onClickOnMagicBagButton (eventData) {
        
        SoundManager.getSound("click").play();
        console.log("[GardenScreen] MagicBag Button click received. Not yet Implemented");
    };

    /*
    GardenScreen.prototype._onClickOnBurrowButton = function _onClickOnBurrowButton (eventData) {
        
        SoundManager.getSound("click").play();
        console.log("[GardenScreen] Burrow Button click received. Not yet Implemented");
    };
    */

    return GardenScreen;
});