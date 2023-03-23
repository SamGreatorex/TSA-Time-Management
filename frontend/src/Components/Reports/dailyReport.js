import React, {useEffect, useState} from 'react';
import {Select, Row, Col, Table, Typography, Space, Button, Modal, Input} from 'antd';
import * as tcActions from '../../redux/actions/timecards';
import { connect} from 'react-redux';
import {bindActionCreators } from 'redux';
import moment from 'moment';
import { v4 as uuid } from 'uuid';


const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;


function DailyReport({actions, timecards, tasks}) {

  const [data, setData] = useState([])
  const [dataFilter, setDataFilter] = useState([]);
  const [weeksTimecard, setWeeksTimecard] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);


  const [editingTask, setEditingTask] = useState({});

  useEffect(() => {
    if(timecards.length === 0) {
        actions.getUserTimecards('samg');
        actions.getTasks();
    }else
    {
        resetData(moment());
    }
  }, []);

  useEffect(() => {
    console.log('Timecard change')
    if(timecards.length > 0){
        resetData(moment());
    }

  }, [timecards]);



  const resetData = async (date) => {
    let currentTimecard = timecards.find(x=>moment(x.StartDate).toString() === moment().startOf('isoWeek').toString());
    setWeeksTimecard(currentTimecard);

    let allTasks = currentTimecard?.Tasks || [];

    let todaysTasks = allTasks.filter(x=>moment(x.StartTime).startOf('day').toString() === moment(date).startOf('day').toString());
    let weekDates = [];
    for (let i = 0; i < allTasks.length; i++) {
        let task = allTasks[i];
        let foundDate = weekDates.filter(x=>moment(x).startOf('day').toString() === moment(task.StartTime).startOf('day').toString());
        if(foundDate.length === 0){
            weekDates.push(task.StartTime);
        }
        }
        setDataFilter([...weekDates]);
        setData(todaysTasks);

  }

  const UpdateRecord = (record) => {
  let notes = [];
  for (let i = 0; i < record.Notes.length; i++) {
    let note = record.Notes[i];
    console.log('Adding Note: ', note, !note.noteId)
    if(!note.noteId)
    {
      notes.push({...note, noteId: uuid()});
    }else
    {
      notes.push({...note});
    }
  }
  let task = {
    "IsInProgress":record.IsInProgress,
    "StartTime":record.StartTime,
    "totalDuration":record.totalDuration,
    "TaskId":record.TaskId,
    "TaskTypeId": record.TaskTypeId,
    "Notes": notes 
  } 
  console.log('Editing task:', task)
   setEditingTask(task);
   setIsModalOpen(true);
  }

  const OnSaveRecord = async () => {
    console.log('Saving Record', editingTask);

    let updatedTask = {...editingTask};

    //Update the value of totalDuration
    updatedTask.totalDuration = updatedTask.Notes.map(x=>x.duration)?.reduce((sum, val) => sum + val);

    setEditingTask({});
     await onUpdateTask(updatedTask);

  }

  const onUpdateTask = async (task) => {
  
    console.log('Weeks Tasks', weeksTimecard, task);
    let updatedTasks = [...weeksTimecard.Tasks.filter(x=>x.TaskId !== task.TaskId)]
    updatedTasks = [...updatedTasks];  
    updatedTasks.push(task);
    let updatedTimeCard = {...weeksTimecard};
    updatedTimeCard.Tasks = updatedTasks;
    console.log('Updated timecard', updatedTimeCard);
     setWeeksTimecard(updatedTimeCard);
     await actions.updateTimecard(updatedTimeCard);
    setIsModalOpen(false);


  // let updatedTasks = task
  // ? [...weeksTimecard.Tasks.filter(x=> x.TaskId !== task.TaskId && x.StartTime !== task.StartTime)] 
  // : [...weeksTimecard.Tasks];
  // console.log('Updated Tasks Tasks', updatedTasks);
  // updatedTasks = [...updatedTasks, task];  
  // console.log('Updated Tasks Tasks2', updatedTasks);
  //  let updatedTimeCard = {...weeksTimecard, Tasks: updatedTasks};
  //  console.log('Updated timecard', updatedTimeCard);
  //  setWeeksTimecard(updatedTimeCard);

    // await actions.updateTimecard(updatedTimeCard);

  }

  


  const onInputChange = (e, key, index) => {

    let updatingTask = {...editingTask};
    let taskNoteIndex = updatingTask.Notes.findIndex(x=>x.StartTime === index.StartTime && x.note === index.note);
    updatingTask.Notes[taskNoteIndex][key] = key === "duration" ? parseInt(e.target.value) : e.target.value;
    console.log('Updated Task', updatingTask);
    setEditingTask(updatingTask);
  };
  const OnAddNewNote = (record) => {
    console.log('Record Adding Note to', record)
    let notes = [];
    notes.push({noteId: uuid(), StartTime: moment().toISOString(), duration: 15, note: ""});
    for (let i = 0; i < record.Notes.length; i++) {
      let note = record.Notes[i];
      notes.push({...note});
    }
    let task = {
      "IsInProgress":record.IsInProgress,
      "StartTime":record.StartTime,
      "totalDuration":record.totalDuration,
      "TaskId":record.TaskId,
      "Notes": notes 
    } 
   setEditingTask(task);
    setIsModalOpen(true);

    // let updatingTask = {...editingTask};
    // let newNote = {StartTime: moment().toISOString(), Duration: 15, Note: ""}
    // updatingTask.Notes.push(newNote);
    // console.log('Updated Task', updatingTask);
    // setEditingTask(updatingTask);
    // setIsModalOpen(true);
  };
  
  // const onDeleteNote = (record) => {
  //   console.log('Deleting note', record)
  //   let task = {...updatingTask};
  // };

  const recordColumns = [
    {
        title: 'Start Time',
        key: 'StartTime',
        width: "300px",
        render: (record, index) => (
          <Input value={record.StartTime}  onChange={(e)=> onInputChange(e,"StartTime", index)}/>
        )
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (record, index) => (
        <Input value={record.duration} onChange={(e) => onInputChange(e,"duration", index)} />
      )
  },
  {
    title: 'Note',
    key: 'note',
    width: "500px",
    render: (record, index) => (
      <TextArea value={record.note}  onChange={(e) => onInputChange(e, "note", index)}/>
    )

   }
  // {
  //   key: 'actions',
  //   render:  (note) => {
  //    return (
  //     <>
  //      <Button onClick={() => onDeleteNote(note)}> Delete Task </Button>
  //     </>
  //    );
  //  }
  // }
    ]




  const dataColumns = [
    {
        key: 'TaskId',
        dataIndex: 'TaskId',
        fixed: true,
        width: 350
      },
      {
        title: 'Task Name',
        key: 'taskName',
        align: 'center',
        render:  (record) => {
            return (
              <Space direction="vrtical">
                {tasks?.find(x=>x.TaskId === record.TaskId)?.Name ?? ""}
                </Space>
            );
          },
      },
      {
        title: 'Task Type',
        key: 'TaskType',
        align: 'center',
        render:  (record) => {
            return (
              <Space direction="vrtical">
                {tasks?.find(x=>x.TaskId === record.TaskId)?.Type ?? ""}
                </Space>
            );
          },
      },
      {
        title: 'Duration',
        key: 'totalDuration',
        render:  (record) => {
           const minutes = record.totalDuration;
           let hrs = Math.floor(minutes / 60);
           let min = minutes - (hrs * 60);
           const display =  `${hrs}hrs ${min}min`;
          return (
            <Space direction="vertical">
              {display}
              </Space>
          );
        }
       },
      {
        title: 'Notes',
        key: 'Notes',
        render:  (record) => {
         return (
           <Space direction="vertical">
          {Array.isArray(record.Notes) ? 
          (
            record.Notes.map((note)=> {
              let display = `${moment(note.StartTime).format('ddd Do HH:mm')} - (${note.duration}min) - ${note.note}`;
              return <div>{display}</div>
            })
          )
          :
          (
            <div>{moment(record.StartTime).format('ddd Do HH:mm')} - {record.totalDuration}min - {record.Notes}</div>
            
          )
          }
            </Space>
            
          
         );
       }
      },
      {
        key: 'actions',
        render:  (record) => {
         return (
          <>
           <Button onClick={() => UpdateRecord(record)}> Update Task </Button>
          <Button onClick={()=> OnAddNewNote(record)}>Add New</Button>
          </>
         );
       }
      }
  ];

  return (
    <div>

      <Row>
      <Col> 
      <Select disabled={timecards?.length === 0} style={{ width: '200px' }} onChange={resetData} defaultValue={()=>  moment().format('Do MMM YY').toString()}>
        {dataFilter.map((data) => (
        <Option key={data}>{moment(data).format('Do MMM YY')}</Option>
        ))}
      </Select>
      </Col>
      </Row>
      <Row>

           <Table
                style={{ marginTop: '4px', alignSelf:'center'}}
                bordered
                dataSource={data}
                rowKey={(record) => `${record.TaskId}|${record.StartTime}`}
                columns={dataColumns}
                pagination={{  
                  total: data ? data.length : 0,
                  pageSize: 15,
                  hideOnSinglePage: true,}}
                summary={pageData => {
                 let minutes = pageData.length > 0 ? pageData.map(x=>x.totalDuration)?.reduce((sum, val) => sum + val) : 0;
                 let hrs = Math.floor(minutes / 60);
                 let min = minutes - (hrs * 60);
                 let display = `${hrs}hrs ${min}min`;
                    return (
                        <>
                          <Table.Summary.Row>
                            <Table.Summary.Cell>Total Duration</Table.Summary.Cell>
                            <Table.Summary.Cell colSpan={4}>
                              <Text type="danger">{display}</Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </>
                      );
                }}
              /> 

      </Row>
      
      <Modal title="Basic Modal" open={isModalOpen} footer={null} onCancel={()=> setIsModalOpen(false)} width="800px">
              <>
                <div>{JSON.stringify(editingTask)}</div>
                <Table
                  rowKey="id"
                  columns={recordColumns}
                  dataSource={editingTask.Notes}
                  pagination={false}
                />
                <Row>

                <Button onClick={() => OnSaveRecord()}>Save</Button>
                </Row>
                
                </>
      </Modal>
     </div>
  ) 
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
      getTasks: bindActionCreators(tcActions.getTasks, dispatch),
      updateTimecard: bindActionCreators(tcActions.updateTimecard, dispatch)
    }
  };
}




export default connect(mapStateToProps, mapDispatchToProps)(DailyReport);
