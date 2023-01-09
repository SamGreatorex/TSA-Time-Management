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

module.exports.deleteTask = async (event, context, callback) => {

    //#region Validation
    try{
     //Authenticate 
     await auth.authenticateRequest(event,null,['TaskId']);

    //#endregion
  
 //Create item
    const pathParameters = event.pathParameters;
     let response = await dynamo.dynamoDeleteItem(taskTable, 'TaskId', pathParameters.TaskId);
     console.log('Dynamo deleted response.', response);
        return responseLib.success(response.body);
      } catch (error) {
        console.log('Error', error);
        return responseLib.failure(error.statusCode.status, error.statusCode.message);
      }
   };


    
module.exports.listTasks = async (event) => {
    console.log('> listTasks');
  
    try {
     //Authenticate 
     await auth.authenticateRequest(event);

     const ExpressionAttributeNames = {
      '#TaskId': 'TaskId',
      '#Name': 'Name',
      '#Type': 'Type'
    };
    const ProjectionExpression = '#TaskId, #Name, #Type'
  
     var requests = await dynamo.dynamoScan(taskTable, null, ExpressionAttributeNames, null, ProjectionExpression)
     console.log('Request response', requests);
      return responseLib.success(requests);
   

  } catch (error) {
    console.log('Error', error);
    return responseLib.failure(error.statusCode.status, error.statusCode.message);
  }

  };
 