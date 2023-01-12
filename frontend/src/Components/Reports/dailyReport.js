import React, {useEffect, useState} from 'react';
import {Select, Row, Col, Table} from 'antd';
import * as tcActions from '../../redux/actions/timecards';
import { connect} from 'react-redux';
import {bindActionCreators } from 'redux';
import moment from 'moment';
const { Option } = Select;

function DailyReport({actions, timecards}) {

  const [data, setData] = useState([])
  const [dataFilter, setDataFilter] = useState([]);
const startDate = "12th Jan 23";
  useEffect(() => {
    if(timecards.length === 0) actions.getUserTimecards('samg');
  }, []);

  useEffect(() => {
    if(timecards.length > 0){
   
        let currentTimecard = timecards.find(x=>moment(x.StartDate).toString() === moment().startOf('isoWeek').toString());
        console.log('curr', currentTimecard);

        let allTasks = currentTimecard?.Tasks || [];
        console.log('Weeks Tasks', allTasks);
        let todaysTasks = allTasks.filter(x=>moment(x.StartTime).startOf('day').toString() === moment().startOf('day').toString());
        console.log('todaysTasks', todaysTasks);
        //let weekDates = new Set(allTasks?.map(x=> moment(x.StartTime).format('Do MMM YY')));
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

  }, [timecards]);



  const OnWeekChanged = async (week) => {
    console.log('Week Changed to', week);
  }

  const dataColumns = [
    {
        key: 'TaskId',
        dataIndex: 'TaskId'
      },
      {
        title: 'Duration',
        key: 'totalDuration',
        dataIndex: 'totalDuration'
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
      <Select disabled={timecards?.length === 0} style={{ width: '200px' }} onChange={OnWeekChanged} defaultValue={()=>  moment().format('Do MMM YY').toString()}>
        {dataFilter.map((data) => (
        <Option key={data}>{moment(data).format('Do MMM YY')}</Option>
        ))}
      </Select>
      </Col>
      </Row>
      <Row>

           <Table
                style={{ marginTop: '4px', width: '100%' }}
                size='small'
                dataSource={data}
                rowKey={(record) => record.TaskId}
                columns={dataColumns}
                pagination={{  
                  total: data ? data.length : 0,
                  pageSize: 15,
                  hideOnSinglePage: true,}}
              /> 

      </Row>
     
     </div>
  ) 
}
function mapStateToProps(state) {
  return {
  timecards: state.timecards.usercards
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: {
      getUserTimecards: bindActionCreators(tcActions.getUserTimecards, dispatch)
    }
  };
}



export default connect(mapStateToProps, mapDispatchToProps)(DailyReport);
