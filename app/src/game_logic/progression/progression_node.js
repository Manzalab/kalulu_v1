define([], function(){
    
    'use strict';

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    /**
     * The ProgressionNode is base element of the pedagogic progression.
     * All nodes must have an id, and belong to a discipline.
     * A node can relate to other nodes via 'parent/children' relations.
     * This structure allows recursive navigation through the plan.
     * 
     * @class
     * @memberof Rafiki.Pedagogy.Progression
     * @param setup.id {string} id of the node
     * @param setup.discipline {DisciplineModule} if parent is not provided, the discipline module of the node.
     * @param setup.parent {ProgressionNode} The parent node
     * @param setup.children {object.<string, object>} The raw data needed to instanciate children
     * @param setup.targetNotion {string[]} The list of identifiers for the node's own notions
    **/
    function ProgressionNode (userProfile, setup) {
        
        this._userProfile = userProfile;

        // console.log(setup)
        this._targetNotionsCumul = setup._targetNotionsCumul;

        /**
         * This node's id.
         * @type {string}
         * @private
        **/
        this._id = setup.id;

        /**
         * This node's disciplineModule.
         *
         * @type {DisciplineModule}
         * @private
        **/
        this._discipline = setup.parent ? setup.parent.discipline : setup.discipline;
        
        /**
         * @type {ProgressionNode}
         * @private
        **/
        this._parent = setup.parent;

        /**
         * This HAS TO BE AN ARRAY AND NOT AN OBJECT LITERAL because the order is important, and we want to be able to call children[0] to have the first child
         * @type {ProgressionNode[]} 
         * @private
        **/
        this._children = null;

        // INITIALISATION LOGIC
        if (setup.children) this._createChildren(setup.children);


    }


    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################
    
    Object.defineProperties(ProgressionNode.prototype, {
        
        /**
         * @type {string}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        id: { get: function () { return this._id; } },
        
        /**
         * @type {DisciplineModule}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        discipline: { get: function () { return this._discipline; } },

        /**
         * @type {ProgressionNode}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        parent: { get: function () { return this._parent; } },

        /**
         * @type {ProgressionNode[]}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        children: { get: function () { return this._children; } },

        /**
         * @type {boolean}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        isUnlocked: {
            get: function () { 
                if (!this._userProfile[this._discipline.type].plan[this.id]) return false;
                return this._userProfile[this._discipline.type].plan[this.id].isUnlocked;
            },
            set : function (isUnlocked) {
                if (isUnlocked) console.log("Unlocking " + this.id);
                this._userProfile[this._discipline.type].plan[this._id].isUnlocked = isUnlocked;
                if (isUnlocked && this._children && this.children.length > 0) {
                    console.log("Trying to unlock " + this._children[0].id);
                    console.log(this._children[0].isUnlocked);
                    this._children[0].isUnlocked = isUnlocked;
                }
                this._userProfile.save();
            }
        },

        /**
         * @type {boolean}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        isStarted: {
            get: function () { 
                if (!this._userProfile[this._discipline.type].plan[this.id]) return false;
                return this._userProfile[this._discipline.type].plan[this.id].isStarted;
            },
            set: function (value) {
                console.log("setting isStarted to " + value);
                console.log(this);
                this._userProfile[this._discipline.type].plan[this._id].isStarted = value;
                if (value && this.parent && !this.parent.isStarted) this.parent.isStarted = true;
                this._userProfile.save();
                return this._isStarted;
            }
        },

        /**
         * @type {boolean}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        isCompleted: {
            get: function () { 
                if (!this._userProfile[this._discipline.type].plan[this.id]) {
                    console.warn("No data for node " + this.id + " of " + this.discipline.type + " module.");
                    return false;
                }
                return this._userProfile[this._discipline.type].plan[this.id].isCompleted;
            },
            set : function (isCompleted) {

                var lIDSplit = this._id.split("_")[1];
                if(lIDSplit) lIDSplit = lIDSplit.substring(0, lIDSplit.length-1);
                
                if(!this._userProfile[this._discipline.type].plan[this._id].isCompleted && isCompleted && lIDSplit == "minigame") this._userProfile.fertilizer += 1;

                this._userProfile[this._discipline.type].plan[this._id].isCompleted = isCompleted;
                if(isCompleted) {
                    if (this.parent) this.parent.checkCompletion();
                    this.unlockNextNode();
                } 
                this._userProfile.save();
            }
        },
        
        /**
         * List of id of the Notions taught by this node or its children.
         * @type {string[]}
         * @readonly
         * @memberof Rafiki.Pedagogy.Progression.ProgressionNode#
        **/
        targetNotionsIds : {
            get : function () {
                // to be overriden in sub-classes depending on the depth (cf. Plan, Chapter, Lesson, etc.)
                return null;
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
                // to be overriden in sub-classes depending on the depth (cf. Plan, Chapter, Lesson, etc.)
                return null;
            }
        }
    });


    // ###############################################################################################################################################
    // ###  PUBLIC METHODS  ##########################################################################################################################
    // ###############################################################################################################################################
    
    /**
     *
     * @return {object.<string, string>} the data to save for this node and its children, indexed by node id
    **/
    ProgressionNode.prototype.getDataForSave = function getDataForSave () {
        var lData = {};

        lData[this.id] = {
            isUnlocked : this.isUnlocked,
            isStarted : this.isStarted,
            isCompleted : this.isCompleted
        };

        if (this._children) {
            for (var i = 0 ; i < this._children.length ; i++) {
                var lChildren = this._children[i];

                Object.assign(lData, lChildren.getDataForSave());
            }
        }
        return lData;
    };

    ProgressionNode.prototype.createSave = function createSave () {
        
        var newSave = {};

        newSave[this.id] = {
            isUnlocked : false,
            isStarted : false,
            isCompleted : false
        };

        if (this._children) {
            for (var i = 0 ; i < this._children.length ; i++) {
                Object.assign(newSave, this._children[i].createSave());
            }
        }
        return newSave;
    };

    ProgressionNode.prototype.setToSavedState = function setToSavedState (savedData) {
        this.isUnlocked = savedData[this.id].isUnlocked;
        this.isStarted = savedData[this.id].isStarted;
        this.isCompleted = savedData[this.id].isCompleted;
        //console.log(this);
        if (this._children) {
            for (var i = 0 ; i < this._children.length ; i++) {
                this._children[i].setToSavedState(savedData);
            }
        }
    };


    /**
     * @return {string[]} an array of notion ids.
    **/
    ProgressionNode.prototype.getTargetNotionsIncludingChildren = function getTargetNotionIdsIncludingChildren () {
        
        var notionIds = this._targetNotion.slice(); // slice() allows a shallow copy of an array

        for (var i = 0 ; i < this.children.length ; i++) {
            
            var notionsInChildren = this.children[i].getTargetNotionsIncludingChildren();
            if (notionsInChildren.length > 0) {
                notionIds = notionIds.concat(notionsInChildren);
            }
        }

        return _.uniq(notionIds);
    };

    ProgressionNode.prototype.checkCompletion = function checkCompletion () {
        
        var allChildrenCompleted = true;
        
        for (var i = 0 ; i < this._children.length ; i++) {
            if (!this.children[i].isCompleted) {
                //console.info("[" + this.id + "] Children " + i + "not yet completed...");
                allChildrenCompleted = false;
                break;
            }
        }
        
        if (allChildrenCompleted) {
            //console.info("[" + this.id + "] All children Completed !");
            this.isCompleted = true;
        }
        else this.isCompleted = false;
    };

    ProgressionNode.prototype._createChildren = function _createChildren (children) {
        // to be overriden in daughter classes.
    };

    ProgressionNode.prototype.unlockNextNode = function unlockNextNode () {

        var lNextNode = this.nextNode();
        if (lNextNode) lNextNode.isUnlocked = true;
    };

    /**
     * Returns either the next sibling node (same parent, next node) or, if this is the last node of the family, the next parent node.
    **/
    ProgressionNode.prototype.nextNode = function nextNode () {
        // if we have no parent, we are the rootest node, and returns null.
        if (!this.parent) {
            return null;
        }

        var index = this.parent.children.indexOf(this);
        // if we are not the last child, we return the next child
        if (index < this.parent.children.length - 1) {
            //console.info("[" + this.id + "] I am not the last Child ! Here is my next brother");
            return this.parent.children[index+1];
        }
        //if we are the last child, we return our parent's next Node.
        else if (index == this.parent.children.length - 1) {
            //console.info("[" + this.id + "] I was the lastr Child ! I let my parent give you his next node");
            return this.parent.nextNode();
        }
    };

    return ProgressionNode;
});