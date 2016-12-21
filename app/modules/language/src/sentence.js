define([], function () {
    
    'use strict';

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    /**
     * The Sentence class represents a sequence of words
     *
     * @class
     * @memberof Kalulu.GameLogic.Language
     * @param words {Word[]} DThe sequence of words composing the sentence
    **/
    function Sentence (words) {

        /**
         * The sequence of words composing the sentence
         *
         * @type {Word[]}
         * @private
        **/
        this._words = words;
    }

    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(Sentence.prototype, {
        
        /**
         * Description of the accessor
         *
         * @type {string}
         * @memberof Kalulu.GameLogic.Language.Sentence#
        **/
        txtValue: {
            get: function () {
                var string = "";
                for (var i = 0 ; i < this._words.length ; i++) {
                    string += this._words[i].txtValue + " ";
                }

                string.trimRight();
                string += ".";
                return string;
            }
        }
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################

    /**
     * Returns the sentence as string.
     *
     * @return {string} the stringified sentence
    **/
    Sentence.prototype.toString = function toString () {
        
        var sentence = "";
        for (var w = 0 ; w < this._words.length ; w++) {
            sentence += this._words[w].txtValue + " ";
        }

        sentence.trim();

        return sentence;
    };

    return Sentence;
});