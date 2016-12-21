
/*

	Generic decorator class for stimulis object (correct/incorrect)
	and optionnaly fake apparitions for debug
	
	Used (yet) by : 
		* recognition
		* shape
		* suite
		* decimal
	todo :
		* sum ????

*/


var _ = require('underscore')

var ModuleUtils = function(){
	return this;
}
	
	// dataset can be either numbers_ or shapes_
	ModuleUtils.prototype.addStimuli = function (isCorrect, distractorvalue_or_object, dataobject, dataset, path) {

		value_ = distractorvalue_or_object
		var out = []
		var st = {
			"value"				: value_,
			"correctResponse"	: isCorrect,
			"stimuli_type"		: dataobject,
			"apparitions"		: this.addFakeApparitions(isCorrect,1, 'perfect_all') //perfect_nothing
		}
		if(value_ !==null){
			// console.log(dataset[value_])
			st.nonSymbolicImage	= 'todo/'+dataobject+'/data/'+value_+'.jpg'
		 	st.soundPath =  dataset[value_].soundPath
		
		}

		if(dataobject == 'number' && path){
			st.path = path
		}
		if(dataobject == 'sum' && path){
			st.path = path
		}
		if(dataobject == 'shape' && path){
			st.path = path
		}

		return st;
	}


	ModuleUtils.prototype.addFakeApparitions = function (isCorrect, count, mode) {
		// console.log('addFakeApparitions')

		var out = []
		
		if(mode == 'prod'){
				return out
		}

		while(out.length < count  ){ 
			var rand_click = Math.random() >= 0.5;


			/// simulate all wrong ! 
			// each clicked on incorrect / notclicked on correct
			
			var apparition ={
				'elapsedTime'	: 1000,
				'isCorrect'		: isCorrect,
				'isClosed'		: true,
				'exitTime'		: 1566
			}

			if(mode == 'perfect_nothing'){
				apparition.isClicked = !isCorrect; 
			}
			else if(mode == 'perfect_all'){
				apparition.isClicked = isCorrect;
			}
			else{
				apparition.isClicked = rand_click
			}	
			out.push(apparition)		
		}
		return out; 
	}

module.exports =  ModuleUtils;