import React, {useEffect} from 'react';
import {Select, Row, Col} from 'antd';
import * as tcActions from '../../redux/actions/timecards';
import { connect} from 'react-redux';
import {bindActionCreators } from 'redux';

 function Timecards({timecards,  actions}) {

  useEffect(() => {

    console.log('Timecards Loaded', timecards);

    if(!timecards) actions.getUserTimecards('samg');

  }, [timecards]);

    return (
        <div>
          <Row>
          <h2>Timecards</h2>
          </Row>
          <Row>
            <Col>
            Select 
            </Col>
          </Row>

        </div>
    );
}


function mapStateToProps(state) {
  return {
    timcards: state.timecards
  };
}



function mapDispatchToProps(dispatch) {
  return {
    actions: {
      getUserTimecards: bindActionCreators(tcActions.getUserTimecards, dispatch)
    }
  };
}



export default connect(mapStateToProps, mapDispatchToProps)(Timecards);
