/*

 return rounds for decimal games
 params : 
 	number 				= target number 
 	number_available    = "filter only" notions available 

*/



var _ 			= require('underscore')
var Distractor 	= require('./distractor.js')
var ModuleUtils = require('./module_utils.js')

var Decimal = function(number,  stimuli_type, numbers_available, count,  numbers_data, lang){
	 
	 this.moduleutils 	= new ModuleUtils()
	 this.number 		= number
	
	 this.stimuli_type 	= stimuli_type
	 this.numbers_data 	= numbers_data

	 // NON SENS UNDER 12 
	 if(this.number < 10 || this.number == null){
		return this;
	 }	
 	//console.log(this.number)

	var n 		= number.toString()
	var dec 	= parseInt(n[0])
	var unit 	= parseInt(n[1])
	var that 	= this

	var dec_d   = new Distractor(dec, numbers_available, count, true)
	//console.log(numbers_available)
	//console.log(count)

//	console.log(dec_d)
	var out 	= { 
					'pre_round' : [ 
						{
							'name': 'decimal',
							'value': (dec*10).toString(), 
							'realValue' :this.number,
							'distractors': new Distractor(dec, numbers_available, count, true)
						},
						{ 	'name': 'unit',
							'value': unit.toString(),
							'realValue' :unit,
							'distractors': new Distractor(unit, numbers_available, count)
						}, 
					]
	}

	if(out.pre_round){
		 
		/// var steps = []
		var round = {"steps": []}
		// var step_decimal = {"type": that.stimuli_type, "stimuli": [] }
		// var step_unit 	 = {"type": that.stimuli_type, "stimuli": [] }
		var step	 = {"type": that.stimuli_type, "stimuli": [] }

		// [dec, unit] 

		// var dec_array = ['decimal', 'unit'];

		steps_ = [];


		_.each(out.pre_round, function(r,ri){

			var st = {};
			st.stimuli = []

			// var true_ = { value: 'true'}

			var true_ =  that.moduleutils.addStimuli(true , r.value, 'number',that.numbers_data)
			if(r.value  !==null && r.name == 'unit' ){
				true_.realValue = r.value
			}
			if(r.value !==null && r.name == 'decimal' ){
				true_.realValue = r.realValue
			}




			st.stimuli.push(true_)


			_.each(r.distractors, function(d){
				//console.log(d.value)
				if(that.numbers_data[d.value]){

				}
				else{
					d.value = '';
				}
				var ff =  that.moduleutils.addStimuli(false , d.value, 'number',that.numbers_data)
				st.unitOrDecimal = r.name;

					if(d.value  !==null && r.name == 'unit' ){
						ff.realValue = d.value
					}
					if(d.value !==null && r.name == 'decimal' ){
						ff.realValue = that.number.toString()
					}
				//st.realValue = that.number
				ff.path    = that.stimuli_type
				st.stimuli.push(ff)
 			
			})

			steps_.push(st)
		})
		 round.steps = steps_



		// round.steps.push(step)
		round.targetSequence = {
				gameType        : that.stimuli_type, 
				targetNumber 	: that.number.toString()
		}
		round.target = {
				gameType        : that.stimuli_type, 
				targetNumber 	: that.number.toString(),
				// soundPath: "assets/sounds/maths/number_54.ogg",
               //  correctResponse: true
		}

		if(round.target.targetNumber !=='null'){
			out.round = round
		}
		
	}

	return out;
}
module.exports =  Decimal;
