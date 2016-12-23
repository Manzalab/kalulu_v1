var _ = require('underscore')

var FakeScore = function(){

	
var record  = [
                            {
                                "score": 1,
                                "time": 1002
                            },
                            {
                                "score": 1,
                                "time": 1003
                            },
                            {
                                "score": 1,
                                "time": 1002
                            },
                            {
                                "score": 1,
                                "time": 1002
                            },
                            {
                                "score": 0,
                                "time": 1002
                            },
                            {
                                "score": 1,
                                "time": 1002
                            }
                        ]
var record_not_av   = [
                            {
                                "score": 0,
                                "time": 1002
                            },
                            {
                                "score": 1,
                                "time": 1002
                            }
                        ]

    var score = {
          
      0 : {   
          'counting': {
              'forward': { 
                'oneby': { 'zero':[], 'random':[], 'multiple':[]}, 
                'twoby': { 'zero': [], 'random':[], 'multiple':[]},
                'fiveby': { 'zero': [], 'random':[], 'multiple':[]},
                'tenby': { 'zero': [], 'random':[], 'multiple':[]} 
              },
              'backward': { 
                'oneby': { 'zero': [], 'random':[], 'multiple':[]}, 
                'twoby': { 'zero': [], 'random':[], 'multiple':[]},
                'fiveby': { 'zero': [], 'random':[], 'multiple':[]},
                'tenby': { 'zero': [], 'random':[], 'multiple':[]} 
              },
          },
          'sum': {
              'addition' : {
                'lefts' : {'xone':record,'xtwo':record, 'xthree': record, 'xfour': record, 'xfive': record, 'xsix':record, 'xseven': record, 'xeight': record, 'xnine':record, 'xten':record, 'xzero': record },
                'rights': {'xzero':record,'xone':record,'xtwo':record, 'xthree': record, 'xfour': record, 'xfive': record, 'xsix':record, 'xseven': record, 'xeight': record, 'xnine': record, 'xten':record}
              },
              'substraction' : {
                 'lefts' : {'xone':record,'xtwo':record, 'xthree': record, 'xfour': record, 'xfive': record, 'xsix':record, 'xseven': record, 'xeight': record, 'xnine':record, 'xten':record, 'xzero': record },
                'rights': {'xzero':record,'xone':record,'xtwo':record, 'xthree': record, 'xfour': record, 'xfive': record, 'xsix':record, 'xseven': record, 'xeight': record, 'xnine': record, 'xten':record}
               }
          },
          'recognition': {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
          'decimal'  : {'audioToNonSymbolic': record, 'nonSymbolicToSymbolic':record, 'audio_symbolic':[]}  
          
      },
      "line" :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      "square"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      "triangle" :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      "rectangle"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      "circle"   : {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      "parallelogram"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      "hexagon"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      "diamond"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 

    }
    for(var i=1; i<=100; i++){
      score[i] = _.clone(score[0])
    }
	return score
}
module.exports =  FakeScore;