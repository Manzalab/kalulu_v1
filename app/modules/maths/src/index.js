(function () {
    
    'use strict';

    var DisciplineModule = require ('game_logic/core/discipline_module');
    var Kalulu_maths     = require ('./kalulu_maths');
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
        // this._numberListByLesson = this._initNumberListByLesson(this._numberList);
        this._notionsInLesson = {};

        DisciplineModule.call(this, rafiki, staticData, userProfile);
       /// console.log(this._userProfile);
        /// console.log(this._userProfile.Maths);
  
          // console.log(this._plan)
         
           if (!this._userProfile.Maths) {
                this._initUserData();
                this._plan.isUnlocked = true;
            }
        if (Config.debug) window.kalulu.mathsModule = this;
           
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
                    var static_skills_array = ['forward', 'backward']

                    // > if _.contains...
                    if(notionID== 'backward' || notionID== 'forward' ||  notionID== 'oneby' || notionID== 'twoby' ||  notionID== 'fiveby' || notionID== 'tenby' || notionID== 'recognition'){
                       that._notionsInLesson[lesson].skills.push(notionID)
                       that._skills_from_plan.push(notionID)
                       that._skills_from_plan = _.uniq(that._skills_from_plan)
                    }
                    var static_shapes_array = ['circle', 'square']

                    // > if _.contains...
                    if(notionID== 'circle'){
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
            
            console.log(this._currentActivityParams);

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

    


    MathsModule.prototype._processCountingResults = function _processCountingResults(currentProgressionNode, results, hasWon) {
      
      var gameGroup= results.setup.gameGroup


      console.log(results)


       console.log('_process '+gameGroup+' Results')
      
        // console.log(hasWon);
       
        if(!results.setup.data || !results.setup.data.rounds){
            return false;
        }
        var result = results.setup.data.rounds;


        console.log(result)

         var score ={}
         if(this._userProfile){
            score = this._userProfile.Maths.numbers;
         }

          console.log(score)


        var roundsCount = result.length;
        
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
                   
                   
                    apparitions:
                    for (var iap = 0 ; iap < currentStimulus.apparitions.length ; iap++) { //cannot read length of undefined in a crabs catcher.
                        var apparition = currentStimulus.apparitions[iap];
                        // console.log(apparition)


              
                        if(apparition.isClicked == true && apparition.isCorrect == true){
                          //console.log('win case')
                         // apparition.wrong = false

                        }
                        if(apparition.isClicked == true && apparition.isCorrect == false){
                         // console.log('loose case')
                         // apparition.wrong = true
                          perfect_step = false
                        }

                         if (!apparition.exitTime) { // the stimuli that had not the opportunity to complete their appearance (game end happened) have no exit time
                           //   continue;
                         }

                          //var elapsed = apparition.exitTime - apparition.apparitionTime;
                          // var elapsed = apparition.exitTime - apparition.apparitionTime;
                          
                          var scoreObject = {
                              elapsedTime :  apparition.elapsedTime, 
                              //ref       : currentStimulus.value,
                              score : apparition.isCorrect === apparition.isClicked ? 1 : 0
                          };
                          

                          this._addRecordOnNotion(currentStimulus,scoreObject, gameGroup )


                    }

                     // OK > 
                     
                    // console.log(currentStimulus.correctResponse)

                }
            }
        }

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

        // recognition only.. here.

      if(gameGroup == 'recognition'){
          var p = stimuli.path[0] 
          var r = stimuli.path[1] 
          //console.log(score)
          if(score && score[stimuli.value] &&  score[stimuli.value][p] && score[stimuli.value][p][r]){
               console.log('score[value][p][r]')
               
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
            var number_    = stimuli.path.number 
            var group_    = 'sum'

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

            if(xnumber_ == '0'){
              xnumber_ = 'xzero'
            }
            if(xnumber_ == 1){
              xnumber_ = 'xone'
            }
            if(xnumber_ == 2){
              xnumber_ = 'xtwo'
            }
            if(xnumber_ == '3'){
              xnumber_ = 'xthree'
            }
            if(xnumber_ == '4'){
              xnumber_ = 'xfour'
            }
            if(xnumber_ == '5'){
              xnumber_ = 'xfive'
            }
            if(xnumber_ == '6'){
              xnumber_ = 'xsix'
            }
            if(xnumber_ == '7'){
              xnumber_ = 'xseven'
            }
            if(xnumber_ == '8'){
              xnumber_ = 'xeight'
            }
            if(xnumber_ == '9'){
              xnumber_ = 'xnine'
            }
            if(xnumber_ == '10'){
              xnumber_ = 'xten'
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

           console.log(stimuli)
           var shape_ = stimuli.value;
           var stimuli_type = stimuli.path.stimuli_type;
           // console.log(shape_)
           // console.log(stimuli.path)
                      if(score && score[shape_] && score[shape_][stimuli_type]) {
                         

                         score[shape_][stimuli_type].push(record)
                         var tscore = score[shape_][stimuli_type]
                          console.log(tscore )
                         var taverage  = this.getAverageScorefromRecords(tscore)
                         score[shape_][stimuli_type]= taverage
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



    MathsModule.prototype.getPedagogicData = function getPedagogicData (progressionNode, params) {
      //  console.log(progressionNode)
        if (progressionNode.activityType === "lecture") {
            return this.getPedagogicDataForLecture(progressionNode);
        }


      var lessonNumber = progressionNode.parent._lessonNumber;
      console.log(progressionNode)


      var that = this;
      
      var params = {
            gameType                        : "crabcatcher", 
            roundsCount                     : 4,           // the amount of rounds, (Rafiki will provide one target per round)
            stepDistracterCount             : 3,             // 
            available_skills                : this._notionsInLesson[lessonNumber].skills,
            available_shapes                : this._notionsInLesson[lessonNumber].skills,
            groupGameType                   : 'shape'   
      }




     
      // // "identification", "composition", "pairing", or "other"
        

      this._currentActivityParams = params;
      

      //var pool_type = 'recognition';
      //var pool_type = 'counting';


      // console.log('score?')
      var score ={}
      if(this._userProfile){
         score = this._userProfile.Maths.numbers;
      }
      //console.log(score)
     console.log(this._notionsInLesson[lessonNumber].numbers)
     console.log(this._notionsInLesson[lessonNumber].skills)

      var available_numbers = this._notionsInLesson[lessonNumber].numbers;
 
 

      var game = new Kalulu_maths(available_numbers,score,this._numberList, params, Config);


      if(!game.data){
         // alert('finished !')
      }

      this._currentExerciseSetup = game;
      //  console.log(this._currentExerciseSetup);
      // console.log(game)
      return this._currentExerciseSetup;
    
    };




    MathsModule.prototype.getPedagogicDataForLecture = function getPedagogicDataForLecture (progressionNode) {
        //console.log(progressionNode);
        var notionsData = [];
        for (var notionId in progressionNode.targetNotions) {
            if (!progressionNode.targetNotions.hasOwnProperty(notionId)) continue;
            var lNotion = progressionNode.targetNotions[notionId];
            //console.log(lNotion);
            //var lTexture = new PIXI3.Texture.fromFrame(lNotion.illustrationName + ".jpg");

            notionsData.push({
                video1 : Config.videoPath + this.id + "/" + lNotion.video1Name,
                video2 : Config.videoPath + this.id + "/" + lNotion.video2Name,
                sound : Config.soundsPath + this.id + "/" + lNotion.soundFilename,
                illustrativeSound : Config.soundsPath + this.id + "/" + lNotion.illustrativeSoundFilename,
                //image : lTexture, // TextureCache of PIXI is not shared and the Texture is unknown of the minigame's instanjce of PIXI. Pass a string instead.
                textValue : lNotion.txtValue
            });
        }

        return notionsData;
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
                'twoby': { 'zero': [], 'random':[], 'multiple':[]} 
              },
              'backward': { 
                'oneby': { 'zero': [], 'random':[], 'multiple':[]}, 
                'twoby': { 'zero': [], 'random':[], 'multiple':[]} 
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
      "triangle" :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      "circle"   : {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      "square"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
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
            minigamesRecords : {}

        };
        this._userProfile.Maths = data;
        // console.log(this._userProfile.Maths)
    };
    
    module.exports = MathsModule;
})();