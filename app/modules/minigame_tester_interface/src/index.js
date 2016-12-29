(function () {
    'use strict';

    var MinigamesManager   = require('game_logic/minigames_manager');
    var MinigameDstRecord  = require ('game_logic/core/minigame_dst_record');
    var StimulusApparition = require ('game_logic/core/stimulus_apparition');
    var Dat                = require ('dat.gui');


    console.info('#######################################\n###### Minigame Tester Interface ######\n#######################################\n');
    
    String.prototype.capitalise = function capitalise () {
        return this[0].toUpperCase() + this.substr(1);
    };


    Dat.GUI.prototype.removeFolder =  function removeFolder (name) {
        var folder = this.__folders[name];
        if (!folder) {
            return;
        }
        folder.close();
        this.__ul.removeChild(folder.domElement.parentNode);
        delete this.__folders[name];
        this.onResize();
    };

    function MinigamesTester () {

        this.options =  {
            LANGUAGE    : KALULU_LANGUAGE, // cannot be changed post build, presence for information only.
            minigame    : 'crabs',
            discipline  : 'maths',
            globalLevel : 1,
            localLevel  : 1,
            start       : this.startGame.bind(this)
        };

        console.log(this.options);
    }

    MinigamesTester.prototype.openDatGUI = function openDatGUI () {

        if (Config.enableGlobalVars) window.kalulu = {};

        this.minigamesManager = new MinigamesManager();
        this.minigamesManager.launchGame = launchGame;

        console.log(Dat);
        window.dat = Dat;

        var gui = this.gui = new Dat.GUI();
        
        this.guiFolderName = 'Launcher GUI';
        var LauncherGUI = gui.addFolder(this.guiFolderName);
        LauncherGUI.add(this.options, 'LANGUAGE');
        LauncherGUI.add(this.options, 'minigame', KALULU_MINIGAMES_LIST);
        LauncherGUI.add(this.options, 'discipline', ['maths', 'language']).listen();
        LauncherGUI.add(this.options, 'globalLevel').min(1).max(5).step(1).listen();
        LauncherGUI.add(this.options, 'localLevel').min(1).max(5).step(1).listen();
        LauncherGUI.add(this.options, 'start');
        LauncherGUI.open();
    };

    MinigamesTester.prototype.startGame = function startGame () {

        var str = 'start' + this.options.minigame.capitalise();
        console.log('about to call ' + str);
        this.minigamesManager[str]();
    };


    var tester = new MinigamesTester();
    Config.request('../config', tester.openDatGUI.bind(tester));

    function getPedagogicData (params) {
        
        console.info("[DummyRafiki] Received Minigame Params requesting for PedagogicData :"); // TODO update level values depending on results.
        console.log(params);


        console.info("[DummyRafiki] About to send the following pedagogicData in response :");
        console.log(tester.options.dummyPedagogicData);

        return(tester.options.dummyPedagogicData);
    }

    function getDifficultyLevel () {
        
        return {
            globalLevel : tester.options.globalLevel,
            localStage : tester.options.localLevel
        };
    }

    function save (record) {
        console.log("Kalulu will now save the Data to Child Profile :");
        console.log(record);
    }

    function close () {
    
        console.log("Game is Finished, Kalulu Will reopen the Lesson Screen Now.");
    }
    
    function launchGame (Launcher) {
        var part1 = tester.options.discipline !== 'language' ? tester.options.discipline : tester.options.LANGUAGE;
        var part2 = '';
        if (tester.options.discipline === 'maths') {
            switch (tester.options.minigame) {
                case 'ants':
                    part2 = 'gapfill';
                    break;
                case 'caterpillar':
                    part2 = 'counting';
                    break;
                case 'crabs':
                    part2 = 'recognition';
                    break;
                case 'fish':
                    part2 = 'assessment';
                    break;
                case 'frog':
                    part2 = 'counting';
                    break;
                case 'jellyfish':
                    part2 = 'recognition';
                    break;
                case 'lookandlearn':
                    part2 = 'lookandlearn';
                    break;
                case 'monkeys':
                    part2 = 'sum';
                    break;
                case 'parakeets':
                    part2 = 'pairing';
                    break;
                case 'turtles':
                    part2 = 'decimal';
                    break;
                default :
                    part2 = 'recognition';
            }
        }
        else {
            switch (tester.options.minigame) {
                case 'ants':
                    part2 = 'filling';
                    break;
                case 'caterpillar':
                    part2 = 'composition';
                    break;
                case 'crabs':
                    part2 = 'recognition';
                    break;
                case 'fish':
                    part2 = 'assessment';
                    break;
                case 'frog':
                    part2 = 'composition';
                    break;
                case 'jellyfish':
                    part2 = 'recognition';
                    break;
                case 'lookandlearn':
                    part2 = 'lookandlearn';
                    break;
                case 'monkeys':
                    part2 = 'composition';
                    break;
                case 'parakeets':
                    part2 = 'pairing';
                    break;
                case 'turtles':
                    part2 = 'composition';
                    break;
                default :
                    part2 = 'recognition';
            }
        }
            
        var filename = part1 + "_" + part2;
        console.log(filename);

        tester.options.dummyPedagogicData = require('../assets/data/' + filename + '.js');

        var rafiki = {
            discipline         : tester.options.discipline,
            getDifficultyLevel : getDifficultyLevel,
            getPedagogicData   : getPedagogicData,
            save               : save,
            close              : close,
            debugPanel         : tester.gui,
            MinigameDstRecord  : MinigameDstRecord,
            StimulusApparition : StimulusApparition
        };
        
        tester.gui.removeFolder(tester.guiFolderName);
        this._currentMinigame = new Launcher(rafiki);
    }


})();