define([
    './progression_node'
], function (
    ProgressionNode
) {
    
    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    /**
     * The Assessment class is ...
     * @class
     * @extends ProgressionNode
     * @memberof Rafiki.Pedagogy.Progression
     * @param parameter {Object} Description of the parameter
    **/
    function Assessment (userProfile, setup, parent) {
        
        //console.log(setup);

        //@param setup.id {string} id of the node
        //@param setup.discipline {DisciplineModule} if parent is not provided, the discipline module of the node.
        //@param setup.parent {ProgressionNode} The parent node
        //@param setup.children {object.<string, object>} The raw data needed to instanciate children
        //@param setup.targetNotions {GP[]} The list of identifiers for the node's own notions
        var assessment = {
            id : "Assessment" + parent.chapterNumber,
            discipline : parent.discipline,
            parent : parent,
            children : {},
            targetNotions : 0
        };

        ProgressionNode.call(this, userProfile, assessment);

        //if (!Config.languageModule.assessments[parent.chapterNumber - 1]) console.warn(assessment);
        //this._activityType = Config.languageModule.assessments[parent.chapterNumber - 1].MINIGAME;
        this._chapterNumber = parent.chapterNumber;
    }

    Assessment.prototype = Object.create(ProgressionNode.prototype);
    Assessment.prototype.constructor = Assessment;



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(Assessment.prototype, {
        
        /**
         * The string id of the activity type
         * @type {string}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.Assessment#
        **/
        activityType : { get : function () { return this._activityType ;} },
        
        /**
         * The number id of the chapter this assessment is for
         * @type {number}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.Assessment#
        **/
        chapterNumber : { get : function () { return this._chapterNumber ;} },

        /**
         * List of id of the Notions taught by this node or its children.
         * @type {string[]}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.Assessment#
        **/
        targetNotionsIds : {
            get : function () {
                return this.parent.targetNotionsIds;
            }
        },

        /**
         * List of the Notions taught by this node or its children.
         * @type {Notion[]}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.Assessment#
        **/
        targetNotions : {
            get : function () {
                return this.parent.targetNotions;
            }
        }
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################

    // PRIVATE METHODS
    Assessment.prototype._createChildren = function _createChildren (children) { };

    return Assessment;
});