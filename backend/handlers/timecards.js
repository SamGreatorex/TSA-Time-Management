const dynamo = require("../utils/dynamo");
const auth = require("../utils/authentication");
const responseLib = require("../utils/response-lib");
const dynamoTable = process.env.TIME_CARD_TABLE;

module.exports.createTimecard = async (event, context, callback) => {
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
    console.log("Dynamo created timecard response.", response);
    return responseLib.success(response.body);
  } catch (error) {
    console.log("Error", error);
    return responseLib.failure(
      error.statusCode.status,
      error.statusCode.message
    );
  }
};

module.exports.listUserTimecards = async (event, context, callback) => {
  //#region Validation
  try {
    //Authenticate
    await auth.authenticateRequest(event, null, ["UserId"]);

    //#endregion

    //Create item
    const pathParameters = event.pathParameters;

    let FilterExpression = "#UserId = :UserId";

    let ExpressionAttributeNames = {
      "#UserId": "UserId",
    };

    let ExpressionAttributeValues = {
      ":UserId": pathParameters.UserId,
    };

    let response = await dynamo.dynamoScan(
      dynamoTable,
      FilterExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    );
    console.log("Dynamo list timecard response.", response);
    return responseLib.success(response);
  } catch (error) {
    console.log("Error", error);
    return responseLib.failure(
      error.statusCode.status,
      error.statusCode.message
    );
  }
};
