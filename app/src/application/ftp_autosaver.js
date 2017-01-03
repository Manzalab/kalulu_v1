/**
 * This module is in charge of saving the user data when the connection to the FTP server is detected.
 * 
**/
define([], function () {

    var _saveObject;
    var _opInterval = null;

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    var ftpAutoSaver = {

        init : init,
        start : start,
        stop : stop,

    };

    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

    function init (saveObject) {
        console.info("ftpAutoSaver init");
        _setSaveObject(saveObject);
    }

    function start (interval) {
        console.info("ftpAutoSaver start", interval);

        if (_opInterval !== null) {
            _clearSaveInterval();
        }

        _startSaveInterval(interval);
    }

    function stop () {

        _clearInterval();
    }

    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################
    
    function _setSaveObject (saveObject) {

        _saveObject = saveObject;
    }

    function _startSaveInterval (time) {

        _doActionSave();
        _opInterval = window.setInterval(_doActionSave, time);
    }

    function _clearSaveInterval () {

        window.clearInterval(_opInterval);
        _opInterval = null;
    }

    // SAVE OPERATIONS

    function _doActionSave () {

        if (typeof _saveObject === 'undefined') {
            return;
        }

        console.info("do action ftp");

        

    }


    return ftpAutoSaver;
});