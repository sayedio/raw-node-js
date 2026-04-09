const http = require('http');
const { handleReqRes } = require('./../helpers/handleReqRes');
const environment = require('./../helpers/environment');
// const lib = require('./lib/data');

server = {};

// lib.delete('test', 'test', (update) => {
//   console.log(update);
// });

server.createServer = () => {
  const serverVariable = http.createServer(app.handleReqRes);
  serverVariable.listen(environment.port, () => {
    // console.log(process.env.NODE_ENV);
    console.log(`listening on port ${environment.port}`);
  });
};
server.handleReqRes = handleReqRes;

server.init = () => {
  server.createServer();
};

module.exports = server;
