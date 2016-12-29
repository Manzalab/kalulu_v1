/**
 * A screen module can only define dependencies toward ext.libs, SoundManager, ScreensManager, and the eventual children popins.
 * This module host the definition of the Object GardenScreen, which can be instantiated and added on stage.
 * The Chapter screen displays the content of a chapter, in the case of Kalulu, every Chapter contains
 * a few Lessons (1 to 4) for each discipline, displayed on a separate Path.
**/
define([
    '../elements/star_bg',
    '../utils/ui/screen',
    '../utils/sound/sound_manager'
], function (
    StarBackground,
    Screen,
    SoundManager
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
        
        if (Config.enableGlobalVars) window.kalulu.gardenScreen = this;

        Screen.call(this);

        //this.modalImage = "blue_bg.png";

        if (Config.enableGlobalVars) window.kalulu.gardenScreen = this;

        this._chaptersProgression;
        this._data = chaptersData;
        this._interfaceManager = interfaceManager;
        this._userProfile = userProfile;
        this.name="mcGardenScreen";
        this.build();
        
        // Reference the built elements
        this._backgroundContainer = this.getChildByName("mcGardenScreenBackground");
        this._background = new StarBackground();

        this._backgroundContainer.addChild(this._background);
        this._background.position.set(0,0);

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
        this._hud = { bottomLeft : this.getChildByName("mcGardenBLHud") };
        this._kaluluButton = this._hud.bottomLeft.getChildByName("mcKaluluButton");
        this._neuroenergy = this.getChildByName("mcGardenTRHud").getChildByName("mcNeuroenergy");
        this._toyChestButton = this.getChildByName("mcGardenBRHud").getChildByName("mcBurrowButton");

        this._toyChestButton.alpha = 0;
        this._toyChestButton.setModeVoid();

        this._lessonDotContainer = new PIXI3.Container();
        this._lessonDotContainer.name = "LessonDotContainer";
        this._lessonDotContainer.position.set(0, 0);
        this._lessonDotContainer.scale.set(1, 1);
        this._lessonDotContainer.rotation = 0;
        this._lessonDotContainer.zIndex = this.children.length;

        this.addChild(this._lessonDotContainer);
        this._createFertilizerText();

        // Plant & BonusPath
        this._plants = [];
        this._bonusPathA = [];
        this._bonusPathB = [];

        var lChildren;
        for(var chapterIndex = 1; chapterIndex <= length; chapterIndex++){
            lGarden = this._gardens[chapterIndex];
            for (var k = 0 ; k < lGarden.children.length ; k++) {
                lChildren = lGarden.children[k];
                if(lChildren.name != null){
                    if(lChildren.name.indexOf("mcBonusPathA") !== -1) this._bonusPathA[chapterIndex] = lChildren;
                    else if(lChildren.name.indexOf("mcBonusPathB") !== -1) this._bonusPathB[chapterIndex] = lChildren;
                }
            }
        }

        this.unlockBonusPath();

        // back
        this._backButton.onClick = this._onClickOnBackButton.bind(this);
        this._kaluluButton.onClick = this._onClickOnKaluluButton.bind(this);

        // Tween
        this._targetPosition = new PIXI3.Point(this._toyChestButton.parent.x + this._toyChestButton.x, this._toyChestButton.parent.y + this._toyChestButton.y);

        this._index = 1;
        this._tweenControlPoint = new PIXI3.Point(this._targetPosition.x, -500);
        this._tweenDestinationPoint = new PIXI3.Point(this._targetPosition.x, this._targetPosition.y);

        this._interactiveObject = [];
    }

    GardenScreen.prototype = Object.create(Screen.prototype);
    GardenScreen.prototype.constructor = GardenScreen;

    GardenScreen.prototype.unlockGardens = function unlockGardens (chaptersProgression) {
        var lGarden;
        this._chaptersProgression = chaptersProgression;
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

    GardenScreen.prototype.unlockPlants = function unlockPlants() {

        this.plants; // GETTER

        var lengthChapter = this._plants.length;
        var lPlant;

        for (var i = 0; i < lengthChapter; i++) {
            lPlant = this._plants[i];
            lPlant.setSaveState(this._userProfile.plantsProgression[lPlant._idChapter-1][lPlant._idPlant-1]);
            lPlant.setUserReference(this._userProfile);
            lPlant.setGardenScreenReference(this);
        }

        this.fertilizerText = this._userProfile.fertilizer;
    };

    GardenScreen.prototype.unlockBonusPath = function unlockBonusPath() {
        var lArrayLesson = [];
        var chapterIndex = 1;
        var lessonIndex = 1;
        var boolLessonPath;

        for(var children in this._userProfile.Language.plan) {
            if(children == "lesson" + lessonIndex){
                lArrayLesson.push(this._userProfile.Language.plan[children].isCompleted);
                lessonIndex++;
            }
            else if(children == "Assessment" + chapterIndex && lArrayLesson.length >= 1){
                switch (lArrayLesson.length) {
                    case 1:
                        boolLessonPath = lArrayLesson[0];
                        break;

                    case 2:
                    case 3:
                        boolLessonPath = lArrayLesson[1];
                        break;

                    default :
                        boolLessonPath = lArrayLesson[2];
                }
                if(boolLessonPath) this._bonusPathA[chapterIndex].setModeOn();
                // if(!boolLessonPath) this._bonusPathA[chapterIndex].setModeOn(); // FOR DEBUG

                lArrayLesson = [];
                chapterIndex++;
            }
        }

        chapterIndex = 1;
        lessonIndex = 1;

        for(children in this._userProfile.Maths.plan) {
            if(children == "lesson" + lessonIndex){
                lArrayLesson.push(this._userProfile.Maths.plan[children].isCompleted);
                lessonIndex++;
            }
            else if(children == "Assessment" + chapterIndex && lArrayLesson.length >= 1){
                switch (lArrayLesson.length) {
                    case 1:
                        boolLessonPath = lArrayLesson[0];
                        break;

                    case 2:
                    case 3:
                        boolLessonPath = lArrayLesson[1];
                        break;

                    default :
                        boolLessonPath = lArrayLesson[2];
                }
                if(boolLessonPath) this._bonusPathB[chapterIndex].setModeOn();
                // if(!boolLessonPath) this._bonusPathB[chapterIndex].setModeOn(); // FOR DEBUG

                lArrayLesson = [];
                chapterIndex++;
            }
        }
    };

    GardenScreen.prototype.unlockStarMiddle = function unlockStarMiddle() {
        var id = this._focusedGarden.id;
        
        if(this._bonusPathA[id].state === "On" && this._bonusPathB[id].state === "On") {
            this._focusedGarden.starMiddle.setModeLarge();
            if(!this._userProfile.starMiddle[this._focusedGarden.id]){
                this._removeAllChildrenInterractiveStatus(this);
                this._tweenStar(this._focusedGarden.starMiddle);
            }
        }
        else if(this._bonusPathA[id].state === "On" || this._bonusPathB[id].state === "On") this._focusedGarden.starMiddle.setModeMedium();
        else this._focusedGarden.starMiddle.setModeSmall();
    };

    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(GardenScreen.prototype, {
        fertilizerText : {
            get : function () { return this._neuroenergy._txt.text; },
            set : function (value) {
                this._neuroenergy._txt.text = value+"";
                if(value === 0) this._neuroenergy.setModeDisabled();
                return this._neuroenergy._txt.text;
            }
        },

        plants : {
            get : function () {

                var index = 0;
                var i, lChildren;

                for (i = 0 ; i < this._focusedGarden.children.length ; i++) {
                    lChildren = this._focusedGarden.children[i];
                    if(lChildren.name != null){
                        if(lChildren.name.indexOf("mcGraphicPlant") !== -1) this._plants[index++] = lChildren;
                    }
                }
                
                return this._plants;
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

    GardenScreen.prototype._onGameStageResize = function _onGameStageResize (eventData) {
        Screen.prototype._onGameStageResize.call(this, eventData);
        
        this._targetPosition.set(this._toyChestButton.parent.x + this._toyChestButton.x, this._toyChestButton.parent.y + this._toyChestButton.y);
        this._tweenControlPoint.set(this._targetPosition.x, -500);
        this._tweenDestinationPoint.set(this._targetPosition.x, this._targetPosition.y);
    };

    GardenScreen.prototype._createFertilizerText = function _createFertilizerText () {
        this._neuroenergy._txt = new PIXI3.Text("", { font : "40px Muli", fill : "#000000", align : "center" });

        this._neuroenergy._upStyle       = { font : "40px Muli", fill : "#000000", align : "center" };
        this._neuroenergy._overStyle     = { font : "40px Muli", fill : "#000000", align : "center" };
        this._neuroenergy._downStyle     = { font : "40px Muli", fill : "#000000", align : "center" };
        this._neuroenergy._disabledStyle = { font : "40px Muli", fill : "#000000", align : "center" };

        this._neuroenergy._txt.anchor.set(0.5, 0.5);
        this._neuroenergy.addChild(this._neuroenergy._txt);
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
    };

    GardenScreen.prototype._slideToGarden = function _slideToGarden (eventData) {
        var targetGardenId = eventData.target.id;
        var duration = 1000;

        createjs.Tween.get(this._lessonDotContainer).to({x: this._getGardensContainerTargetX(targetGardenId) - this._gardensContainer.x}, duration, createjs.Ease.quartInOut).call(function () {
            this._lessonDotContainer.x = 0;
        }.bind(this));
        createjs.Tween.get(this._gardensContainer).to({x: this._getGardensContainerTargetX(targetGardenId)}, duration, createjs.Ease.quartInOut).call(function () {
            this._manageSlidingNavigation(targetGardenId);
        }.bind(this));

        this._focusedGarden.undraw(this._lessonDotContainer);
        this._focusedGarden.undrawPlant();
        this._focusedGarden.undrawStar();

        this._removeSlideFunctions();
    };

    GardenScreen.prototype._getGardensContainerTargetX = function _getGardensContainerTargetX (targetGardenId) {
        var offset = this._gardens[targetGardenId].x - this._focusedGarden.x;
        return this._gardensContainer.x - offset;
    };

    GardenScreen.prototype._manageSlidingNavigation = function _manageSlidingNavigation (targetGardenId) {
        this._registerFocusAndNeighbours(targetGardenId);
        this._assignSlideFunctionsToNeighbourGardens(targetGardenId);

        this._focusedGarden.draw(this._data.data.language[targetGardenId - 1], this._data.data.maths[targetGardenId - 1], this._lessonDotContainer);
        this._focusedGarden.drawPlant();
        this._focusedGarden.drawStar();

        this.unlockPlants();
        this.unlockStarMiddle();
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

    GardenScreen.prototype._tweenStar = function _tweenStar (star) {
        // AJOUTER ASSET

        var duration = 1000;

        star.alpha = 1;
        star.scale.x = 0.5;
        star.scale.y = 0.5;

        if (this._index < 3){
            createjs.Tween.get(star.scale).to({x: 1.5, y: 1.5}, duration, createjs.Ease.bounceOut).call(function () {
                this._tweenStar(star);
                this._index++;
            }.bind(this));
            createjs.Tween.get(star).to({rotation: star.rotation + Math.PI},duration);
        }
        else {
            this._toyChestButton.scale.x = 0;
            this._toyChestButton.scale.y = 0;

            createjs.Tween.get(star.scale).to({x: 1, y: 1}, duration, createjs.Ease.bounceOut).wait(100).call(function () {
                this._index = 0;

                // A MODIFIER UNE FOIS L'ASSET INTEGRER
                star.parent.removeChild(star);
                this.addChild(star);
                //

                var guide = {
                    guide : {
                        path: [
                            star.x, star.y,
                            this._tweenControlPoint.x, this._tweenControlPoint.y,
                            this._tweenDestinationPoint.x, this._tweenDestinationPoint.y
                        ]
                    }
                };

                createjs.Tween.get(star).to(guide, duration * 2).wait(100).call(function(){
                    createjs.Tween.get(star).to({alpha: 0}, duration, createjs.Ease.cubicInOut).call(function () {
                        // DETRUIRE ASSET
                        // A MODIFIER UNE FOIS L'ASSET INTEGRER
                        star.parent.removeChild(star);
                        this._focusedGarden.addChild(star);
                        //

                        this._userProfile.starMiddle = this._focusedGarden.id;
                        this._addChildrenInterractiveStatus();
                    }.bind(this));
                    createjs.Tween.get(this._toyChestButton).to({alpha: 0}, duration, createjs.Ease.cubicInOut);
                    createjs.Tween.get(this._toyChestButton.scale).to({x: 0, y: 0}, duration, createjs.Ease.cubicInOut);
                }.bind(this));
            }.bind(this));
            createjs.Tween.get(star).to({rotation: star.rotation + Math.PI},duration);
            createjs.Tween.get(this._toyChestButton).to({alpha: 1}, duration, createjs.Ease.cubicInOut);
            createjs.Tween.get(this._toyChestButton.scale).to({x: 1, y: 1}, duration, createjs.Ease.cubicInOut);
        }
    };

    GardenScreen.prototype._removeAllChildrenInterractiveStatus = function _removeAllChildrenInterractiveStatus (pObject) {
        var lLength = pObject.children.length;
        var lChildren, i;

        for(i = lLength-1; i>=0; i--){
            if(pObject.children){
                lChildren = pObject.children[i];
                if(lChildren.children.length >= 1) this._removeAllChildrenInterractiveStatus(lChildren);
                if (lChildren.interactive) {
                    lChildren.interactive = false;
                    this._interactiveObject.push(lChildren);
                }
            }
        }
        if(pObject.interactive) {
            pObject.interactive = false;
            this._interactiveObject.push(pObject);
        }
    }

    GardenScreen.prototype._addChildrenInterractiveStatus = function _addChildrenInterractiveStatus () {
        var lLength = this._interactiveObject.length;
        var i;

        for(i = 0; i < lLength; i++) {
            this._interactiveObject[i].interactive = true;
        }

        this._interactiveObject = [];
    }

    GardenScreen.prototype._onClickOnBackButton = function _onClickOnBackButton (eventData) {
        
        SoundManager.getSound("click").play();
        this._interfaceManager.requestBrainScreen();
    };

    GardenScreen.prototype._onClickOnKaluluButton = function _onClickOnKaluluButton (eventData) {
        
        SoundManager.getSound("click").play();
        console.log("[GardenScreen] Kalulu Button click received. Not yet Implemented");
    };

    return GardenScreen;
});