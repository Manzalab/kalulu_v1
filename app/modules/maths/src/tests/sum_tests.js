var _ 				= require('underscore')
var Sum 			= require('../sum.js')
var jsonfile 		= require('jsonfile')
jsonfile.spaces 	= 4
var filescore 		= '../data/sum.json'
var FakeNumbersData = require('../fakenumbersdata.js')
/// FAKE numbers data.
var numbers_data 	= new FakeNumbersData('debug_config_lang')


/*

test run on sums 

( a+x = b) > left
( a+b = x) > right

( a-x = b) > left
( a-b = x) > right




*/
var sums = []
var numbers = [0,1,2,3,4,5,6,7,8,9,10,23,65]
var xnumbers = [0,1,2,3,4,5,6,7,8,9,10]

// var xnumber = xnumbers[0]

for(var z = 0; z<=10; z++){
	//console.log(z)
	for(var xz = 0; xz < xnumbers.length; xz++){

	//	console.log('na:'+z+' nb:'+xz)

		for(var side = 0; side <= 1; side++){
			var side_ = 'left'
			
			if(side == 0){
				side_ = 'right'
			}
			
			for(var sign = 0; sign <= 1; sign++){
				// console.log(side)
				var sign_ = 'substraction'
				if(sign == 0){
				 	sign_ = 'addition'
				
				}
				var s = new Sum(z, xz, side_, sign_, numbers_data,xnumbers,3)
				sums.push(s)
			}
		}
	}
}


jsonfile.writeFile(filescore, sums , function (err) {
		if(!err){
			console.log(filescore+' written ! ')
		}
		else{
			console.error(err)
		}
})
//console.log(sums)
return sums;