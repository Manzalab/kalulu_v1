define ([
    ], function(
        ) {

        /**
         * Load all assets before the game starts 
         * @class 
         * @memberof Patrimath
         * @param {Phaser.Game} game
         */
        function LoadState(){};

        LoadState.prototype = {
            preload : function () {
                //  Kalulu Assets
                this.game.load.spritesheet('button-goTo-Kalulu', Config.assetsPath + 'images/buttons/kalulu.png',78,77);


                // Backgrounds
                this.game.load.image('background-home', Config.assetsPath + 'images/backgrounds/backgroundHome.png');
                this.game.load.image('background-game', Config.assetsPath + 'images/backgrounds/backgroundGame.png');
                this.game.load.image('gameArea', Config.assetsPath + 'images/backgrounds/gameArea.png');

                // Buttons
                this.game.load.spritesheet('button-goTo-freemode', Config.assetsPath + 'images/buttons/freemode.png',300,215);
                this.game.load.spritesheet('button-goTo-levelmode', Config.assetsPath + 'images/buttons/levelmode.png',300,215);
                this.game.load.spritesheet('button-level', Config.assetsPath + 'images/buttons/levels.png',78,77);
                
                // Shapes assets
                this.game.load.spritesheet('hexagon', Config.assetsPath + 'sprites/hexagon.png',130,130);
                this.game.load.spritesheet('square', Config.assetsPath + 'sprites/square.png',130,130);
                this.game.load.spritesheet('diamond', Config.assetsPath + 'sprites/lozenge.png',130,130);
                this.game.load.spritesheet('trapeze', Config.assetsPath + 'sprites/trapezoid.png',130,130);
                this.game.load.spritesheet('triangleEqui', Config.assetsPath + 'sprites/triangle-equi.png',130,130);
                this.game.load.spritesheet('triangle', Config.assetsPath + 'sprites/triangle.png',130,130);
                this.game.load.spritesheet('parallelogram', Config.assetsPath + 'sprites/parallelogram.png',130,130);
                
                // Game menu assets (basket, store and buttons)
                this.game.load.image('store', Config.assetsPath + 'images/menu/store.png');
                this.game.load.image('pipe', Config.assetsPath + 'images/menu/store-pipe.png');
                
                this.game.load.spritesheet('trashbin', Config.assetsPath + 'images/buttons/trashbin.png', 83, 76);
                
                this.game.load.spritesheet('button-square', Config.assetsPath + 'images/buttons/shape-square.png', 78, 77);
                this.game.load.spritesheet('button-trapeze', Config.assetsPath + 'images/buttons/shape-trapeze.png', 78, 77);
                this.game.load.spritesheet('button-triangleEqui', Config.assetsPath + 'images/buttons/shape-t-equi.png', 78, 77);
                this.game.load.spritesheet('button-hexagon', Config.assetsPath + 'images/buttons/shape-hexagon.png', 78, 77);
                this.game.load.spritesheet('button-triangle', Config.assetsPath + 'images/buttons/shape-triangle.png', 78, 77);
                this.game.load.spritesheet('button-diamond', Config.assetsPath + 'images/buttons/shape-diamond.png', 78, 77);
                this.game.load.spritesheet('button-parallelogram', Config.assetsPath + 'images/buttons/shape-parallelogram.png', 78, 77);
                
                this.game.load.image('basket-left', Config.assetsPath + 'images/menu/basket-left.png');
                this.game.load.image('basket-right', Config.assetsPath + 'images/menu/basket-right.png');
                this.game.load.image('basket-middle', Config.assetsPath + 'images/menu/basket-middle.png');
                
                this.game.load.spritesheet('button-colors', Config.assetsPath + 'images/buttons/option-color.png', 48, 48);
                this.game.load.spritesheet('button-colors-picto', Config.assetsPath + 'images/buttons/option-color-picto.png',48,48)
                this.game.load.spritesheet('button-back', Config.assetsPath + 'images/buttons/option-map.png', 48, 48);
                this.game.load.spritesheet('button-home', Config.assetsPath + 'images/buttons/option-home.png', 48, 48);
                this.game.load.spritesheet('button-export', Config.assetsPath + 'images/buttons/option-export.png', 48, 48);
                this.game.load.spritesheet('button-print', Config.assetsPath + 'images/buttons/option-print.png', 48, 48);
                this.game.load.spritesheet('button-mute', Config.assetsPath + 'images/buttons/option-mute.png', 48, 48);
                this.game.load.spritesheet('button-retry', Config.assetsPath + 'images/buttons/option-retry.png', 48, 48);
                this.game.load.spritesheet('ribbon', Config.assetsPath + 'images/buttons/ribbon.png', 204, 391);
                
                this.game.load.image('menu-left', Config.assetsPath + 'images/menu/menu-left.png');
                this.game.load.image('menu-right', Config.assetsPath + 'images/menu/menu-right.png');
                this.game.load.image('menu-middle', Config.assetsPath + 'images/menu/menu-middle.png');
                
                // Patrick animations assets
                this.game.load.image('patrick', Config.assetsPath + 'images/patrick/patrick.png');
                this.game.load.spritesheet('patrick-mouth', Config.assetsPath + 'images/patrick/mouth.png',31,22,4);
                this.game.load.spritesheet('patrick-eyes', Config.assetsPath + 'images/patrick/eyes.png',80,66,5);
                this.game.load.image('home-patrick', Config.assetsPath + 'images/patrick/home-patrick.png',531,970);
                this.game.load.image('win-patrick', Config.assetsPath + 'images/patrick/win-patrick.png');
                this.game.load.spritesheet('win-patrick-mouth', Config.assetsPath + 'images/patrick/win-mouth.png',28,18,4);
                this.game.load.spritesheet('fail-patrick-mouth', Config.assetsPath + 'images/patrick/fail-mouth.png',28,18,4);
                this.game.load.spritesheet('win-patrick-eyes', Config.assetsPath + 'images/patrick/win-eyes.png',70,40,7);


                // UI
                this.game.load.spritesheet('rotation-ui', Config.assetsPath + 'images/buttons/rotation_ui.png');
                this.game.load.spritesheet('stars', Config.assetsPath + 'images/stars/reward.png',150,140);
                this.game.load.spritesheet('level-status', Config.assetsPath + 'images/stars/status.png',68,35);
                this.game.load.image('star-particle', Config.assetsPath + 'images/stars/star-particle.png');

                // Sounds effects
                this.game.load.audio('sound-trashbin', Config.assetsPath + 'audio/effects/trashbin.mp3');
                this.game.load.audio('sound-click', Config.assetsPath + 'audio/effects/click.mp3');
                this.game.load.audio('sound-snap', Config.assetsPath + 'audio/effects/snap.mp3');
                this.game.load.audio('sound-rotation', Config.assetsPath + 'audio/effects/rotate.mp3');
                this.game.load.audio('sound-color', Config.assetsPath + 'audio/effects/color.mp3');
                this.game.load.audio('sound-distrib', Config.assetsPath + 'audio/effects/distrib.mp3');
                this.game.load.audio('sound-success', Config.assetsPath + 'audio/effects/winning.mp3');
                this.game.load.audio('sound-unlock', Config.assetsPath + 'audio/effects/ribbon.mp3');

                // Instructions
                var dir = Config.assetsPath + 'audio/' + this.game.language + "/";
                this.game.load.audio('welcome-home', dir + 'welcome.mp3');
                this.game.load.audio('welcome-levelsMap', dir+'introduction.mp3');
                this.game.load.audio('welcome-levelPlay', dir+'help_levelMode.mp3');
                this.game.load.audio('welcome-freePlay', dir+'help_freeMode.mp3');
                this.game.load.audio('help-levelMode', dir+'classic.mp3');
                this.game.load.audio('help-freeMode', dir+'free.mp3');
                this.game.load.audio('help-trashbin', dir+'help_trash.mp3');
                this.game.load.audio('help-color', dir+'help_color.mp3');
                // this.game.load.audio('help-print', dir+'help_print.mp3');
                this.game.load.audio('help-lock', dir+'help_lock.mp3');
                // this.game.load.audio('help-export', dir+'help_export.mp3');
                // this.game.load.audio('help-placement', dir+'help_placement.mp3');
                for (var i=0;i<4;i++) this.game.load.audio('endOfGame-'+i, dir+'end-'+i+'.mp3');
                for (var key in this.game.shapes){
                    for (var i=0; i<15; i++) {
                        this.game.load.audio(key + "_" + (i+1) + "_" + "on", dir+key+(i+1)+".mp3");
                        this.game.load.audio(key + "_" + i + "_" + "off", dir+key+"_off"+i+".mp3");
                    }
                }

            }, 
            
            create : function (){
                this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
                this.game.scale.fullScreenScaleMode =  Phaser.ScaleManager.RESIZE;
                // Call the menu state
                this.game.state.start('menu');
            }
        };

        return LoadState;
});