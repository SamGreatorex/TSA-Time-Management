import React, {useEffect, useState} from 'react';
import {Select, Row, Col, Space, Tooltip, Button,Table, Input, Modal, Form} from 'antd';
import * as tcActions from '../../redux/actions/timecards';
import { connect} from 'react-redux';
import {bindActionCreators } from 'redux';
import moment, { parseZone } from 'moment';
import { v4 as uuid } from 'uuid';


const { TextArea } = Input;
const { Option } = Select;

 function Timecards({actions, timecards, tasks}) {

  const [form] = Form.useForm();
  const [lTimecards, setlTimecards] = useState([])
  const [currentTimecard, setCurrentTimecard] = useState(null)
  const [updatingTask, setUpdatingTask] = useState(false) 
  const [tcDescription, setTCDescription] = useState("") 
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  useEffect(() => {
    actions.getUserTimecards('samg');
    actions.getTasks();
  }, []);

  useEffect(() => {
    console.log('timecards changed', timecards);
      setlTimecards(timecards);
      const cTimeCard = timecards.find(x=>moment(x.StartDate).toString() === moment().startOf('isoWeek').toString());
      console.log('Current Time Card Set as:', cTimeCard);
      setCurrentTimecard(cTimeCard);
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
           let tc =  currentTimecard.Tasks?.find(x=>x.TaskId === record.TaskId && (moment(x.StartTime).startOf('day').toString() === moment().startOf('day').toString())) || null;
           const RecordUpdating = currentTimecard.Tasks?.find(x=>x.IsInProgress && x.IsInProgress === true);
            return (
              <div>
                {/* Only Show start button if no other task is in progress*/}
              {!RecordUpdating && 
                <Tooltip title="Start Task">
                   <Button onClick={() =>OnStartTask(record)} type="primary">Start </Button>
                </Tooltip>
              }

              {RecordUpdating && tc?.IsInProgress === true &&
                    <Row>
                      <Col span={20}>
                        <TextArea rows={2} onChange={(e) => setTCDescription(e.target.value)}/>
                        </Col>
                        <Col  span={4}>
                        <Button type="primary" onClick={() => OnEndTask(record)}>Submit</Button>
                        </Col>
                    </Row>
                 
                }
           </div>
            );
          },
      }
  ];



  const OnStartTask = async (record) => {

    let existingTask = await getExistingTask(record.TaskId);
    console.log('Starting Task', record, existingTask);
    //check if task already exists
    let newTask = {
        StartTime: existingTask?.StartTime ? existingTask.StartTime : moment().toISOString(),
        totalDuration: existingTask?.totalDuration ? existingTask.totalDuration : 0,
        TaskId: record.TaskId,
        Notes:  existingTask?.Notes ? existingTask.Notes : [],
        IsInProgress : true,
        TaskStartTime: moment().toISOString()
    };
    console.log('Starting new task', newTask);
    onUpdateTask(newTask);

    //setUpdatingTask(true)
  }

  const getExistingTask = async (taskId) => {
    let existingTask = {...currentTimecard.Tasks?.find(x=>x.TaskId === taskId && (moment(x.StartTime).startOf('day').toString() === moment().startOf('day').toString()))};
    return existingTask;
  }

  const OnEndTask = async (record) => {
    console.log('Ending Task', record);

    let task = await getExistingTask(record.TaskId);
    let notes = [...task.Notes];

    let startDate = await formatDate(moment(task.TaskStartTime));
    let endDate = await formatDate(moment());
    var duration = moment.duration(moment(endDate).diff(startDate));
    var minutes = duration.asMinutes() === 0 ? 15 : duration.asMinutes();
    console.log('Startdate ', startDate);
    console.log('endDate ', endDate);

    notes.push({noteId: uuid(), StartTime: task.TaskStartTime, duration: minutes, note: tcDescription});
   
    if(task._totalDuration) minutes = minutes + task._totalDuration;

    delete task.TaskStartTime;
    console.log('Duration saving as ', duration);
    task.totalDuration = task.totalDuration + minutes;
    task.Notes =  notes;
    task.IsInProgress = false;
    console.log('Updated Task', task)
    await onUpdateTask(task)

    setUpdatingTask(false);
  }

  const OnTimeCardChanged = async (record) => {
    console.log('Timecard changed', record);
    setCurrentTimecard(lTimecards.find(x=>x.TimeCardId === record));
  }


  const onCreateTask = async (task) => {
    console.log('Adding task', task);
    
   // let existingTasks = currentTimecard.AvailableTasks;
   // existingTasks.push(tasks.find(x=> x.TaskId === task.type));
    let updatedTasks = [...currentTimecard.AvailableTasks];
    updatedTasks.push(tasks.find(x=> x.TaskId === task.type));
    let updatedTimecard = {...currentTimecard}
    updatedTimecard.AvailableTasks = updatedTasks
    console.log('Current timecard is now', updatedTimecard);
    actions.updateTimecard(updatedTimecard);
    setIsTaskModalOpen(false);
  }

  const onUpdateTask = async (task) => {
    
    let existingTask = await getExistingTask(task.TaskId);
    console.log('Existing Task Found', existingTask)
    let updatedTasks = existingTask
    ? [...currentTimecard.Tasks.filter(x=> !(x.TaskId === existingTask.TaskId && x.StartTime === existingTask.StartTime))] 
    : [...currentTimecard.Tasks];
    updatedTasks = [...updatedTasks, task];  

     let updatedTimeCard = {...currentTimecard};
     updatedTimeCard.Tasks = updatedTasks;
   
    actions.updateTimecard(updatedTimeCard);
  }

  const onCreateWeeksCard = async () => {
  
      let timecard = {
        UserId: "samg",
        TimeCardId: uuid(),
        AvailableTasks: tasks.filter(x=>x.Default === true),
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
              <Select disabled={timecards?.length === 0} style={{ width: '200px' }} onChange={OnTimeCardChanged} defaultValue={()=>  moment().startOf('isoWeek').format('Do MMM YY')}>
                  {lTimecards.map((tc) => (
                    <Option key={tc.TimeCardId}>{moment(tc.StartDate).format('Do MMM YY')}</Option>
                  ))}
                </Select>
            </Col>
            <Col>
            {!timecards?.find(x=>moment(x.StartDate).toString() === moment().startOf('isoWeek').toString()) && 
            <Tooltip title="create-week-card">
                     <Button type="primary" onClick={() => onCreateWeeksCard()}> Create Weeks Card </Button>
            </Tooltip>
            }
            </Col>
            <Col>
            {currentTimecard &&
            <Tooltip title="create-task">
                    <Button type="primary" onClick={() => setIsTaskModalOpen(true)}> Add New Task </Button>
            </Tooltip>
            }  
            
            </Col>
          </Row>
          <Row>
          {currentTimecard && 
           <Table
                style={{ marginTop: '4px', width: '100%' }}
                size='small'
                dataSource={!currentTimecard.AvailableTasks ? [] : currentTimecard.AvailableTasks.sort((a, b) => a.Type.toLowerCase() > b.Type.toLowerCase() ? 1 : -1)}
                rowKey={(record) => record.TaskId}
                columns={timeCardsTasks}
                pagination={{  
                  total: currentTimecard.AvailableTasks ? currentTimecard.AvailableTasks.length : 0,
                  pageSize: 15,
                  hideOnSinglePage: true,}}
              /> 
            }
          </Row>

      <Modal title="Add Task" open={isTaskModalOpen}  footer={null} onCancel={()=> setIsTaskModalOpen(false)}>
     
      <Form name="createTask" labelCol={{ span: 8, }} wrapperCol={{ span: 16, }} form={form} onFinish={onCreateTask}>
      <Form.Item label="Task Type" name="type" rules={[{required: true, message: 'Please select a type!'}]}>
      <Select style={{ width: '300px' }}>
          {tasks?.sort((a, b) => a.Type.toLowerCase() > b.Type.toLowerCase() ? 1 : -1).map((tc) => (
            <Option key={tc.TaskId}>{tc.Type} - {tc.Name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        wrapperCol={{
          offset: 8,
          span: 16,
        }}
      >
        <Button type="primary" htmlType="submit">
          Select
        </Button>
      </Form.Item>
    </Form>
      </Modal>

        </div>


    );
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

function mapStateToProps(state) {
  return {

  timecards: state.timecards.usercards,
   tasks: state.timecards.tasks
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: {
      getUserTimecards: bindActionCreators(tcActions.getUserTimecards, dispatch),
      updateTimecard: bindActionCreators(tcActions.updateTimecard, dispatch),
      getTasks: bindActionCreators(tcActions.getTasks, dispatch)
    }
  };
}



export default connect(mapStateToProps, mapDispatchToProps)(Timecards);
