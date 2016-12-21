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
                'twoby': { 'zero': [], 'random':[], 'multiple':[]} 
              },
              'backward': { 
                'oneby': { 'zero': [], 'random':[], 'multiple':[]}, 
                'twoby': { 'zero': [], 'random':[], 'multiple':[]} 
              },
          },
          'sum': {
              'addition' : {
                'lefts' : {'xzero':record,'xone':record,'xtwo':[], 'xthree': [], 'xfour': [], 'xfive': [], 'xsix':[], 'xseven': [], 'xeight': [], 'xnine': [], 'xten': []},
                'rights': {'xzero':[],'xone':[],'xtwo':[], 'xthree': [], 'xfour': [], 'xfive': [], 'xsix':[], 'xseven': [], 'xeight': [], 'xnine': [], 'xten': []}
              },
              'substraction' : {
                'lefts' : {'xzero':[],'xone':[],'xtwo':[], 'xthree': [], 'xfour': [], 'xfive': [], 'xsix':[], 'xseven': [], 'xeight': [], 'xnine': [], 'xten': []},
                'rights': {'xzero':[],'xone':[],'xtwo':[], 'xthree': [], 'xfour': [], 'xfive': [], 'xsix':[], 'xseven': [], 'xeight': [], 'xnine': [], 'xten': []}
              }
          },
          'recognition': {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
          'decimal'  : {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}  
          
      },
      "triangle" :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      "circle"   : {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
      "square"   :  {'audioToNonSymbolic': [], 'nonSymbolicToSymbolic':[], 'audio_symbolic':[]}, 
    }
    for(var i=0; i<=100; i++){
      score[i] = _.clone(score[0])
    }
      
    

	return score
}
module.exports =  FakeScore;