/**
 * Created by Adrien on 12/08/2016.
 */

var Emitter = require('../events/emitter');
var Events = require('../events/events');

function ProgressionHandler(settings, game){
    
    this.game = game;

    this.settings = settings; // letters-descriptions filename + waitTime between letters
    this.currentModel = null;
    this.currentStep = 0;
    this.letterID = "";
    this.series = []; // contain the keys for the serie
    this.parameters = {}; // contain the series information
    this.currentModelIndex = 0;
    this.alreadyDoneSeries = {};

    var that = this;
    Emitter.on(Events.STEP_VALIDATED, function(localGoodPoints){
      var isNotFinalStep = that.nextStep();
      if(isNotFinalStep){
        Emitter.emit(Events.STEP_STARTED, that.getCurrentStep(), 1, localGoodPoints);
      }
    });
    Emitter.on(Events.STEP_UNVALIDATED, function(last, points){
      //that.currentStep = 0;
      Emitter.emit(Events.RESET_LETTER);
      //Emitter.emit(Events.STEP_STARTED, that.getCurrentStep(), 1);
    });
    Emitter.on(Events.REDO_LETTER, function(){
        Emitter.emit(Events.END_LETTER, that.currentModel);
        that.setModel(that.series[that.currentModelIndex]);
    });

    this.settings.lettersDescriptor = this.game.gameConfig.letters;
}

ProgressionHandler.prototype.load = function ProgressionHandlerLoad(callback){
  // var that = this;
  // LoadJSON(this.settings.lettersDescriptor, function(resp){
  //   that.settings.lettersDescriptor = resp;
  //   callback();
  // })
  
  callback();
};

ProgressionHandler.prototype.setSeries = function ProgressionHandlerSetSeries (series) {
  this.parameters = series;
  // console.log(series);
  this.series = Object.keys(series);
  for(var i = 0; i< this.series.length; i++){
    this.alreadyDoneSeries[this.series[i]] = 0;
  }

  this.currentModelIndex = 0;
  this.setModel(this.series[this.currentModelIndex]);
};

ProgressionHandler.prototype.setModel = function ProgressionHandlerSetModel(letter){
  this.letterID = letter;
  this.currentModel = this.settings.lettersDescriptor.letters[letter];
  this.currentStep = 0;
  
  Emitter.emit(Events.NEW_LETTER, JSON.parse(JSON.stringify(this.currentModel)), letter);
  Emitter.emit(Events.STEP_STARTED, this.getCurrentStep(), 1);

  this.alreadyDoneSeries[letter]++;
};

ProgressionHandler.prototype.getCurrentStep = function ProgressionHandlerGetCurrentStep(){
  return JSON.parse(JSON.stringify(this.currentModel[this.currentStep]));
};

ProgressionHandler.prototype.nextStep = function ProgressionHandlerGetCurrentStep(){
  this.currentStep++;

  if(this.currentStep >= this.currentModel.length){
    Emitter.emit(Events.WAIT_TRACING, this.currentModel);

    var that = this;
    setTimeout(function(){
        Emitter.emit(Events.END_LETTER, that.currentModel);
        Emitter.emit(Events.START_TRACING, that.currentModel);

        if(that.alreadyDoneSeries[that.letterID] >= that.parameters[that.letterID].nbOfTimes){
            that.currentModelIndex++;
        }

        if(that.currentModelIndex >= that.series.length){
          that.game.endOfTracing();
          return;
        }

        that.setModel(that.series[that.currentModelIndex]);
    }, this.settings.waitTimeForNewLetter * 1000);
    return false;
  }else{
    Emitter.emit(Events.STEP_FINISHED, this.currentModel[this.currentStep-1]);
    Emitter.emit(Events.STEP_STARTED, this.getCurrentStep(), 1);
  }

  return true;
};


module.exports = ProgressionHandler;
