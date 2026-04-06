const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environment');
const lib = require('./lib/data');

app = {};

// lib.delete('test', 'test', (update) => {
//   console.log(update);
// });

app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environment.port, () => {
    // console.log(process.env.NODE_ENV);
    console.log(`listening on port ${environment.port}`);
  });
};
app.handleReqRes = handleReqRes;

app.createServer();
