const data = require('./../lib/data');
const { hash } = require('./../utils');
const { parseJson } = require('./../utils');
const { getRandomString } = require('./../utils');
const tokenHandler = {};

tokenHandler.handleToken = (requestedProperties, callback) => {
  const methods = ['get', 'post', 'put', 'delete'];
  // console.log(methods.indexOf(requestedProperties.method));
  if (methods.indexOf(requestedProperties.method) > -1) {
    tokenHandler._token[requestedProperties.method](
      requestedProperties,
      callback
    );
  } else {
    callback(405, {
      message: 'Invalid method'
    });
  }
};
tokenHandler._token = {};

tokenHandler._token.get = (requestedProperties, callback) => {
  const { searchParams } = requestedProperties;
  const token = searchParams.get('token');
  if (!token) {
    callback(400, {
      message: 'token required'
    });
    return;
  }
  data.read('token', token, (err, uData) => {
    const formattedData = parseJson(uData);
    if (!err) {
      callback(200, {
        details: formattedData
      });
    } else {
      callback(400, {
        message: 'token not found'
      });
    }
  });
};
tokenHandler._token.post = (requestedProperties, callback) => {
  const body = requestedProperties.body;
  const password =
    typeof body.password === 'string' && body.password.trim().length > 0
      ? body.password.trim()
      : false;
  const phone =
    typeof body.phone === 'string' && body.phone.trim().length === 11
      ? body.phone.trim()
      : false;

  // console.log(body);
  if (password && phone) {
    data.read('users', phone, (err, userData) => {
      if (!err) {
        const parsedData = parseJson(userData);
        const hashedPassword = hash(password);

        if (parsedData.hashedPassword === hashedPassword) {
          const tokenId = getRandomString(20);
          const expiresAt = Date.now() + 60 * 60 * 1000;
          const tokenObj = {
            tokenId,
            phone,
            expiresAt
          };

          data.create('token', tokenId, tokenObj, (err2) => {
            if (!err2) {
              callback(200, {
                message: 'token added Successfully',
                tokenObj
              });
            } else {
              callback(500, {
                message: 'Failed to add token'
              });
            }
          });
        } else {
          callback(401, {
            message: 'password not correct'
          });
        }
      } else {
        callback(400, {
          message: 'Invalid phone or password'
        });
      }
    });
  } else {
    callback(400, {
      message: 'Password and phone needed'
    });
  }
};
tokenHandler._token.put = (requestedProperties, callback) => {
  const body = requestedProperties.body;
  const token =
    typeof body.token === 'string' && body.token.trim().length > 0
      ? body.token.trim()
      : false;
  const extend =
    typeof body.extend === 'boolean' && body.extend === true ? true : false;
  // console.log(typeof body.extend);
  // console.log(token, extend);
  if (token && extend) {
    data.read('token', token, (err, uData) => {
      if (!err) {
        const parsedData = parseJson(uData);
        if (parsedData.expiresAt > Date.now()) {
          parsedData.expiresAt = Date.now() + 60 * 60 * 1000;
          data.update('token', token, parsedData, (err) => {
            if (!err) {
              callback(201, {
                message: 'token data updated'
              });
            } else {
              callback(500, {
                message: 'token expired'
              });
            }
          });
        }
      } else {
        callback(400, {
          message: 'invalid token'
        });
      }
    });
  } else {
    callback(400, {
      message: 'invalid properties'
    });
  }
};
tokenHandler._token.delete = (requestedProperties, callback) => {
  const searchParams = requestedProperties.searchParams;

  const token =
    typeof searchParams.get('token') === 'string' &&
    searchParams.get('token').trim().length > 0
      ? searchParams.get('token').trim()
      : false;

  if (!token) {
    callback(400, {
      message: 'invalid token'
    });
  } else {
    data.delete('token', token, (err) => {
      if (!err) {
        callback(200, {
          message: 'toke Deleted successfully'
        });
      } else {
        callback(404, {
          message: 'token is not saved in db'
        });
      }
    });
  }
};

tokenHandler._token.verifyToken = (tokenId, phone, callback) => {
  // console.log(tokenId);
  data.read('token', tokenId, (err, data) => {
    if (!err && data) {
      const parsedData = parseJson(data);

      if (parsedData.phone === phone && parsedData.expiresAt > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = tokenHandler;
