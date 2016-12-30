

/*

CALLED by skill/variante 

*/

var _ 				= require('underscore')
var ShapeDistractor = require('./shape_distractor.js')
var ModuleUtils 	= require('./module_utils.js')


var Shape = function(shape, stimuli_type, available_shapes, count, shapes_data, lang){
	var that = this;			
	
	var moduleutils = new ModuleUtils()
	// console.log(shapes_data[shape])
	var round = {"steps": []}
	var step = {"type": stimuli_type, "stimuli": [] }

	var lpath = {'stimuli_type': stimuli_type}
	
	// correct stimuli
	var st =  moduleutils.addStimuli(true , shape, 'shape',shapes_data, lpath)
	step.stimuli.push(st)

	// incorrect stimulis
	var distractors = new ShapeDistractor(shape, available_shapes, count)
	if(distractors){
	  _.each(distractors, function(d){
	  	var st =  moduleutils.addStimuli(false , d.value, 'shape',shapes_data, lpath)
	    step.stimuli.push(st)
	  })
	}

	round.steps.push(step)

	round.targetSequence = {
		gameType       : stimuli_type, 
		targetShape    : shape
	}

	this.round = round
	return this
}




module.exports =  Shape;
