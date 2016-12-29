
var _ = require('underscore')
var jsonfile = require('jsonfile')
jsonfile.spaces = 4
var gamescore = '../data/skillgame_.json' 
var filescore = '../data/skill_tree.json'

var FakeNumbersData = require('../fakenumbersdata.js')
var FakeShapesData = require('../fakeshapesdata.js')

var FakeScore = require('../fakescore.js')

var  SkillTree = require('../skill/tree.js')
var tries = 0;

var out = {
	count :0,
	count_rounds:0,
	tries: tries,
	debug : [],
	tries_results : {}
}

var config = {
	language 						: 'config_language',

}

//console.log(shapes_data)
var score = new FakeScore()
//console.log(score)
// FAKE NUMBERS

//console.log(numbers_data)

//var target_group = ['sum']
	  var available_numbers  = [0,1,2,3]
 	  var params = {
 	  		available_numbers 				: available_numbers,
           	available_skills				: ['forward', 'oneby'],
            available_shapes				: ['circle', 'square', 'triangle'],
            shapes_data						: new FakeShapesData(config.language),
            numbers_data 					: new FakeNumbersData(config.language),
            gameType                        : "DummyGame", // "identification", "composition", "pairing", or "other"
            roundsCount                     : 4,           // the amount of rounds, (Rafiki will provide one target per round)
            stepDistracterCount             : 2,             //
            language 						: config.language,
            groupGameType  					: 'counting'    
      }
    

var game = {
	"gameId": params.gameType,
	"gameGroup": params.groupGameType,
	"discipline" : "maths",
	"language": config.language,
	"data": { "rounds": []}
}



// using numbers OR shape tree .. 
var loop_on = 'available_numbers'
if(params.groupGameType == 'shape'){
	loop_on = 'available_shapes'
}


var loop_on_array = params[loop_on]


function pool_loop(tries){
    var temp_rounds = []
	_.each(loop_on_array, function(n){
			

			var root = {
				group:params.groupGameType,
				name :params.groupGameType,
				paths:'',
				available_skills : params.available_skills,
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
				///console.log(sktree)
		
			// out.tries = tries;
			if(sktree.lowest){
			
			 	out.debug.push(sktree)
				//out.count++
				temp_rounds.push(sktree.lowest.skillvariante.round.round)

			}
			else{
				return null
			}
			//out = sktree
	})
	return temp_rounds;
}
//var loop_on = available_numbers

// game.data.rounds = _.sample(game.data.rounds, 4)

	var temp_rounds_results = [];
	var temp_rounds_results = pool_loop(0)
	//console.log(temp_rounds_results)
	
	out.tries_results[tries] = temp_rounds_results


	//// patch !!! just a copy not re-pooling ...
	//game.data.rounds = _.sample(game.data.rounds, 4)
	// todo check max !!!! 
	if(temp_rounds_results.length == 0){
		var temp_rounds_results = pool_loop(2)
		out.tries_results[tries] = temp_rounds_results
		out.forced_pool = 2		
	}


	if(temp_rounds_results.length == 0){
				var end = {'norounds': true}	
				return end

	}
	else{
		while(game.data.rounds.length < params.roundsCount  ){ //  && tries < 4
				tries++

				_.each(temp_rounds_results, function(r){
					game.data.rounds.push(r)
					out.count_rounds++

				})	
			}

	}


	// console.log('try round lenght : '+temp_rounds_results.length)
	 
console.log('final round lenght : '+game.data.rounds.length+' tries'+tries+' forced pooling'+out.forced_pool)

out.tries = tries;


jsonfile.writeFile(filescore,out, function (err) {
	console.error(err)
	if(!err){
		console.log(filescore+' written ! ')
	}
})

jsonfile.writeFile(gamescore, game, function (err) {
	console.error(err)
	if(!err){
		console.log(gamescore+' written ! ')
	}
})