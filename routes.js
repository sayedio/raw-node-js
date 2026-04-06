const { handleSample } = require('./handlers/sampleRouteHandler');
const { handleUser } = require('./handlers/userHandlers');
const { handleToken } = require('./handlers/tokenHandler');

const routes = {
  sample: handleSample,
  users: handleUser,
  token: handleToken
};

module.exports = routes;
