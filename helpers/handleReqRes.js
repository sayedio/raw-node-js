const { StringDecoder } = require('string_decoder');
const routes = require('./../routes');
const { handleNotfound } = require('./../handlers/notFountRouteHandler');
const { parseJson } = require('./../utils');

const handler = {};
handler.handleReqRes = (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const trimmedPathname = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
  const method = req.method.toLowerCase();
  const headers = req.headers;
  const searchParams = parsedUrl.searchParams;

  const requestedProperties = {
    parsedUrl,
    trimmedPathname,
    method,
    headers,
    searchParams
  };

  if (trimmedPathname === 'favicon.ico') {
    res.end();
    return;
  }
  if (!trimmedPathname) {
    res.end('welcome to raw nodejs');
    return;
  }

  const decoder = new StringDecoder('utf-8');
  let bodyData = '';
  req.on('data', (buffer) => {
    bodyData += decoder.write(buffer);
  });
  req.on('end', () => {
    bodyData += decoder.end();
    requestedProperties.body = parseJson(bodyData);
    const chosenHandler = routes[trimmedPathname]
      ? routes[trimmedPathname]
      : handleNotfound;

    chosenHandler(requestedProperties, (status, payload) => {
      const statusCode = typeof status === 'number' ? status : 400;
      const fixPayload = payload && typeof payload === 'object' ? payload : {};

      res.writeHead(statusCode, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify(fixPayload));
    });
    // console.log(searchParams);
    // res.end();
  });
};
module.exports = handler;
