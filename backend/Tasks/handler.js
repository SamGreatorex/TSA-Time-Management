const dynamo = require('../utils/dynamo');
const auth = require('../utils/authentication');
const responseLib = require('../utils/response-lib')
const taskTable = process.env.TASK_TABLE;


module.exports.createTask = async (event, context, callback) => {

   //#region Validation
   try{
    //Authenticate 

    await auth.authenticateRequest(event);

   let body = JSON.parse(event.body);
   if (!body) {
     console.error('Validation Failed:', body);
     return responseLib.generic(400, {
       message: 'Incorrect JSON Body',
     });
   }
   //#endregion
 
//Create item
    let response = await dynamo.dynamoCreateItem(taskTable, body);
    console.log('Dynamo created response.', response);
       return responseLib.success(response.body);
     } catch (error) {
       console.log('Error', error);
       return responseLib.failure(error.statusCode.status, error.statusCode.message);
     }
  };

