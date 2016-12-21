define([
    './progression_node',
    './lecture',
    './exercise'
], function (
    ProgressionNode,
    Lecture,
    Exercise
) {
    
    'use strict';

    var h_lessonNumber = "LESSON";
    var h_chapterNumber = "CHAPTER";
    var h_minigame1Setup = "MINIGAME 1 SETUP";
    var h_minigame2Setup = "MINIGAME 2 SETUP";
    var h_minigame3Setup = "MINIGAME 3 SETUP";
    var h_notionId = "NOTION ID";


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    /**
     * The Lesson class is ...
     * @class
     * @extends ProgressionNode
     * @memberof Rafiki.Pedagogy.Progression
     * @param parameter {Object} Description of the parameter
    **/
    function Lesson (userProfile, setup, parent) {
        
        //console.log(setup);

        var lDisciplineModule = parent.discipline;

        var lessonNumber = this._lessonNumber = setup[h_lessonNumber];
        
        /**
         * The list of id of the Notions taught by this node or its children.
         * @type {string[]}
         * @private
        **/
        this._targetNotionsIds = lDisciplineModule.getNotionIdsForLesson(this._lessonNumber);
        
        /**
         * The list of the Notions taught by this node or its children.
         * @type {Notion[]}
         * @private
        **/
        this._targetNotions = lDisciplineModule.getNotionsForLesson(this._lessonNumber);

        var lesson = {
            id : "lesson" + lessonNumber,
            parent : parent,
            children : [
                {
                    id : "lesson" + lessonNumber + "_lookandlearn",
                    parent : this,
                    activityType : "lookandlearn"
                },
                {
                    id : "lesson" + lessonNumber + "_minigame1",
                    parent : this,
                    activityType : setup[h_minigame1Setup]
                },
                {
                    id : "lesson" + lessonNumber + "_minigame2",
                    parent : this,
                    activityType : setup[h_minigame2Setup]
                },
                {
                    id : "lesson" + lessonNumber + "_minigame3",
                    parent : this,
                    activityType : setup[h_minigame3Setup]
                }, // TODO : rajouter un test sur les exercices, parfois il n'y en a pas 3.
            ]
        };
        
        ProgressionNode.call(this, userProfile, lesson);
        //console.log(parent.parent)


        
        this._targetNotionsCumul = lDisciplineModule.getNotionsByCumul(parent.parent._targetNotionsCumul,lessonNumber);

    }

    Lesson.prototype = Object.create(ProgressionNode.prototype);
    Lesson.prototype.constructor = Lesson;



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(Lesson.prototype, {
        
        /**
         * The number id of this lesson
         * @type {number}
         * @readonly
         * @memberof Kalulu.GameLogic.Progression.Lesson#
        **/
        lessonNumber : { get : function () { return this._lessonNumber; }},

        /**
         * List of id of the Notions taught by this node or its children.
         * @type {string[]}
         * @readonly
         * @memberof Kalulu.GameLogic.Progression.Lesson#
        **/
        targetNotionsIds : {
            get : function () {
                return this._targetNotionsIds;
            }
        },

        /**
         * List of the Notions taught by this node or its children.
         * @type {Notion[]}
         * @readonly
         * @memberof Kalulu.GameLogic.Progression.Lesson#
        **/
        targetNotions : {
            get : function () {
                return this._targetNotions;
            }
        }
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################

    // PRIVATE METHODS
    Lesson.prototype._createChildren = function _createChildren (children) {
        
        this._children = [];
        this._children.push(new Lecture(this._userProfile, children[0], this));

        for (var i = 1 ; i < children.length ; i++) {
            this._children.push(new Exercise(this._userProfile, children[i], this));
        }
    };

    return Lesson;
});