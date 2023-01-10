import { GET_TIMECARDS, UPDATE_TIMECARDS, GET_TASKS} from "../actions/timecards";

  
const initState = {
  usercards: [],
  tasks: []
};

const timecards = (state = initState, action) => {
  switch (action.type) {
    case GET_TIMECARDS:
      return {
        ...state,
        usercards: action.usercards,
      };
    case UPDATE_TIMECARDS:
      console.log('Updating the state timecards');
     let existingTimecards = [...state.usercards];
     console.log('Existing timecards', existingTimecards);

      let allTimeCards = []; 
     //if it already exists then remove it
      if(existingTimecards?.find(x=>x.TimeCardId === action.timecard.TimeCardId)){
        console.log('Timecard already exists so removing it')
        allTimeCards = existingTimecards.filter(x=>x.TimeCardId !== action.timecard.TimeCardId)
      }else
      {
        console.log('New Timecard being added')
        allTimeCards = [...existingTimecards];
      }
 
      console.log('Returning timecards', [...allTimeCards, action.timecard])
      return {
        ...state,
        usercards: [...allTimeCards, action.timecard],
      };
    case GET_TASKS:
      return {
        ...state,
        tasks: [...action.tasks],
      };
    default:
      return state;
  }
  
}
  
export default timecards;