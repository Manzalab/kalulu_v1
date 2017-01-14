
module.exports = getSingleGrapheme();
// module.exports = getMultipleGraphemesOneImage();
// module.exports = getMultipleGraphemesMultiImages();

function getSingleGrapheme () {
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

function getMultipleGraphemesOneImage () {
    return {
        "discipline" : "language",
        "data" : {
            "notionsIds" : ["oo-u", "o-u", "ou-u"],
            "videoPhase" :  {
                "sequence" : [
                    "assets/video/language/phoneme_u.mp4",
                    "assets/video/language/phoneme_u_closeup.mp4"
                ]
            },
            "illustrationPhase" : {
                "multiPictures" : false,
                "illustrations" : [
                    {
                        "image" : "assets/images/language/lookandlearn/rooster.jpg",
                        "sound" : "assets/sounds/language/phoneme_illustration_rooster.ogg"
                    }
                ]
            },
            "tracingPhase" : {
                "oo" : { "nbOfTimes" : 1 },
                "o" : { "nbOfTimes" : 1 },
                "ou" : { "nbOfTimes" : 1 }
            },
            "interactiveZone" : {
                "buttons" : [
                    ["oo"],
                    ["o"],
                    ["ou"]
                ]
            }
        }
    }
};

function getMultipleGraphemesMultiImages () {
    return {
        "discipline" : "language",
        "data" : {
            "notionsIds" : ["a-@", "e-@", "o-@"],
            "videoPhase" :  {
                "sequence" : [
                    "assets/video/language/phoneme_arobase.mp4",
                    "assets/video/language/phoneme_arobase_closeup.mp4"
                ]
            },
            "illustrationPhase" : {
                "multiPictures" : true,
                "illustrations" : [
                    {
                        "image" : "assets/images/language/lookandlearn/what.jpg",
                        "sound" : "assets/sounds/language/phoneme_illustration_what.ogg"
                    },
                    {
                        "image" : "assets/images/language/lookandlearn/the.jpg",
                        "sound" : "assets/sounds/language/phoneme_illustration_the.ogg"
                    },
                    {
                        "image" : "assets/images/language/lookandlearn/love.jpg",
                        "sound" : "assets/sounds/language/phoneme_illustration_love.ogg"
                    },
                ]
            },
            "tracingPhase" : {
                "a" : { "nbOfTimes" : 2 },
                "e" : { "nbOfTimes" : 2 },
                "o" : { "nbOfTimes" : 2 }
            },
            "interactiveZone" : {
                "buttons" : [
                    ["a"],
                    ["e"],
                    ["o"]
                ]
            }
        }
    }
};
