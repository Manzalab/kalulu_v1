/**
 * This module manages the list of Howler Sounds.
**/
define([], function () {

	var list = [];
	var ambiances = [];
	var activeAmbiances = [];
	var stoppedAmbiances = [];

	function SoundManager () {
		
		// PUBLIC
		
		this.addSound = addSound;
		this.getSound = getSound;
		this.addAmbiance = addAmbiance;
		this.startAmbiance = startAmbiance;
		this.stopAmbiance = stopAmbiance;
		this.stopAllAmbiances = stopAllAmbiances;

		// FUNCTIONS

		function addSound (pName, pSound) {
			list[pName] = pSound;
		}

		function getSound (pName) {
			return list[pName];
		}

		function addAmbiance(pAmbianceName, pSoundNameList) {
			
			ambiances[pAmbianceName] = pSoundNameList;
		}

		function startAmbiance(pAmbianceName, pDelay) {

			pDelay = typeof pDelay === 'undefined' ? 1000 : pDelay;

			if (!ambiances[pAmbianceName]) console.error(pAmbianceName + " was not added to SoundManager ambiances. To startAmbiance you need to addAmbiance first.");
			if (!activeAmbiances[pAmbianceName]) activeAmbiances[pAmbianceName] = true;
			else return;
			
			setTimeout(playAmbianceSound, pDelay, pAmbianceName);
		}

		function playAmbianceSound(pAmbianceName) {
			
			if (stoppedAmbiances[pAmbianceName]) {
				delete stoppedAmbiances[pAmbianceName];
				delete activeAmbiances[pAmbianceName];
				return;
			}

			var lAmbianceSoundList = ambiances[pAmbianceName];
			var lRandomIndex = Math.floor(Math.random()*lAmbianceSoundList.length);
			var lSound = lAmbianceSoundList[lRandomIndex];

			getSound(lSound).play();

			var lRandomDelay = 5000 + Math.random()*5000;
			setTimeout(playAmbianceSound, lRandomDelay, pAmbianceName);
		}

		function stopAmbiance(pAmbianceName) {
			stoppedAmbiances[pAmbianceName] = true;
		}

		function stopAllAmbiances() {
			// for (var i = activeAmbiances.length - 1; i >= 0; i--) {
			//  	console.log(activeAmbiances[i]);
			// }

			for (var lAmbiance in activeAmbiances) {
				stoppedAmbiances[lAmbiance] = true;
			}
		}
	}

	return new SoundManager();
});