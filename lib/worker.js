const data = require('./data');
const { parseJson } = require('./../utils');
const http = require('http');
const https = require('https');
const { sendTwilioSms } = require('./../helpers/notifications');
worker = {};

worker.gatherAllChecks = () => {
  // console.log('worker created');

  data.list('checks', (err, allFiles) => {
    if (!err && allFiles && allFiles.length > 0) {
      allFiles.forEach((file) => {
        worker.checkValidator(file);
      });
    } else {
      console.log('No checks available');
    }
  });
};

worker.checkValidator = (file) => {
  data.read('checks', file, (err2, checkData) => {
    if (!err2 && checkData) {
      const parsedCheckData = parseJson(checkData);

      if (parsedCheckData && parsedCheckData.checkId) {
        // console.log(parsedCheckData);
        worker.validateCheckData(parsedCheckData);
      } else {
        console.log('Error: check file has no id');
      }
    } else {
      console.log('Error: error while getting checkData');
    }
  });
};

worker.validateCheckData = (value) => {
  const checkData = value;
  const status =
    typeof checkData?.status === 'string' &&
    ['up', 'down'].indexOf(checkData.status) > -1
      ? checkData.status
      : 'down';

  const lastChecked =
    typeof checkData?.lastChecked === 'number' && checkData?.lastChecked > 0
      ? checkData?.lastChecked
      : false;

  checkData.status = status;
  checkData.lastChecked = lastChecked;
  worker.performCheck(checkData);
};

worker.performCheck = (checkData) => {
  let checkoutcome = {
    error: false,
    responseCode: false
  };
  let outcomeSent = false;
  const selectedProtocol = checkData.protocol;
  const editedUrl =
    selectedProtocol === 'http'
      ? checkData.url.replace('http://', '')
      : checkData.url.replace('https://', '');
  const parsedUrl = new URL(`${selectedProtocol}://${editedUrl}`);
  // const req = https.request()

  const host = parsedUrl.host;
  const path = parsedUrl.href;

  // console.log(parsedUrl);
  const reqObject = {
    hostname: parsedUrl.hostname,
    port: selectedProtocol === 'https' ? 443 : 80,
    protocol: `${parsedUrl.protocol}`,
    method: checkData.method,
    path: path,
    timeout: checkData.timeoutSeconds * 1000
  };

  const protocolToUse = selectedProtocol === 'http' ? http : https;

  const req = protocolToUse.request(reqObject, (res) => {
    const status = res.statusCode;
    if (!outcomeSent) {
      outcomeSent = true;
      checkoutcome = {
        error: false,
        responseCode: status
      };
      worker.processCheckoutCome(checkData, checkoutcome);
    }
  });

  req.on('error', (err) => {
    console.log(err);
    if (!outcomeSent) {
      outcomeSent = true;
      checkoutcome = {
        error: true,
        value: err
      };
      console.log('error while sending request');
    }
  });
  req.on('timeout', () => {
    // console.log(data);
    if (!outcomeSent) {
      outcomeSent = true;
      checkoutcome = {
        error: true,
        value: 'timeout'
      };
      console.log('timeout');
    }
  });

  req.end();
};

worker.processCheckoutCome = (checkData, checkOutcome) => {
  let state =
    !checkOutcome.error &&
    checkData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? 'up'
      : 'down';
  let alertWanted =
    checkData.lastChecked && checkData.status !== state ? true : false;

  const newCheckData = checkData;
  newCheckData.lastChecked = Date.now();
  newCheckData.status = state;

  data.update('checks', checkData.checkId, newCheckData, (err4) => {
    if (!err4) {
      if (alertWanted) {
        worker.sendMsgToUser(newCheckData);
      } else {
        console.log('status is same as previous, no sms needed');
      }
    } else {
      console.log('Error while saving the updated data at process outcome');
    }
  });
};
worker.sendMsgToUser = (newCheckData) => {
  const msg = `your check for ${newCheckData.method} ${newCheckData.protocol}://${url} is currently ${newCheckData.status}`;
  sendTwilioSms(newCheckData.userPhone, msg, (err5) => {
    if (!err5) {
      console.log('Updated message sended to user');
    } else {
      console.log('Error while sending msg');
    }
  });
};
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 1000 * 60);
};

worker.init = () => {
  worker.gatherAllChecks();
  worker.loop();
};
module.exports = worker;
