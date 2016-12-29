define([
], function (
) {
   'use strict';
   function Reward () {
       this.levelRewards = {
        "language": {
                "1": "Mamba_mwenye_njaa",
                "5": "Kitabu_cha_Hali_ya_Hewa",
                "9": "Maharagwe_Yanayomea",
                "13": "Meno",
                "19": "Wanyama_wa_kufugwa",
                "23": "Bi_Simu",
                "27": "Siku_Upinde_ulitembelea_kijiji",
                "31": "Marafiki",
                "35": "Upepo"
        },
        "maths": {
                "1": "Akili1",
                "9": "Akili2",
                "16": "Akili3",
                "24": "Akili4",
                "31": "Akili6",
                "40": "Akili8"
        },
        "both": [
                "CIRKAFRICA1 MASTER PARTIE 01",
                "CIRKAFRICA1 MASTER PARTIE 02",
                "CIRKAFRICA1 MASTER PARTIE 03",
                "CIRKAFRICA1 MASTER PARTIE 04",
                "patrimath"
        ],
        "bookCount": 10,
        "videoCount": 10,
        "gameCount": 1,
        "locked": {
                "game": [
                        "patrimath"
                ],
                "video": [
                        "Akili1",
                        "Akili2",
                        "CIRKAFRICA1 MASTER PARTIE 01",
                        "Akili3",
                        "CIRKAFRICA1 MASTER PARTIE 02",
                        "Akili4",
                        "CIRKAFRICA1 MASTER PARTIE 03",
                        "Akili6",
                        "CIRKAFRICA1 MASTER PARTIE 04",
                        "Akili8"
                ],
                "book": [
                        "Mamba_mwenye_njaa",
                        "Kitabu_cha_Hali_ya_Hewa",
                        "Maharagwe_Yanayomea",
                        "Meno",
                        "Wanyama_wa_kufugwa",
                        "Bi_Simu",
                        "Siku_Upinde_ulitembelea_kijiji",
                        "Marafiki",
                        "Mamangu_alipanda",
                        "Upepo"
                ]
        }
}
   }
   return new Reward(); 
});