
import * as timecardsApi from '../../apis/timecards';
export const GET_TIMECARDS = 'GET_TIMECARDS';

  
  const getTimecardsSuccess = (timecards) => {
    return {
      type: GET_TIMECARDS,
      timecards
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

  export { getUserTimecards };

