
import * as timecardsApi from '../../apis/timecards';
import * as tasksApi from '../../apis/tasks';
export const GET_TIMECARDS = 'GET_TIMECARDS';
export const UPDATE_TIMECARDS = 'UPDATE_TIMECARDS';
export const GET_TASKS = 'GET_TASKS';
export const UPDATE_TASK = 'UPDATE_TASK';
export const DELETE_TASK = 'DELETE_TASK';

  const getTimecardsSuccess = (usercards) => {
    return {
      type: GET_TIMECARDS,
      usercards
    };
  }
    
  const postTimecardSuccess = (timecard) => {
    return {
      type: UPDATE_TIMECARDS,
      timecard
    };
  }

  const getTaskSuccess = (tasks) => {
    return {
      type: GET_TASKS,
      tasks
    };
  }

  const postTaskSuccess = (task) => {
    return {
      type: UPDATE_TASK,
      task
    };
  }
  const deleteTaskSuccess = (taskId) => {
    return {
      type: DELETE_TASK,
      taskId
    };
  }

  const getUserTimecards = (userId) => {
    return async (dispatch) => {
      try {
      
        let getTCRequest = await timecardsApi.listUserTimecards(userId);
        console.log('Timecards found at:', getTCRequest);
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

  const getTasks = () => {
    return async (dispatch) => {
      try {
      
        let request = await tasksApi.listTasks();
        dispatch(getTaskSuccess(request));
        
      } catch (error) {
        console.log(error);
      }
    };
  };

  const updateTasks = (task) => {
    return async (dispatch) => {
      try {
      
        await tasksApi.postTask(task);
        dispatch(postTaskSuccess(task));
        
      } catch (error) {
        console.log(error);
      }
    };
  };
  const deleteTask = (task) => {
    return async (dispatch) => {
      try {
      
        await tasksApi.deleteTask(task.TaskId);
        dispatch(deleteTaskSuccess(task.TaskId));
        
      } catch (error) {
        console.log(error);
      }
    };
  };
  export { getUserTimecards, updateTimecard, getTasks, updateTasks, deleteTask};

