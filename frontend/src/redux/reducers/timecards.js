import { GET_TIMECARDS, UPDATE_TIMECARDS, GET_TASKS, UPDATE_TASK, DELETE_TASK } from "../actions/timecards";

const initState = {
  usercards: [],
  tasks: [],
};

const timecards = (state = initState, action) => {
  switch (action.type) {
    case GET_TIMECARDS:
      return {
        ...state,
        usercards: action.usercards,
      };
    case UPDATE_TIMECARDS:
      let existingTimecards = [...state.usercards];

      let allTimeCards = [];
      //if it already exists then remove it
      if (existingTimecards?.find((x) => x.TimeCardId === action.timecard.TimeCardId)) {
        allTimeCards = existingTimecards.filter((x) => x.TimeCardId !== action.timecard.TimeCardId);
      } else {
        allTimeCards = [...existingTimecards];
      }

      return {
        ...state,
        usercards: [...allTimeCards, action.timecard],
      };
    case GET_TASKS:
      return {
        ...state,
        tasks: [...action.tasks],
      };
    case UPDATE_TASK:
      let existingTask = [...state.tasks];
      let allTasks = [];
      //if it already exists then remove it
      if (existingTask?.find((x) => x.TaskId === action.TaskId)) {
        allTasks = existingTask.filter((x) => x.TaskId !== action.TaskId);
      } else {
        allTasks = [...existingTask];
      }
      return {
        ...state,
        tasks: [...allTasks, action.task],
      };
    case DELETE_TASK:
      let _tasks = [...state.tasks].filter((x) => x.TaskId !== action.taskId);

      return {
        ...state,
        tasks: _tasks,
      };

    default:
      return state;
  }
};

export default timecards;
