/*

DECIMAL GAME Class test file.

> turn a number into two parts (decimal part / unit)

> 45   >>> 4 (40) + 5

> adds distractors .

Write a json file


*/



var _ 					= require('underscore')
var Decimal 			= require('../decimal.js')
var jsonfile 			= require('jsonfile')
jsonfile.spaces 		= 4
var filescore 			= '../data/decimal_gen.json'
var FakeNumbersData 	= require('../fakenumbersdata.js')
var numbers_data 		= new FakeNumbersData('debug_config_lang')

var numbers_available	= [0,2,3,4,5,6,7,8,9,10,60,50,11,98,97,96,95,94,99]


var foo  				= new Decimal(0, 'audioToNonSymbolic', numbers_available, 3, numbers_data, true)
//var foo   			= Decimal( 99, 3, numbers_available)
//var foo__				= Decimal( 15, 3, numbers_available)

console.log(foo)
jsonfile.writeFile(filescore, foo, function (err) {
	//console.error(err)
	if(!err){
		console.log(filescore+' written ! ')
	}
})