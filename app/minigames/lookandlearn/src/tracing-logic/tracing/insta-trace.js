/**
* Created by Cyprien on 07/01/2017
*/
(function () {
    
    'use strict';

    var Emitter = require('../events/emitter');
    var Events = require('../events/events');
    var graphsDescriptor = require('../../../assets/config/letters-descriptor.json');



    function InstaTrace(game, tracer){

        this.game = game;

        this.tracer = tracer;
        this.currentModel = null;
    }

    InstaTrace.prototype.setModel = function InstaTraceSetModel(letter){

        this.currentModel = graphsDescriptor.letters[letter];
        // this.tracer.setModelForPainter(this.currentModel, letter);
        this.tracer.getBitmap(letter);
    };

    module.exports = InstaTrace;
})();
    
