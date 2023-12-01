const express = require('express');
const bodyParser = require('body-parser');
const { config, protocols } = require('./config');

const { dashboard, log, dwn } = require('./controllers');

// node.js 18 and earlier, needs globalThis.crypto polyfill
const { webcrypto } = require('node:crypto');
// @ts-ignore
if (!globalThis.crypto) globalThis.crypto = webcrypto;

const routes = express.Router();

let errorMessage = '';
let currentInstance, myDid;

init = async () => {
  return new Promise(async (resolve) => {
    const { web5, did } = await dwn.connect();
    currentInstance = web5;
    myDid = did;
  
    await dwn.protocol(currentInstance, myDid);
  
    return { web5, did };
  });
};

module.exports = {
  routes,
  init,
};

routes.use(bodyParser.urlencoded({ extended: true }));
routes.use((request, response, next) => {
  // parsing body content
  bodyParser.json()(request, response, (error) => {
    if (error instanceof SyntaxError) {
      response.status(400);
      response.setHeader('content-type', 'application/json');
      errorMessage = `{"error": "Invalid JSON format"}`;
      response.send(`${errorMessage}`);
      log.saveLog(errorMessage);
    } else {
      next();
    }
  });
});

// Middleware to set local variables
routes.use((req, res, next) => {
  // Set local variables
  res.locals.currentInstance = currentInstance;
  res.locals.myDid = myDid;
  next();
});

routes.get('/', (req, res) => {
  res.send(JSON.stringify({ ping: 'pong' }));
  log.saveLog(myDid);
});

routes.get('/dashboard', dashboard.dashboardView);
routes.get('/add-record', dashboard.dashboardAddRecordView);



routes.get('/myDid', (req, res) => {
  res.send(myDid);
});

routes.post('/record/save', dwn.saveRecord);

// get all records
routes.get('/record/query', dwn.getRecords);

routes.get('/record/query/:id', dwn.getRecords);

routes.post('/record/deleteRecord', dwn.deleteRecord);
routes.post('/record/shareRecord', dwn.shareRecord);
routes.post('/record/shareRecordById', dwn.shareRecordById);
routes.post('/record/protocol', dwn.protocolList);



