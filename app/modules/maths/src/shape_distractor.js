
// ShapeDistractor generate distractors for a shape.
// light-logic implementation ....
// pick each shape once from available_shapes array
// add null values as fallback. (using while < count)

// high logic : todo
// >> pick several times from available_shapes source array


var _ = require('underscore')
var ShapeDistractor = function(shape, available_shapes, count){
	 //console.log('building '+shape+' distractors variante')
	 
	 // return init
	 var out = []

	 // remove target from source array
	 var filtered_available_shapes = _.without(available_shapes, shape)
	 
	 // 
	 _.each(filtered_available_shapes, function(shape_){
		var distractor = {
			'value': shape_
		}
		out.push(distractor)
	})

	// "forced 'null' filling" while..
	while(out.length < count){
		var distractor = {
			'value': null
		}
		out.push(distractor)
	}
	return out
}
module.exports =  ShapeDistractor;
