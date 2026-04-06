const notFoundRouteHandler = {};

notFoundRouteHandler.handleNotfound = (requestedProperties, callback) => {
  callback(400, {
    message: 'invalid route'
  });
};
module.exports = notFoundRouteHandler;
