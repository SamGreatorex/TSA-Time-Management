const dynamo = require('../utils/dynamo');
const auth = require('../utils/authentication');
const responseLib = require('../utils/response-lib')
const taskTable = process.env.TASK_TABLE;
const uuid = require('uuid');

const dynamoTable = 'prod-time-card';

module.exports.testLambda = async (event, context, callback) => {


  //Get All Timecards
  let FilterExpression = '#UserId = :UserId';
  let ExpressionAttributeNames = {
    '#UserId': 'UserId'
  };
  let ExpressionAttributeValues = {
    ':UserId': 'samg'
  };
 let timecards = await dynamo.dynamoScan(dynamoTable, FilterExpression, ExpressionAttributeNames, ExpressionAttributeValues);

 for(var i = 0; i < timecards.length; i++){
  let timeCard = {...timecards[i]};
  let updated = false;

  let updatedTasks = timecards[i].Tasks.map((task) => {
    let updatedTask = {...task};
    if (!task.TaskTypeId) {
      updatedTask.TaskTypeId = task.TaskId;
      updatedTask.TaskId = uuid.v4();
      updated = true;
    }
    //if any missing noteID

    let updatedNotes = task.Notes?.map((note) => {
      let updatedNote = {...note};
      if(!note.noteId) 
      {
        updatedNote.noteId = uuid.v4();
      updated=true;
      }
      return updatedNote;
    });
  
    updatedTask.Notes = updatedNotes;
    return updatedTask;
  });

  if(updated)
  {
    timeCard.Tasks = updatedTasks
    let response = await dynamo.dynamoCreateItem(dynamoTable, timeCard);
    console.log('Updated Timecardx', response)
  }

 }
      return responseLib.success('Request Sent');
  
  };

