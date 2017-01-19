/*

Module main entry file

Generate a "tree of skills" and returns rounds 


*/
var _ 					= require('underscore')
var  SkillTree 			= require('./skill/tree.js')
var FakeNumbersData  	= require('./fakenumbersdata.js')
var FakeScore 			= require('./fakescore.js')
var FakeShapesData 		= require('./fakeshapesdata.js')

var Kalulu_maths = function(available_numbers, score, numbers_data__, params___, config ){
	//console.log('numbers_data__')

	//console.log(numbers_data__)
	
	// repool "count"	
	var tries = 0;

	console.log('available_numbers size '+available_numbers.length)
	//console.log('numbers_data__ size '+numbers_data__.length)

	/// FAKE numbers data.
	//var numbers_data 	= new FakeNumbersData()
	
	var score 			= score
	/// new FakeScore()
	//console.log(numbers_data)
	///// used for distractors filter setup....
	var filter_number_value  =[]
	_.each(available_numbers, function(an){
		filter_number_value.push(parseInt(an["VALUE"]))
	})

	
console.log('params___.roundsCount'+params___.roundsCount)

	/// RE-SETUP incoming 'params___'  ... progressive fine tuning ..

      var params = {
 	  		available_numbers 				: filter_number_value,
           	available_skills				: params___.available_skills, //['forward','oneby'],
            available_shapes				: ['circle', 'square', 'triangle'],
            shapes_data						: new FakeShapesData(config.language),
            numbers_data 					: new FakeNumbersData(config.language),
            gameType                        : params___.gameType, // "identification", "composition", "pairing", or "other"
            roundsCount                     : params___.roundsCount,           // the amount of rounds, (Rafiki will provide one target per round)
            stepDistracterCount             : params___.stepDistracterCount,             // 
            groupGameType  					: params___.groupGameType, // 'recognition'    
      		language 						: config.language,
      		parakeetPairs					: params___.parakeetPairs ? params___.parakeetPairs : null

      }


	
	var game = {
			"gameId": params___.gameType,
			"gameGroup": params.groupGameType,
			"discipline" : "maths",
			"language": config.language,
			"data": { "rounds": []}}


// using numbers OR shape tree .. 
var loop_on = 'available_numbers'
if(params.groupGameType == 'shape'){
	loop_on = 'available_shapes'
}


var loop_on_array = params[loop_on]



	function pool_loop(tries){
	    var temp_rounds = []
		_.each(loop_on_array, function(n){
				
			 // var n_ = n["VALUE"]
				

				var root = {
				//	number 	 			:n_,
				//	shape 				:n,
					group    			:params.groupGameType,
					name     			:params.groupGameType,
					paths				:'',
					available_skills 	:params.available_skills,
					score: score,
				}

				if(loop_on == 'available_numbers'){
					root.number = n
					root.shape = null
				}


				if(loop_on == 'available_shapes'){
					root.number = null
					root.shape = n
				}

				var sktree = new SkillTree(root, 0, tries, params)
				if(sktree.lowest){						
					temp_rounds.push(sktree.lowest.skillvariante.round.round)
				}	
		})
		return temp_rounds;
	}
	//var loop_on = available_numbers

		var temp_rounds_results = [];
		var temp_rounds_results = pool_loop(tries)
		//console.log(temp_rounds_results)
		//// patch 


		if(params.gameType == 'parakeets'){


			console.log('params___.parakeetPairs ='+params.parakeetPairs)
			console.log(temp_rounds_results.length)

			if(temp_rounds_results.length < params.parakeetPairs){
				console.log('not enough parakeets')
				var temp_rounds_results = pool_loop(2)
				console.log('parakeets after re-pool:'+temp_rounds_results.length)
			}
			temp_rounds_results = _.shuffle(temp_rounds_results)

			var mixed_steps = {steps: [ { "type": "mixed", "stimuli": []}]}

			_.each(temp_rounds_results, function(r, ri){
				if(ri<params.parakeetPairs ){
				    // console.log(r.steps[0].stimuli)
					// parakeetPairs
					mixed_steps.steps[0].stimuli.push(r.steps[0].stimuli[0])
				}	
			})
			game.data.rounds.push(mixed_steps)


		}
		else{

			if(temp_rounds_results.length == 0){
				console.log('Score completed, no round anymore, loop on already valid targets (force)')
				temp_rounds_results = pool_loop(2)
				console.log('Score completed force results'+temp_rounds_results.length)

				//out.tries_results[tries] = temp_rounds_results
				// out.forced_pool = 2		
			}


			while(game.data.rounds.length < params.roundsCount  ){ //  && tries < 4
					tries++
					//	console.log(params.roundsCount)
					//	console.log(temp_rounds_results)
					/// shuffle rounds between loops :) 
					temp_rounds_results = _.shuffle(temp_rounds_results)

					// refill with the same N times.
					_.each(temp_rounds_results, function(r){
						game.data.rounds.push(r)
					})	
			}
			game.data.rounds = _.sample(game.data.rounds, params.roundsCount)
		}

	// 
	console.log('rounds length : '+game.data.rounds.length)
	return game;
}
module.exports = Kalulu_maths