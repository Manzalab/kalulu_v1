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
     * The Lecture class is ...
     * @class
     * @extends ProgressionNode
     * @memberof Rafiki.Pedagogy.Progression
     * @param parameter {Object} Description of the parameter
    **/
    function Lecture (userProfile, setup, parent) {
        
        // console.log(setup);
        // console.log(parent);

        // @param setup.id {string} id of the node
        // @param setup.discipline {DisciplineModule} if parent is not provided, the discipline module of the node.
        // @param setup.parent {ProgressionNode} The parent node
        // @param setup.children {object.<string, object>} The raw data needed to instanciate children
        // @param setup.targetNotion {string[]} The list of identifiers for the node's own notions
        this._activityType = setup.activityType;
        
        var lecture = {
            id : setup.id,
            discipline : parent.discipline,
            parent : parent
        };

        ProgressionNode.call(this, userProfile, lecture);
    }

    Lecture.prototype = Object.create(ProgressionNode.prototype);
    Lecture.prototype.constructor = Lecture;



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(Lecture.prototype, {
        
        /**
         * The string id of the activity type
         * @type {string}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        activityType : { get : function () { return this._activityType; } },

        /**
         * List of id of the Notions taught by this node.
         * @type {string[]}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        targetNotionsIds : {
            get : function () {
                return this.parent.targetNotionsIds;
            }
        },

        /**
         * List of the Notions taught by this node.
         * @type {Notion[]}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
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


    return Lecture;
});