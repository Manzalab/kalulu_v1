

/*

Skill Variante is a Skilltree-leaf (from tree)
It prepare "rounds" depending on game type like
suites, sum, decimal or shape games




*/


var _ 			= require('underscore')
var Suite 		= require('../suites.js')
var Sum 		= require('../sum.js')
var Decimal 	= require('../decimal.js')
var Shape 		= require('../shape.js')
var Recognition = require('../recognition.js')

var Distractor 	= require('../distractor.js')

var ModuleUtils = require('../module_utils.js')


function SkillVariante(el, params){
	/// this.numbers_data = numbers_data

	this.moduleutils = new ModuleUtils()


	this.lang = params.language

	this.name   = el.name
	this.group  = el.group
	this.number = el.number
	this.shape  = el.shape
	this.score  = el.score ? el.score : null;

	// console.log(el)
	// this.params = params

	/* GETTING PATHS */
	this.is_completed	= false
	this.hasround 		= false;
	this.average 		= null;
	this.record 		= []


	this.tries = el.tries ? el.tries : 0;
	// console.log('this.tries'+this.tries)
	


	/// 

	if(this.group == 'counting'){
		

		this.direction  =   el.paths[1] ? el.paths_[1] : null
		this.step       =   el.paths[2] ? el.paths_[2] : null
		this.from       =   el.paths[3] ? el.paths_[3] : null
		
		if(this.score[this.direction] && this.score[this.direction][this.step] && this.score[this.direction][this.step][this.from]){
			 this.score = this.score[this.direction][this.step][this.from]		
		}
	}
	if(this.group == 'sum'){
		
		this.sign       =   el.paths[1] ? el.paths_[1] : null
		this.side       =   el.paths[2] ? el.paths_[2] : null
		this.xnumber    =   el.xnumber


		//if(this.xnumber.name == 'xzero'){
			this.xnumber_value = el.xnumber.value ?  el.xnumber.value : 0;
		//}
		// sum execption cf tree.js
		// console.log(el.xnumber.name)
		// console.log('el.xnumber___ :'+el.xnumber.value)
		
	
		
		this.xnumber_name = this.xnumber.name

		

		if(this.score[this.sign] && this.score[this.sign][this.side] && this.score[this.sign][this.side][this.xnumber_name]){
			 this.score = this.score[this.sign][this.side][this.xnumber_name]
		}
	}


	// same for reco, dec. and shape but in case ..
	if(this.group == 'recognition'){

		

		this.stimuli_type  =   el.paths[1] ? el.paths_[1] : null
		if(this.score[this.stimuli_type]){
			 this.score = this.score[this.stimuli_type]
		}
	}
	if(this.group == 'decimal'){ 
		this.stimuli_type   =   el.paths[1] ? el.paths_[1] : null
		if(this.score[this.stimuli_type]){
			 this.score = this.score[this.stimuli_type]
		}
	}

	if(this.group == 'shape'){ 
		this.stimuli_type   =   el.paths[1] ? el.paths_[1] : null
		if(this.score[this.stimuli_type]){
			 this.score = this.score[this.stimuli_type]
		}
	}


		// "records"


		this.record  = this.score ? this.score : []
		
		// this.getRecords();
		this.forced_pick =false

		if(this.tries > 1){
		 	this.is_completed = false
		 	this.forced_pick = true

		}
		else{
			if(this.record.length > 0){

				var sum = 0;
				for (var i = 0 ; i < this.record.length; i++) {
					sum += this.record[i].score;
					// console.log(this.record[i])
				}
				this.average = sum/this.record.length
				if(this.average > 0.8){
					this.is_completed = true
				}
				else{
					/// this.is_completed = false
				}
			}

		}

	/// BLUR
	this.score = {}
	this.record = {}
		
	
	if(this.is_completed == true){
		/// dont need to contruct round.
	}
	else{
		this.round      =   this.toRound(params)
		if(this.round && this.round.round){
			//console.log(this.round )
			this.hasround   =   true;
		}
	}


	return this;     
}

SkillVariante.prototype.toRound = function (params) {
	var numbers_data = params.numbers_data;
	
	if(params.gameType){
			this.gameType = params.gameType
	}
	var step_suite;

	if(this.group == 'counting'){
	
		switch (this.step) {
		    case 'oneby':
		        step_suite = 1
		        break;
		    case 'twoby':
		        step_suite = 2
		        break;
		    case 'fiveby':
		        step_suite = 5
		        break;
		    case 'tenby':
		        step_suite = 10
		        break;
		}

		var tsuite = new Suite(this.number,10,step_suite,this.from,this.direction, 5, numbers_data, params.available_numbers, this.lang)
		if(tsuite){
			var tround = {
				round: tsuite.round,
				target : this.number,
				path : this.group+'__'+this.direction+'__'+this.step+'__'+this.from
			}
		 }
		else{
			 return null
		}
	}
	else if(this.group == 'recognition'){
		var recognition_round = new Recognition(this.number,this.stimuli_type,this.gameType, params.available_numbers, params.stepDistracterCount, numbers_data, this.lang)

		var tround = {
			target : this.number,
			size: 1,
			round : recognition_round.round,
			path : this.group+'__'+this.stimuli_type
		}
	 }
	 else if(this.group == 'decimal'){
				
		var decimal_round = new Decimal(this.number,this.stimuli_type,  params.available_numbers, params.stepDistracterCount, numbers_data, this.lang)
		var tround = {
			target : this.number,
			size: 1,
			decimalGame: true,
			round : decimal_round.round,
			path : this.group+'__'+this.stimuli_type
		}
		
	}

	else if(this.group == 'sum'){
		var _side = ''
		// console.log(this.side)
		if(this.side == 'lefts'){
			_side =  'left'
		}
		if(this.side == 'rights'){
			 _side =  'right'
		}
		//  console.log(this)

		
		var s 	= new Sum(this.number,this.xnumber,_side, this.sign, numbers_data, params.available_numbers, params.stepDistracterCount, this.lang)
		var tround  = {
			target : this.number,
			size: 1,
			round: s.round,
			path : this.group+'__'+this.sign+'__'+this.side+'__'+this.xnumber_name
		}
	}
	else if(this.group == 'shape'){
		var shape_round = new Shape(this.shape, this.stimuli_type, params.available_shapes, params.stepDistracterCount, params.shapes_data, this.lang)
		var tround = {
			target : this.shape,
			// shape_score : this.score,
			size: 1,
			round: shape_round.round,
			path : this.group+'__'+this.stimuli_type
		}
	}
	return tround
}

module.exports =  SkillVariante;
