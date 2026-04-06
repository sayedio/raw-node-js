const { handleSample } = require('./handlers/sampleRouteHandler');
const { handleUser } = require('./handlers/userHandlers');
const { handleToken } = require('./handlers/tokenHandler');
const { handleCheck } = require('./handlers/checkHandler');

const routes = {
  sample: handleSample,
  users: handleUser,
  token: handleToken,
  check: handleCheck
};

module.exports = routes;
