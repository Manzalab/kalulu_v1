/**
 * This module is in charge of saving the user data when the connection to the FTP server is detected.
 * 
**/
define([], function () {

    'use strict';

    var _opInterval = null;
    var _dirEntry;
    var _saveFileName;
    var _saveExt;

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    var ftpAutoSaver = {

        init : init,
        add  : add,
        startConnecting : startFTPConnecting,
        stopConnecting : stopFTPConnecting

    };

    window.ftpAutoSaver = ftpAutoSaver;

    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

    /**
     *
     * @param {string} saveFolderName
     * @param {string} saveFileName
     * @param {string} saveExt
     */
    function init (saveFolderName, saveFileName, saveExt) {

        _getSavesFolder(saveFolderName, _setSaveDirEntry);
        _setSaveFileName(saveFileName);
        _setSaveExt(saveExt);
    }

    function startFTPConnecting (interval) {

        if (_opInterval !== null) {
            _clearSaveInterval();
        }

        _startSaveInterval(interval);
    }

    function stopFTPConnecting () {

        _clearSaveInterval();
    }

    function add (uuid, saveObject) {

        console.info('SAVE PROCESS...', saveObject);

        if (!_apiIsLoaded() || !_isReadyToAddSave()) {
            return;
        }

        console.info('--- saving...');

        var date = new Date();
        var year  = ('0000' + date.getUTCFullYear()).substr(-4, 4);
        var month = ('00' + (date.getUTCMonth()+1)).substr(-2, 2);
        var day   = ('00' + date.getUTCDate()).substr(-2, 2);

        var content  = JSON.stringify(saveObject);
        var fileName = _saveFileName + '_' + uuid + '_D' + year + month + day + '_' + date.getTime() + '.' + _saveExt;

        _getFile(fileName, _appendFileOnBoundCallback.bind(undefined, content, function (r) {

            console.info('SAVE PROCESS DONE', r);
        }));
    }

    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################

    function _isReadyToAddSave () {
        return typeof _dirEntry !== 'undefined';
    }

    function _writeFileOnBoundCallback (content, callback, _fileEntry) {
        _writeFile(_fileEntry, content, false, callback);
    }

    function _appendFileOnBoundCallback (content, callback, _fileEntry) {
        _writeFile(_fileEntry, content, true, callback);
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

    function _getSavesFolder (saveFolderName, callback) {

        _createDirectory(saveFolderName, callback);
    }

    function _createDirectory(newFolderName, callback) {

        //window.requestFileSystem(window.PERSISTENT, 0, function (fs) {
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (rootDirEntry) {
            //var rootDirEntry = fs.root;
            rootDirEntry.getDirectory(newFolderName, { create: true }, callback, console.error);
        }, console.error);
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

        if (!_apiIsLoaded()) {
            return;
        }

        // TODO
        //_sendFile(_dirEntry.nativeURL + _saveFileName);
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

            var dataObj = new Blob([content], { type: 'text/plain' });

            // If we are appending data to file, go to the end of the file.
            if (isAppend) {
                try {
                    fileWriter.seek(fileWriter.length);
                } catch (e) {
                    // the file doesn't exist yet
                }
            }

            fileWriter.write(dataObj);
        });
    }

    function _sendFile (filePath) {

        console.info('##D sending save...');

        ///////////////////////////////////////////////////////////////////

        var ftpURL = "ftp://manzaphpkv:vMazu7b7@ftp.manzaphp.eu/test.txt;type=i";

        // !! Assumes variable fileURL contains a valid URL to a text file on the device,
        //    for example, cdvfile://localhost/persistent/path/to/file.txt



        if (filePath) {
            var fileURL = filePath; // contains a valid URL to a text file on the device
        } else {
            return;
        }

        console.info('--fileURL: '+fileURL);

        var win = function (r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
        };

        var fail = function (error) {
            alert("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
        };

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = "text/plain";

        var params = {};
        params.value1 = "test";
        params.value2 = "param";

        options.params = params;

        var ft = new FileTransfer();
        ft.upload(fileURL, encodeURI(ftpURL), win, fail, options);

    }

    function _apiIsLoaded () {
        return typeof window['FileTransfer'] !== 'undefined' && typeof window['FileUploadOptions'] !== 'undefined';
    }


    return ftpAutoSaver;
});