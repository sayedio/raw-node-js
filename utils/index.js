const crypto = require('crypto');
const environment = require('./../helpers/environment');
const utils = {};

utils.parseJson = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
};
utils.hash = (str) => {
  const hmac = crypto
    .createHmac('sha256', environment.authSecret)
    .update(str)
    .digest('hex');

  return hmac;
};
utils.getRandomString = (size) => {
  const finalSize = typeof size === 'number' ? size : 20;
  const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let data = '';
  for (let i = 1; i <= finalSize; i++) {
    const char = characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
    data += char;
    // console.log(data);
  }

  return data;
};
module.exports = utils;
