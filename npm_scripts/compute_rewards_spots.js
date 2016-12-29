(function computeRewardsSpots () {

    'use strict';

    var fs = require('fs');
    var d3 = require('d3-dsv');
    
    

    setRewardsSpots('english');
    setRewardsSpots('swahili');

    function setRewardsSpots (language) {
        
        var levelRewards = { language:{}, maths:{}, both:[], bookCount:0, videoCount:0, gameCount:0 };
        
        var lRewardsCSV = d3.dsvFormat(",").parse(fs.readFileSync('app/assets/data/' + language + '/rewards.csv', 'UTF-8'));
        
        var lRewardCount_language = 0;
        var lRewardCount_maths = 0;
        
        var lRewards_language = [];
        var lRewards_maths = [];
        
        var lBookCount = 0, lVideoCount = 0, lGameCount = 0;
        var lLockedGames = [], lLockedVideos = [], lLockedBooks = [];

        for (var i = 0; i < lRewardsCSV.length; i++)
        {
            if (lRewardsCSV[i].BOTH)   levelRewards.both.push(lRewardsCSV[i]["FOLDER NAME"]);
            else if (lRewardsCSV[i].LANGUAGE)  lRewardCount_language++;
            else  lRewardCount_maths++;

            if (lRewardsCSV[i].TYPE === "book")
            {
                lBookCount++;
                lLockedBooks.push(lRewardsCSV[i]["FOLDER NAME"]);
            } 
            else if (lRewardsCSV[i].TYPE === "video") 
            {
                lVideoCount++;
                lLockedVideos.push(lRewardsCSV[i]["FOLDER NAME"]);
            }
            else
            {
                lGameCount++;
                lLockedGames.push(lRewardsCSV[i]["FOLDER NAME"]);
            } 

            if (lRewardsCSV[i].BOTH) continue;
            var lRewards = lRewardsCSV[i].LANGUAGE?lRewards_language:lRewards_maths;
            lRewards.push(lRewardsCSV[i]["FOLDER NAME"]);
        }
            console.log(language + ' : ');
            console.log(lRewards_language);

        levelRewards.bookCount = lBookCount;
        levelRewards.videoCount = lVideoCount;
        levelRewards.gameCount = lGameCount;
        levelRewards.locked = {
            game: lLockedGames, 
            video: lLockedVideos,
            book: lLockedBooks
        };

        var lPlan_language = d3.dsvFormat(";").parse(fs.readFileSync('app/modules/language/assets/data/' + language + '/plan.csv', 'UTF-8'));
        var lPlan_maths    = d3.dsvFormat(";").parse(fs.readFileSync('app/modules/maths/assets/data/plan.csv', 'UTF-8'));

        for (var a = 0; a < 2; a++) 
        {
            var lPlan        = a === 0 ? lPlan_language:lPlan_maths;
            var lLevelCount  = lPlan.length;
            var lRewardCount = a === 0 ? lRewardCount_language:lRewardCount_maths;
            var lRewards     = a === 0 ? lRewards_language:lRewards_maths;
            var lChapters    = [];
            var lStepForReward;

            for (var i = 0; i < lLevelCount; i++) 
            {
                var lLessons = [];
                for (var j = i; j < lLevelCount; j++) 
                {
                    if (lPlan[j].CHAPTER == lPlan[i].CHAPTER) lLessons.push(lPlan[j].LESSON);
                    else {
                        i+=lLessons.length-1;
                        break;
                    }
                }
                if (lChapters.length<lPlan[lLevelCount-1].CHAPTER) lChapters.push(lLessons);
            }

            for (var i = 0; i < lChapters.length; i++) 
            {
                var lChapterLessons = lChapters[i];
                var lLessonSemiBonus = lChapterLessons[Math.floor(lChapterLessons.length/2)];
                lChapterLessons.splice(lChapterLessons.indexOf(lLessonSemiBonus), 1);
            }

            lChapters = Array.prototype.concat.apply([], lChapters);
            var ratio = lChapters.length / lRewardCount;
            lStepForReward = Math.round(lChapters.length / lRewardCount);
   

            console.log(lRewardCount + ' : ' + lRewards.length);
            console.log(lRewards);
            console.log(lChapters);
            for (var j = 0; j < lRewardCount; j++) 
            {
                var aaa = (a === 0 ? levelRewards.language : levelRewards.maths);
                var lIndexA = Math.min(j*lStepForReward,lChapters.length-1);
                var lIndex = Math.min(lChapters[lIndexA],lLevelCount);

                if (aaa[lIndex]) {
                    var toReposition = aaa[lIndex];

                    lIndex = lChapters[lIndexA - 1];
                    aaa[lIndex] = toReposition;
                    lIndex = Math.min(lChapters[lIndexA],lLevelCount);
                }
                (a === 0 ? levelRewards.language : levelRewards.maths)[lIndex] = lRewards.shift();
            }

        }

        var str =   "define([], function () {\n"+
                    "    'use strict';\n"+
                    "    function Reward () {\n"+
                    "        this.levelRewards = "+JSON.stringify(levelRewards, null, "    ") + "\n" +
                    "    };\n"+
                    "    return new Reward(); \n"+
                    "});";
        
        fs.writeFile('app/assets/data/' + language + '/dynamic_rewards.js', str);
    }

})();