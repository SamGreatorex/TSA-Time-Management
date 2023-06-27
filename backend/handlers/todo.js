const dynamo = require("../utils/dynamo");
const auth = require("../utils/authentication");
const responseLib = require("../utils/response-lib");
const dynamoTable = process.env.TODO_TABLE;

module.exports.create = async (event, context, callback) => {
  //#region Validation
  try {
    //Authenticate
    await auth.authenticateRequest(event);

    let body = JSON.parse(event.body);
    if (!body) {
      console.error("Validation Failed:", body);
      return responseLib.generic(400, {
        message: "Incorrect JSON Body",
      });
    }
    //#endregion

    //Create item
    let response = await dynamo.dynamoCreateItem(dynamoTable, body);
    console.log("Dynamo created todo response.", response);
    return responseLib.success(response.body);
  } catch (error) {
    console.log("Error", error);
    return responseLib.failure(
      error.statusCode.status,
      error.statusCode.message
    );
  }
};

module.exports.update = async (event, context, callback) => {
  //#region Validation
  try {
    //Authenticate
    await auth.authenticateRequest(event);

    let body = JSON.parse(event.body);
    if (!body) {
      console.error("Validation Failed:", body);
      return responseLib.generic(400, {
        message: "Incorrect JSON Body",
      });
    }
    //#endregion

    //Create item
    let response = await dynamo.dynamoCreateItem(dynamoTable, body);
    console.log("Dynamo updated todo response.", response);
    return responseLib.success(response.body);
  } catch (error) {
    console.log("Error", error);
    return responseLib.failure(
      error.statusCode.status,
      error.statusCode.message
    );
  }
};

module.exports.delete = async (event, context, callback) => {
  //#region Validation
  try {
    //Authenticate
    await auth.authenticateRequest(event);
    //#endregion

    //Delete item (Set as Visible = flase)
    const pathParameters = event.pathParameters;

    const UpdateExpression = "set IsVisible = :x";
    const ExpressionAttributeValues = {
      ":x": false,
    };

    let response = await dynamo.dynamoUpdateItem(
      dynamoTable,
      "Id",
      pathParameters.Id,
      UpdateExpression,
      ExpressionAttributeValues
    );

    console.log("Dynamo delete response.", response);
    return responseLib.success(response.body);
  } catch (error) {
    console.log("Error", error);
    return responseLib.failure(
      error.statusCode.status,
      error.statusCode.message
    );
  }
};

module.exports.get = async (event, context, callback) => {
  //#region Validation
  try {
    //Authenticate
    await auth.authenticateRequest(event);
    //#endregion

    //List todo items
    const ExpressionAttributeNames = {
      "#Id": "Id",
      "#Task": "Task",
      "#Status": "Status",
      "#IsVisible": "IsVisible",
      "#Progress": "Progress",
      "#ReviewDate": "ReviewDate",
    };
    const ProjectionExpression =
      "#Id, #Task, #Status, #IsVisible, #Progress, #ReviewDate";

    var requests = await dynamo.dynamoScan(
      dynamoTable,
      null,
      ExpressionAttributeNames,
      null,
      ProjectionExpression
    );
    console.log("Request response", requests);
    return responseLib.success(requests);
  } catch (error) {
    console.log("Error", error);
    return responseLib.failure(
      error.statusCode.status,
      error.statusCode.message
    );
  }
};
