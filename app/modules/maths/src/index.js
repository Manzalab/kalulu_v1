(function () {
    
    'use strict';

    var DisciplineModule = require ('game_logic/core/discipline_module');
    var Kalulu_maths     = require ('./kalulu_maths');
    var _                = require ('underscore');

    // var constants        = require ('../config/config.json');
    // console.log(constants)
    
    var staticData = {
        name              : 'maths',
        language          : KALULU_LANGUAGE.toLowerCase(),
        assessments       : require ('../assets/data/assessments.csv'),
        filling           : require ('../assets/data/filling.csv'),
        numbers           : require ('../assets/data/nb_list.csv'),
        plan              : require ('../assets/data/plan.csv'),
        sorting           : require ('../assets/data/sorting.csv')
    };


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    


    /**
     * The MathsModule class is ...
     * @class
     * @extends DisciplineModule
     * @memberof Namespace (e.g. Kalulu.Remediation)
     * @param parameter {Object} Description of the parameter
    **/
    function MathsModule (rafiki, userProfile) {
        
        this.type = "Maths";

        // console.log(staticData.numbers)
        // NUMBERS all in array(INDEX[NUMBER.VALUE] = NUMBER)
        this._skills_from_plan = [];
        this._shapes_from_plan = [];
        this._numbers = [];
        this._numberList = this._initNumberList(staticData.numbers);
        // console.log(staticData.numbers)

        // sorted by lesson [index]
        this._notionsListByLesson = this._initNotionsListByLesson(this._numberList);
        this._notionsInLesson = {};

        DisciplineModule.call(this, rafiki, staticData, userProfile);
       /// console.log(this._userProfile);
        /// console.log(this._userProfile.Maths);
  
          // console.log(this._plan)
         
           if (!this._userProfile.Maths) {
                this._initUserData();
                this._plan.isUnlocked = true;
            }

            this._sortingGamesListByChapter = this._initSortingGamesList();

        if (Config.enableGlobalVars) window.kalulu.mathsModule = this;
           
    }

    MathsModule.prototype = Object.create(DisciplineModule.prototype);
    MathsModule.prototype.constructor = MathsModule;


    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################


    /**
     * Returns something
     * @param paramName {Type} description of the parameter
     * @return {Type} description of the returned object
    **/
    MathsModule.prototype._initSortingGamesList = function _initSortingGamesList () {
        var data = staticData.sorting;
        var listByChapter = {};
        for (var i = 0 ; i < data.length ; i++) {
            var lItem = data[i];

            if (!listByChapter.hasOwnProperty(lItem.CHAPTER)) listByChapter[lItem.CHAPTER] = [];
            var st_array = {'stimuli': []}

            st_array.stimuli.push({
                "value" : lItem["HIGHER NUM"],
                "correctResponse": true,
              
            });
            st_array.stimuli.push({
                "value"  : lItem["OTHER NUM"],
                "correctResponse": false,
            });
            listByChapter[lItem.CHAPTER].push(st_array)
        }

        // console.log(listByChapter)
        return listByChapter;
    };
    MathsModule.prototype.getNotionsById = function getNotionsById (id) {
        // console.log('getNotionsById'+id)
       //@ console.log(this._numberList[id])
      //  this._numberList[id]["NOTION ID"] =
      /*  var mnotion = {}
        if(this._numberList[id]){
            mnotion.data = this._numberList[id];
            mnotion.type = 'number';
            //mnotion = new _Number(this._numberList[id])
        }
        else{
          if(id== 'backward'){
             mnotion.data = null;
             mnotion.type = 'skill';
            // mnotion = new Skill('backward')
          }
          
        }
        return mnotion; 
        */
    };

    


    MathsModule.prototype.getNotionsByCumul = function getNotionsByCumul(notions,lesson) {
        var that = this;
        // this._skills_from_plan
        if (!that._notionsInLesson[lesson]) {
                    that._notionsInLesson[lesson] = {
                        'numbers' : [],
                        'shapes'  : [],
                        'skills'  : []
                    };
        }
        if(notions[lesson]){
            _.each(notions[lesson], function(notionID){

                // IS A NUMBER
                  if(that._numberList[notionID]){
                      that._notionsInLesson[lesson].numbers.push(that._numberList[notionID])
                  }
                  // IS A SKILL OR A SHAPE
                  else{
                    var static_skills_array = ['forward', 'backward', 'oneby', 'twoby', 'fiveby', 'tenby', 'recognition', 'addition', 'substraction']

                    if( _.contains(static_skills_array, notionID) ){

                       that._notionsInLesson[lesson].skills.push(notionID)
                       that._skills_from_plan.push(notionID)
                       that._skills_from_plan = _.uniq(that._skills_from_plan)
                    }
                    var static_shapes_array = ['line','square', 'triangle', 'rectangle','circle', 'parallelogram', 'hexagon', 'diamond']

                    // > if _.contains...
                    if(  _.contains(static_shapes_array, notionID) ){
                       that._notionsInLesson[lesson].shapes.push(notionID)
                       that._shapes_from_plan.push(notionID)
                       that._shapes_from_plan = _.uniq(that._shapes_from_plan)
                    }
                    
                  }
            })
        } 
        /// console.log(that._notionsInLesson)
        // console.log(that._skills_from_plan)
        return that._notionsInLesson;
    }



    MathsModule.prototype._initNumberList = function _initNumberList (numberArray) {
        var numberList = {};
        for (var i = 0 ; i < numberArray.length ; i++) {
          //console.log(numberArray[i])
          /// var lGP = new _Number(gpArray[i], this);
          //console.log(score[numberArray[i]["VALUE"] ])
           numberList[numberArray[i]["VALUE"] ] = numberArray[i];
        }
        if (Config.debug) window.kalulu.MathsNumberList = numberList;
                
        // console.log(numberList)
        return numberList;
    };

     MathsModule.prototype.getDataForSave = function getDataForSave () { // TODO move in a save module

        // 5 things to save in this module :
        // * the progression in the plan
        // * the userRecord on each NUMBER
        // * the userRecord on each MinigameSetting 
        return {
            progression : this._plan.getDataForSave(),
            numbers     : this._saveList(this._numberList)
        };    
    };

     MathsModule.prototype.processResults = function processResults (currentProgressionNode, results, hasWon) { // TODO : move in a save module
            
            console.log(currentProgressionNode);

            if(currentProgressionNode._activityType=='ants'){
              this._processAntsResults(currentProgressionNode, results, hasWon);
            }
            else if(currentProgressionNode._activityType[0]=='fish'){
              this._processFishResults(currentProgressionNode, results, hasWon);
            }
            else{
                this._processCountingResults(currentProgressionNode, results, hasWon);

            }

           // if (this._currentActivityParams.gameType === "caterpillar") {
                this._processCountingResults(currentProgressionNode, results, hasWon);
           // }


        // var lSettings = this.getSettings(currentProgressionNode.activityType);
        // console.log(lSettings);
/*
        if (this._currentActivityParams.gameType === "identification") {
            this._processIdentificationResults(currentProgressionNode, results, hasWon);
        }
        else if (this._currentActivityParams.gameType === "composition") {
            this._processCompositionResults(currentProgressionNode, results, hasWon);
        }
        else if (this._currentActivityParams.gameType === "pairing") {
            if (hasWon) currentProgressionNode.isCompleted = true;
        }
        */
    };

    MathsModule.prototype._processAntsResults = function _processAntsResults(currentProgressionNode, results, hasWon) {

        if (results.hasWon) {
            console.log('results.hasWon ants')
            currentProgressionNode.isCompleted = true;
        }
    }

    MathsModule.prototype._processFishResults = function _processFishResults(currentProgressionNode, results, hasWon) {

        if (results.hasWon) {
            console.log('results.hasWon fishs')
            currentProgressionNode.isCompleted = true;
        }

    }

    MathsModule.prototype._processCountingResults = function _processCountingResults(currentProgressionNode, results, hasWon) {
       console.log('_processCountingResults')
       console.log(currentProgressionNode)
       console.log(hasWon)


       var gameGroup = results._results.gameGroup


       console.log(results)


       console.log('_process '+gameGroup+' Results')
      
        // console.log(hasWon);
       
        if(!results._results.data || !results._results.data.rounds){
            return false;
        }
        var result = results._results.data.rounds;
        console.log(result)

        var flawlessGame = true;
        var score ={}
        if(this._userProfile){
            score = this._userProfile.Maths.numbers;
        }

        console.log(score)

        var roundsCount = result.length;

        var saved_values = []

        
        rounds:
        for (var r = 0; r < roundsCount ; r++) { 
            //var currentRoundPath = result[r].path;

            //console.log(result[r].path)
            var currentRound = result[r];
            // console.log(currentRound)
            var stepsCount = currentRound.steps.length;
            var perfect_step = true;

            steps:
            for (var s = 0 ; s < stepsCount ; s++) {
                var currentStep = currentRound.steps[s];
                // console.log(currentStep)
                var stimuliCount = currentStep.stimuli.length;
                var stimuliPath = currentStep.type;

               //  console.log(stimuliPath)

               // var notion = currentStep;

                stimuli:

                for (var st = 0 ; st < stimuliCount ; st++) {
                     var has_score = null
                     var currentStimulus = currentStep.stimuli[st];
                     //console.log(currentStimulus)
                     if (!currentStimulus.apparitions) {
                        // console.warn("LanguageModule : stimulus has no apparitions :");
                        // console.log(stimulus);
                        continue;
                     }
                     if (currentStimulus.value == "") {
                        // console.warn("LanguageModule : stimulus has no apparitions :");
                        // console.log(stimulus);
                        continue;
                     }
                   
                   
                    apparitions:
                    for (var iap = 0 ; iap < currentStimulus.apparitions.length ; iap++) { //cannot read length of undefined in a crabs catcher.
                        var apparition = currentStimulus.apparitions[iap];
                    
                        console.log(apparition)


              
                        if(apparition._isClicked == true && apparition._isCorrect == true){
                          //console.log('win case')
                         // apparition.wrong = false

                        }
                        if(apparition.isClicked == true && apparition._isCorrect == false){
                         // console.log('loose case')
                         // apparition.wrong = true
                          perfect_step = false
                        }

                         if (!apparition.exitTime) { // the stimuli that had not the opportunity to complete their appearance (game end happened) have no exit time
                           //  continue;
                         }

                          //var elapsed = apparition.exitTime - apparition.apparitionTime;
                          // var elapsed = apparition.exitTime - apparition.apparitionTime;
                          
                          var sc = 0
                          if(apparition.isCorrect === true &&  apparition.isClicked === true ){
                            sc = 1
                          }
                          var scoreObject = {
                              elapsedTime :  apparition.elapsedTime, 
                              //ref       : currentStimulus.value,
                              score       :  sc
                          };

                           if (scoreObject.score === 0) {
                            console.log("flawwless set to false");

                            flawlessGame = false;
                            console.log(currentStimulus)
                            console.log("value : " + currentStimulus.value + ", isCR : " + apparition.isCorrect + ", clicked : " + apparition._isClicked);
                        }
                          
                        saved_values.push(currentStimulus.value)
                        this._addRecordOnNotion(currentStimulus,scoreObject, gameGroup )


                    }

                     // OK > 
                     
                    // console.log(currentStimulus.correctResponse)

                }
            }
        }



        results.flawless = flawlessGame;
        if (flawlessGame) console.info("##############################\n###### FLAWLESS GAME !! ######\n##############################");
      ///  record.correctResponseShare = totalCorrectClicks / totalClicks;
        var isPreviousGameFlawless, isPreviousGameWon;
        if (!this._userProfile.Maths.minigamesRecords.hasOwnProperty(currentProgressionNode.activityType)) {
            console.log('flawless case 1')

            this._userProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType] = {
                currentLevel : 3,
                currentStage : 3,
                records : []
            };
            isPreviousGameFlawless = false;
        }
        else {
                      console.log('flawless case 2')


            var records = this._userProfile.Maths.minigamesRecords[currentProgressionNode.activityType].records;
             console.log(records.length-1)
             console.log(records)
             if(records.length>0){
                isPreviousGameWon = records[records.length - 1].hasWon;
               isPreviousGameFlawless = records[records.length - 1].flawless;

             }
             else{
            isPreviousGameWon = false;
            isPreviousGameFlawless = false;
          }

        }
        
        if (results.hasWon) {
                      console.log('flawless case 1B')

            currentProgressionNode.isCompleted = true;

            if (isPreviousGameFlawless && results.flawless) {
                          console.log('flawless case 2B')

                if (++this._userProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType].currentLevel > 5) {
                                         console.log('flawless case 3B')

                    this._userProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType].currentLevel = 5;
               
                }
            }
        } else {
                                    console.log('flawless case 4B')

            if (!isPreviousGameWon) {
                                        console.log('flawless case 5B')

                if (--this._userProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType].currentLevel <1) {
                                             console.log('flawless case 6B')

                    this._userProfile[currentProgressionNode.discipline.type].minigamesRecords[currentProgressionNode.activityType].currentLevel = 1;
                }
            }
        }
        console.log('saved_values')

        console.log(saved_values)
        _.each(saved_values, function(v){

          console.log(score[v])

        })

    }
   MathsModule.prototype._addRecordOnNotion = function addRecordOnNotion (stimuli, record, gameGroup) {
        
       var  windowSize = 10;


        // console.log('notion'+stimuli.value);

        //console.log(record)
        //console.log(stimuli)
        var score ={}
        if(this._userProfile){
          score = this._userProfile.Maths.numbers;
        }
       // console.log(score)

       

      if(gameGroup == 'recognition'){


          var p = stimuli.path[0] 
          var r = stimuli.path[1] 
          //console.log(score)
          if(score && score[stimuli.value] &&  score[stimuli.value][p] && score[stimuli.value][p][r]){
               console.log('score[value][p][r]')
               console.log(p)
               console.log(r)

               console.log(score[stimuli.value][p][r])
               score[stimuli.value][p][r].push(record)
               var tscore = score[stimuli.value][p][r]

               
               var taverage  = this.getAverageScorefromRecords(tscore)
               score[stimuli.value][p][r] = taverage
              

            }

        }
        else if(gameGroup == 'sum'){
          

            var side_     = stimuli.path.side
            var sign_     = stimuli.path.sign
            var xnumber_  = stimuli.path.xnumber
            var number_   = stimuli.path.number 
            var group_    = 'sum'


            console.log(xnumber_)
            console.log(number_)
            console.log(stimuli.path)

            if(sign_ == '+'){
              sign_ = 'addition'
            }
            if(sign_ == '-'){
              sign_ = 'substraction'
            }

            if(side_ == 'left'){
              side_ = 'lefts'
            }
            if(side_ == 'right'){
              side_ = 'rights'
            }

           
            if(score && score[number_] && score[number_][group_] && score[number_][group_][sign_] && score[number_][group_][sign_][side_] && score[number_][group_][sign_][side_][xnumber_] ){

               // console.log(score[number_][[group_]][sign_][side_][xnumber_])

                score[number_][group_][sign_][side_][xnumber_].push(record)
                var tscore = score[number_][group_][sign_][side_][xnumber_]
                var taverage  = this.getAverageScorefromRecords(tscore)
                score[number_][group_][sign_][side_][xnumber_] = taverage

            }



        }
        else if(gameGroup == 'shape'){

           console.log(stimuli);
           var shape_ = stimuli.value;
           var stimuli_type = stimuli.path.stimuli_type;
           // console.log(shape_)
           // console.log(stimuli.path)
                      if(score && score[shape_] && score[shape_][stimuli_type]) {
                         

                         score[shape_][stimuli_type].push(record);
                         var tscore = score[shape_][stimuli_type];
                          console.log(tscore );
                         var taverage  = this.getAverageScorefromRecords(tscore);
                         score[shape_][stimuli_type]= taverage;
                      }

        }

        else if(gameGroup == 'decimal'){
           //var p = stimuli.path[0] 
           var r = stimuli.path
           console.log(stimuli.path)
           var group_ = 'decimal'
           if(score && score[stimuli.value] && score[stimuli.value][group_] && score[stimuli.value][group_][r] ) {

                score[stimuli.value][group_][r].push(record)
                var tscore = score[stimuli.value][group_][r]
                var taverage  = this.getAverageScorefromRecords(tscore)
                score[stimuli.value][group_][r] = taverage
           }
        }
        else if(gameGroup == 'counting'){

            // console.log('counting score ?')
            var direction_ = stimuli.path.direction
            var group_ = 'counting'
            var from_ = stimuli.path.from
              var step_ = stimuli.path.step
              // console.log(step_)
              if(step_ == '1'){
                 step_ = 'oneby' 
              }
              if(step_ == '2'){
               
                 step_ = 'twoby' 
              }
               if(step_ == '5'){
               
                 step_ = 'fiveby' 
              }
               if(step_ == '10'){
               
                 step_ = 'tenby' 
              }

           
           // console.log(stimuli.path)
            if(score && score[stimuli.value] && score[stimuli.value][group_] && score[stimuli.value][group_][direction_] && score[stimuli.value][group_][direction_][step_] && score[stimuli.value][group_][direction_][step_][from_]) {
               
              score[stimuli.value][group_][direction_][step_][from_].push(record)
               
              var tscore = score[stimuli.value][group_][direction_][step_][from_]
              //console.log(tscore)
              var taverage  = this.getAverageScorefromRecords(tscore)
              score[stimuli.value][group_][direction_][step_][from_] = taverage
           //     console.log(taverage)
            }
        }
          this._userProfile.Maths.numbers = score;
          // Merci Cyprien :) 
          this._userProfile.Maths         = this._userProfile.Maths
    };
    MathsModule.prototype.getAverageScorefromRecords = function getAverageScorefromRecords(records) {
          var  windowSize   = 10;
          var responseCount = Math.min(windowSize, records.length);
          var index         = records.length - responseCount;
          var latestResults = records.slice(index); // shallow copy
       //   console.log(latestResults)
          return latestResults;
    }


    MathsModule.prototype.getPedagogicDataForGame = function getPedagogicDataForGame (progressionNode, params) {


          var lessonNumber = progressionNode.parent._lessonNumber;
          console.log(progressionNode.activityType)
          console.log(params)

          var that = this;

          var params = {
            gameType                        : progressionNode.activityType, 
            roundsCount                     : params.roundsCount,           // the amount of rounds, (Rafiki will provide one target per round)
            parakeetPairs                   : (progressionNode.activityType == 'parakeets' && params.pairsCount) ? params.pairsCount : null,
            stepDistracterCount             : params.stepDistracterCount,             // 
            available_skills                : this._notionsInLesson[lessonNumber].skills,
            available_shapes                : this._notionsInLesson[lessonNumber].skills,  
          }

          if(progressionNode.activityType == 'crabs' || progressionNode.activityType == 'jellyfish' ||  progressionNode.activityType == 'parakeets' ){
            params.groupGameType      = 'recognition'  
          }
         
          if(progressionNode.activityType == 'caterpillar' || progressionNode.activityType == 'frog'){
            params.groupGameType      = 'counting'  
          }
          if(progressionNode.activityType == 'turtles'){
            params.groupGameType      = 'decimal'  

          }
          if(progressionNode.activityType == 'cocolision'){
            params.groupGameType      = 'sum'  

          }

          if(progressionNode.activityType == 'ants'){
            params.groupGameType      = 'gapfill'  

          }

         
          if(progressionNode.activityType == 'monkeys'){
            params.groupGameType      = 'sum'  

          }

            console.log(params)

          
          this._currentActivityParams = params;
          //var pool_type = 'recognition';
          //var pool_type = 'counting';
          // console.log('score?')
          var score ={}
          if(this._userProfile){
            score = this._userProfile.Maths.numbers;
          }
          //console.log(score)
        //  console.log(this._notionsInLesson[lessonNumber].numbers)
         // console.log(this._notionsInLesson[lessonNumber].skills)

         //  var available_numbers = this._notionsInLesson[lessonNumber].numbers;
         // console.log(lessonNumber)
         // console.log(available_numbers)
         // console.log(staticData.numbers)

          var available_numbers =[]

          _.each(staticData.numbers, function(num){
             // console.log(parseInt(num["VALUE"]))
              if(_.isFinite( parseInt(num["VALUE"])) && parseInt(num["LESSON"]) <= progressionNode.parent._lessonNumber){
                  available_numbers.push(num)
              }

          })
         // console.log(real_available_numbers)


          var game = new Kalulu_maths(available_numbers,score,this._numberList, params, staticData);
          if(!game.data){
            // alert('finished !')
          }

          this._currentExerciseSetup = game;
          //  console.log(this._currentExerciseSetup);
          // console.log(game)
          return this._currentExerciseSetup;
      }
    MathsModule.prototype.getPedagogicData = function getPedagogicData (progressionNode, params) {
      // alert(progressionNode.activityType)
      console.log(progressionNode)
      if (progressionNode.activityType === "lookandlearn") {
          return this.getPedagogicDataForLookAndLearn(progressionNode);
      }
      else if (progressionNode.activityType[0] === "fish") {
          return this.getPedagogicDataForAssessment(progressionNode)
      }
      else if (progressionNode.activityType === "ants") {
          return this._populateGapFillGame(progressionNode, params);
      }
      else{
        return this.getPedagogicDataForGame(progressionNode, params);
      }    
    };
    MathsModule.prototype.getPedagogicDataForAssessment = function getPedagogicDataForAssessment (progressionNode) {
       // var constants = constants.assessments;
       //  var setup = {'yo':'boo'}
       //alert('zeee')
        var stimuli_for_chapter = this._sortingGamesListByChapter[progressionNode.chapterNumber]
       
        var setup = {
            discipline : 'maths',
            language   : KALULU_LANGUAGE, // can be : english, french, swahili
            categories : ['HIGHER NUM', 'OTHER NUM'],
            timer : 99999920,
            minimumWordsSorted : 10,
            minimumCorrectSortRatio : 0.5,
            // stimuli: stimuli_for_chapter,
            data       : {
                 categories : ['HIGHER NUM', 'OTHER NUM'],
                 rounds: [ { steps:  stimuli_for_chapter }]
            }
        };
        console.log(setup)
        return setup;
    };

    MathsModule.prototype.getPedagogicDataForLookAndLearn = function getPedagogicDataForLookAndLearn (progressionNode) {
       console.log(progressionNode);
        var notionsData = [];
        var sounds = [];
        var value;
        var composeNumberSounds = false;
        if (KALULU_LANGUAGE === 'swahili') composeNumberSounds = true;

        for (var notionId in progressionNode.targetNotions) {
            if (!progressionNode.targetNotions.hasOwnProperty(notionId)) continue;

            var lNotion = progressionNode.targetNotions[notionId];
            value = parseInt(lNotion.VALUE, 10);
            //console.log(lNotion);
            //var lTexture = new PIXI3.Texture.fromFrame(lNotion.illustrationName + ".jpg");

            if (composeNumberSounds && value > 10 && value%10 !== 0) {
              sounds = [
                Config.soundsPath + this.id + "/number_" + Math.floor(value/10)*10 + '.ogg',
                Config.soundsPath + this.id + "/number_and_" + value%10 + '.ogg'
              ];
            }
            else {
              sounds = [Config.soundsPath + this.id + "/number_" + lNotion.VALUE + '.ogg'];
            } 

            notionsData.push({
                id                : value,
                value             : value,
                textValue         : lNotion.VALUE.toString(),
                sounds            : sounds,
                illustrativeSound : Config.soundsPath + this.id + "/number_" + lNotion.VALUE + '.ogg',
                image             : Config.imagesPath + this.id + "/" + lNotion.IMAGE.toLowerCase() + '.jpg'
            });
        }

        //console.log(notionsData);

        return {
          discipline : 'maths',
          language   : KALULU_LANGUAGE, // can be : english, french, swahili
          data       : {
            notions : notionsData
          }
        }
    };



    MathsModule.prototype.loadSavedGame = function loadSavedGame (savedGame) { // move in a save module
        console.log(savedGame);
        this._plan.setToSavedState(savedGame.progression);
        this._addUserDataToList(this._numberList, savedGame.numbers);
        this._loadMinigamesRecords(savedGame.minigamesRecords);
    };

    // default score data constructor
   
    MathsModule.prototype.loop_numbers_skills = function loop_numbers_skills () {
          
          // Score object Squeleton


var record  = [
                            {
                                "score": 1,
                                "time": 1002
                            },
                            {
                                "score": 1,
                                "time": 1003
                            },
                            {
                                "score": 1,
                                "time": 1002
                            },
                            {
                                "score": 1,
                                "time": 1002
                            },
                            {
                                "score": 0,
                                "time": 1002
                            },
                            {
                                "score": 1,
                                "time": 1002
                            }
                        ]
var record_not_av   = [
                            {
                                "score": 0,
                                "time": 1002
                            },
                            {
                                "score": 1,
                                "time": 1002
                            }
                        ]

    var score = {
          
      0 : {   
          'counting': {
              'forward': { 
                'oneby': { 'zero':[], 'random':[], 'multiple':[]}, 
                'twoby': { 'zero': [], 'random':[], 'multiple':[]},
                'fiveby': { 'zero': [], 'random':[], 'multiple':[]},
                'tenby': { 'zero': [], 'random':[], 'multiple':[]} 
              },
              'backward': { 
                'oneby': { 'zero': [], 'random':[], 'multiple':[]}, 
                'twoby': { 'zero': [], 'random':[], 'multiple':[]},
                'fiveby': { 'zero': [], 'random':[], 'multiple':[]},
                'tenby': { 'zero': [], 'random':[], 'multiple':[]} 
              },
          },
          'sum': {
              'addition' : {
                'lefts' : {'xzero':[],'xone':[],'xtwo':[], 'xthree': [], 'xfour': [], 'xfive': [], 'xsix':[], 'xseven': [], 'xeight': [], 'xnine': [], 'xten': []},
                'rights': {'xzero':[],'xone':[],'xtwo':[], 'xthree': [], 'xfour': [], 'xfive': [], 'xsix':[], 'xseven': [], 'xeight': [], 'xnine': [], 'xten': []}
              },
              'substraction' : {
                'lefts' : {'xzero':[],'xone':[],'xtwo':[], 'xthree': [], 'xfour': [], 'xfive': [], 'xsix':[], 'xseven': [], 'xeight': [], 'xnine': [], 'xten': []},
                'rights': {'xzero':[],'xone':[],'xtwo':[], 'xthree': [], 'xfour': [], 'xfive': [], 'xsix':[], 'xseven': [], 'xeight': [], 'xnine': [], 'xten': []}
              }
          },
          'recognition': {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
          'decimal'  : {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}  
          
      },
        "line" :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
        "square"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
        "triangle" :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
        "rectangle"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
        "circle"   : {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
        "parallelogram"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
        "hexagon"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
        "diamond"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      }
    for(var i=0; i<=100; i++){
      score[i] = _.clone(score[0])
    }
    return score

    }

    MathsModule.prototype._initUserData = function _initUserData () {
       // if (this._userProfile.Maths) return;
        var data = {
            plan             : this._plan.createSave(),
            numbers          : this.loop_numbers_skills(),
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
        this._userProfile.Maths = data;
        // console.log(this._userProfile.Maths)
    };

    MathsModule.prototype._initNotionsListByLesson = function _initNotionsListByLesson (notionsList) {
        var lNotionListByLesson = {};
        var lNotion;
        if (Config.debugMathsModule) console.log(notionsList)
        for (var notionId in notionsList) {
            if (!notionsList.hasOwnProperty(notionId)) continue;

            lNotion = notionsList[notionId];

            if (!lNotionListByLesson[lNotion.LESSON]) lNotionListByLesson[lNotion.LESSON] = {};
            lNotionListByLesson[lNotion.LESSON][lNotion.VALUE] = lNotion;
        }
        
        if (Config.enableGlobalVars) window.kalulu.mathsNotionListByLesson = lNotionListByLesson;
        return lNotionListByLesson;
    };

    MathsModule.prototype.getNotionsForLesson = function getNotionsForLesson (lessonNumber) {
        return _.values(this._notionsListByLesson[lessonNumber]);
    };

    MathsModule.prototype.getNotionIdsForLesson = function getNotionIdsForLesson (lessonNumber) {
        return Object.keys(this._notionsListByLesson[lessonNumber]);
    };

    MathsModule.prototype._populateGapFillGame = function _populateGapFillGame () {
        
        // if (!data) console.error('link data here');
        
        var refined = {

            "discipline" : 'maths',
            "language": KALULU_LANGUAGE,
            "data": {

                "rounds": []
            }
        };

        var roundIndex = null;
        console.log(staticData.filling)

        for (var i = 0 ; i < staticData.filling.length ; i++) {

            var row = staticData.filling[i];
            //console.log( row)


            if(row.GROUP !== roundIndex) {
                roundIndex = row.GROUP;
                refined.data.rounds.push({
                    "steps": [{
                        "stimuli": []
                    }]
                });
            }
            refined.data.rounds[roundIndex - 1].steps[0].stimuli.push({
               id             : row["SYMBOLIC NUMBER"],
               value          : row["SYMBOLIC NUMBER"],
               correctResponse: true,
               soundPath      : 'assets/sounds/maths/number_'+row["SYMBOLIC NUMBER"]+'.ogg'

           });
        }
        // console.log(refined);
        // console.log('done');
        return refined;
    };

    module.exports = MathsModule;
})();