
// setup data objects for shapes (soundpath, etc)

var _ = require('underscore')
var FakeShapesData = function(lang){
	var shapes_data = {}
	var data_gen = ['triangle', 'circle', 'square']
	
	_.each(data_gen, function(n){
		var t = {
				////"VALUE" : n,
				"soundPath": '..../'+lang+'/shapes/'+n+'.ogg'
		}
		shapes_data[n] = t
	})
	return shapes_data;
}
module.exports =  FakeShapesData;
