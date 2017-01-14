
module.exports = getSingleGraphemeOneLetter();
// module.exports = getSingleGraphemeMultiLetters();

function getSingleGraphemeOneLetter () {
    return {
        "discipline" : "language",
        "data" : {
            "notionsIds" : ["b-b"],
            "videoPhase" :  {
                "sequence" : [
                    "assets/video/language/phoneme_b.mp4",
                    "assets/video/language/phoneme_b_closeup.mp4"
                ]
            },
            "illustrationPhase" : {
                "multiPictures" : false,
                "illustrations" : [
                    {
                        "image" : "assets/images/language/lookandlearn/bottle.jpg",
                        "sound" : "assets/sounds/language/phoneme_illustration_bottle.ogg"
                    }
                ]
            },
            "tracingPhase" : {
                "B" : { "nbOfTimes" : 2 },
                "b" : { "nbOfTimes" : 2 }
            },
            "interactiveZone" : {
                "buttons" : [
                    ["B", "b"]
                ]
            }
        }
    }
}

function getSingleGraphemeMultiLetters () {
    return {
        "discipline" : "language",
        "data" : {
            "notionsIds" : ["ng'-N"],
            "videoPhase" :  {
                "sequence" : [
                    "assets/video/language/phoneme_capital_n.mp4",
                    "assets/video/language/phoneme_capital_n_closeup.mp4"
                ]
            },
            "illustrationPhase" : {
                "multiPictures" : false,
                "illustrations" : [
                    {
                        "image" : "assets/images/language/lookandlearn/cow.jpg",
                        "sound" : "assets/sounds/language/phoneme_illustration_ng'ombe.ogg"
                    }
                ]
            },
            "tracingPhase" : {
                "ng'" : { "nbOfTimes" : 2 }
            },
            "interactiveZone" : {
                "buttons" : [
                    ["ng'"]
                ]
            }
        }
    }
}