
// module.exports = getSingleNumber();
module.exports = getMultiNumbers();
// module.exports = getSkill();
// module.exports = getShape();

function getSingleNumber () {
    return {
        "discipline" : "maths",
        "data" : {
            "notionsIds" : ["8"],
            "boardGamePhase" :  {
                "checkOnlyFirst" : true
                "sounds" : [
                    "assets/sounds/maths/number_8.ogg"
                ]
            },
            "illustrationPhase" : {
                "multiPictures" : false,
                "illustrations" : [
                    {
                        "image" : "assets/images/maths/number_8.jpg",
                        "sound" : "assets/sounds/maths/number_8.ogg"
                    }
                ]
            },
            "tracingPhase" : {
                "8" : { "nbOfTimes" : 2 }
            },
            "interactiveZone" : {
                "buttons" : [
                    ["8"]
                ]
            }
        }
    }
}

function getMultiNumbers () {
    return {
        "discipline" : "maths",
        "data" : {
            "notionsIds" : ["50", "51", "52", "53", "54"],
            "boardGamePhase" :  {
                "checkOnlyFirst" : false
                "sounds" : [
                    "assets/sounds/maths/number_50.ogg",
                    "assets/sounds/maths/number_51.ogg",
                    "assets/sounds/maths/number_52.ogg",
                    "assets/sounds/maths/number_53.ogg",
                    "assets/sounds/maths/number_54.ogg"
                ]
            },
            "illustrationPhase" : {
                "multiPictures" : true,
                "illustrations" : [
                    {
                        "image" : "assets/images/maths/number_50.jpg",
                        "sound" : "assets/sounds/maths/number_50.ogg"
                    },
                    {
                        "image" : "assets/images/maths/number_51.jpg",
                        "sound" : "assets/sounds/maths/number_51.ogg"
                    },
                    {
                        "image" : "assets/images/maths/number_52.jpg",
                        "sound" : "assets/sounds/maths/number_52.ogg"
                    },
                    {
                        "image" : "assets/images/maths/number_53.jpg",
                        "sound" : "assets/sounds/maths/number_53.ogg"
                    },
                    {
                        "image" : "assets/images/maths/number_54.jpg",
                        "sound" : "assets/sounds/maths/number_54.ogg"
                    },
                ]
            },
            "tracingPhase" : {
                "50" : { "nbOfTimes" : 2 }
            },
            "interactiveZone" : {
                "buttons" : [
                    ["50", "51", "52", "53", "54"]
                ]
            }
        }
    }
}

function getSkill () {
    return {
        "discipline" : "maths",
        "data" : {
            "notionsIds" : ["add1"],
            "illustrationPhase" : {
                "multiPictures" : false,
                "illustrations" : [
                    {
                        "image" : "assets/images/maths/number_add1.jpg",
                        "sound" : "assets/sounds/maths/number_add1.ogg"
                    }
                ]
            }
            "interactiveZone" : {
                "buttons" : [
                    ["8"]
                ]
            }
        }
    }
}

function getShape () {
    return {
        "discipline" : "maths",
        "data" : {
            "notionsIds" : ["diamond"],
            "illustrationPhase" : {
                "multiPictures" : false,
                "illustrations" : [
                    {
                        "image" : "assets/images/maths/shape_diamond.jpg",
                        "sound" : "assets/sounds/maths/shape_diamond.ogg"
                    }
                ]
            },
            "tracingPhase" : {
                "diamond" : { "nbOfTimes" : 2 }
            },
            "interactiveZone" : {
                "buttons" : [
                    ["diamond"]
                ]
            }
        }
    }
}