require('dotenv').config()
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const region = process.env.AWS_REGION;
const responseLib = require('./response-lib')
AWS.config.region = region;
AWS.config.credentials = new AWS.Credentials({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY})
const eventConnectionTable = process.env.EVENT_CONNECTION_TABLE;



module.exports.dynamoCreateItem = async (tableName, data)  => {


    console.log(`Creating item in table ${tableName}`);

  try
  {
    const params = {
        TableName: tableName,
        Item: data,
      };
      await dynamoDb.put(params).promise();
      return responseLib.success(`Item added to DB Table: ${tableName}`);
  }catch(error)
  {
    console.log('Error Creating Item in table', error)
    throw responseLib.failure({ status: 500,  message: error.message });
  }
}

module.exports.dynamoDeleteItem = async (tableName, itemIdName, itemIdValue)  => {


    console.log(`Deleting ${itemIdName}: ${itemIdValue} from table: ${tableName}`);

  try
  {
    let params = {
        TableName: tableName,
        Key: {
          [itemIdName]: itemIdValue,
        },
      };
      await dynamoDb.delete(params).promise();
       console.log(`Deleted ${itemIdName}:${itemIdValue} from table ${tableName}`);
    return responseLib.success(`Deleted Item ${itemIdValue} from table ${tableName}`);
  }catch(error)
  {
    console.log('Delete item failed: ', error);
    return responseLib.failure({ message: error.message });
  }
}

module.exports.dynamoScan = async (tableName, FilterExpression, ExpressionAttributeNames, ExpressionAttributeValues, ProjectionExpression)  => {

// console.log(`Deleting ${itemIdName}: ${itemIdValue} from table: ${tableName}`);

try
{
  const params = {
    TableName: tableName,
    FilterExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ProjectionExpression
  };
  // logger.info('Getting data using params: ' + JSON.stringify(params, null, 2));
  const requests = await dynamoDb.scan(params).promise();

    while (requests.LastEvaluatedKey) {
      // console.log('Scanning for more...');
      params.ExclusiveStartKey = requests.LastEvaluatedKey;
      let moreRequests = await dynamo.scan(params).promise();
      // console.log('Returning more requests...:', moreRequests.Items.length);
      requests.Items = requests.Items.concat(moreRequests.Items);
      // console.log('More Requests Last Evaluated Key:', moreRequests.LastEvaluatedKey);
      requests.LastEvaluatedKey = moreRequests.LastEvaluatedKey;
    }

   //console.log(`Items Found:`, requests.Items);
   return requests.Items || [];
}catch(error)
{
  console.log('Delete item failed: ', error);
  return responseLib.failure({ message: error.message });
}
}

     


