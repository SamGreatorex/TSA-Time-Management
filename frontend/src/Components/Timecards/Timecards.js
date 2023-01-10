import React, {useEffect, useState} from 'react';
import {Select, Row, Col, Space, Tooltip, Button,Table, Input, Modal, Form} from 'antd';
import * as tcActions from '../../redux/actions/timecards';
import { connect} from 'react-redux';
import {bindActionCreators } from 'redux';
import moment from 'moment';
import { v4 as uuid } from 'uuid';


const { Option } = Select;

 function Timecards({actions, timecards, tasks}) {

  const [form] = Form.useForm();
  const [lTimecards, setlTimecards] = useState([])
  const [currentTimecard, setCurrentTimecard] = useState(null)
  const [updatingTask, setUpdatingTask] = useState(false) 
  const [tcDescription, setTCDescription] = useState("Something") 
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
            return (
              <Space direction="vrtical">
                {/* Only Show start button if no other task is in progress*/}
    
              {!currentTimecard.Tasks?.find(x=> x.totalDuration === "") && !updatingTask  && 
                <Tooltip title="Start Task">
                   <Button onClick={() =>OnStartTask(record)} type="primary">Start </Button>
                </Tooltip>

              }
              
             {/* Only Show end button if task is in progress*/}
              {currentTimecard.Tasks?.find(x=>x.TaskId === record.TaskId && x.totalDuration === "") && !updatingTask  &&
                     <Tooltip title="End Task">
                     <Button onClick={() => {
                      setTCDescription(record.Notes);
                      setUpdatingTask(true)
                    }
                      }> Stop </Button>
                    </Tooltip>
              }

              {currentTimecard.Tasks?.find(x=>x.TaskId === record.TaskId && x.totalDuration === "") && updatingTask  &&
                    <Row>
                      <Col>
                        <Input defaultValue={tcDescription} onChange={(e) => setTCDescription(e.target.value)}/>
                        </Col>
                        <Col>
                        <Button type="primary" onClick={() => OnEndTask(record)}>Submit</Button>
                        </Col>
                    </Row>
                 
              }
         
                </Space>
            );
          },
      }
  ];

  const OnStartTask = (record) => {
    console.log('Starting Task', record);

    //check if task already exists
    let existingTask = currentTimecard.Tasks?.find(x=>x.TaskId === record.TaskId);
    let newTask = {
        StartTime: moment().toISOString(),
        totalDuration: "",
        TaskId: record.TaskId,
        Notes:  existingTask ? existingTask.Notes : "",
        _totalDuration: existingTask ? existingTask.totalDuration : 0
    };
    onUpdateTask(newTask);

  }
  const OnDescriptionChanged = (record) => {
    console.log('Description Task', record);
  }

  const OnEndTask = async (record) => {
    console.log('Ending Task', record);

    let task = {...currentTimecard.Tasks.find(x=>x.TaskId === record.TaskId)};


    let startDate = await formatDate(moment(task.StartTime));
    let endDate = await formatDate(moment());
    var duration = moment.duration(moment(endDate).diff(startDate));
    var minutes = duration.asMinutes() === 0 ? 15 : duration.asMinutes();
    console.log('Startdate ', startDate);
    console.log('endDate ', endDate);

    
    if(task._totalDuration) minutes = minutes + task._totalDuration;

    console.log('Duration saving as ', duration);

    delete task._totalDuration;
    task.totalDuration = minutes;
    task.Notes = tcDescription;
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
    
    let updatedTasks = currentTimecard.Tasks?.find(x=>x.TaskId === task.TaskId) 
    ? [...currentTimecard.Tasks.filter(x=>x.TaskId !== task.TaskId)] 
    : [...currentTimecard.Tasks];
    updatedTasks.push(task);  

     let updatedTimeCard = {...currentTimecard};
     updatedTimeCard.Tasks = updatedTasks;
     console.log()
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
              <Select disabled={timecards?.length === 0} style={{ width: '200px' }} onChange={OnTimeCardChanged}>
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
                dataSource={!currentTimecard.AvailableTasks ? [] : currentTimecard.AvailableTasks}
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
          {tasks?.filter(x=> !x.Default).map((tc) => (
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
      updateTimecard: bindActionCreators(tcActions.updateTimecard, dispatch),
      getTasks: bindActionCreators(tcActions.getTasks, dispatch)
    }
  };
}



export default connect(mapStateToProps, mapDispatchToProps)(Timecards);
