const data = require('./../lib/data');
const { getRandomString } = require('./../utils');
const { parseJson } = require('./../utils');
const environment = require('./../helpers/environment');
// console.log(environment);
const {
  _token: { verifyToken }
} = require('./../handlers/tokenHandler');

const checkHandler = {};
checkHandler.handleCheck = (requestedProperties, callback) => {
  const methods = ['get', 'post', 'put', 'delete'];
  // console.log(methods.indexOf(requestedProperties.method));
  if (methods.indexOf(requestedProperties.method) > -1) {
    checkHandler._check[requestedProperties.method](
      requestedProperties,
      callback
    );
  } else {
    callback(405, {
      message: 'Invalid method'
    });
  }
};
checkHandler._check = {};

checkHandler._check.get = (requestedProperties, callback) => {
  const { searchParams } = requestedProperties;
  const id = searchParams.get('id');
  if (!id) {
    callback(400, {
      message: 'checks id required'
    });
  } else {
    data.read('checks', id, (err, checksData) => {
      if (!err) {
        const parsedChecksData = parseJson(checksData);
        let token =
          typeof requestedProperties.headers?.token === 'string'
            ? requestedProperties.headers.token
            : false;
        verifyToken(token, parsedChecksData.userPhone, (isValidToken) => {
          if (isValidToken) {
            callback(200, parsedChecksData);
          } else {
            callback(401, {
              error: 'unauthorized access during token validation'
            });
          }
        });
      } else {
        callback(500, {
          error: 'There is a serverside error'
        });
      }
    });
  }
};
checkHandler._check.post = (requestedProperties, callback) => {
  const body = requestedProperties.body;

  const protocol =
    typeof body.protocol === 'string' &&
    ['http', 'https'].indexOf(body.protocol) > -1
      ? body.protocol
      : false;

  const url =
    typeof body.url === 'string' && body.url.trim().length > 0
      ? body.url.trim()
      : false;

  const method =
    typeof body.method === 'string' &&
    ['get', 'put', 'post', 'delete'].indexOf(body.method) > -1
      ? body.method
      : false;
  const successCodes =
    typeof body.successCodes === 'object' && body.successCodes instanceof Array
      ? body.successCodes
      : false;

  const timeoutSeconds =
    typeof body.timeoutSeconds === 'number' &&
    body.timeoutSeconds % 1 === 0 &&
    body.timeoutSeconds >= 1 &&
    body.timeoutSeconds <= 5
      ? body.timeoutSeconds
      : false;
  if (protocol && url && method && successCodes && timeoutSeconds) {
    const token =
      typeof requestedProperties.headers.token === 'string'
        ? requestedProperties.headers.token
        : false;
    if (token) {
      data.read('token', token, (err, uToken) => {
        if (!err && data) {
          const parsedToken = parseJson(uToken);
          data.read('users', parsedToken.phone, (err2, uData) => {
            if (!err2) {
              const parsedUserData = parseJson(uData);

              verifyToken(
                parsedToken.tokenId,
                parsedUserData.phone,
                (isTokenValid) => {
                  // console.log(parsedToken.tokenId);
                  if (isTokenValid) {
                    const userChecks =
                      typeof parsedUserData.checks === 'object' &&
                      parsedUserData.checks instanceof Array
                        ? parsedUserData.checks
                        : [];

                    if (userChecks.length < environment.maxChecks) {
                      const checkId = getRandomString(20);
                      const checksData = {
                        checkId,
                        userPhone: parsedToken.phone,
                        url,
                        method,
                        protocol,
                        successCodes,
                        timeoutSeconds
                      };
                      data.create(
                        'checks',
                        checksData.checkId,
                        checksData,
                        (err4) => {
                          if (!err4) {
                            // userChecks.push(checkId);
                            parsedUserData.checks = userChecks;
                            parsedUserData.checks.push(checkId);
                            // console.log(parsedUserData);
                            data.update(
                              'users',
                              parsedToken.phone,
                              parsedUserData,
                              (err5) => {
                                if (!err5) {
                                  callback(201, {
                                    message: 'Checks successfully created',
                                    checksData
                                  });
                                } else {
                                  callback(500, {
                                    error:
                                      'There is a server error while adding checkId to user data'
                                  });
                                }
                              }
                            );
                          } else {
                            callback(500, {
                              error:
                                'there is a server side error while creating checks'
                            });
                          }
                        }
                      );
                    } else {
                      callback(400, {
                        error: 'Maximum checks limit crossed'
                      });
                    }
                  } else {
                    callback(401, {
                      error: 'Unauthorized access'
                    });
                  }
                }
              );
            } else {
              callback(500, {
                error: 'Server error while getting userdata at create checks'
              });
            }
          });
        } else {
          callback(400, {
            error: 'Invalid token'
          });
        }
      });
    } else {
      callback(401, {
        error: 'Unauthorized access invalid token'
      });
    }
  } else {
    callback(400, {
      error: 'Invalid Properties'
    });
  }
};
checkHandler._check.put = (requestedProperties, callback) => {};
checkHandler._check.delete = (requestedProperties, callback) => {};

module.exports = checkHandler;
