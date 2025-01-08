# Gaithersburg Transportation Grant Report

Given transportation and address data, this report validates addresses against the Gaithersburg city database and computes totals.

## Development installation

This is a Google Apps Script project which uses:
* Clasp for source code management
* QUnit for testing
* ESLint and Prettier for linting and formatting

To set up a local development environment, do the following:
1) Install [Node.js](https://nodejs.org/en/download/)
2) Install [Clasp](https://developers.google.com/apps-script/guides/clasp)
3) Run `npm install` from the project directory

To lint and format:
1) Run `npx eslint --fix`
2) Run `npx prettier . --write`