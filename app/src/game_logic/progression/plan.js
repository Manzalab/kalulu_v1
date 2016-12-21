define([
    './progression_node',
    './chapter'
], function (
    ProgressionNode,
    Chapter
) {
    
    'use strict';

    // CSV HEADERS
    var h_lessonNumber = "LESSON";
    var h_chapterNumber = "CHAPTER";



    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    
    /**
     * The Plan object is the highest level progression Node.
     * @class
     * @memberof Rafiki.Pedagogy.Progression
     * @param rawData {Object} an array of data. each line includes the data for a lesson.
     * @param discipline {DisciplineModule} the discipline this plan is attached to
    **/
    function Plan (userProfile, rawData, discipline) {

        // console.log(rawData);
        // console.log(discipline);

        // INIT OF PLAN

        // we have to rebuild the data in a form that can be used by the ProgressionNode Class, i.e. each node has a "children" member containing the array of its children data
        
        //@param setup.id {string} id of the node
        //@param setup.discipline {DisciplineModule} if parent is not provided, the discipline module of the node.
        //@param setup.parent {ProgressionNode} The parent node
        //@param setup.children {object.<string, object>} The raw data needed to instanciate children
        //@param setup.targetNotion {string[]} The list of identifiers for the node's own notions
        var plan = {
            id          : discipline.id + "PedagogicProgression",
            discipline  : discipline,
            children    : []
        };

        var cumulbyLesson = {}
        var AllNotions = ['forward','oneby']
        

        // for each line (corresponding to a lesson)
        for (var i = 0 ; i < rawData.length ; i++) {
            
            var lLessonRawData = rawData[i];
            var lChapterNumber = lLessonRawData[h_chapterNumber];
            var lLessonNumber = lLessonRawData[h_lessonNumber];
            var lChapterId = "Chapter" + lChapterNumber;
            var lLessonId = "Lesson" + lLessonNumber;
            var lLessonNotionId = lLessonRawData["NOTION ID"];
            

            var lnotions = AllNotions.concat(lLessonNotionId)
            // console.log(lnotions)
            this.AllNotions =  lnotions

            if (!plan.children[lChapterNumber - 1]) {
                plan.children[lChapterNumber - 1] = {
                    id : lChapterId,
                    ChapterNumber : lChapterNumber,
                    children : []
                };
                //console.log("added " + lChapterId + " to plan");
            }
            if (!cumulbyLesson[lLessonNumber]) cumulbyLesson[lLessonNumber] = lnotions;

            AllNotions = lnotions

            plan.children[lChapterNumber - 1].children.push(lLessonRawData);
        }
        
        plan._targetNotionsCumul = cumulbyLesson;
        this._targetNotionsCumul = cumulbyLesson;
        ProgressionNode.call(this, userProfile, plan);

        this._lessonCount = rawData.length;
    }

    Plan.prototype = Object.create(ProgressionNode.prototype);
    Plan.prototype.constructor = Plan;


    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(Plan.prototype, {
        
        /**
         * The count of lessons included in this plan
         * @type {number}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.Plan#
        **/
        lessonCount : { get : function () { return this._lessonCount; } },

        /**
         * List of id of the Notions taught by this node or its children.
         * @type {string[]}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.Plan#
        **/
        targetNotionsIds : {
            get : function () {
                var targetNotionsIds = [];
                for (var i = 0 ; i < this.children.length ; i++) {
                    targetNotionsIds = targetNotionsIds.concat(this.children[i].targetNotionsIds);
                }
                return targetNotionsIds;
            }
        },

        /**
         * List of the Notions taught by this node or its children.
         * @type {Notion[]}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.Plan#
        **/
        targetNotions : {
            get : function () {
                var targetNotions = [];
                for (var i = 0 ; i < this.children.length ; i++) {
                    targetNotions = targetNotions.concat(this.children[i].targetNotions);
                }
                return targetNotions;
            }
        }
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################


    /**
     *
    **/
    Plan.prototype.unlockAllNodesUpToChapter = function unlockAllNodesUpToChapter (chapterNumber) {
        
        var i, j, k, lChapter, lLesson;

        for (i = 0 ; i < this.children.length ; i++)  {
            lChapter = this.children[i];
            if (lChapter.chapterNumber <= chapterNumber) {
                lChapter.isUnlocked = true;
                lChapter.isStarted = false;
                lChapter.isCompleted = false;
                for (j = 0 ; j < lChapter.children.length ; j++) {
                    lLesson = lChapter.children[j];
                    lLesson.isUnlocked = true;
                    lLesson.isStarted = false;
                    lLesson.isCompleted = false;
                    if (!lLesson.children) {
                        continue;
                    }
                    for (k = 0; k < lLesson.children.length; k++) {
                        lLesson.children[k].isUnlocked = true;
                        lLesson.isStarted = false;
                        lLesson.isCompleted = false;
                    }
                }
            }
            else {
                lChapter.isUnlocked = false;
                lChapter.isStarted = false;
                lChapter.isCompleted = false;
                for (j = 0 ; j < lChapter.children.length ; j++) {
                    lLesson = lChapter.children[j];
                    lLesson.isUnlocked = false;
                    lLesson.isStarted = false;
                    lLesson.isCompleted = false;
                    if (!lLesson.children) {
                        continue;
                    }
                    for (k = 0; k < lLesson.children.length; k++) {
                        lLesson.children[k].isUnlocked = false;
                        lLesson.children[k].isStarted = false;
                        lLesson.children[k].isCompleted = false;
                    }
                }
            }
        }
    };

    // PRIVATE METHODS
    Plan.prototype._createChildren = function _createChildren (children) {
        //console.log(children);
        this._children = [];
        for (var i = 0 ; i< children.length ; i++) {
            
            this._children.push(new Chapter(this._userProfile, children[i], this));
        }
    };

    return Plan;
});