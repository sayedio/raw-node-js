const sampleHandler = {};

sampleHandler.handleSample = (properties, callback) => {
  console.log('sample route handler');
  callback(200, { test: 'ok' });
};
module.exports = sampleHandler;
