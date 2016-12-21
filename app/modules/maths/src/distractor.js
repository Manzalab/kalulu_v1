
/*


	the "distractor" function returns an array made of values picked 
	"around" targetValue Number 

	using:
		- two differents distances "near" and "far" forward and backward
		- a "swaped decimals" value (example : 54 > 45) 

	distractors are picked from a source array (distractors_available params)	
	
	OPTION "decimal" > return values * 10 only..
	

	>> return 

*/

// node_modules require
var _ = require('underscore')


var Distractor = function (number, distractors_available, count, decimal) {
	//	count = 7
	
	if(decimal && decimal === true){
		// console.log('decimal mode')
	}

	// "kinds" of distractors
	var loop_kinds = ['easy', 'hard', 'easy_back', 'hard_back', 'swaped']
	// setup kinds of pool 
	var distractors_pool = {}
	_.each(loop_kinds, function(kind){
		distractors_pool[kind] = {
			name: kind,
			pool: [],
			index_:0,
			size_:0
		}
	})
	var distractors_pool_all = []


   
	var stepper = 0

	while(stepper < count){


		var swap;
		if(number > 12 && number < 99){
			var n = number.toString()
			var dec 	= n[0]
			var unit 	= n[1]
			var swap = parseInt(unit+''+dec)
			//var val_swaped = swap
			// console.log('swap')
			//console.log(val_swaped)
		}

		// MAGIC MIX ...
		var keys_values = {
			easy 		: number-(1*(stepper+6) ),
			hard 		: number-(1*(stepper+1)),
			easy_back 	: number+(1*(stepper+4) ),
			hard_back 	: number+(1*(stepper+3) ),		
			swaped 		: swap
		}


		_.each(loop_kinds, function(kind){
			if(keys_values[kind] > 0 && keys_values[kind] < 100 ){
				distractors_pool[kind].pool.push(keys_values[kind] )
				distractors_pool[kind].size_++;
			}
		})

		stepper++;

	}



	var kindmax  = 0
	kindmax = _.max(distractors_pool, function(p){return p.size_}).size_
	//console.log('kindmax == '+kindmax)
	//console.log(kindmax)
	// as long as there is a value in one of the array

	// using the 'kindmax' value as "for loop" maximum		
	for (var s = 0; s <= kindmax ; s++) {
		_.each(loop_kinds, function(kind){
				if(distractors_pool[kind].pool[distractors_pool[kind].index_]){
					var val_ = distractors_pool[kind].pool[distractors_pool[kind].index_]
					var distractor_ = {
						'correctResponse': false,
						'dLevel': distractors_pool[kind].name
					}
					//console.log(val_)
					distractor_.value = val_
					distractors_pool_all.push(distractor_)
					//console.log(distractors_pool[kind].name +'>'+distractors_pool[kind].index_)
					distractors_pool[kind].index_ ++
				}
		})	
	}

	var out = []
	//console.log('dd')
	//console.log(distractors_available)

	//distractors_available = [0,1,2,3]
	_.each(distractors_pool_all, function(candidate){
		//console.log(distractors_available)
		if( _.contains(distractors_available, candidate.value ) ){

			if(  candidate.value == number ){
				//	console.log('//////////////')
			}
			else{
					//console.log(number+'  <>' +candidate.value+' is in')
					// ultimate fix for decimal game (*10 entry)
					if(decimal && decimal === true){
						candidate.value = (candidate.value)*10
					}
					//console.log('pushcandidate')
					//console.log(candidate)

					out.push(candidate)
			}
		
		}

	})

	out = _.sample(out, count);

	/// ultimate push to null value ...
	// force distractor count to "count" elements at least
	while(out.length < count){
		var distractor_d = {
			'correctResponse': false,
			'value': null
		}
		out.push(distractor_d)
	}
	
	
	//out= _.shuffle(out)
	//console.log(out)
	return out
}; 

module.exports =  Distractor;
