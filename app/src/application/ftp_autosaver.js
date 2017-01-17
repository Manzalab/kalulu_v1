/**
 * This module is in charge of saving the user data when the connection to the FTP server is detected.
 * When the save is sent, the next attempts will start if the method `add` is call
**/
define([], function () {

    'use strict';
    var _isEnabled;
    var _LAST_SAVE_DATE    = 'KALULU_FTP_LAST_SAVE_DATE';
    var _LAST_SAVE_CONTENT = 'KALULU_FTP_LAST_SAVE_CONTENT';

    var _opInterval = null;
    var _timeInterval;
    var _dirEntry;
    var _saveFileName;
    var _saveExt;
    var _uuid;

    var _ftpData;
    var _isSending = false;

    var _isTryingToSend = false;

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    var ftpAutoSaver = {

        init : init,
        add  : add,
        startConnecting : startFTPConnecting,
        stopConnecting : stopFTPConnecting

    };

    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

    /**
     *
     * @param {string} uuid
     * @param {string} saveFolderName
     * @param {string} saveFileName
     * @param {string} saveExt
     *
     * @param {Object} ftpData
     * @param {string} ftpData.address
     * @param {string} ftpData.username
     * @param {string} ftpData.password
     * @param {string} ftpData.homePath
     */
    function init (uuid, saveFolderName, saveFileName, saveExt, ftpData) {

        if (typeof window.cordova === 'undefined') {
            _isEnabled = false;
            return;
        }

        _isEnabled = true;

        _initFtpData(ftpData);
        _setUuid(uuid);
        _getSavesFolder(saveFolderName, _setSaveDirEntry);
        _setSaveFileName(saveFileName);
        _setSaveExt(saveExt);

        if (window.localStorage.getItem(_LAST_SAVE_DATE) === null) {
            window.localStorage.setItem(_LAST_SAVE_DATE, _getDateString(new Date()));
        }
    }

    function startFTPConnecting (interval) {

        if (!_isEnabled) return;

        _timeInterval = interval;

        _isTryingToSend = true;
        _startSaveInterval(interval);
    }

    function stopFTPConnecting () {

        if (!_isEnabled) return;

        _isTryingToSend = false;
        _clearSaveInterval();
    }

    function add (saveObject) {

        if (!_isEnabled) return;

        console.info('SAVE PROCESS...', saveObject);

        if (!_apiIsLoaded() || !_isReadyToAddSave()) {
            return;
        }

        var date = _getDateString(new Date());
        var content = JSON.stringify(saveObject);

        var lastDate = window.localStorage.getItem(_LAST_SAVE_DATE);

        if (date === lastDate || lastDate === null) {

            // Save frequency
            window.localStorage.setItem(_LAST_SAVE_CONTENT, content);
            return;

        } else {

            var contentToSend = window.localStorage.getItem(_LAST_SAVE_CONTENT);
            var datePassed    = lastDate;

            // new daily content
            window.localStorage.setItem(_LAST_SAVE_DATE, date);
            window.localStorage.setItem(_LAST_SAVE_CONTENT, content);


            if (contentToSend === null) return;

            // Check if it is the same save than the last one
            /*if (window.localStorage.getItem("KALULU_FTP_LAST_SAVE") !== content) {
                window.localStorage.setItem("KALULU_FTP_LAST_SAVE", content);
                window.localStorage.setItem("KALULU_FTP_LAST_SAVE_KEY", datePassed);
            } else {
                content = window.localStorage.getItem("KALULU_FTP_LAST_SAVE_KEY");
                if (!content) content = 'error: the localStorage data is missing';
            }*/

            contentToSend = '"' + datePassed + '":' + contentToSend;

            var fileName = _getLocalFileName();

            _write(fileName, contentToSend, true, function (r) {
                console.info('SAVE PROCESS DONE', r);


                if (_isTryingToSend && _opInterval === null) {
                    _startSaveInterval(_timeInterval);
                }
            });

        }

    }

    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################

    function _isReadyToAddSave () {
        return typeof _dirEntry !== 'undefined';
    }
    function _isReadyToSend () {
        return window.cordova && window.cordova.plugin && window.cordova.plugin.ftp;
    }

    /**
     *
     * @param {Object} ftpData
     * @param {string} ftpData.address
     * @param {string} ftpData.username
     * @param {string} ftpData.password
     * @param {string} ftpData.homePath
     * @private
     */
    function _initFtpData (ftpData) {
        _ftpData = {
            ADDRESS: ftpData.address, // domain name is also supported, e.g. 'one.two.com'
            USERNAME: ftpData.username,
            PASSWORD: ftpData.password,
            HOME_PATH: ftpData.homePath // any ftp start path you want, e.g. '/', '/myFtpHome/'...
        };
    }

    function _setSaveDirEntry (dirEntry) {
        _dirEntry = dirEntry;
    }

    function _setSaveFileName (fileName) {
        _saveFileName = fileName.trim();
    }

    function _setSaveExt (ext) {
        ext = ext.trim();
        if (ext.charAt(0) === '.') {
            ext = ext.substr(1);
        }
        _saveExt = ext;
    }

    function _setUuid (uuid) {
        _uuid = uuid;
    }

    function _getLocalFileName () {
        return _saveFileName + '_' + _uuid + '.' + _saveExt;
    }

    function _getDateString (date) {
        var year   = ('0000' + date.getUTCFullYear()).substr(-4, 4);
        var month  = ('00' + (date.getUTCMonth()+1)).substr(-2, 2);
        var day    = ('00' + date.getUTCDate()).substr(-2, 2);
        //var hour   = ('00' + date.getUTCHours()).substr(-2, 2);
        //var minute = ('00' + date.getUTCMinutes()).substr(-2, 2);
        //var second = ('00' + date.getUTCSeconds()).substr(-2, 2);
        //var ms     = ('000' + date.getUTCMilliseconds()).substr(-3, 3);
        return year + month + day;// + second + ms;
    }

    function _getSavesFolder (saveFolderName, callback) {

        _createDirectory(saveFolderName, callback);
    }

    function _createDirectory(newFolderName, callback) {

        //window.requestFileSystem(window.PERSISTENT, 0, function (fs) {
        window.resolveLocalFileSystemURL(window.cordova.file.externalDataDirectory, function (rootDirEntry) {
            //var rootDirEntry = fs.root;
            rootDirEntry.getDirectory(newFolderName, { create: true }, callback, console.error);
        }, console.error);
    }

    // SAVE OPERATIONS

    function _startSaveInterval (time) {

        if (_opInterval !== null) {
            _clearSaveInterval();
        }

        _doActionSave();
        _opInterval = window.setInterval(_doActionSave, time);
    }

    function _clearSaveInterval () {

        window.clearInterval(_opInterval);
        _opInterval = null;
    }

    function _doActionSave () {

        if (_isSending || !_apiIsLoaded() || !_isReadyToAddSave() || !_isReadyToSend()) {
            return;
        }

        _sendFile();
    }

    function _write (fileName, content, isAppend, callback) {
        _getFile(fileName, _writeFileOnBoundCallback.bind(undefined, content, isAppend, function (r) {
            if (typeof callback !== 'undefined') callback(r);
        }));
    }

    function _getFile (fileName, callback) {

        console.log('File system open: ' + _dirEntry.name, _dirEntry);

        _dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {

            console.log("FileEntry is file?: " + fileEntry.isFile.toString());

            if (typeof callback !== 'undefined') callback(fileEntry);

        }, onErrorCreateFile);

        function onErrorCreateFile (e) {
            console.error("onErrorCreateFile: ", e);
        }
    }

    function _writeFileOnBoundCallback (content, isAppend, callback, _fileEntry) {
        _writeFile(_fileEntry, content, isAppend, callback);
    }

    function _writeFile(fileEntry, content, isAppend, callback) {

        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {
            console.log("fileWriter", fileWriter);
            fileWriter.onwriteend = function (r) {
                console.log('Successful file write...',r);
                if (typeof callback !== 'undefined') callback(fileEntry);
            };

            fileWriter.onerror = function (e) {
                console.log('Failed file write: ' + e.toString());
            };

            // If we are appending data to file, go to the end of the file.
            if (isAppend) {
                var isExistent = true;
                try {
                    fileWriter.seek(fileWriter.length);
                } catch (e) {
                    // the file doesn't exist yet
                    isExistent = false;
                }

                if (isExistent) {
                    content = ',' + content;
                }
            }

            var dataObj = new Blob([content], { type: 'text/plain' });

            fileWriter.write(dataObj);
        });
    }

    function _sendFile () {

        var localFile = _dirEntry.nativeURL.substr('file://'.length) + _getLocalFileName();
        var remotePath = _dirEntry.fullPath;

        if (remotePath.substr(-1) !== '/') {
            remotePath += '/';
        }

        var remoteFile = remotePath + _saveFileName + '_' + _uuid + '_' + _getDateString(new Date()) + '.' + _saveExt; // `remoteFile`, uploaded from `localFile`


        // 1. connect to one ftp server, then you can do any actions/cmds
        window.cordova.plugin.ftp.connect(_ftpData.ADDRESS, _ftpData.USERNAME, _ftpData.PASSWORD, function(ok) {

            console.info("xtest: ftp: connect ok=" + ok);
            _isSending = true;

            // create one dir on ftp server, fail if a same named dir exists
            _checkRemoteFolder(remotePath, function(ok) {
                console.info("xtest: ftp: mkdir ok=" + ok);

                // upload localFile to remote (you can rename at the same time). arg1: localFile, arg2: remoteFile
                // - make sure you can ACCESS and READ the localFile.
                // - (for iOS) if localFile dose not exist or accessible, a blank remoteFile will be created on ftp server.
                // - if a same named remoteFile exists on ftp server, it will be overrided!
                _upload(localFile, remoteFile, _onUploadSuccess, _onUploadFail);

            });


        }, function(error) {
            console.warn("xtest: ftp: connect error=" + error);
        });

    }

    // 3. create one dir on ftp server, fail if a same named dir exists
    function _checkRemoteFolder (remotePath, callback) {

        window.cordova.plugin.ftp.mkdir(remotePath, function(ok) {
            if (typeof callback !== 'undefined') callback(ok);
        }, function(error) {
            if (typeof callback !== 'undefined') callback(error);
        });
    }

    function _upload (localFile, remoteFile, success, fail) {
        window.cordova.plugin.ftp.upload(localFile, remoteFile, function(percent) {
            if (percent === 1) {
                console.info("xtest: ftp: upload finish");
                if (typeof success !== 'undefined') success();
            } else {
                //"xtest: ftp: upload percent=" + percent * 100 + "%");
            }
        }, function(error) {
            console.warn("xtest: ftp: upload error=" + error);
            if (typeof fail !== 'undefined') fail(error);
        });
    }

    function _onUploadSuccess () {

        _clearSaveInterval();

        _clearLocalSave(function () {
            _isSending = false;
            console.log("local save deleted");
        });
    }

    function _onUploadFail () {
        _isSending = false;
    }

    function _clearLocalSave (callback) {
        _write(_getLocalFileName(), '', false, callback);
    }

    function _apiIsLoaded () {
        return typeof window['FileTransfer'] !== 'undefined' && typeof window['FileUploadOptions'] !== 'undefined';
    }


    return ftpAutoSaver;
});