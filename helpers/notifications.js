const https = require('https');
const { twilio } = require('./environment');
const queryString = require('querystring');
//TODO: testing is needed
const notifications = {};

notifications.sendTwilioSms = (phone, msg, callback) => {
  const finalPhone =
    typeof phone === 'string' && phone.length === 11 ? phone : false;
  const finalMsg =
    typeof msg === 'string' &&
    msg.trim().length > 1 &&
    msg.trim().length <= 1500
      ? msg.trim()
      : false;

  if (finalMsg && finalPhone) {
    const payload = {
      From: twilio.fromNumber,
      To: `+88${phone}`,
      Body: finalMsg
    };
    const stringifyPayload = queryString.stringify(payload);
    const options = {
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${twilio.TWILIO_ACCOUNT_SID}/Messages`,
      method: 'POST',
      auth: `${twilio.TWILIO_ACCOUNT_SID}:${twilio.TWILIO_AUTH_TOKEN}`,
      headers: {
        'Content-Type': 'application/x-www-from-urlencoded'
      }
    };
    const req = https.request(options, (res) => {
      const status = res.statusCode;
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Returned status code was ${status}`);
      }
    });

    req.on('error', (e) => {
      callback(e);
    });
    req.write(stringifyPayload);
    req.end();
  } else {
    callback('there is a issue with your number and message');
  }
};

module.exports = notifications;
