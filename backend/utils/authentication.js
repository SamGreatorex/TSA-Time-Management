const responseLib = require('./response-lib')

module.exports.authenticateRequest = async (event, headers, params, qsParams)  => {

//Authenticate Token
//    if (!headers.hasOwnProperty('token')) {
//      console.error('Missing token header');
//      return responseLib.generic(400, {
//        message: 'Missing token header',
//      });
//    }


//Authenticate Headers
if(headers)
{
    const eventHeaders = event.headers; 
    for (let i = 0; i < headers.length; i++) {
        let _header = headers[i];
        if (!eventHeaders.hasOwnProperty(_header)) {
            console.error(`Missing header: ${_header}`);
            throw responseLib.generic(400, {
              message: `Missing header: ${_header}`,
            });
          }
       }
}


//Authenticate Params
if(params)
{
    const eventParams = event.pathParameters;
    for (let i = 0; i < params.length; i++) {
        let _param = params[i];
        if (!eventParams.hasOwnProperty(_param)) {
            console.error(`Missing parameter: ${_param}`);
            throw responseLib.generic(400, {
              message: `Missing parameter: ${_param}`,
            });
          }
       }
}

if(qsParams)
{
    const _qsParams = event.pathParameters;
    for (let i = 0; i < qsParams.length; i++) {
        let _param = qsParams[i];
        if (!_qsParams.hasOwnProperty(_param)) {
            console.error(`Missing Querystring Parameter: ${_param}`);
            throw responseLib.generic(400, {
              message: `Missing Querystring Parameter: ${_param}`,
            });
          }
       }
}
console.log('request Authenticated');
}

     