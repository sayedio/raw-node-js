const environment = {};

environment.staging = {
  port: 3000,
  envName: 'staging',
  authSecret: 'assdadsadasdadsd',
  maxChecks: 5
};
environment.production = {
  port: 3000,
  envName: 'production',
  authSecret: 'asdalkfnksjdgfkaj',
  maxChecks: 5
};

const environmentKey =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

const environmentsToExport =
  typeof environment[environmentKey] === 'object'
    ? environment[environmentKey]
    : environment.staging;

module.exports = environmentsToExport;
