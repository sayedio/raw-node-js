const server = require('./lib/server');
const worker = require('./lib/worker');

app = {};
// lib.delete('test', 'test', (update) => {
//   console.log(update);
// });

app.init = () => {
  server.init();
  worker.init();
};

app.init();
module.exports = app;
