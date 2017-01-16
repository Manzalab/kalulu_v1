/*


Draw and loop through a recursive tree of skills and return the "lowest" branch
(at the deepest level, a branch has a "leaf" === skillvariante. )

*/

// module dependencies
var _ = require('underscore')
var  SkillVariante = require('./variante.js')


var SkillTree = function(el,depth, tries, params){
	
	// console.log(params)


	
	this.depth 		= depth ? depth : 0
	this.isleaf 	= true;

	
	if(el.paths){
		this.paths 	= el.paths+'__'+el.name
	}
	else{
		this.paths 	= el.name
	}
	this.number 	= el.number ? el.number : 0;
	this.shape 		= el.shape ? el.shape : 'null' ;


	this.name 		= el.name
	this.children 	= el.children ? el.children : []
	this.group 		= el.group
	this.score 		= el.score ? el.score : {}
	
	this.unlocked = el.unlocked ? el.unlocked : false;
	


	var lefts				=  {'name':'lefts'}
	var rights 				=  {'name':'rights'}

	var addition			=  {'name':'addition'}
	var substraction 		=  {'name':'substraction'}

	var xone 				=  {'name':'xone', 'value':1}
	var xtwo 				=  {'name':'xtwo', 'value':2}
	var xthree 				=  {'name':'xthree', 'value':3}
	var xfour 				=  {'name':'xfour', 'value':4}
	var xzero 				=  {'name':'xzero', 'value':0}

	var xfive				=  {'name':'xfive', 'value':5}
	var xsix				=  {'name':'xsix', 'value':6}
	var xseven				=  {'name':'xseven', 'value':7}
	var xeight 				=  {'name':'xeight', 'value':8}
	var xnine 				=  {'name':'xnine', 'value':9}
	var xten 				=  {'name':'xten', 'value':10}

	var forward 			=  {'name':'forward', 'direction':'forward'}
	var backward 			=  {'name':'backward', 'direction':'backward'}
	
	var oneby 				=  {'name':'oneby', 'value':1}
	var twoby 				=  {'name':'twoby', 'value':2}
	var fiveby 				=  {'name':'fiveby', 'value':5}
	var tenby				=  {'name':'tenby', 'value':10}
	
	var zero 				=  {'name':'zero', 'from':'0'}
	var multiple 			=  {'name':'multiple', 'from':'multiple'}
	var random 				=  {'name':'random', 'from':'random'}

    var audioToNonSymbolic		=  {'name':'audioToNonSymbolic'}
	var nonSymbolicToSymbolic	=  {'name':'nonSymbolicToSymbolic'}
	var audio_symbolic 			=  {'name':'audio_symbolic'}
	var recognition_types 		=  [audioToNonSymbolic, nonSymbolicToSymbolic, audio_symbolic]
	var recognition_typesDecimal =  [audioToNonSymbolic, nonSymbolicToSymbolic, audio_symbolic]



	var from_types 			= [zero, multiple, random] 	
	var step_types 			= [oneby, twoby, fiveby, tenby] 	
	var directions 			= [forward, backward]
	var x_types 			= [xone, xtwo, xthree, xfour, xzero,  xfive, xsix, xseven, xeight, xnine, xten]
	var sum_types 			= [lefts, rights]
	var sum_signs 			= [addition,substraction]


	/// subarray contains ths child tree array to loop on 
	//  depending on the group and depth

	var subarray = []

	if(this.group == 'shape' ){
		// this.max_depth = 0;
		this.max_depth = 1;
		this.unlocked = true
		
		
			if(this.depth == 0){
				this.isleaf = false;
				subarray = recognition_types
				// console.log('tree for shape depth 0')
				this.score = this.score[this.shape] 
			}
			if(this.depth == 1){
				// console.log('tree for rctype for shape')
				
			}

		
	}

	if(this.group == 'recognition' ){
		this.max_depth = 1;
		this.unlocked = true
		
		if(this.name == 'recognition'){

			subarray = recognition_types

			if( (params.gameType == 'crabs' || params.gameType == 'jellyfish') && this.number > 6){
				
				subarray = _.without(subarray,recognition_types[0])
				subarray = _.without(subarray,recognition_types[1])
				
			//	console.log('filter sub_array stimuliToStimuli target for '+params.gameType)
			//	console.log(subarray.length+' for value '+this.number)
			}

			if( params.gameType == 'crabs'){
				subarray = _.without(subarray,recognition_types[1])

			}



			
			//console.log(subarray.length+' for value '+this.number)

		
			this.isleaf = false;
		}
	
	}
	if(this.group == 'decimal' ){

		this.max_depth = 1;
		this.unlocked = true
		if(this.name == 'decimal'){
			subarray = recognition_types
			this.isleaf = false;
		}
		
		

	}
	if(this.group == 'sum' ){
			
		this.max_depth = 3;
		this.unlocked = true

		if(this.name == 'lefts' || this.name == 'rights'){
			subarray = x_types 
			this.isleaf = false;
		}
		else if(this.name == 'addition' || this.name == 'substraction'){
			subarray = sum_types
			this.isleaf = false;
		}
		else if(this.name == 'sum'){
			subarray = sum_signs 
			this.isleaf = false;	
		}
	}
	if(this.group == 'counting' ){
			
		this.max_depth = 3;
		if(this.name == 'forward' || this.name == 'backward'){

			if( _.contains(params.available_skills ,this.name)){
				this.unlocked = true;
				//console.log('av_________'+this.name)
			}
			else{
				this.unlocked = false;
				//console.log('----------ava'+this.name)
			}
			subarray = step_types
			this.isleaf = false;
		}
		else if(this.name == 'oneby' || this.name == 'twoby'){

			if( _.contains(params.available_skills ,this.name)){
					this.unlocked = true;
					//console.log('av_________'+this.name)
			}
			else{
				this.unlocked = false;
				//	console.log('----------ava'+this.name)
			}
			subarray = from_types 
			this.isleaf = false;
		}
		else if(this.name == 'counting'){
			this.unlocked = true;
			subarray = directions
			this.isleaf = false;
		}

	}

	if(this.group !== 'shape' ){
		if( this.score[this.number] ){
			this.score = this.score[this.number][this.name]
			//console.log('has score for #'+this.number+'--'+this.name)
		}
	}

	else{
		//console.log('no score for '+this.name)
		//console.log(this.score)
		// this.score[this.number] = false
	}

	if(depth == this.max_depth){		
		this.paths_ = this.paths.split("__");


	}

	for (var subarray_i =0;  subarray_i < subarray.length;  subarray_i++) {

		var  pa_ = subarray[subarray_i]
		//console.log('>>this.score'+pa_.name+this.depth )
		//console.log(this.score)


		// MAYBE EXCLUDE SOME Stimuli/stimuli here..

		
		var root = {
		    paths :this.paths,
			group: this.group,
			name : pa_.name,
			score: this.score,
			number: this.number,
			shape : this.shape,
			unlocked : this.unlocked
		}

		// special sum patch
		
		var c = new SkillTree(root, depth+1, tries, params)

		

		// todo : clean to (max_depth - 1 == xx)
		if((this.depth == 0 && this.group == 'shape'  ) ||  (this.depth == 2 && this.group == 'sum') ||  (this.depth == 2 && this.group == 'counting') || ( this.depth == 0 && this.group == 'recognition') || ( this.depth == 0 && this.group == 'decimal') ) {
			//	console.log(c.parent)
			
			//c.is_completed = false
			c.has_no_score = true

			if(pa_.value){
				c.setupValue = pa_.name

			}

			if(this.group == 'sum' && pa_.name ){
				// special setup for 'sum' to avoid xnumbers-values translation
				// pass full object {name, value}
				c.xnumber = pa_
			}
			

			c.tries =  tries
			c.skillvariante = new SkillVariante(c,params)
			/// ???? buggy .... 
			c.is_completed = c.skillvariante.is_completed

		}
		this.children.push(c)	

	}
	if(this.children.length > 0 ){

		this.is_completed = true
		if( (this.depth == 2 && this.group == 'counting') || (this.depth == 2  && this.group == 'sum')  || (this.depth == 0  && this.group == 'recognition')  || (this.depth == 2  && this.group == 'sum')  || (this.depth == 0  && this.group == 'decimal') || this.depth == 0  && this.group == 'shape'  ){	

					var test = _.filter(this.children, function(c){ 
						
						if(c.is_completed == false && c.unlocked == true && c.skillvariante.hasround == true){
								return c
						};
					

					});
					if(test.length > 0 ){
						this.is_completed = false

						if(tries>1){
							// Randomize skill pooling if all completed instead of first match.
							// random array index to avoid picking in the index[0] lowest skill..
							var random_lowest = (Math.floor(Math.random() * (test.length )));

							// console.log('randomize pooling random lowest: #'+random)
							// console.log(test[random])

							this.lowest = test[random_lowest]
						}
						else{
							this.lowest = test[0]
						}
						
						
					}
					else{
						this.lowest = null
					}		
		}
		

		else{	
					var test = _.filter(this.children, function(c){ 
						
						if(c.lowest && c.unlocked == true){
								return c
						};

					});

					if(test.length > 0 ){
						this.is_completed = false

						if(tries>1){
							// Randomize skill pooling if all completed instead of first match.
							// random array index to avoid picking in the index[0] lowest skill..
							var random_lowest = (Math.floor(Math.random() * (test.length)));

							// console.log('randomize pooling random lowest: #'+random)
							// console.log(test[random])

							// this.lowest = test[random_lowest].lowest
							this.lowest = test[random_lowest].lowest
						}
						else{
							this.lowest = test[0].lowest
						}
						
					}
					else{
						this.lowest = null
					}
		
		}
	}
	else{
	}

	if(this.name == 'recognition' || this.name == 'sum' || this.name == 'counting' || this.name == 'shape' ){
		  this.score = ''
	}

}

module.exports =  SkillTree;


