var Phaser = require('phaser-bundle');

console.log("I'm Look & Learn");
console.log('Look And Learn : Phaser.Game is a ' + typeof Phaser.Game);

module.exports = {
    Launcher : LookAndLearnLauncher
};

function LookAndLearnLauncher () {
    //var game = new Phaser.Game();
    console.log('ll starting');
    return 'string 000';
}

// request.ensure not working properly