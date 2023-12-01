const { config, protocols } = require('../../config');
const { Web5 } = require('@web5/api');
const { saveLog } = require('../logController');

/**
 * Connect to DWN instance.
 *
 * @returns {{
 *  web5: Object,
 *  did: String
 * }} web5 is DWN instance object, did is the DID of current DWN
 */
const connect = async () => {
  let connect_options = {
  }

  connect_options = config.DWN_END_POINTS ? {...connect_options, techPreview: {dwnEndpoints: [config.DWN_END_POINTS]}} : connect_options;
  connect_options = config.DWN_SYNC_SECONDS ? {...connect_options, sync: `${config.DWN_SYNC_SECONDS}s`} : connect_options;

  saveLog(connect_options);
  const { web5, did } = await Web5.connect(connect_options);

  return { web5, did };
};

const getRecords = async (req, res) => {
  const web5Instance = res.locals.currentInstance;
  const recordId = req.params.id || '';
  
  const recordList = await queryRecord(web5Instance, recordId);

  res.status(200);
  res.setHeader('content-type', 'application/json');
  res.send(`${JSON.stringify(recordList)}`);
  saveLog(recordList);
  return;
  
}

const queryRecord = async (web5Instance, recordId)=> {
  const filterMessage = {
    message: {
      filter: {
        dataFormat: 'application/json',
      },
    },
  };
  
  filterMessage.message.filter = recordId ? {...filterMessage.message.filter, recordId} : filterMessage.message.filter;
  const { records } = await web5Instance.dwn.records.query(filterMessage);
  
  const recordList = await Promise.all(
    await records.filter(record => !config.EXCLUDE_SCHEMA.includes(record.schema))
    .map(async(record) => {
      let data = "";
      try {
        data = await record.data.json();
      } catch (error) {
        try {
          data = await record.data.text();
        } catch (error) {
          saveLog(error);
        }
      }
      
      const returnJSON = {
        schema: (record.schema ? record.schema : ''),
        recordId: record.id,
        protocol: (record.schema ? record.protocol : ''),
        protocolPath: (record.schema ? record.protocolPath : ''),
        data 
      };
      return returnJSON;
      
    })
  );
  
  return recordList;
}

const protocol = async (web5Instance, myDid) => {
  // setup the protocol permission to allow other user to read/write data in current user's DWeb Node.
  const { protocol } = await web5Instance.dwn.protocols.configure(
    protocols.protocolDefinition
  );
  // sends the protocol configuration to the user's other DWeb Nodes.
  protocol.send(myDid);

  return;
};

const protocolList = async (req, res) => {
  const web5Instance = res.locals.currentInstance;
  const myDid = res.locals.myDid;
  const { targetDid, protocol } = req.body;
  let protocolMessage = {
    message: {
    },
  };

  protocolMessage = targetDid ? {...protocolMessage, from: targetDid} : protocolMessage;

  if(protocol){
    protocolMessage.message = {...protocolMessage.message, filter: {} }
    protocolMessage.message = protocol ? {...protocolMessage.message.filter, protocol} : protocolMessage.message;
  }

  // protocolMessage.message.filter = targetDid ? Object.assign(protocolMessage.message.filter, {from: targetDid}) : protocolMessage.message;
  // protocolMessage.message.filter = protocol ? Object.assign(protocolMessage.message.filter, {protocol}) : protocolMessage.message;
    saveLog(protocolMessage); // logs an array of protocol configurations installed on Bob's DWeb Node
    try{
    const { protocols, protocolStatus } = await web5Instance.dwn.protocols.query(protocolMessage);
    // saveLog(protocolMessage); // logs an array of protocol configurations installed on Bob's DWeb Node
    saveLog(protocols); // logs an array of protocol configurations installed on Bob's DWeb Node
    res.send(protocols);
    return;
  }catch(err){
    saveLog(err);
    res.send(`[]`);
    return;
  }
}

const saveRecord = async (req, res) => {
  const web5Instance = res.locals.currentInstance;
  const myDid = res.locals.myDid;
  const { schema, data, protocol, protocolPath } = req.body;
  const recordMessage = {
    data: data,
    message: {
      dataFormat: 'application/json',
    },
  };
  recordMessage.message = schema ? {...recordMessage.message, schema} : recordMessage.message;
  recordMessage.message = protocol ? {...recordMessage.message, protocol} : recordMessage.message;
  recordMessage.message = protocolPath ? {...recordMessage.message, protocolPath} : recordMessage.message;


  saveLog(recordMessage);
  const { record: postRecord, status: postStatus } =
    await web5Instance.dwn.records.create(recordMessage);

  if(![200,202].includes(postStatus.code)){
    res.send(postStatus);
    return
  }
  const { status } = await postRecord.send(myDid);

  res.send(status);
  return;
}


const shareRecord = async (req, res) => {
  const web5Instance = res.locals.currentInstance;
  const myDid = res.locals.myDid;
  const { data, targetDid, protocol, protocolPath, schema } = req.body;

  const shareMessage = {
    data,
    message: {
      recipient: (targetDid || myDid),
      dataFormat: 'application/json',
    },
  };
  shareMessage.message = targetDid ? {...shareMessage.message, store: false} : shareMessage.message;
  shareMessage.message = protocol ? {...shareMessage.message, protocol} : shareMessage.message;
  shareMessage.message = protocolPath ? {...shareMessage.message, protocolPath} : shareMessage.message;
  shareMessage.message = schema ? {...shareMessage.message, schema} : shareMessage.message;

  const { record: postRecord, status: createStatus } =
    await web5Instance.dwn.records.create(shareMessage);
  if(![200,202].includes(createStatus.code)){
    res.send(createStatus);
    saveLog(createStatus);
    return
  }
  const { status: targetStatus } = await postRecord.send(targetDid);
  res.send(targetStatus);
  saveLog(targetStatus);
  return;
}

const shareRecordById = async (req, res) => {
  const web5Instance = res.locals.currentInstance;
  const myDid = res.locals.myDid;
  const { id, targetDid} = req.body;

  if(id==""){
    return;
  }
  const record = await queryRecord(web5Instance, id) || [];
  if(record.length<0){
    return;
  }

  const {data, protocol, protocolPath, schema} = record[0];

  const shareMessage = {
    data,
    message: {
      recipient: targetDid,
      dataFormat: 'application/json',
    },
  };
  shareMessage.message = targetDid ? {...shareMessage.message, store: false} : shareMessage.message;
  shareMessage.message = protocol ? {...shareMessage.message, protocol} : shareMessage.message;
  shareMessage.message = protocolPath ? {...shareMessage.message, protocolPath} : shareMessage.message;
  shareMessage.message = schema ? {...shareMessage.message, schema} : shareMessage.message;

  saveLog(shareMessage);
  const { record: postRecord, status: createStatus } =
    await web5Instance.dwn.records.create(shareMessage);
    saveLog(targetDid);
    saveLog(createStatus);
  if(![200,202].includes(createStatus.code)){
    res.send(createStatus);
    return
  }
  const { status: targetStatus } = await postRecord.send(targetDid);
  saveLog(targetStatus);
  res.send(targetStatus);

  saveLog(targetDid);
  return;
}

const deleteRecord = async (req, res) => {
  const web5Instance = res.locals.currentInstance;
  const myDid = res.locals.myDid;
  const { id, targetDid } = req.body;

  const deleteMessage = {
    message: {
      recordId: id,
    },
  };
  newDeleteMessage = targetDid ? {...deleteMessage, from: targetDid} : deleteMessage;
  
  const { record } =
    await web5Instance.dwn.records.delete(newDeleteMessage);
    res.status(200);
    res.setHeader('content-type', 'application/json');
    res.send();
    saveLog(record);
  return;
}

module.exports = {
  connect,
  deleteRecord,
  getRecords,
  protocol,
  protocolList,
  saveRecord,
  shareRecord,
  shareRecordById,
};
