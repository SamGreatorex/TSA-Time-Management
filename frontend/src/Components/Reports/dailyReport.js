import React, {useEffect, useState} from 'react';
import {Select, Row, Col, Table, Typography, Space} from 'antd';
import * as tcActions from '../../redux/actions/timecards';
import { connect} from 'react-redux';
import {bindActionCreators } from 'redux';
import moment from 'moment';
import { convertMinToStringTime } from '../../utils/utils';

const { Option } = Select;
const { Text } = Typography;
function DailyReport({actions, timecards, tasks}) {

  const [data, setData] = useState([])
  const [dataFilter, setDataFilter] = useState([]);
  const [weeksTimecard, setWeeksTimecard] = useState([]);

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
    if(timecards.length > 0){
        resetData(moment());
    }

  }, [timecards]);



  const OnWeekChanged = async (date) => {
    resetData(date)
  }

  const resetData = async (date) => {
    let currentTimecard = timecards.find(x=>moment(x.StartDate).toString() === moment().startOf('isoWeek').toString());
    setWeeksTimecard(currentTimecard);

    let allTasks = currentTimecard?.Tasks || [];
     console.log('Weeks Tasks', allTasks);

    let todaysTasks = allTasks.filter(x=>moment(x.StartTime).startOf('day').toString() === moment(date).startOf('day').toString());
    console.log('todaysTasks', todaysTasks);
        
    let weekDates = [];
    for (let i = 0; i < allTasks.length; i++) {
        let task = allTasks[i];
        let foundDate = weekDates.filter(x=>moment(x).startOf('day').toString() === moment(task.StartTime).startOf('day').toString());
        if(foundDate.length === 0){
            weekDates.push(task.StartTime);
        }
        }
       console.log('WeekDates', [...weekDates])
        setDataFilter([...weekDates]);
        setData(todaysTasks);

  }

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
           console.log('Converting', minutes );
           let hrs = Math.floor(minutes / 60);
           let min = minutes - (hrs * 60);
           const display =  `${hrs}hrs ${min}min`;
           console.log('Display is', display );
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
                console.log(pageData)

                 let minutes = pageData.length > 0 ? pageData.map(x=>x.totalDuration)?.reduce((sum, val) => sum + val) : 0;
                 let hrs = Math.floor(minutes / 60);
                 let min = minutes - (hrs * 60);
                 let display = `${hrs}hrs ${min}min`;
                
                console.log(display)
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



export default connect(mapStateToProps, mapDispatchToProps)(DailyReport);
