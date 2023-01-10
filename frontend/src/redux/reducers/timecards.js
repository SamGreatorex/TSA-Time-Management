import { all } from "axios";
import { GET_TIMECARDS, UPDATE_TIMECARDS} from "../actions/timecards";

  
const initState = [];

const timecards = (state = initState, action) => {
  switch (action.type) {
    case GET_TIMECARDS:
      return {
        ...state,
        timecards: [...action.timecards],
      };
    case UPDATE_TIMECARDS:

     let existingTimecards = [...state.timecards];
     console.log('Existing timecards', existingTimecards);

      let allTimeCards = []; 
     //if it already exists then remove it
      if(state?.timecard?.find(x=>x.TimeCardId === action.timecard.TimeCardId)){
        console.log('Timecard already exists so removing it')
        allTimeCards = state.timecard.find(x=>x.TimeCardId !== action.timecard.TimeCardId)
      }else
      {
        console.log('New Timecard being added')
        allTimeCards = [...state.timecards];
      }
 
      console.log('Returning timecards', [...allTimeCards, action.timecard])
      return {
        ...state,
        timecards: [...allTimeCards, action.timecard],
      };
    
    default:
      return state;
  }
  
}
  
export default timecards;