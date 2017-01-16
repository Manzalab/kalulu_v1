/*

Generate a suite array with multiple params...

n 	 				: target
size 				: expected size (20)
step 				: 1,2,5,10  
direction 			: 'forward' || 'backward' 
distractor_count 	: ""
numbers_data		
numbers_available (for distractor)

*/

var _ = require('underscore')
var Distractor = require('./distractor.js')
var ModuleUtils 	= require('./module_utils.js')

var Suite = function(n,size,step,from,direction, distractors_count, numbers_data, numbers_available_, lang){
   this.number_data = numbers_data

   this.moduleutils = new ModuleUtils()
   
   this.numbers_available_ = numbers_available_
   this.n = n;
	// setting "from" parameters

	if(from == 'zero'){
		var size = 10

	}
	if(from == 'multiple'){
		var size = 4
		if(direction =='backward'){
			//var size = 4
		}	 
	}
	if(from == 'random'){
		var size = 4
		if(direction =='backward'){
			//var size = 4
		}
	}

	var optimist_suite = []
	var random_tail;
	var has_zero = false
	var has_zero_index = -1 
	var size_enough = true;

	var available = true;
	

	var available_from_multiple = true;
	var available_from_random = true;

	var available_first_index = -1;
	var available_last_index = -1;


	for (var s =0; s < 10; s++) {
		// var n_previous = n-((s-1)*step)
		var v = n-(s*step)
		if(direction =='backward'){
			var v = n-(s*-step)
		}
		
		if(direction =='backward' && from=='zero' && s<4){
				// optimist_suite.push(v+'__')

		}

		if(v==0){
			has_zero = true
			// has_zero_index = s+1
			available_last_index  = s+1

			// available_from_zero_size = s+1
			// available_from_random_best = s
			//has_zero_indexnotzero = s-1
		}


		if(v >= 0 && v<100){
			
			optimist_suite.push(v)
			
			if(v == 0){

				// use previous best to avoid 0.
				//available_from_multiple_best =  v+step
			}
			else{
				//available_from_multiple_best = 0
			}


			if(size >= s && from == 'multiple' ){
				//available_from_multiple_best = v
				// available_from_random_best = v
				
			}

			if(from=='zero' ){
				
			}
			if(from == 'random' || from == 'multiple' ){

				// loop before the min length
				if(s < size){
					//available_last_index  = 'no'+s
				}
				
				// the last loop (20)
				else if(s == size){
				//	v = 'this'
					available_first_index = s+1
					available_last_index  = s+1

				}
				// after 4 
				else{
					available_last_index  = s+1
				}
				
			}
		}
	}

	

	if(from !== 'zero'){

			if(direction=='backward'){


			}
			else{
				
			}
	}
	
	if(optimist_suite.length < 4){
    	size_enough = false
    	available = false;
    }

    if( from == 'zero' && has_zero == false ){
    	available = false;
    }

    if (available == false) {
    	return 
    };


    // available_from_multiple_shortest = optimist_suite[4]



   var sequence = optimist_suite.reverse();

	if(from !== 'zero'){
		
		// three passes random to reduce suite "tail" (length)
		for(var t=0; t<2; t++){

			// var max = Math.floor(parseInt(available_last_index))/3
		   	var length_delta = -(4-(optimist_suite.length))
		   	var tail = (Math.floor(Math.random() * (length_delta + 1)));
		   	//console.log('final lenght:'+ tail)
			optimist_suite = optimist_suite.slice(tail);
			// console.log(optimist_suite)
		}
		sequence = optimist_suite
	}



   var splited_sequence = ''

   //console.log(sequence)
   var steps = []
   var round = {"steps": []}
   var that = this;
		var lpath =  {'from': from, 'step': step, 'direction': direction}

   	_.each(sequence, function(seq, seq_i){
   	   		
   		splited_sequence += seq
		if(sequence.length !== seq_i+1){
			splited_sequence +='-'
		}

		var stimuli = {}
		var step = {"stimuli": [] }

		

		var st =  that.moduleutils.addStimuli(true , seq, 'number',numbers_data, lpath, lang)
		step.stimuli.push(st)

	    /// distractors
		//console.log(that.numbers_available_)
	    var distractors = new Distractor(seq, that.numbers_available_,distractors_count, false)
	    // console.log(distractors)
	    // console.log('that.n '+that.n)
	    if(distractors){
	        _.each(distractors, function(d){
	    	 	if(numbers_data[d.value]){		
				}
				else{
					d.value = ''
				}
				var st =  that.moduleutils.addStimuli(false , d.value, 'number',numbers_data, lpath, lang)
				step.stimuli.push(st)
	        })
		}
    
    	round.steps.push(step)

   	})
   





   round.targetSequence = {
   		id           : direction+'__'+step+'__from__'+from,
        value        : splited_sequence,
        length       : optimist_suite.length,
        targetNumber : n,
        length_delta : length_delta,
        tail 		 : tail

   }
 	//console.log(round)


	var suite_object = {
	    	'number' :n,
	    	'round': round,
	    	'size':optimist_suite.length,
	    	//'has_zero' : has_zero,
	    	//'has_zero_index':has_zero_index,
	    	'sequence' : sequence,
	    	// 'size_enough' : size_enough,
	    	'available': available,
	    	//'available_from_zero_size': available_from_zero_size,
	    	//'available_from_multiple':available_from_multiple,
	    	//'available_from_random':available_from_random,
	    	//'available_first_index':available_first_index,
	    	//'available_last_index':available_last_index,
	    	//'random_tail' : random_tail,
	    	//'available_from_multiple_shortest':available_from_multiple_shortest,
	    	'path' : n+'____'+direction+'___'+step+'by__from_'+from
	 }
   	 return suite_object;
}
module.exports =  Suite;
