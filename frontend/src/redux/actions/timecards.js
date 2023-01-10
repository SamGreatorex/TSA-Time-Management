
import * as timecardsApi from '../../apis/timecards';
export const GET_TIMECARDS = 'GET_TIMECARDS';
export const UPDATE_TIMECARDS = 'UPDATE_TIMECARDS';
  
  const getTimecardsSuccess = (timecards) => {
    return {
      type: GET_TIMECARDS,
      timecards
    };
  }
    
  const postTimecardSuccess = (timecard) => {
    return {
      type: UPDATE_TIMECARDS,
      timecard
    };
  }

  const getUserTimecards = (userId) => {
    return async (dispatch) => {
      try {
      
        let getTCRequest = await timecardsApi.listUserTimecards(userId);
        dispatch(getTimecardsSuccess(getTCRequest));
        
      } catch (error) {
        console.log(error);
      }
    };
  };

  const updateTimecard = (timecard) => {
    return async (dispatch) => {
      try {
      
       const response = await timecardsApi.postTimecard(timecard);
       console.log('API Post timecard response:', response)
        dispatch(postTimecardSuccess(timecard));
        
      } catch (error) {
        console.log(error);
      }
    };
  };


  export { getUserTimecards, updateTimecard };

