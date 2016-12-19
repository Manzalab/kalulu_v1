define([], function () {
    
    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    
    /**
     * The Notion class represents the object of a Lesson. It is generic (not linked to a specific Discipline).
     * Each Discipline can extend this class for specific notions (e.g. Grapheme-Phoneme, Word, Number, Skill);
     * @class
     * @memberof Kalulu.GameLogic.Core
     * @param parameter {Object} Description of the parameter
    **/
    function Notion () {

        /**
         * The notion id
         * @type {string}
         * @private
        **/
        this._id = null;

        /**
         * The number id of the lesson that teaches this notion
         * @type {number}
         * @private
        **/
        this._lessonNumber = null;

        /**
         * The number id of the chapter that teaches this notion
         * @type {number}
         * @private
        **/
        this._chapterNumber = null;
    }


    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(Notion.prototype, {
        
        /**
         * The notion id
         * @type {string}
         * @memberof Kalulu.GameLogic.Core.Notion#
        **/
        id: {
            get: function () {
                return this._id;
            },
            set: function (value) {
                this._id = value;
                return this._id;
            }
        },

        /**
         * The number id of the lesson that teaches this notion
         * @type {number}
         * @memberof Kalulu.GameLogic.Core.Notion#
        **/
        lessonNumber: {
            get: function () {
                return this._lessonNumber;
            },
            set: function (value) {
                this._lessonNumber = value;
                return this._lessonNumber;
            }
        },

        /**
         * The number id of the chapter that teaches this notion
         * @type {number}
         * @memberof Kalulu.GameLogic.Core.Notion#
        **/
        chapterNumber: {
            get: function () {
                return this._chapterNumber;
            },
            set: function (value) {
                this._chapterNumber = value;
                return this._chapterNumber;
            }
        },

        /**
         * False until the player has completed the lecture for this notion
         * @type {boolean}
         * @memberof Kalulu.GameLogic.Core.Notion#
        **/
        isAvailable : {
            get : function () {
                return this._isAvailable;
            },
            set : function (value) {
                this._isAvailable = value;
                return this._isAvailable;
            }
        },
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################


    /**
     * Returns something
     * @param paramName {Type} description of the parameter
     * @return {Type} description of the returned object
    **/
    Notion.prototype.init = function init (paramName) {
        
        // code
        return null;
    };

    return Notion;
});