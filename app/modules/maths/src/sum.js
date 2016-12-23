var _ 				= require('underscore')
var Distractor 		= require('./distractor.js')
var ModuleUtils 	= require('./module_utils.js')


// sums skill test A +/- B = C
// with B OR C as 'hidden' value
// @params
// 	NUMBER params is the "first" number target (0>10)
// 	X NUMBER is a both a skill AND a number (0>10)
// 	side (left or right) 
// 	sign 

// @return 
// a round object
// 

var Sum = function(number, xnumber, side, sign, numbers_data, numbers_available, count){

	this.number 		= parseInt(number) ? parseInt(number) : 0
	this.xnumber 		= xnumber ? parseInt(xnumber) : 0
	this.side			= side

	this.xnumber_value 		= xnumber.value ? parseInt(xnumber.value) : 0
	this.xnumber_name		= xnumber.name
	if(this.number > 10){
			return null
	}


	// console.log(this.number+'//'+this.xnumber.name+'//'+this.side)

	/// numbers_available
	var filter_number_value  =[]
	_.each(numbers_available, function(an){
		if(an <= 10){
			filter_number_value.push(an)
		}
		
	})
	this.filter_number_value = filter_number_value
	if(sign=='addition'){
		 this.sign = '+'
	}
	else{
		this.sign = '-'
	}


	moduleutils 		= new ModuleUtils()
	var round			= {"steps": []}
	var step			= {"type": 'target__'+this.number+'__sum__'+this.side+'__'+this.sign+'__'+this.xnumber_name, "stimuli": [] }
	

	var la, lb, lc;

    li = this.number //la+lb
    var parts = this.picksum(this.number, this.xnumber_value, this.side, this.sign)
		
    if(parts.exception == true){
    	return null
    }
	//console.log(parts)
	//return 
	la = parts.first
    lb = parts.second
    lc = parts.third

    lx = 'x'
    var resolve_true = la+''+this.sign+''+lb+'='+lc


  
    this.lpath = {'xnumber':this.xnumber_name, 'number': this.number, 'side': this.side, 'sign': this.sign}
	
	var st =  moduleutils.addStimuli(true , this.number, 'sum', numbers_data, this.lpath)
	
	st.value = resolve_true

	step.stimuli.push(st)

	var distractors = new Distractor(this.number, this.filter_number_value, count, false )

    var that = this
	if(distractors){
		_.each(distractors, function(d){
			var st =  moduleutils.addStimuli(false , d.value, 'sum',numbers_data,that.lpath )
			// to fix again.

			st.value = d.value
			step.stimuli.push(st)
		})
	}


	round.steps.push(step)
	round.targetSequence = {
		gameType       : 'sum', 
		targetNumber   : this.number
	}
	
  	this.round = round
	return this 
}
Sum.prototype.picksum = function (number, xnumber, side, sign) {

	

	if(side =='right'){

		var first  	=  number
		var second 	=  xnumber

		
		if(sign == '+'){
			var third =  number+xnumber
		}
		else{
			var third =  number-xnumber
		}

		if(third < 0 ){
		//	console.log('neg sum exception')
		}
		var parts = {
			first 	: first,
			second	: second,
			third	: third,
			exception : (third < 0) ? true : false
		}
		
	}

	if(side =='left'){
		
		var first  = xnumber
		
		//var second =  xnumber
		if(sign == '+'){
			var second =  number-xnumber
		}
		else{
			var second =  number+xnumber
		}

		if(second < 0 ){
		//	console.log('neg sum exception')
		}

		var parts = {
			first   : first,
			second	: second,
			third	: number,
			exception : (second < 0) ? true : false
		}	
	}
	return parts;
}

module.exports =  Sum;
