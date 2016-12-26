define([], function () {
    
    'use strict';

    /// List of headers in the csv file :
    var h_lesson            = "LESSON";
    var h_orthography       = "ORTHOGRAPHY";
    var h_phonology         = "PHONOLOGY";
    var h_gpMatch           = "GPMATCH";
    var h_graphemeCount     = "NB GRAPH";
    var h_letterCount       = "NB LET";
    var h_syllableCount     = "NB SYLL";
    var h_audiofileName     = "AUDIOFILE NAME";
    var h_isWord            = "IS WORD";
    var h_syllabicStructure = "SYLLABIC STRUCTURE";
    var h_properName        = "PROPER NAME";
    
    /**
     * The Word class is used to represent a word in a language discipline module
     *
     * @class
     * @memberof Kalulu.GameLogic.Language
    **/
    function Word (data, module) {

        if (!data.hasOwnProperty(h_lesson) ||
            !data.hasOwnProperty(h_orthography) ||
            !data.hasOwnProperty(h_phonology) ||
            !data.hasOwnProperty(h_gpMatch) ||
            !data.hasOwnProperty(h_graphemeCount) ||
            !data.hasOwnProperty(h_letterCount) ||
            !data.hasOwnProperty(h_syllableCount) ||
            !data.hasOwnProperty(h_audiofileName) ||
            !data.hasOwnProperty(h_isWord) ||
            !data.hasOwnProperty(h_syllabicStructure) ||
            !data.hasOwnProperty(h_properName)) {
            console.error("You are trying to create a Word with inappropriate data :");
            console.log(data);
            return;
        }

        /**
         * the Language Module this word belongs to.
         * @type {LanguageModule}
         * @private
        **/
        this._languageModule = module;

        /**
         * the word in string format, lowercase.
         * @type {number}
         * @private
        **/
        this._lesson = parseInt(data[h_lesson], 10);

        /**
         * the word in string format, lowercase.
         * @type {string}
         * @private
        **/
        this._word = data[h_orthography];

        /**
         * the word split by syllables.
         * @type {string}
         * @private
        **/
        this._phonology = data[h_phonology];

        /**
         * the word split by syllables.
         * @type {string}
         * @private
        **/
        this._gpMatch = data[h_gpMatch];

        /**
         * Number of graphemes composing the word.
         * @type {number}
         * @private
        **/
        this._graphemeCount = parseInt(data[h_graphemeCount], 10);
        
        /**
         * Number of letters composing the word.
         * @type {number}
         * @private
        **/
        this._letterCount = parseInt(data[h_letterCount], 10);
        
        /**
         * Number of syllables composing the word.
         * @type {number}
         * @private
        **/
        this._syllableCount = parseInt(data[h_syllableCount], 10);

        /**
         * Number of syllables composing the word.
         * @type {string}
         * @private
        **/
        this._audiofileName = data[h_audiofileName];

        /**
         * Number of syllables composing the word.
         * @type {boolean}
         * @private
        **/
        this._isWord = parseInt(data[h_isWord], 10) === 1;

        /**
         * Number of syllables composing the word.
         * @type {string}
         * @private
        **/
        this._syllabicStructure = data[h_syllabicStructure];


        /**
         * List of GraphemePhonemeEntities composing the word.
         *
         * @type {GraphemePhonemeEntity[]}
         * @private
        **/
        this._gpList = this._parseGPMatchData(data[h_gpMatch]);

        /**
         * List of syllables composing the word
         *
         * @type {Syllable[]}
         * @private
        **/
        this._syllables = [];
    }

    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(Word.prototype, {
        
        /**
         * Description of the accessor
         *
         * @type {boolean}
         * @memberof Kalulu.GameLogic.Language.Word#
        **/
        id: {
            get: function () {
                return this._word;
            },
            set: function (value) {
                try { value = value.toString(); }
                catch (e) {console.error(e); }

                if (typeof value !== "string") {
                    return null;
                }
                else {
                    this._txtValue = value.toLowerCase();
                    return value;
                }
            }
        },
        lesson : { get : function () { return this._lesson; } },
        syllableCount : { get : function () { return this._syllableCount; } },
        letterCount : { get : function () { return this._letterCount; } },
        graphemeCount : { get : function () { return this._graphemeCount; } },
        gpMatch : { get : function () { return this._gpMatch; } },
        gpList : { get : function () { return this._gpList; } },
        syllabicStructure : { get : function () { return this._syllabicStructure; } },
        isWord : { get : function () { return this._isWord; } },
        value : { get : function () { return this._word; }},
        soundPath : {
            get : function () { 
                var path = Config.soundsPath + 'language/' + this._audiofileName;
                return path + ".ogg";
            }
        }
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################
    
    /**
     * Parse a GP split descriptive string and returns and array of GP
     * @param gpMatchData {string} a string describing the gp division with a dot split-identifier (ex. : a-a.n-n.a-a.o-o.n-n.i-i.)
     * @return {GP[]}
    **/
    Word.prototype._parseGPMatchData = function _parseGPMatchData (gpMatchData) {
        // console.log(gpMatchData);
        // GP MATCH : "a-a.i-i.n-n.a-a."
        if (!gpMatchData) {
            throw new Error("[Word] You are trying to create a word but there is no associated GP Match data for grapheme/phoneme analysis. Please check your csv.");
        }

        var gpStringsArray = gpMatchData.split("."); // the array of syllableStrings
        
        // if the data has a trailing dot, the last element of the array is an undesired empty string. We remove it now.
        if (gpStringsArray[gpStringsArray.length - 1] === "") {
            gpStringsArray.pop();
        }

        var gpString = null;    // the string for one Grapheme/Phoneme couple (GP)
        var gp = null;          // the GP object
        var gpList = [];        // the array of GP objects

        // console.log(gpStringsArray);
        for (var c = 0 ; c < gpStringsArray.length ; c++) {
            gpList.push(this._languageModule.getGPbyId(gpStringsArray[c]));
        }

        // if some syllables are not yet present in the syllablesList we create it and add it.
        return gpList;
    };

    /**
     * Initialise this Word from Data.
     *
     * @param languageModule {LanguageModule} The module this word belongs to.
     * @param wordData {Object} The word description including the split into syllables and graphemes, the number of letters, graphemes and syllables, the frequency of apparition.
    **/
    // Word.prototype.initFromData = function init (languageModule, wordData) {
        
    //     this._languageModule = languageModule;
    //     this._txtValue = wordData.WORD.toLowerCase();
    //     this._syllablesCount = parseInt(wordData.NBSYLL, 10);
    //     this._graphemesCount = parseInt(wordData.NBGRAPH, 10);
    //     this._lettersCount = parseInt(wordData.NBLET, 10);
    //     this._gpList = this._parseGPMatchData(wordData.GPMATCH);
    //     this._syllables = this._parseSyllables(wordData.PHONO);
    // };

    /**
     * Initialise this Word from Syllables
     *
     * @param languageModule {LanguageModule} The module this word belongs to.
     * @param syllables {Kalulu.GameLogic.Language.Syllable[]} The ordered list of syllables composing this word
    **/
    // Word.prototype.initFromSyllables = function initFromSyllables (languageModule, syllables) {
        
    //     this._languageModule = languageModule;
    //     this._syllables = syllables;
    //     this._txtValue = this._getStringFromSyllables(this._syllables);
    //     this._syllablesCount = this._syllables.length;
    //     this._gpList = this._getGPFromSyllables(this._syllables);
    //     this._graphemesCount = this._gpList.length;
    //     this._lettersCount = this._getLettersCountFromGP(this._gpList);
        
        
    //     return null;
    // };

    /**
     * Parse a syllables-descriptive string and returns an array of Syllables.
     * 
     * @param syllablesString {string} a string describing the syllables division with a dot split-identifier (ex. : a.na.o.ni)
     * @return {Syllable[]} the array of the syllables corresponding to the given string.
    **/
    // Word.prototype._parseSyllables = function _parseSyllables (syllablesString) {
            
    //     // PHONO : "na.o."
    //     if (!syllablesString) {
    //         throw new Error("[Word] You are trying to create a word but there is no associated phonologic data for syllables analysis. Please check your csv.");
    //     }

    //     var syllableStringsArray = syllablesString.split("."); // the array of syllableStrings
        
    //     // if the data has a trailing dot, the last element of the array is an undesired empty string. We remove it now.
    //     if (syllableStringsArray[syllableStringsArray.length - 1] === "") {
    //         syllableStringsArray.pop();
    //     }

    //     var syllableString = null;  // the string for one syllable
    //     var syllable = null;        // the syllable object
    //     var syllables = [];         // the array of syllable objects
    //     var done = 0;               // the count of letters that have been treated.
    //     var lSyllableGP = [];       // the array of GP composing the syllable

    //     // For each syllable in the array
    //     for (var s = 0 ; s < syllableStringsArray.length ; s++) {
    //         var lString = syllableStringsArray[s];
    //         // console.log(lString + " from " + this._txtValue + " being processed (" + lString.length + " letters out of " + this._lettersCount + " in the word)");
    //         lSyllableGP = [];

    //         // For each letter of the syllable
    //         for (var l = 0 ; l < lString.length ; l++) {
    //             lSyllableGP.push(this._gpList[done]);
    //             done ++;
    //             // console.log(done + " letters done out of " + this._lettersCount);
    //         }
    //         // console.log(lSyllableGP);
            
    //         syllables.push(this._languageModule.getSyllable(lString, lSyllableGP));
    //     }

    //     if (done !== this._lettersCount) {
    //         throw new Error('[Word] The syllables analysis failed (incorrect number of letters processed). Word : ' + this._txtValue);
    //     }

    //     // if some syllables are not yet present in the syllablesList we create it and add it.
    //     return syllables;
    // };


    // Word.prototype._getStringFromSyllables = function _getStringFromSyllables (syllables) {

    //     var string = "";
    //     for (var i = 0 ; i < syllables.length ; i++) {
    //         console.log(syllables);
    //         string += syllables[i].txtValue;
    //     }
    //     return string;
    // };
    
    // Word.prototype._getGPFromSyllables = function _getGPFromSyllables (syllables) {

    //     var gpList = [];
    //     for (var i = 0 ; i < syllables.length ; i++) {
    //         gpList = gpList.concat(syllables[i].gpList);
    //     }
    //     return gpList;
    // };

    // Word.prototype._getLettersCountFromGP = function _getLettersCountFromGP (gpList) {

    //     var count = 0;
    //     for (var i = 0 ; i < gpList.length ; i++) {
    //         count += gpList[i].lowerCase.length;
    //     }
    //     return count;
    // };
    
    return Word;
});