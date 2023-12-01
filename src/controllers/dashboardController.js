const { config } = require('../config');
const fetch = require('node-fetch');
const { saveLog } = require('./logController');

exports.dashboardView = async (req, res) => {
  // Pass data to the template
  const data = {
    dwnName: config.DWN_NAME,
    myDid: res.locals.myDid,
    endpointURL: `http://${config.HOST}:${config.PORT}`
  };


    fetchRecords = async () => {
      const recordsList = await fetch(`http://${config.HOST}:${config.PORT}/record/query`, {
        method: 'GET',
      }).then(r => r.json())
      .then(r => {
        return r
      })
      .catch((err) => {
        saveLog(err);
      });
      
      return recordsList;
    };


  records = await fetchRecords();
  saveLog(config.DWN_NAME);
  res.render('dashboard', {data, records});
};


exports.dashboardAddRecordView = async (req, res) => {
  // Pass data to the template
  const data = {
    dwnName: config.DWN_NAME,
    myDid: res.locals.myDid,
    endpointURL: `http://${config.HOST}:${config.PORT}`

  };


  res.render('dashboard-add-record', {data});
};