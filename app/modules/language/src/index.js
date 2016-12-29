(function () {
    'use strict';
    var _                = require ('underscore');

    var DisciplineModule = require ('game_logic/core/discipline_module');

    var Word             = require ('./word');
    var GP               = require ('./gp');
    var StimuliFactory   = require ('./stimuli_factory');
    
    var constants        = require ('../config/config');

    var staticData = {
        name              : KALULU_LANGUAGE,
        language          : KALULU_LANGUAGE.toLowerCase(),
        assessments       : require ('../assets/data/' + KALULU_LANGUAGE + '/assessments.csv'),
        filling           : require ('../assets/data/' + KALULU_LANGUAGE + '/filling.csv'),
        gp                : require ('../assets/data/' + KALULU_LANGUAGE + '/gp_list.csv'),
        lettersSimilarity : require ('../assets/data/' + KALULU_LANGUAGE + '/letters_similarity.csv'),
        plan              : require ('../assets/data/' + KALULU_LANGUAGE + '/plan.csv'),
        sentences         : require ('../assets/data/' + KALULU_LANGUAGE + '/sentences_list.csv'),
        sorting           : require ('../assets/data/' + KALULU_LANGUAGE + '/sorting.csv'),
        words             : require ('../assets/data/' + KALULU_LANGUAGE + '/words_list.csv')
    };

    // MINIGAME SETTINGS CSV HEADERS
    // var h_id                    = "ID";
    // var h_description           = "DESCRIPTION";
    // var h_roundsCount           = "ROUNDS COUNT";
    // var h_currentLessonShare    = "CURRENT LESSON SHARE IN TARGETS";
    // var h_roundTargetClass      = "ROUND TARGET CLASS";
    // var h_steptargetClass       = "STEP TARGET CLASS";
    // var h_stepsToPlay           = "STEPS TO PLAY";
    // var h_stepTargetCount       = "STEP TARGET STIMULI COUNT";
    // var h_stepDistractorCount   = "STEP DISTRACTOR STIMULI COUNT";
    // var h_stepRequiredCrCount   = "STEP REQUIRED CR COUNT";

    //SKILLS
    var graphemeReco = 'graphemeRecognition';
    var vowelsReco = 'vowelsRecognition';
    var consonantsReco = 'consonantsRecognition';
    var leftToRightReading = 'leftToRightReading';

    /**
     * The LanguageModule class is a specialisation of the DisciplineModule Class allowing to manage Language Specific Data such as graphemes, syllables, words...
     * It is used to provide initialisation data to language minigames.
     * @class
     * @extends DisciplineModule
     * @memberof Rafiki.Pedagogy.Language
    **/
    function LanguageModule (rafiki, userProfile) {
        
        // console.log(rafiki);
        // console.log(staticData);
        // console.log(userProfile);


        this.type = "Language";

        /**
         * The list of all Grapheme/Phoneme couples of the language
         * @type {object.<string, GP>}
         * @private
        **/
        this._gpList = this._initGPList(staticData.gp, staticData.lettersSimilarity);
        
        /**
         * The list of all Grapheme/Phoneme couples of the language sorted by Lesson
         * @type {object.<string, object.<string, GP>>}
         * @private
        **/
        this._gpListByLesson = this._initGpListByLesson(this._gpList);
        
        /**
         * The list of all words included in the module (true words and invented words)
         * @type {object.<string, Word>}
         * @private
        **/
        this._wordsList = this._initWordsList(staticData.words);

        
        // must be done here because the gp lists are required for plan initialisation in DisciplineModule constructor
        DisciplineModule.call(this, rafiki, staticData, userProfile);




        /**
         * The list of Syllables for Syllable Games, i.e. all words complying to :
         * - syllableCount : 1
         * - syllabicStructure : CV. || VC. || V.
         * - Quality -> both real word and non-word are valid
         * The list is sorted by lesson, and by word id
         * @type {object.<string, object.<string, Word>>}
         * @private
        **/
        this._syllablesGamesStimuli = this._initSyllablesGamesStimuli(this._wordsList);

        /**
         * The list of Words for Word Games, i.e. all words complying to :
         * - isWord : true
         * @type {object.<string, object.<string, Word>>}
         * @private
        **/
        this._wordsGamesStimuli = this._initWordGamesStimuli(this._wordsList);

        if (!this._userProfile.Language) {
            this._initUserData();
            console.log(this._userProfile);
        }

        this._sortingGamesListByChapter = this._initSortingGamesList();

        this._assessmentSentences = this._initAssessmentSentences();

        this._matrix = this._initLettersSimilarityMatrix(staticData.lettersSimilarity);

        if (Config.enableGlobalVars) window.kalulu.languageModule = this;
    }


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    LanguageModule.prototype = Object.create(DisciplineModule.prototype);
    LanguageModule.prototype.constructor = LanguageModule;



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    // Object.defineProperties(LanguageModule.prototype, {});

    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

        // GETTERS
        // #######
    LanguageModule.prototype.getNotionsById = function getNotionsById (arrayOfIds) {

        var notionsArray = [];
        var notion, id, i;
        for (i = 0 ; i < arrayOfIds.length ; i++) {
            id = arrayOfIds[i];
            notion = this._gpList[id];
            if (!notion) notion = this._wordsList[id];
            if (!notion) console.warn("Notion " + id + " has not been found");
            else {
                notionsArray.push(notion);
            }
        }
        return notionsArray;
    };

    LanguageModule.prototype.getWordbyId = function getWordbyId (id) {
        if (!this._wordsList.hasOwnProperty(id)) {
            console.warn("The word requested does not exist :" + id);
            return null;
        }
        return this._wordsList[id];
    };


    /**
     * Returns a Grapheme/Phoneme Entity object (GP) from the GP List. Will throw an error if not found.
     * 
     * @param gpString {string} The string identifying the grapheme/phoneme couple (a-a like)
     * @return {Kalulu.Remediation.Pedagogy.Language.GP}
    **/
    LanguageModule.prototype.getGPbyId = function getGPbyId (gpString) {
        if (!this._gpList.hasOwnProperty(gpString)) {
            throw new Error ("The Grapheme/Phoneme Couple requested does not exist :" + gpString);
        }
        return this._gpList[gpString];
    };

        // UI UTILS
        // ########
    /**
     * @param chapterNumber {number} a chapter number
     * @return {Chapter} the list of lessons and the assessment for this chapter
    **/
    LanguageModule.prototype.getDataForChapter = function getDataForChapter (chapterNumber) {
        if (isNaN(chapterNumber)) throw new Error("chapterNumber must be a number");
        return this._plan.children[chapterNumber - 1];
    };

    /**
     * @param {number} the lesson Number
     * @return {GP[]}
    **/
    LanguageModule.prototype.getNotionsForLesson = function getNotionsForLesson (lessonNumber) {
        return _.values(this._gpListByLesson[lessonNumber]);
    };

    LanguageModule.prototype.getNotionIdsForLesson = function getNotionIdsForLesson (lessonNumber) {
        return Object.keys(this._gpListByLesson[lessonNumber]);
    };

    /**
     * @param chapterNumber {number} a chapter number
     * @return {Lesson[]} the list of lessons and the assessment for this chapter
    **/    
    LanguageModule.prototype.getLessonsForChapter = function getLessonsForChapter (chapterNumber) {
        var lLessons = [];
        for (var i = 0 ; i < this._plan.lessons.length ; i++) {
            //console.log(this._plan.lessons[i]);
            if (this._plan.lessons[i].chapterNumber === chapterNumber) {
                lLessons.push(this._plan.lessons[i]);
            }
        }
        return lLessons;
    };

        // INTERFACE MINIGAMES
        // ###################
    /**
     * @param progressionNode {ProgressionNode} the activity node we want a setup for
     * @return the setup object needed by the Minigame
    **/
    LanguageModule.prototype.getPedagogicData = function getPedagogicData (progressionNode, params) {

        this._currentActivityParams = params;

        if (progressionNode.activityType === "lookandlearn") {
            return this.getPedagogicDataForLecture(progressionNode);
        }
        else if (progressionNode.activityType === "assessment") {
            return this.getPedagogicDataForAssessment(progressionNode, params);
        }
        else {
            return this.getPedagogicDataForExercise(progressionNode, params);
        }
    };

    /**
     * @param progressionNode {ProgressionNode} the Progression Node corresponding to the Lecture
     * @return {object.<string, string>} the setup for the Lecture corresponding to the study of 1 Grapheme-Phoneme
    **/
    LanguageModule.prototype.getPedagogicDataForLecture = function getPedagogicDataForLecture (progressionNode) {

        var pedagogicData, selectedNotion;
        for (var i = 0; i < progressionNode.targetNotions.length; i++) {
            if (progressionNode.targetNotions[i].toTrace) selectedNotion = progressionNode.targetNotions[i];
        }

        if (!selectedNotion) {
            console.error("[LanguageModule] Impossible to provide data to look and learn module for this Lesson : No GP to be traced.");
            return;
        }
        console.log(selectedNotion);
        pedagogicData = {
            video1            : selectedNotion.video1,
            video2            : selectedNotion.video2,
            sound             : selectedNotion.soundPath,
            illustrativeSound : selectedNotion.illustrativeSoundPath,
            image             : selectedNotion.illustrationPath,
            value             : selectedNotion.value,
            textValue         : selectedNotion.value,
            traceUppercase    : selectedNotion.traceUppercase
        };
        
        console.log(pedagogicData);
        return {
            discipline : 'language',
            language   : KALULU_LANGUAGE, // can be : english, french, swahili
            data       : {
                traceUppercase : pedagogicData.traceUppercase,
                notions : [pedagogicData]
            }
        };
    };

    /**
     * This function is called by the minigames manager when a minigame calls getSetup().
     * It should provide a setup freshly updated with the latest player data available.
    **/
    LanguageModule.prototype.getPedagogicDataForExercise = function getPedagogicDataForExercise (progressionNode, params) {
        
        var gameType = params.gameType;

        switch (gameType) {
            
            case 'identification':
                if (params.roundTargetClass === "Syllable") {
                    return this._populateIdentificationSetupWithSyllables(progressionNode, params);
                }
                else {
                    throw new Error("identification games are not yet implemented for other stimuli than syllables.");
                }
            break;

            case 'composition':
                if (params.roundTargetClass === "Word" && params.stepTargetClass === "GP") {
                    return this._populateCompositionSetupWithWords(progressionNode, params);
                }
                else {
                    throw new Error("composition games are not yet implemented for other stimuli than words.");
                }
            break;

            case 'pairing':
                if (params.roundTargetClass === "GP") {
                    return this._populatePairingSetupWithGP(progressionNode, params);
                }
                else {
                    throw new Error("pairing games are not yet implemented for other stimuli than GP.");
                }
            break;

            case 'filling':
                return this._populateGapFillGame(progressionNode, params);

            default:
                console.warn("[LanguageModule] Game type <" + gameType + "> has not been recognised.");
            break;
        }
    };

    LanguageModule.prototype.getPedagogicDataForAssessment = function getPedagogicDataForAssessment (progressionNode) {
        var constants = constants.assessments;
        var setup = {
            categories : ['WORD', 'NO WORD'],
            timer : constants.timer,
            minimumWordsSorted : constants.minimumWordsSorted,
            minimumCorrectSortRatio : constants.minimumCorrectSortRatio,
            stimuli: this._sortingGamesListByChapter[progressionNode.chapterNumber]
        };

        return setup;
    };

    LanguageModule.prototype.getStimuliToRevise = function getStimuliToRevise (listByLesson, count, currentLessonNumber) {
        
        var selectedStimuli = [];
        var allStimuliToBeRevised = this._selectNotionsForRevision(listByLesson, currentLessonNumber); // from previous lessons

        // SELECTION OF REVISION TARGETS
        var randomIndex;

        for (var j = 0 ; j < count ; j++) {
            
            if (allStimuliToBeRevised.length === 0) break;
            randomIndex = Math.floor(Math.random() * allStimuliToBeRevised.length);
            selectedStimuli.push(allStimuliToBeRevised.splice(randomIndex, 1));
        }

        count = selectedStimuli.length;
        console.log(count + " stimuli found for Revision");
        return selectedStimuli;
    };

    LanguageModule.prototype.getStimuliForLesson = function getStimuliForLesson (listByLesson, count, currentLessonNumber) {
        
        var selectedStimuli = [];
        var allStimuliToBeLearned = _.toArray(listByLesson[currentLessonNumber]); // from previous lessons

        if (!allStimuliToBeLearned.hasOwnProperty(currentLessonNumber)) {
            console.log(allStimuliToBeLearned);
            throw new Error("No Words available for this lesson (" + currentLessonNumber + ")");
        }

        for (var k = 0 ; k < count ; k++) {

            randomIndex = Math.floor(Math.random() * allStimuliToBeLearned.length);
            selectedStimuli.push(allStimuliToBeLearned[randomIndex]);
        }

        count = selectedStimuli.length;
        console.log(count + " stimuli found for Current Lesson");
        return selectedStimuli;
    };

    LanguageModule.prototype.processResults = function processResults (currentProgressionNode, minigameRecord) { // TODO : move in a save module
        console.log(currentProgressionNode);
        console.log(this._currentActivityParams);
        // var lSettings = this.getSettings(currentProgressionNode.activityType);
        // console.log(lSettings);

        if (this._currentActivityParams.gameType === "identification") {
            this._processIdentificationResults(currentProgressionNode, minigameRecord);
        }
        else if (this._currentActivityParams.gameType === "composition") {
            this._processCompositionResults(currentProgressionNode, minigameRecord);
        }
        else if (this._currentActivityParams.gameType === "pairing") {
            if (minigameRecord.hasWon) currentProgressionNode.isCompleted = true;
        }
    };


    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################
    

    LanguageModule.prototype._initUserData = function _initUserData () {
        
        if (this._userProfile.Language) return;

        var data = {
            plan   : this._plan.createSave(),
            gp     : {},
            words  : {},
            minigamesRecords : {
                ants : {
                    localLevel  : 1,
                    globalLevel : 1,
                    records :[]
                },
                caterpillar : {
                    localLevel  : 1,
                    globalLevel : 1,
                    records :[]
                },
                crabs : {
                    localLevel  : 1,
                    globalLevel : 1,
                    records :[]
                },
                frog : {
                    localLevel  : 1,
                    globalLevel : 1,
                    records :[]
                },
                jellyfish : {
                    localLevel  : 1,
                    globalLevel : 1,
                    records :[]
                },
                lookandlearn : {
                    localLevel  : 1,
                    globalLevel : 1,
                    records :[]
                },
                monkeys : {
                    localLevel  : 1,
                    globalLevel : 1,
                    records :[]
                },
                parakeets : {
                    localLevel  : 1,
                    globalLevel : 1,
                    records :[]
                },
                turtles : {
                    localLevel  : 1,
                    globalLevel : 1,
                    records :[]
                }
            }
        };
        this._userProfile.Language = data;

        this.unlockPlan();
    };


    /**
     * Transforms the static csv data into GP objects
     * @private
     * @param gpArray {object[]} the list loaded from static CSV file
     * @return {object.<string, GP>} an associative array of GP listed by Id
    **/
    LanguageModule.prototype._initLettersSimilarityMatrix = function _initLettersSimilarityMatrix (lettersSimilarityMatrix) {
        // console.log(lettersSimilarityMatrix);
        if(!lettersSimilarityMatrix) throw new Error("Issue with the loading of the Letters Similarity Matrix");
        var lMatrix = {};
        for (var i = 0 ; i < lettersSimilarityMatrix.length ; i++) {
            var line = lettersSimilarityMatrix[i];
            lMatrix[line.GRAPHEME] = line;
            delete lMatrix[line.GRAPHEME].GRAPHEME;
        }
        for (var element in lMatrix) {
            if (!lMatrix.hasOwnProperty(element)) continue;
            var lVector = lMatrix[element];
            for (var element2 in lVector) {
                if (!lVector.hasOwnProperty(element2)) continue;
                // console.log("before parseFloat : " + lVector[element2]);
                lVector[element2] = parseFloat(lVector[element2], 10);
                // console.log("after parseFloat : " + lVector[element2]);
            }
        }
        if (Config.enableGlobalVars) window.kalulu.lettersSimilarityMatrix = lMatrix;
        return lMatrix;
    };

    /**
     * Transforms the static csv data into GP objects
     * @private
     * @param gpArray {object[]} the list loaded from static CSV file
     * @return {object.<string, GP>} an associative array of GP listed by Id
    **/
    LanguageModule.prototype._initGPList = function _initGPList (gpArray, lettersSimilarityMatrix) {
        var gpList = {};

        for (var i = 0 ; i < gpArray.length ; i++) {
            var lGP = new GP(gpArray[i], this);
            gpList[lGP.id] = lGP;
        }
        if (Config.enableGlobalVars) window.kalulu.languageGpList = gpList;
        return gpList;
    };

    /**
     * Transforms the static csv data into word objects
     * @private
     * @param wordsArray {object[]} the list loaded from static CSV file
     * @return {object.<string, Word>} an associative array of Words listed by Id
    **/
    LanguageModule.prototype._initWordsList = function _initWordsList (wordsArray) {
        var wordList = {};
        var lDistractorSyllable;

        for (var i = 0 ; i < wordsArray.length ; i++) {
            lDistractorSyllable = new Word(wordsArray[i], this);
            wordList[lDistractorSyllable.id] = lDistractorSyllable;
        }
        if (Config.enableGlobalVars) window.kalulu.languageWordList = wordList;

        return wordList;
    };

    /**
     * Parse the complete list of stimuli and select the ones that are compliant to Syllable Games Stimuli
     * @param wordList {object.<string, Word>}
     * @return {object.<string, object.<string, Word>>} a list of syllables sorted by Lesson.
    **/
    LanguageModule.prototype._initSyllablesGamesStimuli = function _initSyllablesGamesStimuli (wordList) {
        var syllablesList = {};
        var lDistractorSyllable;
        var lessonNumber;
        
        for (var wordId in wordList) {
            if (!wordList.hasOwnProperty(wordId)) continue;

            lDistractorSyllable = wordList[wordId];
            //console.log('processing <' + lDistractorSyllable.gpMatch + '>');
            if (lDistractorSyllable.syllableCount === 1 && (
                lDistractorSyllable.syllabicStructure === "CV" || 
                lDistractorSyllable.syllabicStructure === "VC" || 
                lDistractorSyllable.syllabicStructure === "V" ))
            {
                // console.log('match');
                // console.log(lDistractorSyllable);
                lessonNumber = 0;
                for (var i = 0 ; i < lDistractorSyllable.graphemeCount ; i++) {
                    lessonNumber = Math.max(lessonNumber, lDistractorSyllable.gpList[i].lesson);
                }
                if (!syllablesList[lessonNumber]) syllablesList[lessonNumber] = {};
                syllablesList[lessonNumber][lDistractorSyllable.id] = lDistractorSyllable;
            }
        }
        
        var lessonCount = this._plan.lessonCount;
        // for (var lessonIndex = 1; lessonIndex < lessonCount; lessonIndex++) {
        //     if (!syllablesList.hasOwnProperty(lessonIndex)) console.info('[LanguageModule] No Syllable available for lesson ' + lessonIndex);
        // }

        if (Config.enableGlobalVars) window.kalulu.syllableGamesShortList = syllablesList;
        return syllablesList;
    };

    /**
     * Parse the complete list of stimuli and select the ones that are compliant to Words Games Stimuli
     * @param wordList {object.<string, Word>}
     * @return {object.<string, object.<string, Word>>} a list of syllables sorted by Lesson.
    **/
    LanguageModule.prototype._initWordGamesStimuli = function _initWordGamesStimuli (wordList) {
        var wordsList = {};
        var lDistractorSyllable;

        for (var wordId in wordList) {
            if (!wordList.hasOwnProperty(wordId)) continue;

            lDistractorSyllable = wordList[wordId];
            
            if (lDistractorSyllable.isWord) {
                
                if (!wordsList[lDistractorSyllable.lesson]) wordsList[lDistractorSyllable.lesson] = {};
                wordsList[lDistractorSyllable.lesson][lDistractorSyllable.id] = lDistractorSyllable;
            }
        }
        
        if (Config.enableGlobalVars) window.kalulu.wordGamesShortList = wordsList;
        return wordsList;
    };

    LanguageModule.prototype._initGpListByLesson = function _initGpListByLesson (gpList) {
        var lGpList = {};
        var lGP;

        for (var gpId in gpList) {
            if (!gpList.hasOwnProperty(gpId)) continue;

            lGP = gpList[gpId];

            if (!lGpList[lGP.lesson]) lGpList[lGP.lesson] = {};
            lGpList[lGP.lesson][lGP.id] = lGP;
        }
        
        if (Config.enableGlobalVars) window.kalulu.wordGamesGPList = lGpList;
        return lGpList;
    };

    LanguageModule.prototype._initSortingGamesList = function _initSortingGamesList () {
        var data = staticData.sorting;
        var listByChapter = {};

        for (var i = 0 ; i < data.length ; i++) {
            var lItem = data[i];

            if (!listByChapter.hasOwnProperty(lItem.CHAPTER)) listByChapter[lItem.CHAPTER] = [];

            listByChapter[lItem.CHAPTER].push({
                "id" : lItem.WORD,
                "value" : lItem.WORD,
                "category" : "WORD"
            });
            listByChapter[lItem.CHAPTER].push({
                "id" : lItem.PSEUDO_WORD,
                "value" : lItem.PSEUDO_WORD,
                "category" : "NO WORD"
            });
        }
        return listByChapter;
    };

    LanguageModule.prototype._initAssessmentSentences = function _initAssessmentSentences () {

        // code
    };

    /**
     * Select the notions from previous lessons with a score < treshold defined in config.
     * 
    **/
    LanguageModule.prototype._selectNotionsForRevision = function _selectNotionsForRevision (notionsListByLesson, lessonNumber) { 
        console.log(notionsListByLesson);
        var selectionArray = [];
        
        for (var lessonIndex = 1 ; lessonIndex < lessonNumber ; lessonIndex++) {
            

            if (!notionsListByLesson.hasOwnProperty(lessonIndex)) continue;
            
            var lNotion = notionsListByLesson[lessonIndex];
            
            for (var wordId in lNotion) {
                if (!lNotion.hasOwnProperty(wordId)) continue;
                
                var stimulus = lNotion[wordId];
                if (stimulus.userScore < Config.pedagogy.revisionTreshold) {
                    
                    selectionArray.push(stimulus);
                }
            }
        }

        return selectionArray;
    };

    /**
     * Select the notions from the previous lessons with a score > treshold defined in config, and all the notions from the current lesson
     * 
    **/
    LanguageModule.prototype._selectNotionsForDistraction = function _selectNotionsForDistraction (notionsList, lessonNumber, includeCurrentLesson) {

        console.log(notionsList);
        console.log(lessonNumber);
        var selectionArray = [];
        var lessonStimuli;
        var stimuliId;
        var stimulus;
        includeCurrentLesson = (typeof includeCurrentLesson !== 'undefined') ? includeCurrentLesson : true;

        // PREVIOUS LESSONS ==> SCORE HAS TO BE > TRESHOLD (NO DISTRACTION WITH UNMASTERED STIMULI)
        for (var lessonIndex = 1 ; lessonIndex < lessonNumber ; lessonIndex++) {
            
            if (!notionsList.hasOwnProperty(lessonIndex)) continue;
            
            lessonStimuli = notionsList[lessonIndex];
            
            for (stimuliId in lessonStimuli) {
                if (!lessonStimuli.hasOwnProperty(stimuliId)) continue;
                
                stimulus = lessonStimuli[stimuliId];
                if (this._getNotionRecord(stimulus) > Config.pedagogy.revisionTreshold) {
                    
                    selectionArray.push(stimulus);
                }
            }
        }

        // CURRENT LESSON ==> TAKE All
        if (includeCurrentLesson) {
            lessonStimuli = notionsList[lessonNumber];
            console.log(lessonStimuli);
            for (stimuliId in lessonStimuli) {
                if (!lessonStimuli.hasOwnProperty(stimuliId)) continue;
                selectionArray.push(lessonStimuli[stimuliId]);
            }
        }

        return selectionArray;
    };

    /**
     * Select <count> random elements from <sourceArray> and reference or copy them into <targetArray>.
     * If refill is true, the sourceArray will be taken again when emptied.
    **/
    LanguageModule.prototype._selectRandomElements = function _selectRandomElements (count, sourceArray, targetArray, refill, stimulusCopy) {
        
        if (!sourceArray || sourceArray.length === 0) return null; 
        stimulusCopy = stimulusCopy || false;
        
        var sourceCopy = sourceArray.slice();
        var randomIndex;
        var toPush;
        for (var i = 0 ; i < count ; i++) {
            
            randomIndex = Math.floor(Math.random() * sourceCopy.length);
            if (stimulusCopy) {
                toPush = StimuliFactory.copy(sourceCopy.splice(randomIndex, 1)[0]);
            }
            else {
                toPush = sourceCopy.splice(randomIndex, 1)[0];
            }
            targetArray.push(toPush);
            if (sourceCopy.length === 0) {
                if (refill) sourceCopy = sourceArray.slice();
                else return;
            }
        }
    };

    /**
     * Select N targets in the stimuliPool and returns it in an array
     * @param params {object.<string, string>} the parameters of the minigame, including in particular
     *      - the number of rounds (and thus targets) 
     *      - the share of previous lessons vs. current lesson targets (e.g. 20% of targets to revise previous lessons and 80% to learn new lesson)
     * @param lessonNumber {number}
     * @param stimuliPool {(Word[] | GP[])} the list of stimuli to take from
     * @return {(Word[] | GP[])}
    **/
    LanguageModule.prototype._selectTargets = function _selectTargets (params, lessonNumber, stimuliPool) {
        if (!stimuliPool.hasOwnProperty(lessonNumber)) {
            throw new Error("No Syllables available for this lesson (n° " + lessonNumber + ")");
        }

        var lRoundsCount = params.roundsCount;

        // SELECTION OF TARGETS FOR REVISION OF PREVIOUS LESSONS
        var previousLessonsAvailableStimuli = this._selectNotionsForRevision(stimuliPool, lessonNumber);
        var revisionTargetsCount = Math.floor(lRoundsCount * (1 - params.currentLessonShareInTargets));
        var revisionTargets = []; 
        this._selectRandomElements(revisionTargetsCount, previousLessonsAvailableStimuli, revisionTargets, false);
        revisionTargetsCount = revisionTargets.length;
        console.log("Revision Targets :");
        console.log(revisionTargets);

        // SELECTION OF TARGETS FOR LEARNING OF CURRENT LESSON
        var currentLessonAvailableStimuli = _.toArray(stimuliPool[lessonNumber]); // from the current lesson
        var currentLessonTargetsCount = lRoundsCount - revisionTargetsCount;
        var currentLessonTargets = [];
        this._selectRandomElements(currentLessonTargetsCount, currentLessonAvailableStimuli, currentLessonTargets, true);
        console.log("Current Lesson Targets :");
        console.log(currentLessonTargets);

        // MERGE AND SHUFFLE
        var totalTargets = currentLessonTargets.concat(revisionTargets);
        totalTargets = _.shuffle(totalTargets);
        console.log("Proposed Targets for Minigame :");
        console.log(totalTargets);
        return totalTargets;
    };

    // CRABS CATCHER, JELLYFISHES
    LanguageModule.prototype._populateIdentificationSetupWithSyllables = function _populateIdentificationSetupWithSyllables (progressionNode, params) {
        
        var stimuliPool = this._syllablesGamesStimuli; // Note : this is one of the words sublists. It has to be words, not GP. To make dynamic = f(minigameSetup)
        var lessonNumber = progressionNode.parent.lessonNumber;
        var lRoundsCount = params.roundsCount;

        var totalTargets = this._selectTargets(params, lessonNumber, stimuliPool);
        
        var lSetup = { 
            discipline : 'language',
            data : {
                rounds : []
            }
        };

        // CONSTRUCTION OF SETUP OBJECT
        rounds :
        for (var r = 0 ; r < lRoundsCount ; r++) {
            
            var lRound = {
                stepRequiredCrCount : params.stepRequiredCrCount || 1, // amount of correct responses to validate the step (or round if 1 step only)
                steps : [
                    {
                        stimuli : []
                    }
                ]
            };

            var lTarget = totalTargets.pop();

            var isCapitalLetters = Math.random() > constants.lowerCaseTargetsShare;
            var skills = [graphemeReco];
            if (lTarget.syllabicStructure.indexOf("C") !== -1) skills.push(consonantsReco);
            if (lTarget.syllabicStructure.indexOf("V") !== -1) skills.push(vowelsReco);
            if (lTarget.lettersCount > 1) skills.push(leftToRightReading);
            var targetStimulus = StimuliFactory.fromWord(lTarget, skills, isCapitalLetters, true);
            lRound.steps[0].stimuli.push(targetStimulus);


            // SELECTION OF CANDIDATE SYLLABLES FOR DISTRACTION
            var availableSyllablesForDistraction = this._selectNotionsForDistraction(stimuliPool, lessonNumber); // from previous lessons
            console.log("Available Syllables For Distraction (before filtering) :");
            console.log(availableSyllablesForDistraction);

            var distractorsStimuli = {
                leftToRightReading   : [],
                vowelChange         : [],
                consonantChange     : []
            };

            for (var i = 0 ; i < availableSyllablesForDistraction.length ; i++) {
                
                var lDistractorSyllable = availableSyllablesForDistraction[i];
                
                if (lDistractorSyllable === lTarget || lDistractorSyllable.graphemeCount !== lTarget.graphemeCount) continue;

                var distractorGpList = lDistractorSyllable.gpList;
                var targetGpList = lTarget.gpList;
                
                if (lDistractorSyllable.syllabicStructure === lTarget.syllabicStructure) { // 1 GP (pure vowel) or 2 GP (mixed)
                    
                    var distractorGrapheme;
                    var targetGrapheme;
                    var similarityScore;
                    
                    if (distractorGpList[0] === targetGpList[0]) {
                        
                        distractorGrapheme = distractorGpList[1].lowerCase;
                        targetGrapheme = targetGpList[1].lowerCase;
                        similarityScore = this._matrix[targetGrapheme][distractorGrapheme];
                        if (similarityScore === 0) continue; // the two graphemes are identical
                        
                        skills = [];

                        if (distractorGpList[1].syllabicStructure.indexOf("C") !== -1) {
                            skills.push(consonantsReco);
                            distractorsStimuli.consonantChange.push(StimuliFactory.fromWord(lDistractorSyllable, skills, isCapitalLetters, false));
                        }
                        if (distractorGpList[1].syllabicStructure.indexOf("V") !== -1) {
                            skills.push(vowelsReco);
                            distractorsStimuli.vowelChange.push(StimuliFactory.fromWord(lDistractorSyllable, skills, isCapitalLetters, false));
                        }
                    }
                    else if (distractorGpList[1] === targetGpList[1]) {

                        console.log(distractorGpList);
                        distractorGrapheme = distractorGpList[0].lowerCase;
                        targetGrapheme = targetGpList[0].lowerCase;
                        similarityScore = this._matrix[targetGrapheme][distractorGrapheme];
                        if (similarityScore === 0) continue; // the two graphemes are identical

                        skills = [graphemeReco];
                        if (distractorGpList[0].syllabicStructure.indexOf("C") !== -1) {
                            skills.push(consonantsReco);
                            distractorsStimuli.consonantChange.push(StimuliFactory.fromWord(lDistractorSyllable, skills, isCapitalLetters, false));
                        }
                        if (distractorGpList[0].syllabicStructure.indexOf("V") !== -1) {
                            skills.push(vowelsReco);
                            distractorsStimuli.vowelChange.push(StimuliFactory.fromWord(lDistractorSyllable, skills, isCapitalLetters, false));
                        }

                    }
                }
            }
            if (lTarget.graphemeCount === 2) {

                // if (distractorGpList[0] === targetGpList[1] && distractorGpList[1] === targetGpList[0]) {
                //     distractorsStimuli.leftToRightReading = [StimuliFactory.fromWord(lDistractorSyllable, [graphemeReco, leftToRightReading], isCapitalLetters, false)];
                // }
                // else continue;
                //@TODO pourquoi c'est commenté ici ?
            }

            console.log("Candidate Syllables For Distraction After Filtering :");
            console.log(distractorsStimuli);
            

            /// SELECT RANDOM ELEMENTS AMONGST VALID DISTRACTORS
            var selectedDistractorsStimuli = [];
            var lDistractorsCount = params.stepDistracterCount;
            var leftToRightCount = Math.ceil(0.2 * lDistractorsCount);
            var consonantChangeCount = Math.floor(0.4 * lDistractorsCount);
            var vowelChangeCount = lDistractorsCount - leftToRightCount - consonantChangeCount;

            if (distractorsStimuli.leftToRightReading.length === 0 && lTarget.graphemeCount === 2) {
                distractorsStimuli.leftToRightReading = [StimuliFactory.getInversedSyllable (lTarget, ["leftToRightReading"], isCapitalLetters, false)];
                console.log(distractorsStimuli.leftToRightReading);
            }
            else (console.log(distractorsStimuli.leftToRightReading));
            console.log("about to select " + leftToRightCount + " inversed Syllables");
            this._selectRandomElements(leftToRightCount, distractorsStimuli.leftToRightReading, selectedDistractorsStimuli, false, true);
            
            if (distractorsStimuli.consonantChange.length < consonantChangeCount && lTarget.graphemeCount === 2) distractorsStimuli.consonantChange.push({
                value               : "",
                gpMatch             : "",
                graphemeCount       : 0,
                soundPath           : "",
                correctResponse     : false,
                skills              : ['graphemeRecognition']
            });

            console.log("about to select " + consonantChangeCount + " consonantChange");
            this._selectRandomElements(consonantChangeCount, distractorsStimuli.consonantChange, selectedDistractorsStimuli, false, true);
            
            if (distractorsStimuli.vowelChange.length < vowelChangeCount) distractorsStimuli.vowelChange.push({
                value               : "",
                gpMatch             : "",
                graphemeCount       : 0,
                soundPath           : "",
                correctResponse     : false,
                skills              : ['graphemeRecognition']
            });

            console.log("about to select " + vowelChangeCount + " vowel Change");
            this._selectRandomElements(vowelChangeCount, distractorsStimuli.vowelChange, selectedDistractorsStimuli, false, true);

            console.log(selectedDistractorsStimuli);
            lRound.steps[0].stimuli = lRound.steps[0].stimuli.concat(selectedDistractorsStimuli);

            lSetup.data.rounds.push(lRound);
        }

        this._currentExerciseSetup = lSetup;
        console.log(this._currentExerciseSetup);
        return this._currentExerciseSetup;
    };

    // COCOLLISION, CATERPILLAR, FROGGER, POINTSMAN
    LanguageModule.prototype._populateCompositionSetupWithWords = function _populateCompositionSetupWithWords (progressionNode, params) {
        
        console.log(progressionNode);

        var stimuliPool = this._wordsGamesStimuli;
        var lessonNumber = progressionNode.parent.lessonNumber;
        var roundsCount = params.roundsCount;
        
        var lSetup = { rounds : [] };

        var totalTargets = this._selectTargets(params, lessonNumber, stimuliPool);

        // CONSTRUCTION OF SETUP OBJECT
        rounds:
        for (var r = 0 ; r < roundsCount ; r++) {
            
            var lRound = {
                stepRequiredCrCount : params.stepRequiredCrCount || 1, // amount of correct responses to validate the step (or round if 1 step only)
                stimuli : []
            };

            var lTarget = totalTargets.pop();
            console.log(lTarget);
            var skills = [];

            if (lTarget.lettersCount > 1) skills.push(leftToRightReading);
            lRound.word = StimuliFactory.fromWord(lTarget, skills, false, true);
            lRound.soundPath = lRound.word.soundPath; // deprecated
            lRound.steps = [];

            steps:
            for (var s = 0 ; s < lTarget.graphemeCount ; s++) {
                var lStep = {
                    stimuli : []
                };
                var lTargetGrapheme = lTarget.gpList[s];
                lStep.stimuli.push(StimuliFactory.fromGP(lTargetGrapheme, skills, false, true));
                console.log(lStep.stimuli[0]);

                // SELECTION of candidate GP for distraction
                var availableGPs = this._selectNotionsForDistraction(this._gpListByLesson, lessonNumber);
                console.log("Available GP For Distraction (before filtering) :");
                console.log(availableGPs);

                var distractorsStimuli = [];

                for (var i = 0 ; i < availableGPs.length ; i++) {
                    
                    var lGP = availableGPs[i];
                    if (lGP === lTargetGrapheme || lGP.syllabicStructure !== lTargetGrapheme.syllabicStructure) continue;
                    distractorsStimuli.push(StimuliFactory.fromGP(lGP, skills, false, false));
                }

                console.log("Available GP For Distraction (after filtering) :");
                console.log(distractorsStimuli);

                if (distractorsStimuli.length === 0) distractorsStimuli = [{
                    value               : "",
                    gpMatch             : "",
                    graphemeCount       : 0,
                    soundPath           : "",
                    correctResponse     : false,
                    skills              : []
                }];

                var selectedDistractorsStimuli = [];
                this._selectRandomElements(params.stepDistracterCount, distractorsStimuli, selectedDistractorsStimuli, true, true);

                console.log("Selected GP For Distraction :");
                console.log(selectedDistractorsStimuli);

                lStep.stimuli = lStep.stimuli.concat(selectedDistractorsStimuli);
                lRound.steps.push(lStep);
            }
            lRound.step = lRound.steps; // for the deprecated use of "step" in minigames
            lSetup.rounds.push(lRound);
        }

        lSetup.round = lSetup.rounds; // for the deprecated use of "round" in minigames
        this._currentExerciseSetup = lSetup;
        console.log(lSetup);
        return this._currentExerciseSetup;
    };

    // MEMORY
    LanguageModule.prototype._populatePairingSetupWithGP = function _populatePairingSetupWithGP (progressionNode, params) {
        // console.log(params);
        // console.log(progressionNode);

        var lessonNumber = progressionNode.parent.lessonNumber;
        var nbStimuliToProvide = params.roundsCount; // counter intuitive but we use the roundsCount for the nb of Pairs for this type of game, which has always one round.
        var lGameInitData = {
            rounds : [{
                stimuli : []
            }]
        };

        var firstChoiceGP, secondChoiceGP; // we filter 2 lists : the first with all the GP where user has a big enough score, then a second with GP to be revised.
        firstChoiceGP = this._selectNotionsForDistraction(this._gpListByLesson, lessonNumber, false);
        secondChoiceGP = this._selectNotionsForRevision(this._gpListByLesson, lessonNumber);
        // console.log("1st choice : ");
        // console.log(firstChoiceGP);
        // console.log("2nd choice : ");
        // console.log(secondChoiceGP);
        var selectedNotions = _.toArray(progressionNode.targetNotions);

        this._selectRandomElements(nbStimuliToProvide - selectedNotions.length, firstChoiceGP, selectedNotions, false);

        if (selectedNotions.length < nbStimuliToProvide) {
            this._selectRandomElements((nbStimuliToProvide - selectedNotions.length), secondChoiceGP, selectedNotions, false);
        }

        // console.log("found " + selectedNotions.length + " elements vs. " + nbStimuliToProvide + " expected : ");
        // console.log(selectedNotions);

        var length = selectedNotions.length;
        for (var i = 0 ; i < length ; i++) {
            lGameInitData.rounds[0].stimuli.push(StimuliFactory.fromGP(selectedNotions[i], [], false, true));
        }
        console.log(lGameInitData);
        return lGameInitData;
    };

    LanguageModule.prototype._addRecordOnNotion = function addRecordOnNotion (notion, record) {
        console.log(notion);
        console.log(record);
        var data = this._userProfile.Language;
        if (notion.constructor.name === "GP") {
            if (!data.gp[notion.id]) {
                data.gp[notion.id] = [];
            }
            data.gp[notion.id].push(record);
        }
        else if (notion.constructor.name === "Word") {
            if (!data.words[notion.id]) {
                data.words[notion.id] = [];
            }
            data.words[notion.id].push(record);
        }
        else {
            console.warn("[LanguageModule] Unrecognised notion");
        }

        this._userProfile.Language = data;
    };

    LanguageModule.prototype._getNotionRecord = function _getNotionRecord (notion, windowSize) {
        
        windowSize = windowSize || Config.pedagogy.scoreWindowSize ;
        
        if (notion.constructor.name === "GP") {
            if (!this._userProfile.Language.gp[notion.id]) this._userProfile.Language.gp[notion.id] = [];
            return this._computeAverageScore(this._userProfile.Language.gp[notion.id], windowSize);
        }
        else if (notion.constructor.name === "Word") {
            if (!this._userProfile.Language.words[notion.id]) this._userProfile.Language.words[notion.id] = [];
            return this._computeAverageScore(this._userProfile.Language.words[notion.id], windowSize);
        }
        else {
            console.warn("[LanguageModule] Notion not recognised.");
        }
    };

    LanguageModule.prototype._computeAverageScore = function _computeAverageScore (userRecord, windowSize) {

        var responseCount = Math.min(windowSize, userRecord.length);
        var index = userRecord.length - responseCount;
        var latestResults = userRecord.slice(index); // shallow copy
        var sum = 0;
        
        for (var i = 0 ; i < responseCount; i++) {
            sum += latestResults[i].score;
        }

        return responseCount > 0 ? sum/responseCount : 0;
    };


    LanguageModule.prototype._loadMinigamesRecords = function loadMinigamesRecords (data) {
        if (typeof data === "undefined") return;
        console.warn("[Language Module] Loading of minigames record to be implemented");
    };

    LanguageModule.prototype._processIdentificationResults = function _processIdentificationResults (currentProgressionNode, record) {
        
        var totalClicks = 0;
        var totalCorrectClicks = 0;
        var results = record.results;
        console.log(record);
        var flawlessGame = true;

        for (var r = 0; r < results.data.rounds.length ; r++) {
            console.info("[LangugaeModule] Processing Results of Minigame for Round " + r);
            var stimuli = results.data.rounds[r].steps[0].stimuli;
            
            for (var s = 0 ; s < stimuli.length ; s++) {
                
                var stimulus = stimuli[s];
                console.log(stimulus);
                var notion = this.getWordbyId(stimulus.value.toLowerCase());
                
                if (notion) { // if it is a blank stimulus we wont save scores on its notion or on underlying notions
                    console.info("[LangugaeModule] Processing Results of Minigame for Notion " + notion.id);
                    if (!stimulus.apparitions) {
                        console.warn("LanguageModule : stimulus has no apparitions :");
                        console.log(stimulus);
                        continue;
                    }
                    var apparition;
                    
                    for (var i = 0 ; i < stimulus.apparitions.length ; i++) { //cannot read length of undefined in a crabs catcher.
                        apparition = stimulus.apparitions[i];
                        if (!apparition.isClosed) { // the stimuli that had not the opportunity to complete their appearance (game end happened) are not closed
                            console.warn("Appearance " + i + " not closed, continuing...");
                            continue;
                        }

                        var scoreObject = {
                            elapsedTime : apparition.elapsedTime,
                            score : apparition.isCorrect === apparition.isClicked ? 1 : 0
                        };

                        if (!apparition.isCorrect && scoreObject.score === 0) {
                            flawlessGame = false;
                            console.log("value : " + stimulus.value.toLowerCase() + ", isCR : " + apparition.isCorrect + ", clicked : " + apparition.isClicked);
                        }
                        console.info("[LangugaeModule] Score for notion " + notion.id + " at appearance " + i);
                        console.info(scoreObject);
                        this._addRecordOnNotion(notion, scoreObject);
                        
                        for (var g = 0 ; g < notion.gpList.length ; g++) {
                            this._addRecordOnNotion(notion.gpList[g], scoreObject);
                        }
                    }

                    if (stimulus.correctResponse) {
                        totalClicks += stimulus.clicked;
                        totalCorrectClicks += stimulus.clicked;
                    }
                    else {
                        totalClicks += stimulus.clicked;
                    }
                }
            }
        }

        record.flawless = flawlessGame;
        if (flawlessGame) console.info("##############################\n###### FLAWLESS GAME !! ######\n##############################");
        record.correctResponseShare = totalCorrectClicks / totalClicks;
        var isPreviousGameFlawless, isPreviousGameWon;
        if (!this._userProfile.Language.minigamesRecords.hasOwnProperty(currentProgressionNode.activityType)) {
            this._userProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType] = {
                currentLevel : 3,
                currentStage : 3,
                records : []
            };
            isPreviousGameFlawless = false;
        }
        else {
            var records = this._userProfile.Language.minigamesRecords[currentProgressionNode.activityType].records;
            isPreviousGameWon = records[records.length - 1].hasWon;
            isPreviousGameFlawless = records[records.length - 1].flawless;

        }
        
        if (record.hasWon) {
            currentProgressionNode.isCompleted = true;

            if (isPreviousGameFlawless && record.flawless) {
                if (++this._userProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType].currentLevel > 5) {
                    this._userProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType].currentLevel = 5;
                }
            }
        } else {
            if (!isPreviousGameWon) {
                if (--this._userProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType].currentLevel <1) {
                    this._userProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType].currentLevel = 1;
                }
            }
        }
    };
    

    LanguageModule.prototype._processCompositionResults = function _processCompositionResults (currentProgressionNode, results, hasWon) {
        
        console.log(results);

        var totalDistractorSyllablesCompleted = 0;

        var roundsCount, stepsCount, stimuliCount, apparitionsCount; // length of loops to avoid recalculation at each iteration.
        var currentRound, currentWordData, currentWord, currentStep, currentStimulus, notion, apparition, scoreObject; //temps for loops
        var r, s, st, a; // indices for loops (rounds, steps, stimuli, apparitions)
        
        roundsCount = results.rounds.length;
        rounds:
        for (r = 0; r < roundsCount ; r++) {
            
            currentRound = results.rounds[r];
            currentWordData = currentRound.word;
            console.log(currentWordData);
            scoreObject = {
                elapsedTime : currentWordData.stats.exitTime ? (currentWordData.stats.exitTime - currentWordData.stats.apparitionTime) : 0,
                score : 0
            };

            if (currentWordData.stats.success) {
                scoreObject.score = 1;
                totalDistractorSyllablesCompleted++;
            }

            currentWord = this.getWordbyId(currentWordData.notionId);
            this._addRecordOnNotion(currentWord, scoreObject);
            console.log("Record added on word " + currentWordData.value + " : elapsedTime was " + (scoreObject.elapsedTime/1000) + " seconds with a score of " + scoreObject.score + ".");
            stepsCount = currentRound.steps.length;
            steps:
            for (s = 0 ; s < stepsCount ; s++) {
                
                currentStep = currentRound.steps[s];

                stimuliCount = currentStep.stimuli.length;
                stimuli:
                for (st = 0 ; st < stimuliCount ; st++) {

                    currentStimulus = currentStep.stimuli[st];

                    if (currentStimulus.notionId) { // if it is a blank stimulus we wont save scores on its notion or on underlying notions
                        
                        notion = this.getGPbyId(currentStimulus.notionId);
                        
                        apparitionsCount = currentStimulus.apparitions.length;
                        apparitions:
                        for (a = 0 ; a < apparitionsCount ; a++) {
                            
                            apparition = currentStimulus.apparitions[a];
                            if (!apparition.exitTime) { // the stimuli that had not the opportunity to complete their appearance (game end happened) have no exit time
                                continue;
                            }

                            scoreObject = {
                                elapsedTime : apparition.exitTime - apparition.apparitionTime, 
                                score : apparition.correctResponse === apparition.clicked ? 1 : 0
                            };
                            this._addRecordOnNotion(notion, scoreObject);
                            console.log("Record added on GP " + currentStimulus.notionId + " : elapsedTime was " + (scoreObject.elapsedTime/1000) + " seconds with a score of " + scoreObject.score + ".");
                        }
                    }
                }
            }
        }

        var finalScore = {
            elpasedTime : null,
            score : totalDistractorSyllablesCompleted/roundsCount
        };

        //lSettings.addRecord(finalScore); // TO DO record minigame result
        
        if (hasWon) {
            currentProgressionNode.isCompleted = true;
        }
    };

    LanguageModule.prototype._populateAssessmentSetup = function _populateAssessmentSetup (progressionNode, params) {
        var list = [];
        var a = Config.languageModule.sorting;
    };


    LanguageModule.prototype._populateGapFillGame = function _populateGapFillGame () {
        
        if (!data) console.error('link data here');
        
        var refined = {

            "discipline" : 'language',

            "language": 'english',

            "data": {

                "rounds": []
            }
        };

        var roundIndex = null;

        for (var i = 0 ; i < data.length ; i++) {

            var row = data[i];
            if(row.GROUP !== roundIndex) {
                roundIndex = row.GROUP;
                refined.data.rounds.push({
                    "steps": [{
                        "stimuli": []
                    }]
                });
            }

            var cleanWords = row.ORTHOGRAPHY;
            cleanWords = cleanWords.replace('.', '');
            cleanWords = cleanWords.replace('!', '');
            cleanWords = cleanWords.replace(',', '');
            cleanWords = cleanWords.replace('?', '');

            var words = cleanWords.split(' ');

            refined.data.rounds[roundIndex - 1].steps[0].stimuli.push({
                sentence: row.ORTHOGRAPHY,
                wordIndex: words.indexOf(row.WORD)
            });
        }
        console.log('done');
        return refined;
    };

    module.exports = LanguageModule;
})();
