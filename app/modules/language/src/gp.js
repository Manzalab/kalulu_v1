define([], function () {

    'use strict';
    
    /// List of headers in the csv file :
    var h_lessonNumber              = "LESSON";
    var h_chapterNumber             = "CHAPTER";
    var h_lowerCase                 = "LOWER CASE TEXT";
    var h_phonemeSymbol             = "SOUND PHONEME SYMBOL";
    var h_phonemeName               = "SOUND NAME";
    var h_illustrativeWord          = "ILLUSTRATIVE WORD";
    var h_illustrativeWordEnglish   = "ILLUSTRATIVE WORD ENGLISH";
    var h_regularPhoneme            = "REGULAR PHONEME";
    var h_syllabicStructure         = "SYLLABIC STRUCTURE";
    var h_toTrace                   = "TO TRACE";

    //CV Type/Matrix Name Enum :
    var VOWEL = "vowel", CONSONANT = "consonant";

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    /**
     * The GP class represent a specific type of notion : the Grapheme/Phoneme Couple.
     *
     * @class
     * @extends Notion
     * @memberof Kalulu.GameLogic.Language
     * @param data {Object} the data from the pedagogic static file (in discipline_modules_data)
    **/
    function GP (data, languageModule) {

        if (!data.hasOwnProperty(h_lessonNumber) ||
            !data.hasOwnProperty(h_chapterNumber) ||
            !data.hasOwnProperty(h_lowerCase) ||
            !data.hasOwnProperty(h_phonemeSymbol) ||
            !data.hasOwnProperty(h_phonemeName) ||
            !data.hasOwnProperty(h_illustrativeWord) ||
            !data.hasOwnProperty(h_illustrativeWordEnglish) ||
            !data.hasOwnProperty(h_regularPhoneme) ||
            !data.hasOwnProperty(h_syllabicStructure) ||
            !data.hasOwnProperty(h_toTrace)) {
            console.error("You are trying to create a GraphemePhoneme Couple with inappropriate data :");
            console.log(data);
            return;
        }

        /**
         * Text value of the Grapheme in lower casing
         * @type {string}
         * @private
        **/
        this._lowerCase = data[h_lowerCase];

        /**
         * Text value of the Grapheme in lower casing
         * @type {string}
         * @private
        **/
        this._phonemeSymbol = data[h_phonemeSymbol];
        
        /**
         * Text value of the Grapheme in lower casing
         * @type {string}
         * @private
        **/
        this._phonemeName = data[h_phonemeName];
        
        /**
         * Text value of the Grapheme in lower casing
         * @type {string}
         * @private
        **/
        this._illustrativeWord = data[h_illustrativeWord];
        
        /**
         * Text value of the Grapheme in lower casing
         * @type {string}
         * @private
        **/
        this._illustrativeWordEnglish = data[h_illustrativeWordEnglish];
        
        /**
         * 
         * @type {number}
         * @private
        **/
        this._lessonNumber = parseInt(data[h_lessonNumber], 10);
        
        /**
         * Text value of the Grapheme in lower casing
         * @type {string}
         * @private
        **/
        this._chapterNumber = parseInt(data[h_chapterNumber], 10);
        
        /**
         * Text value of the Grapheme in lower casing
         * @type {string}
         * @private
        **/
        this._regularPhoneme = data[h_regularPhoneme];
        
        /**
         * Text value of the Grapheme in lower casing
         * @type {string}
         * @private
        **/
        this._syllabicStructure = data[h_syllabicStructure];

        this._toTrace = data[h_toTrace].toLowerCase() === "true";

        this._languageModule = languageModule;
    }

    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(GP.prototype, {
        
        /**
         * C if it is a consonant, V if it is a vowel.
         * @type {string}
         * @memberof Kalulu.GameLogic.Language.GP#
        **/
        cvType: {
            get: function () {
                return this._matrixName === VOWEL ? "V" : "C";
            }
        },

        /**
         * The GraphemePhoneme Id composed with the pattern [lower case grapheme - phoneme symbol], e.g. "a-a"
         * @type {string}
         * @memberof Kalulu.GameLogic.Language.GP#
        **/
        id: {
            get: function () {
                return this._lowerCase + "-" + this._phonemeSymbol;
            }
        },

        /**
         * le nom du GP (du type "a-a")(equivalent a id)
         * 
         * @type {string}
         * @memberof Kalulu.GameLogic.Language.GP#
        **/
        name: {
            get: function () {
                return this.id;
            }
        },

        /**
         * equivalent to lowerCase : lowerCase value of the Grapheme
         * 
         * @type {string}
         * @memberof Kalulu.GameLogic.Language.GP#
        **/
        value: {
            get: function () {
                return this._lowerCase;
            }
        },

        lesson : { get : function () { return this._lessonNumber; } },


        /**
         * lowerCase value of the Grapheme
         * 
         * @type {string}
         * @memberof Kalulu.GameLogic.Language.GP#
        **/
        lowerCase: {
            get: function () {
                return this._lowerCase;
            }
        },

        /**
         * lowerCase value of the Grapheme
         * 
         * @type {string}
         * @memberof Kalulu.GameLogic.Language.GP#
        **/
        upperCase: {
            get: function () {
                return this._lowerCase.toUpperCase();
            }
        },
        /**
         * true if this GP is the regular phoneme of the grapheme.
         * (For example the natural sound for letter 's' is 'sss', not 'zzz'.
         * s-s would have its regularPhoneme property to true, when s-z would have the property set to false.)
         * 
         * @type {boolean}
         * @memberof Kalulu.GameLogic.Language.GP#
        **/
        regularPhoneme : {
            get: function () {
                return this._regularPhoneme;
            }
        },

        soundPath : {
            get : function () { 
                var path = Config.soundsPath + 'language/phoneme_' + this._phonemeName;
                return path + ".ogg";
            }
        },
        
        illustrativeSoundPath : {
            get : function () {
                var path = Config.soundsPath + 'language/phoneme_illustration_' + this._illustrativeWordEnglish;
                return path + ".ogg";
            }
        },

        illustrationPath : {
            get : function () {
                return  Config.imagesPath + 'language/lookandlearn/' + this._illustrativeWordEnglish + '.jpg';
            }
        },

        isAvailable : {
            get : function () {
                return this._isAvailable;
            },
            set : function (value) {
                this._isAvailable = value;
                return this._isAvailable;
            }
        },

        syllabicStructure : { get : function () { return this._syllabicStructure; } },

        toTrace : { get : function () { return this._toTrace; } },
        
        video1 : { get : function () { return Config.videoPath + 'language/L' + this.lesson + '.mp4'; } },
        
        video2 : { get : function () { return Config.videoPath + 'language/S' + this.lesson + '.mp4'; } },

        traceUppercase : { get : function () { return this.value.length === 1 ? true : false; } },


    });


    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################



    return GP;
});