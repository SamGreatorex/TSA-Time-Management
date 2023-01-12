import React, {useEffect, useState} from 'react';
import {Select, Row, Col, Space, Tooltip, Button,Table, Input, Modal, Form} from 'antd';
import * as tcActions from '../../redux/actions/timecards';
import { connect} from 'react-redux';
import {bindActionCreators } from 'redux';
import moment, { parseZone } from 'moment';
import { v4 as uuid } from 'uuid';
import Sider from 'antd/es/layout/Sider';

function Home({actions, timecards, tasks}) {
  const initSummary = {weekTimeLogged: "", dailyTimeLogged: ""}
  const [summaryData, setSummaryData] = useState(initSummary);

  
  useEffect(() => {
    if(timecards.length === 0) actions.getUserTimecards('samg');
  }, []);

  useEffect(() => {
    console.log('timecards updated', timecards);
    let totalDailyHours = 0;

    if(timecards.length > 0){
      const cTimeCard = timecards.find(x=>moment(x.StartDate).toString() === moment().startOf('isoWeek').toString());
      const dailyTasks = cTimeCard?.Tasks?.filter(x=>(moment(x.StartTime).startOf('day').toString() === moment().startOf('day').toString()));
      console.log('Daily Tasks', dailyTasks);
    
      let totalWeeklyDuration = cTimeCard?.Tasks?.map(item => item.totalDuration).reduce((prev, next) => prev + next);
      let weekHrs = Math.floor(totalWeeklyDuration / 60);
      let weekMns = totalWeeklyDuration - (weekHrs * 60);
      let totalWeeklyHours = `${weekHrs}hrs ${weekMns}min`

      if(dailyTasks.length > 0)
      {
      let totalDailyDuration = dailyTasks.map(item => item.totalDuration).reduce((prev, next) => prev + next);
      let dilyHrs = Math.floor(totalDailyDuration / 60);
      let dailyMns = totalDailyDuration - (dilyHrs * 60);
      totalDailyHours = `${dilyHrs}hrs ${dailyMns}min`
      }
      let updatedData = {...initSummary};
      updatedData.weekTimeLogged = totalWeeklyHours;
      updatedData.dailyTimeLogged = totalDailyHours;
      setSummaryData(updatedData);
    }
   
  }, [timecards]);

  return (
    <div>
      <Row>
      <h2>Weekly Summary</h2>
      </Row>
      <Row>
        <Col>Week Start Date: </Col>
        <Col>{moment().startOf('isoWeek').format('dddd  Do MMMM')}</Col>
      </Row>
      <Row>
        <Col>Week Time logged: </Col>
        <Col>{summaryData.weekTimeLogged}</Col>
      </Row>
      <Row>
      <h2>Daily Summary</h2>
      </Row>
      <Row>
        <Col>Date: </Col>
        <Col>{moment().format('dddd  Do MMMM')}</Col>
      </Row>
      <Row>
        <Col>Time Logged: </Col>
        <Col>{summaryData.dailyTimeLogged}</Col>
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



export default connect(mapStateToProps, mapDispatchToProps)(Home);
