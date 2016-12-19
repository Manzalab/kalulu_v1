/**
 * This module can manage loading by batches, for sounds, images and texts resources. It extends the PIXI3.loader
 * TODO : review regex for CSS files. (CSS currently unsupported)
**/
(function () {

    'use strict';
    
    var PIXI3              = require('../../../libs/pixi');
    var DeviceCapabilities = require('../system/device_capabilities');
    var LoadEventType      = require('../events/load_event_type');
    var SoundManager       = require('../sound/sound_manager');
    var howler             = require('howler');


    var txtLoaded = [];
    var Config = null;
    
    function GameLoader (pConfig) {

        if(!pConfig) throw new Errror('GameLoader needs appConfig');
        PIXI3.loaders.Loader.call(this);

        // console.log(pConfig);

        Config = pConfig;
        this._soundsLists = [];
        this._soundsSpecs = [];

        this.once(LoadEventType.COMPLETE, this.onComplete);
    }


    GameLoader.prototype = Object.create(PIXI3.loaders.Loader.prototype);
    GameLoader.prototype.constructor = GameLoader;



    GameLoader.prototype.getContent = function getContent (pPath, pFile) {
        return txtLoaded[pPath + pFile];
    };

    GameLoader.prototype.addTxtFile = function addTxtFile (pUrl) {
        var lUrl = Config.txtPath + pUrl;
        this.add(Config.url(lUrl));
    };


    GameLoader.prototype.addImageFile = function addImageFile (pUrl) {
        var lUrl = Config.imagesPath + pUrl;
        this.add(Config.url(lUrl));
    };

    GameLoader.prototype.addVideoFile = function addVideoFile (pUrl) {
        var lUrl = Config.videoPath + pUrl;
        this.add(Config.url(lUrl));
    };


    GameLoader.prototype.addSoundList = function addSoundList (pUrl) {
        var lUrl = Config.soundsPath + pUrl;
        this._soundsLists.push(lUrl);
        this.add(Config.url(lUrl));
    };


    GameLoader.prototype.addFontFile = function addFontFile (pUrl) {
        var lUrl = Config.fontsPath + pUrl;
        this.add(Config.url(lUrl));
    };


    GameLoader.prototype.parseData = function parseData (pResource, pNext) {
        
        // console.log(pResource.url + " loaded");
        
        var lUrl = pResource.url.split("?")[0];
        
        // REVOIR LA REGEX
        if (lUrl.indexOf(".css") > 0 && !DeviceCapabilities.isCocoonJS) {
            
            var lData = pResource.data.split(";");
            var lFamilies = [];
            //var lReg = ~/font-family:\s?(.*)/;
            
            for (var i  = 0 ; i < lData.length ; i++) {
                //if (lReg.match(lData[i])) lFamilies.push(lReg.matched(1));
            }
            
            var lWebFontConfig = {
                custom: {
                    families: lFamilies,
                    urls: [Config.fontsPath + "fonts.css"],
                },

                active: pNext
            };
           
            WebFont.load(lWebFontConfig);
            return;
        }
        

        if (pResource.isJson) {         

            txtLoaded[lUrl] = pResource.data;
            // for (propertyName in pResource.data) {
            //  if (!pResource.data.hasOwnProperty(propertyName)) continue;
            //  console.log(propertyName);
            // }

            // case where Flump Tool has been used for Atlases
            if(lUrl.substr(-12,12)=="library.json" &&
               pResource.data.hasOwnProperty("md5") &&
               pResource.data.hasOwnProperty("movies") &&
               pResource.data.hasOwnProperty("textureGroups") &&
               pResource.data.hasOwnProperty("frameRate"))
            {

                FlumpParser.flumpParser(1,Config.cache)(pResource, pNext);
                return;
            }

            // case of a SpriteSheet description
            else if (pResource.data.hasOwnProperty("frames") &&
                     pResource.data.hasOwnProperty("meta"))
            {
                // console.info(lUrl + " detected as spritesheet");
            }

            // case of a Howler Sounds Description
            else if (this._soundsLists.length>0 && this.checkIfHowlerDescription(pResource.data)) {
                
                // console.info(lUrl + " detected as Howler Sounds Description File");
                var lSoundData;
                
                // the list of soundLists is looped (this._soundLists is built with loader.addSoundList() which is typcally called in kalulu.preload)
                // if the current resource is identified as part of the list, the name is removed of this._soundLists, and the resource is added 
                for (var j = this._soundsLists.length - 1 ; j >= 0 ; j--) {
                    
                    if (lUrl == this._soundsLists[j]) {
                        
                        this._soundsLists.splice(j, 1);
                        
                        lSoundData = pResource.data;
                        
                        if (DeviceCapabilities.isCocoonJS) {
                            if (lSoundData.extensions.indexOf("ogg") == -1) throw "CocoonJs needs ogg sounds. No sound will be played in the application.";
                            else lSoundData.extensions = ["ogg"];
                        }
                        
                        for (var k = 0 ; k < lSoundData.extensions.length ; k++) {
                            
                            if (howler.Howler.codecs(lSoundData.extensions[k])) {
                                this.addSounds(lUrl, lSoundData.fxs, false, lSoundData.extensions, lSoundData.extensions[k]);
                                this.addSounds(lUrl, lSoundData.musics, true, lSoundData.extensions, lSoundData.extensions[k]);
                                break;
                            }
                        }
                        break;
                    }
                }
            }

            // default case
            else {
                //console.info(lUrl + " not identified as Atlas, SpriteSheet, or Sound Description. No additional processing done.")
            }
        }
        
        pNext();
    };
    

    GameLoader.prototype.checkIfHowlerDescription = function checkIfHowlerDescription (resourceData) {
        
        if(resourceData.hasOwnProperty("notice") &&
           resourceData.hasOwnProperty("extensions") &&
           resourceData.hasOwnProperty("fxs") &&
           resourceData.hasOwnProperty("musics"))
        {
            
            return true;
        }

        else return false;
    }

    GameLoader.prototype.manageCache = function manageCache (pResource, pNext) {
        if  (pResource.name != pResource.url) pResource.url = Config.url(pResource.url);
        pNext();
    };


    GameLoader.prototype.addSounds = function addSounds (listUrl, pList, pLoop, pExtensions, pCodec) {
        
        // the url of the resource, built from soundName, codec and url parameters
        var lUrl;

        for (var soundName in pList) {
            if (!pList.hasOwnProperty(soundName)) continue;

            // console.log(listUrl);            // assets/sounds/kiswahili_module/kiswahili_module_sounds.json
            // console.log(Config.soundsPath);  // assets/sounds/
            // console.log(soundName);          // phoneme_a
            // console.log(pCodec);         // wav

            // the sounds are taken in the same folder as the resource description file (next to the .json file)
            lUrl = listUrl.substring(0, listUrl.lastIndexOf("/")) + "/" + soundName + "." + pCodec;
            // lUrl = Config.url(Config.soundsPath + soundName + "." + pCodec); // former version, not managing subfolders.

            // console.log(lUrl);               // assets/sounds/<dynamic path>/<soundName>.<codec>?<version>


            var options = {
                urls    :[lUrl],
                volume  :pList[soundName] / 100,
                loop    :pLoop
            };

            this._soundsSpecs[soundName] = options;
            
            // add is a function of ResourceLoader by Chad Engler : https://github.com/englercj/resource-loader
            // it actually enqueue the resource in the loading process.
            this.add(lUrl);
        }
    };

    
    GameLoader.prototype.load = function load (pCallback) {
        
        this.before(this.manageCache);
        this.after(this.parseData);

        if (pCallback)
            return PIXI3.loaders.Loader.prototype.load.call(this, pCallback);
        else
            return PIXI3.loaders.Loader.prototype.load.call(this);
    };


    GameLoader.prototype.onComplete = function onComplete () {
        
        for (var lId in this._soundsSpecs) {
            
            if (!this._soundsSpecs.hasOwnProperty(lId)) continue;
            
            SoundManager.addSound(lId, new howler.Howl(this._soundsSpecs[lId]));
        }
    };

    return GameLoader;
});