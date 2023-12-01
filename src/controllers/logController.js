const { config } = require('../config');
const { existsSync, mkdirSync, appendFileSync } = require('fs');

const saveLog = (logContent) => {
  if (!existsSync(config.LOG_PATH)) {
    mkdirSync(config.LOG_PATH);
  }
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  const currentDateFileName = `log-${year}${month}${day}.log`;
  appendFileSync(
    `${config.LOG_PATH}/${currentDateFileName}`,
    `[${hour}:${minute}:${second}] ${JSON.stringify(logContent)}\r\n`
  );
};

module.exports = {
  saveLog,
};
