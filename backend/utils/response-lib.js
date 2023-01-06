module.exports.generic = function (statusCode, body) {
    return buildResponse(statusCode, body);
  };
  
  module.exports.success = function (body) {
    return buildResponse(200, body);
  };
  
  module.exports.notFound = function () {
    return buildResponse(404, {
      message: 'The requested resource was not found.',
    });
  };
  
  module.exports.unauthorized = function () {
    return buildResponse(403, {
      message: 'You are not authorized to perform the requested action.',
    });
  };
  
  module.exports.created = function (body) {
    return buildResponse(201, body);
  };
  
  module.exports.noContent = function () {
    return buildResponse(204, null);
  };
  
  module.exports.failure = function (status, message) {
    return buildResponse(status ? status : 500, message);
  };
  
  function buildResponse(statusCode, body) {
    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE, HEAD',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(body),
    };
  }