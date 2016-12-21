/*

SUITES Class test file.

Write a json from single or multiple rounds results

*/



var _ = require('underscore')
var Suite = require('../suites.js')
var jsonfile = require('jsonfile')
jsonfile.spaces = 4
var filescore = '../data/suite_gen.json'

var FakeNumbersData = require('../fakenumbersdata.js')

/// FAKE numbers data.
var numbers_data = new FakeNumbersData()


// var Bucket_size = require('./bucket_size.js')
// var bucket = new Bucket_size()

single("caterpillar")

function single(gameId){
	
	var game = {
		"gameId": gameId,
		"discipline" : "maths",
		"data": { "rounds": []}}
	
	//// var Suite(n,size,step,from,direction,distractors_count)

	var suite 			  = new Suite( 5,8,1,'zero','addition',4, numbers_data)
	var suite_impossible  = new Suite( 1,8,2,'zero','addition',4, numbers_data)
	
		
	if(suite.round){
		game.data.rounds.push(suite.round)
	}
	if(suite_impossible.round){
		game.data.rounds.push(suite_impossible.round)
	}

	jsonfile.writeFile(filescore,game , function (err) {
		console.error(err)
	})

	return game;
}






var suites = []
//multi()


function multi(){

var test_numbers =[1,2,3,5,18,25,30,33,40,41,88,85,90,95,96,97,98,99,100] 	// ,5,6,784


	var test_directions = ['backward'] // , 'backward'
	var test_steps = [1,2,10] // ,2,5,10

    var test_froms = ['zero', 'random']

    var suite_obj = {'numbers': {}}
	for(var n = 0; n<test_numbers.length; n++){
		suite_obj.numbers[test_numbers[n]] = {'directions' : {}}
		console.log(test_numbers[n])
		for(var d = 0; d < test_directions.length; d++){
			    suite_obj.numbers[test_numbers[n]].directions[test_directions[d]]={}
				for(var s = 0; s < test_steps.length; s++){
					suite_obj.numbers[test_numbers[n]].directions[test_directions[d]][test_steps[s]]= {}

					for(var f = 0; f < test_froms.length; f++){


						var t = 'number'+test_numbers[n]+' size'+' dir '+test_directions[d]+'  steps'+test_steps[s]+'By from '+test_froms[f]
						var suite = new Suite( test_numbers[n], 8 ,test_steps[s],test_froms[f],test_directions[d], 5)
						
						var suite_ = {
								'n': test_numbers[n],
								'sequence': suite.sequence,
								'bucket' : suite.bucket,
								'path' : suite.path
						}


						var p_ = {
								'available': suite.available,
								'sequence': suite.sequence,
						}
						suite_obj.numbers[test_numbers[n]].directions[test_directions[d]][test_steps[s]][test_froms[f]]= p_

						

					}
				}
		}

	}

	suites = suite_obj
	jsonfile.writeFile(filescore,suites , function (err) {
		console.error(err)
	})
	return suites;
}

