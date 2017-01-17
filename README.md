# kalulu-the-gathering

- Clone the project
- Make sure that you have a recent version of node (^6.3) and npm (nodejs.org)
- open a command prompt in the project folder and type :

> npm install


### to test the app in debug mode :

> npm run testAll

> npm run testAllSwahili

- you can try the app in your browser on localhost:3000


### to test the app in production mode :

> npm run buildProdEnglish

> npm run buildProdSwahili

- you can try the app in your browser on localhost:3000

### In order to build the apk :
You must first execute a build command in english or swahili, then :
> cordova run android
The apk will be pushed on the connected device (if any) and be written at *platform/android/build/output/apk*

You may encouter several error messages requiring to add the android platform, install the android sdk or install java runtime environment, if they are not already installed on your computer