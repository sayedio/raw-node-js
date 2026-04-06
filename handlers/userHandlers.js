const data = require('./../lib/data');
const { hash } = require('./../utils');
const { parseJson } = require('./../utils');
const {
  _token: { verifyToken }
} = require('./../handlers/tokenHandler');

const userHandler = {};
userHandler.handleUser = (requestedProperties, callback) => {
  const methods = ['get', 'post', 'put', 'delete'];
  // console.log(methods.indexOf(requestedProperties.method));
  if (methods.indexOf(requestedProperties.method) > -1) {
    userHandler._user[requestedProperties.method](
      requestedProperties,
      callback
    );
  } else {
    callback(405, {
      message: 'Invalid method'
    });
  }
};
userHandler._user = {};

userHandler._user.get = (requestedProperties, callback) => {
  const { searchParams } = requestedProperties;
  const phone = searchParams.get('phone');
  if (!phone) {
    callback(400, {
      message: 'Phone number required'
    });
    return;
  }
  let token =
    typeof requestedProperties.headers?.token === 'string'
      ? requestedProperties.headers.token
      : false;
  if (token) {
    verifyToken(token, phone, (isTokenOk) => {
      if (isTokenOk) {
        data.read('users', phone, (err, data) => {
          const formattedData = parseJson(data);
          const { hashedPassword, ...rest } = formattedData;
          if (!err) {
            callback(200, {
              details: rest
            });
          } else {
            callback(400, {
              message: 'number not found'
            });
          }
        });
      } else {
        callback(401, {
          message: 'unauthorized access'
        });
      }
    });
  } else {
    callback(400, {
      message: 'token needed'
    });
  }
};
userHandler._user.post = (requestedProperties, callback) => {
  const body = requestedProperties.body;
  const firstname =
    typeof body.firstname === 'string' && body.firstname.trim().length > 0
      ? body.firstname.trim()
      : false;
  const lastname =
    typeof body.lastname === 'string' && body.lastname.trim().length > 0
      ? body.lastname.trim()
      : false;
  const phone =
    typeof body.phone === 'string' && body.phone.trim().length === 11
      ? body.phone.trim()
      : false;
  const password =
    typeof body.password === 'string' && body.password.trim().length > 0
      ? body.password.trim()
      : false;

  // console.log(typeof body.tosAgree);
  const tosAgree = body.tosAgree === true ? body.tosAgree : false;

  if (firstname && lastname && phone && password && tosAgree) {
    const newObj = {
      firstname,
      lastname,
      phone,
      tosAgree,
      hashedPassword: hash(password)
    };
    // callback(200, newObj);
    data.create('users', phone, newObj, (err) => {
      if (!err) {
        callback(201, {
          message: 'User successfully created'
        });
      } else {
        callback(400, {
          message: 'number already exists'
        });
      }
    });
  } else {
    callback(400, {
      message: 'incomplete properties'
    });
  }
};
userHandler._user.put = (requestedProperties, callback) => {
  const body = requestedProperties.body;
  const firstname =
    typeof body.firstname === 'string' && body.firstname.trim().length > 0
      ? body.firstname.trim()
      : false;
  const lastname =
    typeof body.lastname === 'string' && body.lastname.trim().length > 0
      ? body.lastname.trim()
      : false;

  const password =
    typeof body.password === 'string' && body.password.trim().length > 0
      ? body.password.trim()
      : false;
  const phone =
    typeof body.phone === 'string' && body.phone.trim().length === 11
      ? body.phone.trim()
      : false;

  if (firstname || lastname || password || phone) {
    let token =
      typeof requestedProperties.headers.token === 'string'
        ? requestedProperties.headers.token
        : false;
    if (token) {
      verifyToken(token, phone, (isTokenOk) => {
        if (isTokenOk) {
          data.read('users', phone, (err, uData) => {
            if (!err) {
              const parsedData = parseJson(uData);
              let newObj = parsedData;
              if (firstname) {
                newObj = { ...newObj, firstname };
              }
              if (lastname) {
                newObj = { ...newObj, lastname };
              }
              if (password) {
                newObj = { ...newObj, hashedPassword: hash(password) };
              }
              data.update('users', phone, newObj, (err) => {
                if (!err) {
                  callback(201, {
                    message: 'user data updated'
                  });
                } else {
                  callback(500, {
                    message: 'server error updating users'
                  });
                }
              });
            } else {
              callback(400, {
                message: 'number not available or number incorrect or missing'
              });
            }
          });
        } else {
          callback(401, {
            message: 'unauthorized access'
          });
        }
      });
    } else {
      callback(400, {
        message: 'token needed'
      });
    }
  } else {
    callback(400, {
      message: 'invalid properties'
    });
  }
};
userHandler._user.delete = (requestedProperties, callback) => {
  const searchParams = requestedProperties.searchParams;

  const phone =
    typeof searchParams.get('phone') === 'string' &&
    searchParams.get('phone').trim().length === 11
      ? searchParams.get('phone').trim()
      : false;

  if (!phone) {
    callback(400, {
      message: 'phone number invalid'
    });
  } else {
    let token =
      typeof requestedProperties.headers.token === 'string'
        ? requestedProperties.headers.token
        : false;
    if (token) {
      verifyToken(token, phone, (isTokenOk) => {
        if (isTokenOk) {
          data.delete('users', phone, (err) => {
            if (!err) {
              callback(200, {
                message: 'Deleted successfully'
              });
            } else {
              callback(404, {
                message: 'user number is not saved in db'
              });
            }
          });
        } else {
          callback(401, {
            message: 'unauthorized access'
          });
        }
      });
    } else {
      callback(400, {
        message: 'token needed'
      });
    }
  }
};

module.exports = userHandler;
