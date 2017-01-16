define([], function () {
    
    'use strict';

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    /**
     * The StimuliFactory class aim at producing stimuli object from notions.
     * @class
     * @memberof Namespace (e.g. Kalulu.Remediation)
     * @param parameter {Object} Description of the parameter
    **/
    function StimuliFactory () {}


    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################

    /**
     * Returns something
     * @param paramName {Type} description of the parameter
     * @return {Type} description of the returned object
    **/
    StimuliFactory.prototype.fromWord = function fromWord (word, skills, isCapitalised, isCorrectResponse) {
        
        return {
            value               : isCapitalised ? word.value.capitalise() : word.value.toLowerCase(),
            gpMatch             : word.gpMatch,
            graphemeCount       : word.graphemeCount,
            soundPath           : word.soundPath,
            correctResponse     : isCorrectResponse,
            skills              : skills,
            syllabicStructure   : word.syllabicStructure,
            id                  : word.id
        };
    };

    StimuliFactory.prototype.fromGP = function fromGP (gp, skills, isCapitalised, isCorrectResponse) {
        
        return {
            value               : isCapitalised ? gp.upperCase : gp.lowerCase,
            soundPath           : gp.soundPath,
            correctResponse     : isCorrectResponse,
            skills              : skills,
            syllabicStructure   : gp.syllabicStructure,
            id                  : gp.id
        };
    };

    StimuliFactory.prototype.copy = function copy (stimulus) {
        
        var copy = {};
        Object.assign(copy, stimulus);
        return copy;
    };

    StimuliFactory.prototype.getInversedSyllable = function getInversedSyllable (word, skills, isCapitalised, isCorrectResponse) {
        
        if (word.syllableCount > 1 || (word.syllabicStructure !== "CV" && word.syllabicStructure !== "VC")) {
            console.log(word);
            throw new Error("Impossible to reverse anything else than a 2-graphemes-Syllable");
        } 

        var inversedValue = word.value.split("").reduceRight(function (valA, valB, index, array) {return valA + valB;}, "");
        var inversedGpMatch = word.gpMatch.split(".");
        if (inversedGpMatch[inversedGpMatch.length - 1] === "") inversedGpMatch.splice(inversedGpMatch.length - 1, 1);
        inversedGpMatch = inversedGpMatch.reduceRight(function (valA, valB, index, array) {return valA + "." + valB;});

        return {
            value               : isCapitalised ? inversedValue.capitalise() : inversedValue,
            gpMatch             : inversedGpMatch,
            graphemeCount       : word.graphemeCount,
            soundPath           : [],
            correctResponse     : isCorrectResponse,
            skills              : skills,
            syllabicStructure   : word.syllabicStructure === "CV" ? "VC" : "CV",
            notionId            : ""
        };
    };

    return new StimuliFactory();
});