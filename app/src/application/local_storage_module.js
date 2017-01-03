/**
 * This module is in charge of
 * 
**/
define([], function () {
	'strict mode';

	//KEYS
	var USER_PROFILES = "UserProfiles";

	function LocalStorageModule () {
		this.store = window.localStorage;
		if (!this.isAvailable) {
			console.error("Local Storage is not supported. Please contact developers in order to assess a solution.");
			return null;
		}

		if (!this.store.getItem(USER_PROFILES)) {
			this.store.setItem(USER_PROFILES, JSON.stringify({}));
		}
	}

	LocalStorageModule.prototype.isAvailable = function isAvailable () {
		try {
			var x = '__storage_test__';
			this.store.setItem(x, x);
			this.store.removeItem(x);
			return true;
		}
		catch(e) {
			return false;
		}
	};

	LocalStorageModule.prototype.getUsersData = function getUsersData () {
		return JSON.parse(this.store.getItem(USER_PROFILES));
	};

	LocalStorageModule.prototype.getUserData = function getUserData () {
		return JSON.parse(this.store.getItem(USER_PROFILES))['user'];
	};

	LocalStorageModule.prototype.saveUserData = function saveUserData (value) {
		// console.log(profile);
		var save = this.store.getItem(USER_PROFILES);
		// console.log(save);
		save = JSON.parse(save);
		save['user'] = value;
		// console.log(save);
		save = JSON.stringify(save);
		var a = this.store.setItem(USER_PROFILES, save);
	};

	LocalStorageModule.prototype.resetSave = function resetSave () {
		this.store.removeItem(USER_PROFILES);
	};


	return LocalStorageModule;
});