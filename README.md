# Kalulu: learn how to read, write and count!

To start with Kalulu:

- make sure that you have a recent version of node (^6.3) and npm (nodejs.org)
- use git to clone the project
- open a command prompt in the project folder and type:

> npm install

# Testing Kalulu

### To test the app in debug mode

> npm run testAll

> npm run testAllSwahili

- you can try the app in your browser on http://localhost:3000

### To test the app in production mode

> npm run buildProdEnglish

> npm run buildProdSwahili

- you can try the app in your browser on http://localhost:3000

# Building the .apk

You must first execute a build command in English or Swahili, then:

> cordova run android

The apk will be pushed on the connected device (if any) and be written at *platform/android/build/output/apk*.

You may encouter several error messages requiring to:

- add the android platform
- install the android sdk
- or install java runtime environment, if they are not already installed on your computer

# License and contributions

Kalulu uses [phaser.io](http://phaser.io), released by Photon Storm
Ltd under the [MIT license](https://opensource.org/licenses/MIT).

Kalulu also uses the cordova `ftp4j` plugin, released
under [LGPL](http://opensource.org/licenses/LGPL-2.1).

Images, videos and sounds produced by Manzalab are released under
the
[Creative Commons by-sa 4.0 license](https://creativecommons.org/licenses/by-sa/4.0/).

All the code written by Manzalab is released under the Apache 2.0
license--see the `LICENSE` file in this repository.
