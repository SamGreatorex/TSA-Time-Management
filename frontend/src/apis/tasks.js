import axios from 'axios';
import {handleResponse, handleError} from '../utils/utils';
import globals from '../utils/globals';


  export const listTasks = async (timecard) => {
    console.log('Getting Tasks');

    try {

      let result = await axios({
        url: `${globals.BACKEND_URL}/tasks`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return handleResponse(result);
    } catch (error) {
      console.error("error for api ", error);
      handleError(error);
    }
  };

  export const postTask = async (task) => {
    console.log('Creating/Updating Task');

    try {

      let result = await axios({
        url: `${globals.BACKEND_URL}/tasks`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(task)
      });
      return handleResponse(result);
    } catch (error) {
      console.error("error for api ", error);
      handleError(error);
    }
  };

  export const deleteTask = async (taskId) => {
    console.log('Deleting Task');

    try {

      let result = await axios({
        url: `${globals.BACKEND_URL}/tasks/${taskId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return handleResponse(result);
    } catch (error) {
      console.error("error for api ", error);
      handleError(error);
    }
  };