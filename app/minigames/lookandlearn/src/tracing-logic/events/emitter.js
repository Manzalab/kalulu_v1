/**
 * Created by Adrien on 12/08/2016.
 */
var EventEmitter = require('micro-events'); // require it

function loadEmitter(game){
    var emitter = new EventEmitter();

    emitter.maxListeners = 20;

    return emitter;
}

module.exports = loadEmitter();