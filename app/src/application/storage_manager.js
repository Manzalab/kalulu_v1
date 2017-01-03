/**
 * This module is in charge of presenting a consistent interface for various storage strategies.
 * 
**/
define([], function () {

	function StorageManager (pStorageModule) {
		
		this._storageStrategy = pStorageModule;
	}


	StorageManager.prototype.getUsersData = function getUsersData () {
		return this._storageStrategy.getUsersData();
	};

	/**
	 * @param key {string} the key at which the data is stored
	 * @return {object} the parsed saved data
	**/
	StorageManager.prototype.resetSave = function resetSave () {
		return this._storageStrategy.resetSave();
	};

	/**
	 * @param key {string} the key at which the data is stored
	 * @return {object} the parsed saved data
	**/
	StorageManager.prototype.getUserData = function getUserData (key) {
		return this._storageStrategy.getUserData(key);
	};

	/**
	 * @param key {string} the id of the user for which the data is requested
	 * @param value {object} the data to be stored. the object must be stringifiable (no circular references)
	**/
	StorageManager.prototype.saveUserData = function saveUserData (key, value) {
		this._storageStrategy.saveUserData(key, value);
	};

	return StorageManager;
});