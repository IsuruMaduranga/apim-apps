#!/bin/bash

sudo apt-get update -y
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install cypress
npm install --save-dev cypress-file-upload
npm install --save  nodemailer
npm install --save require-text
npm install styliner
npm i --save-dev cypress-mochawesome-reporter
VAR=`grep "PublisherUrl" ../../../../data-bucket/deployment.properties |cut -d'=' -f2`
VAR2=${VAR//[\\]}
export CYPRESS_BASE_URL=${VAR2//\/publisher}

npm install --save-dev cypress-multi-reporters mocha-junit-reporter
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator
npm install --save-dev mocha
npm run delete:reportFolderHTML
npm run delete:reportFolderJUnit
npm run delete:reportFolderReport
npm run test
npm run report:merge
npm run report:generate
#node ./mail.sh