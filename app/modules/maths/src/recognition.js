/*

CALLED by skill/variante 

*/

var _ 				= require('underscore')
var Distractor 		= require('./distractor.js')
var ModuleUtils 	= require('./module_utils.js')

var Recognition = function(number, stimuli_type, numbers_available, count,  numbers_data){

	this.moduleutils = new ModuleUtils()
	this.number = number
	this.stimuli_type = stimuli_type
	this.numbers_data = numbers_data
	
	var round = {"steps": []}

	var step = {"type": this.stimuli_type, "stimuli": [] }
			
	var Lpath = ['recognition', this.stimuli_type]
	
	var st =  this.moduleutils.addStimuli(true , this.number, 'number',numbers_data, Lpath)
	
	step.stimuli.push(st)

	var distractors = new Distractor(this.number,numbers_available,count, false )
	//console.log(distractors)
	var that = this
	if(distractors){
		_.each(distractors, function(d){
			var st =  that.moduleutils.addStimuli(false , d.value, 'number',numbers_data, Lpath)
			step.stimuli.push(st)
		})
	}

	round.steps.push(step)
	round.targetSequence = {
		gameType        : this.stimuli_type, 
		targetNumber    : this.number
	}

	
	this.round = round
	return this
	//return out;
}

module.exports =  Recognition;