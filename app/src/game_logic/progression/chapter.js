define([
    './progression_node',
    './lesson',
    './assessment'
], function (
    ProgressionNode,
    Lesson,
    Assessment
) {
    
    'use strict';

    var h_notionId               = "NOTION ID";
    var h_minigame1BaseSetup     = "MINIGAME 1 BASE SETUP";
    var h_minigame1SpecificSetup = "MINIGAME 1 SPECIFIC SETUP";
    var h_minigame2BaseSetup     = "MINIGAME 2 BASE SETUP";
    var h_minigame2SpecificSetup = "MINIGAME 2 SPECIFIC SETUP";
    var h_minigame3BaseSetup     = "MINIGAME 3 BASE SETUP";
    var h_minigame3SpecificSetup = "MINIGAME 3 SPECIFIC SETUP";


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    

    /**
     * @class
     * @extends ProgressionNode
     * @memberof Rafiki.Pedagogy.Progression
     * @param setup {Object}
     * @param parent {ProgressionNode}
    **/
    function Chapter (userProfile, setup, parent) {
        if (Config.debugPlanConstruction) {
            console.log(setup);
            console.log(parent);
        }

        //@param setup.id {string} id of the node
        //@param setup.discipline {DisciplineModule} if parent is not provided, the discipline module of the node.
        //@param setup.parent {ProgressionNode} The parent node
        //@param setup.children {object.<string, object>} The raw data needed to instanciate children
        //@param setup.targetNotion {string[]} The list of identifiers for the node's own notions
        var chapter = {
            id          : setup.id,
            parent      : parent,
            children    : setup.children
        };

        this._chapterNumber = setup.ChapterNumber;

        ProgressionNode.call(this, userProfile, chapter);
    }

    Chapter.prototype = Object.create(ProgressionNode.prototype);
    Chapter.prototype.constructor = Chapter;



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(Chapter.prototype, {
        
        /**
         * The number id of this chapter
         * @type {number}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.Chapter#
        **/
        chapterNumber : { get : function () { return this._chapterNumber; }},

        /**
         * List of id of the Notions taught by this node or its children.
         * @type {string[]}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.Chapter#
        **/
        targetNotionsIds : {
            get : function () {
                
                var targetNotionsIds = [];
                // The TargetNotions of a Chapter are the sum of the TargetNotions of its children *Lessons*.
                // An *Assessment* (last child node of a chapter) has no targetNotion of its own. A call to targetNotions on an assessment will return the chapter's targetNotions.
                // To prevent infinite looping, we do not take in the sum the last child which is an assessment.
                for (var i = 0 ; i < this.children.length - 1; i++) {
                    targetNotionsIds = targetNotionsIds.concat(this.children[i].targetNotionsIds);
                }
                return targetNotionsIds;
            }
        },

        /**
         * List of the Notions taught by this node or its children.
         * @type {Notion[]}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.Chapter#
        **/
        targetNotions : {
            get : function () {
                
                var targetNotions = [];
                // The TargetNotions of a Chapter are the sum of the TargetNotions of its children *Lessons*.
                // An *Assessment* (last child node of a chapter) has no targetNotion of its own. A call to targetNotions on an assessment will return the chapter's targetNotions.
                // To prevent infinite looping, we do not take in the sum the last child which is an assessment.
                for (var i = 0 ; i < this.children.length - 1; i++) {
                    targetNotions = targetNotions.concat(this.children[i].targetNotions);
                }
                return targetNotions;
            }
        }
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################
    
    // PRIVATE METHODS
    Chapter.prototype._createChildren = function _createChildren (children) {

        // console.log(children); // only lessons, assessment to add
        this._children = [];
        for (var i = 0 ; i < children.length ; i++) {

            this._children.push(new Lesson(this._userProfile, children[i], this));
        }

        this._children.push(new Assessment(this._userProfile, {}, this));
    };

    return Chapter;
});