
var _ = require('underscore')
var jsonfile = require('jsonfile')
jsonfile.spaces = 4
var filescore = '../data/distractors_test.json'

var Distractor = require('../distractor.js')

var available_numbers = [86] // ,2,7,56,99
var numbers_available_distractors=[0,1,2,3,5,4,6]

var d_ = []


_.each(available_numbers, function(n){
		var dl = new Distractor(n,numbers_available_distractors, 12, false)

		var d = {
			from :numbers_available_distractors,
			target:n,
			d : dl
		}

		d_.push(d)
})

jsonfile.writeFile(filescore, d_, function (err) {
	console.error(err)
	if(!err){
		console.log('skillgroup.json written ! ')
	}
})