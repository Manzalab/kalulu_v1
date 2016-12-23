
var _ = require('underscore')


var FakeNumbersData = function(lang){

	var numbers_data = {}
	var data_gen = _.range(101);

	_.each(data_gen, function(n){
		var t = {
				"VALUE" : n,
				"soundPath": '..../'+lang+'/'+n+'.ogg'
		}
		numbers_data[n] = t
	})
	return numbers_data;

}


// console.log( new FakeNumbersData() )
module.exports =  FakeNumbersData;
