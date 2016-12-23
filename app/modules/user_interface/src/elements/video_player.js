
define([
	"../utils/ui/ui_component",
	"../utils/ui/ui_positions",
	"../utils/system/device_capabilities"
], function (
	UIComponent,
	UIPositions,
	DeviceCapabilities
) {
	
	'use strict';


	// ###############################################################################################################################################
	// ###  CONSTRUCTOR  #############################################################################################################################
	// ###############################################################################################################################################
	
	/**
	 * The VideoPlayer class is ...
	 * @class
	 * @extends UIComponent
	 * @memberof Namespace (e.g. Kalulu.Remediation)
	 * @param parameter {Object} Description of the parameter
	**/
	function VideoPlayer (videoId, interfaceManager) {
		
		this._interfaceManager = interfaceManager;

		UIComponent.call(this);
		this.name = "mcVideoPlayer";
		this.build();	

		this._totalContainer = this.getChildByName("mcTotalVideo");

		this._playButton = this._totalContainer.getChildByName("mcPlayButton");
		this._playButton.visible = false;
		this._playButton.interactive = false;
		
		this._playBar = this._totalContainer.getChildByName("mcPlayBar");
		this._playBar._anim.anchor.x = 0;
		this._playBar.interactive = true;
		
		this._playTimeBar = this._totalContainer.getChildByName("mcPlayTimeBar");
		this._playTimeBar._anim.anchor.x = 0;
		this._playTimeBar.scale.x = 0;

		this._videoBackground = this._totalContainer.getChildByName("mcVideoContainer");

		this._videoBarGroup = this._totalContainer.getChildByName("mcVideoBarGroup");
		this._fullScreenButton = this._videoBarGroup.getChildByName("mcFullScreenButton");
		this._muteButton = this._videoBarGroup.getChildByName("mcMuteButton");
		this._videoBar = this._videoBarGroup.getChildByName("mcVideoBar");

		// video source
		this._videoTexture = new PIXI3.Texture(PIXI3.VideoBaseTexture.fromUrl({ src: Config.videoPath + "Akili"+ videoId +".ogv", mime: 'video/ogg' }));
		this._videoSprite = new PIXI3.Sprite(this._videoTexture);
		this._videoSprite.anchor.set(0.5,0.5);
		this._videoSprite.interactive = true;
		this._videoSprite.height = this._videoBackground.height;
		this._videoSprite.width = this._videoSprite.height*(16/9);
		

		// this._videoSizeRatio = this._videoSprite.width/this._videoSprite.height;
		// console.log(this._videoSprite.height);
		// this._videoSprite.width = this._videoBar.width;
		// this._videoSprite.height = this._videoSprite.width/this._videoSizeRatio;

		//element to use video tag methods
		this.videoElement = this._videoSprite._texture.baseTexture.source;

		// video management
		this._isFullScreen = false;
		this._fullScreenButton.onClick = this._onClickOnFullScreenButton.bind(this);
		this._muteButton.onClick = this._onClickOnMuteButton.bind(this);
			// change video currentTime
		this._playBar.on('click', this._onClickOnVideoTimeline, this);
			// click play/pause
		this._videoSprite.on('click', this._onClickOnVideo, this);
			// update PlayTimeBar size to fit currentTime
		this.videoElement.ontimeupdate = this._onVideoTimeUpdate.bind(this);
			// addChild video when loaded
		this.videoElement.onloadeddata = this._onVideoLoaded.bind(this);
	}

	VideoPlayer.prototype = Object.create(UIComponent.prototype);
	VideoPlayer.prototype.constructor = VideoPlayer;



	// ###############################################################################################################################################
	// ###  GETTERS & SETTERS  #######################################################################################################################
	// ###############################################################################################################################################


	Object.defineProperties(VideoPlayer.prototype, {
	});



	// ##############################################################################################################################################
	// ###  METHODS  ################################################################################################################################
	// ##############################################################################################################################################

	VideoPlayer.prototype._onClickOnFullScreenButton = function _onClickOnFullScreenButton (pEventData) 
	{
		pEventData.stopPropagation();
		if (!this._isFullScreen)
		{
			this._totalContainerSize = {width: this._totalContainer.width, height: this._totalContainer.height};
			this._totalContainer.width = DeviceCapabilities.getScreenRect(this).width;
			this._totalContainer.height = DeviceCapabilities.getScreenRect(this).height;
		}
		else
		{
			this._totalContainer.width = this._totalContainerSize.width;
			this._totalContainer.height = this._totalContainerSize.height;
		}
		this._isFullScreen = !this._isFullScreen;
	};

	VideoPlayer.prototype._onClickOnMuteButton = function _onClickOnMuteButton (pEventData) 
	{
		pEventData.stopPropagation();
		this.videoElement.muted = !this.videoElement.muted;
	};

	VideoPlayer.prototype._onClickOnVideo = function _onClickOnVideo (pEventData) 
	{
		pEventData.stopPropagation();
		this._playButton.visible = !this.videoElement.paused;
		if (this.videoElement.paused)	this.videoElement.play();
		else this.videoElement.pause();
	};
	
	VideoPlayer.prototype._onClickOnVideoTimeline = function _onClickOnVideoTimeline (pEventData) 
	{
		pEventData.stopPropagation();
		var lVideo = this.videoElement;
		var lMouseX = this._playBar.toLocal(pEventData.data.global).x/this._playBar.width;
		lVideo.currentTime = lMouseX*lVideo.duration;
		this._playTimeBar.scale.x = lVideo.currentTime/lVideo.duration;
	};

	VideoPlayer.prototype._onVideoTimeUpdate = function _onVideoTimeUpdate (pEventData) 
	{
		this._playTimeBar.scale.x = this.videoElement.currentTime/this.videoElement.duration;
	};

	VideoPlayer.prototype._onVideoLoaded = function _onVideoLoaded (pEventData) 
	{
		this._videoBackground.addChild(this._videoSprite);

		this._modalZone.once("click", this._onClickClose,this);
	};

	VideoPlayer.prototype._onClickClose = function _onClickClose()
	{
		this.videoElement.pause();
		this._interfaceManager.closePopin(this);
	}




	return VideoPlayer;
});