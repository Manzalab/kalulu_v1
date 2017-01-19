define([
    '../utils/ui/ui_component',
    '../utils/ui/ui_builder',
    '../utils/events/mouse_event_type',
    './plant',
    './star_middle',
    './lesson_dot'
], function (
    UIComponent,
    UIBuilder,
    MouseEventType,
    Plant,
    StarMiddle,
    LessonDot
) {
    
    'use strict';

    // Depending on the lessons count in this garden, gives the index of the position marker for each lesson.
    // examples : if I have 2 lessons in this garden, the first will be positionned on marker 1, the second on marker 3.
    // If I have 3 lessons in this garden, the first will be positionned on marker 2, the second on marker 3 and the third on marker 4.
    var lessonMatch = {
        1 : { 1 : 3 },
        2 : { 1 : 1, 2 : 3},
        3 : { 1 : 2, 2 : 3, 3 : 4},
        4 : { 1 : 1, 2 : 2, 3 : 3, 4 : 4}
    };

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    

    /**
     * The Garden class is ...
     * @class
     * @extends UIComponent
     * @memberof Namespace (e.g. Kalulu.Remediation)
    **/
    function Garden (description, assetName) {
        
        this._assetName = assetName;
        UIComponent.call(this);
        this.isModal = false;

        this._description = description;

        this.name = assetName;

        this.id = parseInt(assetName.split("_")[1], 10);

        this.build();

        this._dots = [];
        this._plants = [];
        this._starsPath = [];
        this._starLessonState = [];
        this._starMiddle;
    }
    
    Garden.prototype = Object.create(UIComponent.prototype);
    Garden.prototype.constructor = Garden;



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(Garden.prototype, {
        starMiddle : {
            get : function () { return this._starMiddle; }
        },

        starPath : {
            get : function () {return this._starsPath; }
        },

        starLessonState : {
            get : function ()  {return this._starLessonState; }
        }
    });



    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

    /**
     * Enable or disable clicking on the Garden to call onClick.
     * @param interactive {boolean} should the Garden be set to interactive or not
    **/
    Garden.prototype.setInteractive = function setInteractive (interactive) {
        
        this.interactive = interactive;
        this.buttonMode = interactive;
        
        if (interactive) {
            this.on(MouseEventType.CLICK, this._click, this);
        }
        else {
            this.off(MouseEventType.CLICK, this._click, this);
        }
    };

    /**
     * 
    **/
    Garden.prototype.draw = function draw (languageChapter, mathsChapter, container, lessonsNumber, rewardLanguage, rewardMath) {

        var i, j, markerPosition, lDot, lNode, star, lDotBossA, lDotBossB, lRotation, lDeltaX, lDeltaY;
        var assetNameAssessment = "LessonDotBoss";

        // ### LANGUAGE : PATH A
        var languageNodes = languageChapter.children;
        var languageNodesCount = languageNodes.length;
        var languageLessonsCount = languageNodesCount - 1;
        var match = lessonMatch[languageLessonsCount];

        for (i = 0 ; i < languageNodesCount ; i++) {

            lNode = languageNodes[i];
            // console.log(i);
            // console.log(lNode);

            if (lNode.constructor.name == "Lesson") {
                lDot = new LessonDot(lNode, this._onClickOnLessonDot.bind(this));
                lDot.scale.set(1, 1);
                markerPosition = this.getChildByName("mcLesson" + match[(i+1)] + "PathA");
                if (!markerPosition) {
                    console.log("[GardenScreen] Issue with mcLesson" + match[(i+1)] + "PathA");
                    console.log("[GardenScreen] Issue maybe due to missing " + lNode.lessonNumber + " in match array.");
                }
                lDot.position.set(markerPosition.x, markerPosition.y + this.y);

                for(j = 0; j < rewardLanguage.length; j++){
                    if(lessonsNumber[this.id][0] + i == rewardLanguage[j]) {
                        if(this.id < 10) star = new StarMiddle("StarMiddle0" + this.id);
                        else star = new StarMiddle("StarMiddle" + this.id);
                        star.position.set(markerPosition.x, markerPosition.y + this.y);
                    }
                }
            }
            else if (lNode.constructor.name == "Assessment") {
                lDot = new LessonDot(lNode, this._onClickOnAssessmentDot.bind(this), assetNameAssessment);
                markerPosition = this.getChildByName("mcAssessmentPathA");
                lDot.position.set(markerPosition.x, markerPosition.y + this.y);
                lDot.rotation = Math.DEG2RAD * 180;
                lDotBossA = lDot;
            }

            lDot.setText(lNode.id);
            container.addChild(lDot);
            this._dots.push(lDot);

            lDot.alpha = 0;
            createjs.Tween.get(lDot).to({alpha: 1}, 1000, createjs.Ease.linear);

            if(star) {
                container.addChild(star);
                star.alpha = 0;
                createjs.Tween.get(star).to({alpha: 1}, 1000, createjs.Ease.linear);

                this._starsPath.push(star);
                this._starLessonState.push(lNode);
                star = null;
            }
        }

        // ### MATHS : PATH B
        var mathsNodes = mathsChapter.children;
        var mathsNodesCount = mathsNodes.length;
        var mathsLessonsCount = mathsNodesCount - 1;
        var match2 = lessonMatch[mathsLessonsCount];

        for (i = 0 ; i < mathsNodesCount ; i++) {

            lNode = mathsNodes[i];

            if (lNode.constructor.name == "Lesson") {
                lDot = new LessonDot(lNode, this._onClickOnLessonDot.bind(this));
                lDot.scale.set(1, 1);
                markerPosition = this.getChildByName("mcLesson" + match2[(i+1)] + "PathB");
                if (!markerPosition) {
                    console.log("[GardenScreen] Issue with mcLesson" + match2[(i+1)] + "PathB");
                    console.log("[GardenScreen] Issue maybe due to missing " + lNode.lessonNumber + " in match array. " + (i+1) + " requested.");
                }
                lDot.position.set(markerPosition.x, markerPosition.y + this.y);

                for(j = 0; j < rewardMath.length; j++){
                    if(lessonsNumber[this.id][0] + i == rewardMath[j]) {
                        if(this.id < 10) star = new StarMiddle("StarMiddle0" + this.id);
                        else star = new StarMiddle("StarMiddle" + this.id);
                        star.position.set(markerPosition.x, markerPosition.y + this.y);
                    }
                }
            }
            else if (lNode.constructor.name == "Assessment") {
                lDot = new LessonDot(lNode, this._onClickOnAssessmentDot.bind(this), assetNameAssessment);
                markerPosition = this.getChildByName("mcAssessmentPathB");
                lDot.position.set(markerPosition.x, markerPosition.y + this.y);
                lDotBossB = lDot;
            }

            lDot.setText(lNode.id);
            container.addChild(lDot);
            this._dots.push(lDot);

            lDot.alpha = 0;
            createjs.Tween.get(lDot).to({alpha: 1}, 1000, createjs.Ease.linear);

            if(star) {
                container.addChild(star);
                star.alpha = 0;
                createjs.Tween.get(star).to({alpha: 1}, 1000, createjs.Ease.linear);

                this._starsPath.push(star);
                this._starLessonState.push(lNode);
                star = null;
            }
        }

        lRotation = Math.atan((lDotBossB.x-lDotBossA.x)/(lDotBossB.y-lDotBossA.y));

        lDeltaX = Math.abs((lDotBossB.x - lDotBossA.x) * Math.cos(lRotation) / 2);
        lDeltaY = Math.abs((lDotBossB.y - lDotBossA.y) * Math.sin(lRotation) / 2);

        lDotBossA.x -= lDeltaX;
        lDotBossA.y -= lDeltaY;

        lDotBossB.x += lDeltaX;
        lDotBossB.y += lDeltaY;

        lRotation = Math.atan((lDotBossB.x-lDotBossA.x)/(lDotBossB.y-lDotBossA.y));

        lDotBossA.rotation -= lRotation;
        lDotBossB.rotation -= lRotation;
    };

    Garden.prototype.undraw = function undraw (container) {
        var lastDotIndex = this._dots.length - 1;
        var i, lDot;

        for (i = lastDotIndex ; i >= 0 ; i--) {
            createjs.Tween.get(this._dots[i]).to({alpha: 0}, 1000, createjs.Ease.linear).call(function () {
                lDot = this._dots.splice(i, 1)[0];
                container.removeChild(lDot);
                lDot.destroy();
            }.bind(this));
        }

        this._starLessonState = [];

        this.undrawStarPath(container);
    };

    Garden.prototype.undrawStarPath = function undrawStarPath(container) {
        var lastStarIndex = this._starsPath.length - 1;
        var i, lStar;

        for (i = lastStarIndex ; i >= 0 ; i--) {
            createjs.Tween.get(this._starsPath[i]).to({alpha: 0}, 1000, createjs.Ease.linear).call(function () {
                lStar = this._starsPath.splice(i, 1)[0];
                container.removeChild(lStar);
                lStar.destroy();
            }.bind(this));
        }
    }

    Garden.prototype.drawPlant = function drawPlant () {
        var i, lPlant, lChildren;

        var lLength = this.children.length;

        for (i = 0 ; i < lLength ; i++) {

            lChildren = this.children[i];

            if (lChildren.name.indexOf("Plant") !== -1) {

                lPlant = new Plant(lChildren, lChildren.name);
                lPlant.x = lChildren.x;
                lPlant.y = lChildren.y - lPlant.height/2;

                this.addChild(lPlant);
                this._plants.push(lPlant);

                lPlant.alpha = 0;
                createjs.Tween.get(lPlant).to({alpha: 1}, 1000, createjs.Ease.linear);
            }
        }
    }

    Garden.prototype.undrawPlant = function undrawPlant () {
        var lastPlantIndex = this._plants.length - 1;
        var i, lPlant;

        for (i = lastPlantIndex ; i >= 0 ; i--) {
            createjs.Tween.get(this._plants[i]).to({alpha: 0}, 1000, createjs.Ease.linear).call(function () {
                lPlant = this._plants.splice(i, 1)[0];
                this.removeChild(lPlant);
                lPlant.destroy();
            }.bind(this));
        }
    }

    Garden.prototype.drawStar = function drawStar (rewardChapter) {
        var i, j, lChildren;

        var lLength = this.children.length;

        for (i = 0 ; i < lLength ; i++) {

            lChildren = this.children[i];

            if (lChildren.name.indexOf("StarMiddle") !== -1) {

                for(j = 0; j < rewardChapter.length; j++) {
                    if(rewardChapter[j] == this.id) {
                        this._starMiddle = new StarMiddle(lChildren.name);
                        this._starMiddle.x = lChildren.x;
                        this._starMiddle.y = lChildren.y;

                        this.addChild(this._starMiddle);
                        
                        this._starMiddle.alpha = 0;
                        createjs.Tween.get(this._starMiddle).to({alpha: 1}, 1000, createjs.Ease.linear);

                        break;
                    }
                }
            }
        }
    }

    Garden.prototype.undrawStar = function undrawStar () {
        createjs.Tween.get(this._starMiddle).to({alpha: 0}, 1000, createjs.Ease.linear).call(function () {
            this.removeChild(this._starMiddle);
            this._starMiddle.destroy();
        }.bind(this));
    }

    Garden.prototype.onClick = function onClick (pEventData) {
        // to be overriden
    };

    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################

    Garden.prototype._builderCall = function _builderCall () {
        // console.log("Garden Build :");
        // console.log(this);
        return UIBuilder.build(this, this._description);
    };

    Garden.prototype._click = function _click (pEventData) {
        this.onClick(pEventData);
    };
    
    Garden.prototype._onClickOnLessonDot = function _onClickOnLessonDot (pEventData) {
        var lesson = pEventData.target.data;
        if (!lesson.children[0].isCompleted) {
            this.parent.parent._interfaceManager.requestMinigame(lesson.children[0]);
        }
        else {
            this.parent.parent._interfaceManager.requestLessonScreen(lesson);
        }
    };

    Garden.prototype._onClickOnAssessmentDot = function _onClickOnAssessmentDot (pEventData) {
        this.parent.parent._interfaceManager.requestAssessment(pEventData.target.data);
    };

    return Garden;
});

