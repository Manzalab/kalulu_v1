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
	
	// console.log(config)
	
	// repool "count"	
	var tries = 0;

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
		if(temp_rounds_results.length == 0){
			console.log('Score completed, no round anymore, loop on already valid targets (force)')
			var temp_rounds_results = pool_loop(2)
			//out.tries_results[tries] = temp_rounds_results
			// out.forced_pool = 2		
		}
		
		//if(temp_rounds_results.length == 0){
			
		//		var end = {'norounds': true}	
		//		return end
		// }
		else{
			while(game.data.rounds.length <= params.roundsCount  ){ //  && tries < 4
				tries++
				console.log(temp_rounds_results)
				// refill with the same.
				_.each(temp_rounds_results, function(r){
					game.data.rounds.push(r)
				})	
			}
		}
		// console.log('try round lenght : '+temp_rounds_results.length)
	// 
	game.data.rounds = _.sample(game.data.rounds, params.roundsCount)
	console.log('rounds length : '+game.data.rounds.length)
	return game;
}
module.exports = Kalulu_maths