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
  const [groupByFunction, setGroupByFunction] = useState('All');
  const [currentDateFilter, setCurrentDateFilter] = useState(moment().startOf('isoWeek')); 

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


    //Group by Task
    if(groupType === 'Task'){
      var result = [];
      allTasks.reduce(function(res, value) {
        if (!res[value.TaskId]) {
          res[value.TaskId] = { TaskId: value.TaskId, totalDuration: 0, Notes: '', StartTime: currentTimecard.StartDate};
          result.push(res[value.TaskId])
        }
        res[value.TaskId].totalDuration += value.totalDuration;
        res[value.TaskId].Notes += moment(value.StartTime).format('dddd Do') + ": " + value.Notes + '\n';
        return res;
      }, {});
       allTasks = result;
    }

    if(groupType === 'TaskType'){
      var result = [];
      allTasks.reduce(function(res, value) {
        let task = tasks.find(x=>x.TaskId === value.TaskId);
    
        if (!res[task.Type]) {
          res[task.Type] = { TaskType: task.Type, totalDuration: 0, Notes: '', StartTime: currentTimecard.StartDate};
          result.push(res[task.Type])
        }
        res[task.Type].totalDuration += value.totalDuration;
        res[task.Type].Notes += `${moment(value.StartTime).format('dddd Do')}: ${value.Notes} (${task.Name})\n`;
        return res;
      }, {});
      allTasks = result;
    }

    

    //Set weekdates filter
    let weekDates = timecards.map(x=>x.StartDate);

    //Set the UI
    setDataFilter([...weekDates]);
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
        dataIndex: 'Notes'
      }
    
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
                            <Table.Summary.Cell colSpan={4}>
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
