import React, {useEffect, useState} from 'react';
import {Select, Row, Col, Space, Tooltip, Button,Table, Input, Modal, Form} from 'antd';
import * as tcActions from '../../redux/actions/timecards';
import { connect} from 'react-redux';
import {bindActionCreators } from 'redux';


function WeeklyReport({actions, timecards}) {

  
  useEffect(() => {
    if(timecards.length === 0) actions.getUserTimecards('samg');
  }, []);

  useEffect(() => {
    console.log('timecards updated', timecards);
  }, [timecards]);

  return (
    <div>
      <Row>
      <h2>Weekly Reeport</h2>
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



export default connect(mapStateToProps, mapDispatchToProps)(WeeklyReport);
