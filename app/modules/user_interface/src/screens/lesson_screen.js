define([
    '../utils/ui/screen',
    '../utils/sound/sound_manager'
], function (
    Screen,
    SoundManager
) {

    'use strict';

    /**
     * A screen showing a Lesson.
     * @constructor
     * @param {Lesson} lessonNode
    **/
    function LessonScreen (interfaceManager, lessonNode) {
        
        //console.log(lessonNode);
        
        Screen.call(this);
        this._interfaceManager = interfaceManager;
        this.name="mcLessonScreen";
        this.modalImage = "purple_bg.png";

        this.build();

        this._kalulu = this._interfaceManager.kaluluCharacter;
        this._node = lessonNode;
        //console.log(this._node);

        // Reference auto-built parts
        this._lookAndLearnButton    = this.getChildByName("mcLookAndLearn");
        this._topMinigameButton     = this.getChildByName("mcMinigameTop");
        this._leftMinigameButton    = this.getChildByName("mcMinigameLeft");
        this._rightMinigameButton   = this.getChildByName("mcMinigameRight");
        
        this._backButton            = this.getChildByName("mcTLHudLesson").getChildByName("mcBackButton");
        this._hud                   = { bottomLeft: this.getChildByName("mcBLHudLesson") };
        this._kaluluButton          = this._hud.bottomLeft.getChildByName("mcKaluluButton");
        
        if (Config.enableGlobalVars) window.kalulu.lessonScreen = this;
        
        // Setup Buttons
        this._lookAndLearnButton.setup(this._node.children[0], this._onClickOnActivity.bind(this), true);
        this._lookAndLearnButton.setText(this.stringifyTargetNotions(this._node));
        this._topMinigameButton.setup(this._node.children[1], this._onClickOnActivity.bind(this), true);
        this._rightMinigameButton.setup(this._node.children[2], this._onClickOnActivity.bind(this), true);
        this._leftMinigameButton.setup(this._node.children[3], this._onClickOnActivity.bind(this), true);

        this._backButton.onClick = this._onClickOnBackButton.bind(this);
        this._kaluluButton.onClick = this._onClickOnKaluluButton.bind(this);
    }

    LessonScreen.prototype = Object.create(Screen.prototype);
    LessonScreen.prototype.constructor = LessonScreen;

    LessonScreen.prototype.destroy = function destroy () {

        Screen.prototype.destroy.call(this);
    };

    LessonScreen.prototype._onClickOnActivity = function _onClickOnActivity (pEventData) {
        SoundManager.getSound("click").play();
        this._interfaceManager.requestMinigame(pEventData.target.data);
    };


    LessonScreen.prototype._onClickOnBackButton = function _onClickOnBackButton (pEventData) {
        
        SoundManager.getSound("click").play();
        this._interfaceManager.requestGardenScreen(this._node.parent.chapterNumber);
    };

    LessonScreen.prototype._onClickOnKaluluButton = function _onClickOnKaluluButton (pEventData) {
        

        this._kalulu.x = this._kalulu.width/2;
        this._kalulu.y = -this._kalulu.height/3;
        this._hud.bottomLeft.addChild(this._kalulu);
        /*if (this._node.children[1].isCompleted&&this._node.children[2].isCompleted&&this._node.children[3].isCompleted) this._kalulu.startTalk("kalulu_tuto_lessonscreen");
        else*/ if ((this._node.children[1].isCompleted&&this._node.children[2].isCompleted)||
                 (this._node.children[2].isCompleted&&this._node.children[3].isCompleted)||
                 (this._node.children[3].isCompleted&&this._node.children[1].isCompleted))  this._kalulu.startTalk("kalulu_tuto_twogameplayed");
        else if (this._node.children[1].isCompleted||this._node.children[2].isCompleted||this._node.children[3].isCompleted)    this._kalulu.startTalk("kalulu_tuto_onegameplayed");
        else this._kalulu.startTalk("kalulu_tuto_lessonscreen");
    };

    LessonScreen.prototype.stringifyTargetNotions = function stringifyTargetNotions (lessonNode) {
        console.log(lessonNode);
        var string ="";
        
        for (var notionId in lessonNode.targetNotions) {
            if (!lessonNode.targetNotions.hasOwnProperty(notionId)) continue;
            var targetNotion = lessonNode.children[0].targetNotions[notionId];

            if (string.length > 0) string += " & ";
            string += targetNotion.upperCase;
        }

        return string;
    };

    return LessonScreen;
});