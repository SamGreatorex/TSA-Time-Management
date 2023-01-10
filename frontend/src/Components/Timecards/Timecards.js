import React, {useEffect, useState} from 'react';
import {Select, Row, Col, Space, Tooltip, Button,Table, Input} from 'antd';
import * as tcActions from '../../redux/actions/timecards';
import { connect} from 'react-redux';
import {bindActionCreators } from 'redux';
import moment from 'moment';
import { v4 as uuid } from 'uuid';

const { Option } = Select;

 function Timecards({actions, timecards}) {


  const [lTimecards, setlTimecards] = useState([])
  const [currentTimecard, setCurrentTimecard] = useState(null)
  const [updatingTask, setUpdatingTask] = useState(false) 
  const [tcDescription, setTCDescription] = useState(null) 
  
  useEffect(() => {

    console.log('Timecards Loaded', timecards);

   if(timecards.length === 0) {
      actions.getUserTimecards('samg');
    }else
    {
      setlTimecards(timecards.timecards);
      const cTimeCard = timecards.timecards.find(x=>moment(x.StartDate).toString() === moment().startOf('isoWeek').toString());
    console.log('Current Time Card Set as:', cTimeCard);
    setCurrentTimecard(cTimeCard);
    }

  }, [timecards]);


  const timeCardsTasks = [
    {
        key: 'taskId',
        dataIndex: 'taskId',
        hidden: true
      },
      {
        title: 'Task Name',
        key: 'Name',
        dataIndex: 'Name',
        align: 'center',
      },
      {
        title: 'Type',
        key: 'Type',
        dataIndex: 'Type',
        align: 'center',
      },
      {
        key: 'actions',
        align: 'center',
        render:  (record) => {
            return (
              <Space direction="vrtical">
                {/* Only Show start button if no other task is in progress*/}
    
              {!currentTimecard.Tasks?.find(x=> x.totalDuration === "") && !updatingTask  && 
                <Tooltip title="Start Task">
                   <Button onClick={() =>OnStartTask(record)} type="primary">Start </Button>
                </Tooltip>

              }
              
             {/* Only Show end button if task is in progress*/}
              {currentTimecard.Tasks?.find(x=>x.taskId === record.TaskId && x.totalDuration === "") && !updatingTask  &&
                     <Tooltip title="End Task">
                     <Button onClick={() => setUpdatingTask(true)}> Stop </Button>
                    </Tooltip>
              }

              {currentTimecard.Tasks?.find(x=>x.taskId === record.TaskId && x.totalDuration === "") && updatingTask  &&
                    <Input.Group compact>
                        <Input onChange={(e) => setTCDescription(e.target.value)}/>
                        <Button type="primary" onClick={() => OnEndTask(record)}>Submit</Button>
                      </Input.Group>
              }
         
                </Space>
            );
          },
      }
  ];

  const OnStartTask = (record) => {
    console.log('Starting Task');
  }
  const OnDescriptionChanged = (record) => {
    console.log('Description Task', record);
  }

  const OnEndTask = async (record) => {
    console.log('Ending Task', record);
    let tasks = currentTimecard.Tasks;
    let startDate = await formatDate(moment(tasks.find(x=>x.totalDuration === "").StartTime));
    let endDate = await formatDate(moment());
    var duration = moment.duration(moment(endDate).diff(startDate));
    var minutes = duration.asMinutes();
    console.log('Duration saving as ', duration);
    console.log('Notes saving as ', tcDescription);
    console.log('Saving time card item', currentTimecard.Tasks.find(x=>x.taskId === record.TaskId));
   
    let timecardTasks = currentTimecard.tasks;
    let changingTask = timecardTasks.find(x=>x.taskId == record.TaskId);
    console.log('Task we are changing', changingTask);

    let updatedTask = {...changingTask}
    updatedTask.Notes = tcDescription;
    updatedTask.totalDuration = minutes;
    console.log('Task after we have updated', updatedTask);

    // let id = currentTimecard.Tasks.find(x=>x.totalDuration === "").taskId;

    // let updatedTimecard = {...currentTimecard};
    // updatedTimecard.Tasks.find(x=>x.taskId === id).totalDuration = minutes.toString();
    // updatedTimecard.Tasks.find(x=>x.taskId === id).Notes = tcDescription;

    // //let timeCards = [...lTimecards, currentTimecard];
    // console.log('Updating Timecard',updatedTimecard)
    // await actions.updateTimecard(updatedTimecard);
  }

  const OnTimeCardChanged = async (record) => {
    console.log('Timecard changed', record);
    setCurrentTimecard(lTimecards.find(x=>x.TimeCardId === record));
  }

  const onCreateWeeksCard = async () => {
      let timecard = {
        UserId: "samg",
        TimeCardId: uuid(),
        availableTasks: [],
        StartDate: moment().startOf('isoWeek').toString(),
        EndDate: moment().endOf('isoWeek').toString(),
        Tasks:[]
      };
      console.log('Creating Timecard:', timecard);
      actions.updateTimecard(timecard);
  }
  
    return (
        <div>
          <Row>
          <h2>Timecards</h2>
          </Row>
          <Row>
          <Col>
              Start Week: 
            </Col>
            <Col>
              <Select disabled={timecards?.length === 0} style={{ width: '200px' }} onChange={OnTimeCardChanged}>
                  {lTimecards.map((tc) => (
                    <Option key={tc.TimeCardId}>{moment(tc.StartDate).format('Do MMM YY')}</Option>
                  ))}
                </Select>
            </Col>
            <Col>
            {!timecards?.timecards?.find(x=>moment(x.StartDate).toString() === moment().startOf('isoWeek').toString()) && 
            <Tooltip title="create-week-card">
                     <Button type="primary" onClick={() => onCreateWeeksCard()}> Create Weeks Card </Button>
            </Tooltip>
          }
            </Col>
          </Row>
          <Row>
          {currentTimecard && 
           <Table
                style={{ marginTop: '4px', width: '100%' }}
                size='small'
                dataSource={!currentTimecard.AvailableTasks ? [] : currentTimecard.AvailableTasks}
                rowKey={(record) => record.TaskId}
                columns={timeCardsTasks}
                pagination={{  
                  total: currentTimecard.AvailableTasks ? currentTimecard.AvailableTasks.length : 0,
                  pageSize: 3,
                  hideOnSinglePage: true,}}
              /> 
            }
          </Row>

        </div>
    );
}


function mapStateToProps(state) {
  return {
    timecards: state.timecards
  };
}

async function formatDate(date) {

let minutes = date.minutes();
let hour = date.hour();
var day = date.date();
var month = date.month();
var year = date.year();
if(minutes < 15) minutes = 15;
if(minutes > 15 && minutes < 30) minutes = 30;
if(minutes > 30 && minutes < 45) minutes = 45;
if(minutes > 45) {
minutes = 0;
hour = hour +1;
} 

var newDate = new Date(year, month, day, hour, minutes);
return moment(newDate).toString();
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      getUserTimecards: bindActionCreators(tcActions.getUserTimecards, dispatch),
      updateTimecard: bindActionCreators(tcActions.updateTimecard, dispatch)
    }
  };
}



export default connect(mapStateToProps, mapDispatchToProps)(Timecards);
