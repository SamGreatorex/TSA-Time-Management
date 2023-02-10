import React, {useEffect, useState} from 'react';
import {Select, Row, Col, Table, Typography, Space, Radio} from 'antd';
import * as tcActions from '../../redux/actions/timecards';
import { connect} from 'react-redux';
import {bindActionCreators } from 'redux';
import moment from 'moment';
import { convertMinToStringTime } from '../../utils/utils';
import { current } from '@reduxjs/toolkit';

const { Option } = Select;
const { Text } = Typography;
function WeeklyReport({actions, timecards, tasks}) {

  const [data, setData] = useState([])
  const [dataFilter, setDataFilter] = useState([]);
  const [weeksTimecard, setWeeksTimecard] = useState([]);
  const [groupByFunction, setGroupByFunction] = useState('TaskType');
  const [currentDateFilter, setCurrentDateFilter] = useState(moment().startOf('isoWeek')); 
  const [summaryData, setSummaryData] = useState({Total: "", Remaining: ""});

  useEffect(() => {
    if(timecards.length === 0) {
        actions.getUserTimecards('samg');
        actions.getTasks();
    }else
    {
      resetData(currentDateFilter, groupByFunction);
    }
  }, []);

  useEffect(() => {
    if(timecards.length > 0){
        resetData(currentDateFilter, groupByFunction);
    }

  }, [timecards]);



  const OnWeekChanged = async (date) => {
    setCurrentDateFilter(date)
    resetData(date, groupByFunction);
  }

  const onRadioChanged = async (value) => {
    setGroupByFunction(value.target.value);
    resetData(currentDateFilter, value.target.value);
  }

  const  resetData = async (date, groupType) => {
    let currentTimecard = timecards.find(x=>moment(x.StartDate).toString() === moment(date).toString());
    setWeeksTimecard(currentTimecard);



    let allTasks = currentTimecard?.Tasks || [];
    console.log('All Tasks are:', allTasks);

    //Group by Task
    if(groupType === 'Task'){
      var result = [];
      allTasks.reduce(function(res, value) {
        console.log('Looping Reducer', value, res);
        if (!res[value.TaskId]) {
          res[value.TaskId] = { TaskId: value.TaskId, totalDuration: 0, Notes: [], StartTime: currentTimecard.StartDate};
          result.push(res[value.TaskId])
        }
        res[value.TaskId].totalDuration += value.totalDuration;
        if(Array.isArray(value.Notes)){
     
          res[value.TaskId].Notes.push(...value.Notes);
        }else
        {
          res[value.TaskId].Notes.push({StartTime: value.StartTime, duration: value.totalDuration, note: value.Notes})
        }
  
        console.log('Returning Notes', res, value);
        return res;
      }, {});
       allTasks = result;
    }

    if(groupType === 'TaskType'){
      var result = [];
      allTasks.reduce(function(res, value) {
        let task = tasks.find(x=>x.TaskId === value.TaskId);
    
        if (!res[task.Type]) {
          res[task.Type] = { TaskId: task.TaskId, TaskType: task.Type, totalDuration: 0, Notes: [], StartTime: currentTimecard.StartDate};
          result.push(res[task.Type])
        }
        res[task.Type].totalDuration += value.totalDuration;


        //res[task.Type].Notes += `${moment(value.StartTime).format('dddd Do')}: ${value.Notes} (${task.Name})\n`;
        if(Array.isArray(value.Notes)){
          res[task.Type].Notes.push(...value.Notes);
        }else
        {
          res[task.Type].Notes.push({TaskId: task.TaskId, StartTime: value.StartTime, duration: value.totalDuration, note: value.Notes})
        }
        return res;
      }, {});
      allTasks = result;
      console.log('Set All tasks to', result);
    }

    

    //Set weekdates filter
    let weekDates = timecards.map(x=>x.StartDate);
    let minutes = data.length > 0 ? data.map(x=>x.totalDuration)?.reduce((sum, val) => sum + val) : 0;
    let total = await convertMinToStringTime(minutes);
    let remainingData = await convertMinToStringTime((40*5)-minutes);
    let summaryData = {Total: total, Remaining: remainingData};
    console.log('Summary Data', summaryData);


    //Set the UI
    setDataFilter([...weekDates]);
    console.log('Set Data to', allTasks);
    setData(allTasks);

  }

  const dataColumns = [
      {
        title: 'Date',
        align: 'center',
        render:  (record) => {
            return (
              <Space direction="vertical">
                {moment(record.StartTime).format('dddd Do')}
                </Space>
            );
          },
      },
      {
        title: 'Task Name',
        key: 'taskName',
        align: 'center',
        render:  (record) => {
            return (
              <Space direction="vertical">
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
              <Space direction="vertical">
                {record.TaskType ? record.TaskType : tasks?.find(x=>x.TaskId === record.TaskId)?.Type ?? ""}
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
               let display = `${moment(note.StartTime).format('ddd Do HH:mm')} - ${note.duration}min - ${note.note}`;
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

      }}
    
  ]

  return (
    <div>
      <Row>
      <Col> 
      <Select disabled={timecards?.length === 0} style={{ width: '200px' }} onChange={OnWeekChanged} defaultValue={()=> currentDateFilter.toString()}>
        {dataFilter.map((data) => (
        <Option key={data}>{moment(data).format('Do MMM YY')}</Option>
        ))}
      </Select>
      </Col>
      <Col>
      <Radio.Group 
        onChange={onRadioChanged}
         value={groupByFunction}>
      <Radio value={'All'}>All</Radio>
      <Radio value={'Task'}>Group By Task</Radio>
      <Radio value={'TaskType'}>Group By Task Type</Radio>
  
    
    </Radio.Group></Col>
      </Row>
      <Row>

           <Table
                style={{ whiteSpace: 'pre', marginTop: '4px', alignSelf:'center'}}
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
                            <Table.Summary.Cell colSpan={2}>
                              <Text type="danger">{display}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell>Hours Left</Table.Summary.Cell>
                            <Table.Summary.Cell colSpan={2}>
                              <Text type="danger">{display}</Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </>
                      );
                }}
              /> 

      </Row>
     
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
      getTasks: bindActionCreators(tcActions.getTasks, dispatch)
    }
  };
}



export default connect(mapStateToProps, mapDispatchToProps)(WeeklyReport);
