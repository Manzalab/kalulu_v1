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
     * The Exercise class is ...
     * @class
     * @extends ProgressionNode
     * @memberof Rafiki.Pedagogy.Progression
     * @param parameter {Object} Description of the parameter
    **/
    function Exercise (userProfile, setup, parent) {
        // console.log("exercise ::");
        // console.log(setup);
        // console.log(parent);

        // @param setup.id {string} id of the node
        // @param setup.discipline {DisciplineModule} if parent is not provided, the discipline module of the node.
        // @param setup.parent {ProgressionNode} The parent node
        // @param setup.children {object.<string, object>} The raw data needed to instanciate children
        // @param setup.targetNotion {string[]} The list of identifiers for the node's own notions
        
        this._activityType = setup.activityType;

        var exercise = {
            id : setup.id,
            discipline : parent.discipline,
            parent : parent
        };

        // this._targetNotionsCumul = parent._targetNotionsCumul;
        ProgressionNode.call(this, userProfile, exercise);
        // console.log(parent)
        

        //console.log(this);
    }

    Exercise.prototype = Object.create(ProgressionNode.prototype);
    Exercise.prototype.constructor = Exercise;



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(Exercise.prototype, {
        
        /**
         * The string id of the activity type
         * @type {string}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        activityType : { get : function () { return this._activityType; } },

        /**
         * List of id of the Notions taught by this node or its children.
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
         * List of the Notions taught by this node or its children.
         * @type {Notion[]}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        targetNotions : {
            get : function () {
                return this.parent.targetNotions;
            }
        },
       targetNotionsCumul : {
            get : function () {
                return this.parent._targetNotionsCumul;
            }
        }
      

        
    });


    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################


    return Exercise;
});