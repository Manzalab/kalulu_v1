define([], function () {

    'use strict';
    
    /**
     * The Syllable class is used to represent the association of graphemes/phoneme entities in a word.
     *
     * @class
     * @memberof Kalulu.GameLogic.Language
     * @param gpList {GP[]} the ordered list of the Grapheme/Phoneme entities composing this syllable
     * @param syllableString {string} the string value of the syllable. if not provided, will be computed.
    **/
    function Syllable (gpList, string) {

        /**
         * The string of the syllable
         *
         * @type {string}
         * @private
        **/
        this._txtValue = string || "";

        /**
         * The Grapheme/Phoneme Entities constituting this syllable
         *
         * @type {GP[]}
         * @private
        **/
        this._gps = gpList;

        /**
         * The name of the sound file
         *
         * @type {string}
         * @private
        **/
        this._soundFileName = "";

        // INIT LOGIC
        
        if (this._txtValue === "") {
            for (var i = 0 ; i < this._gps.length ; i++) {
                this._txtValue += this._gps[i].lowerCase;
            }
        }
    }

    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(Syllable.prototype, {
        
        /**
         * The id of the syllable (equivalent to txtValue)
         *
         * @type {string}
         * @memberof Kalulu.GameLogic.Language.Syllable#
        **/
        id: {
            get: function () {
                return this._txtValue;
            }
        },
                /**
         * The text value of the syllable
         *
         * @type {string}
         * @memberof Kalulu.GameLogic.Language.Syllable#
        **/
        txtValue: {
            get: function () {
                return this._txtValue;
            }
        },

        /**
         * The number of letters composing this syllable
         *
         * @type {number}
         * @memberof Kalulu.GameLogic.Language.Syllable#
        **/
        lettersCount: {
            get: function () {
                return this._txtValue.length;
            }
        },

        /**
         * The number of letters composing this syllable
         *
         * @type {number}
         * @memberof Kalulu.GameLogic.Language.Syllable#
        **/
        gpList: {
            get: function () {
                return this._gps;
            }
        }
    });


    return Syllable;
});