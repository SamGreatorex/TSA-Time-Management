import { GET_TIMECARDS} from "../actions/timecards";


const initialState = {
    timecards: null
  };
  
const timecards = (state = initialState, action) => {
  switch (action.type) {
    case GET_TIMECARDS:
      return {
        ...state,
        timecards: action.timecards,
      };
    default:
      return state;
  }
  
}
  
export default timecards;