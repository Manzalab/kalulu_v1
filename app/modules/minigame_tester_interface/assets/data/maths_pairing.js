module.exports = {
    "discipline": "maths",
    "data": {
        "rounds": [
            {
                "target": 1,
                "size": 1,

                "steps": [
                    {
                        "type": "audioToNonSymbolic",
                        "stimuli": [
                            {
                                "value": 1,
                                "correctResponse": true,
                                "stimuli_type": "number",
                          
                                "nonSymbolicImage": "todo/number/data/1.jpg",
                                "soundPath": "assets/sounds/maths/number_1.ogg",
                                "path": [
                                    "recognition",
                                    "audio_symbolic"
                                ]
                            },
                            {
                                "value": 2,
                                "correctResponse": true,
                                "stimuli_type": "number",

                                "nonSymbolicImage": "todo/number/data/2.jpg",
                                "soundPath": "assets/sounds/maths/number_2.ogg",
                                "path": [
                                    "recognition",
                                    "audio_symbolic"
                                ]
                            },
                            {
                                "value": 4,
                                "correctResponse": false,
                                "stimuli_type": "number",
                           
                                "nonSymbolicImage": "todo/number/data/4.jpg",
                                "soundPath": "assets/sounds/maths/number_4.ogg",
                                "path": [
                                    "recognition",
                                    "audio_symbolic"
                                ]
                            },
                            {
                                "value": 5,
                                "correctResponse": false,
                                "stimuli_type": "number",
                               
                                "nonSymbolicImage": "todo/number/data/5.jpg",
                                "soundPath": "assets/sounds/maths/number_5.ogg",
                                "path": [
                                    "recognition",
                                    "audio_symbolic"
                                ]
                            }
                        ]
                    }
                ],
                "targetSequence": {
                    "gameType": "audio_symbolic",
                    "targetNumber": 1
                },

                "path": "recognition__audio_symbolic"
            }]
    }

};
