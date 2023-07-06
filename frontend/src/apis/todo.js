import axios from "axios";
import { handleResponse, handleError } from "../utils/utils";
import globals from "../utils/globals";

export const listTodo = async () => {
  console.log("Getting ToDo Items");

  try {
    let result = await axios({
      url: `${globals.BACKEND_URL}/listTodo`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse(result);
  } catch (error) {
    console.error("error for api ", error);
    handleError(error);
  }
};

export const createTodo = async (item) => {
  console.log("Create ToDo Items");

  try {
    let result = await axios({
      url: `${globals.BACKEND_URL}/todo`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(item),
    });
    return handleResponse(result);
  } catch (error) {
    console.error("error for api ", error);
    handleError(error);
  }
};

export const updateTodo = async (item) => {
  console.log("Update ToDo Items");

  try {
    let result = await axios({
      url: `${globals.BACKEND_URL}/todo`,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(item),
    });
    return handleResponse(result);
  } catch (error) {
    console.error("error for api ", error);
    handleError(error);
  }
};

export const deleteTodo = async (itemId) => {
  console.log("deleting ToDo Items");

  try {
    let result = await axios({
      url: `${globals.BACKEND_URL}/todo/${itemId}`,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse(result);
  } catch (error) {
    console.error("error for api ", error);
    handleError(error);
  }
};

export const getTodo = async (taskId) => {
  console.log(`Getting ToDo Items for TaskID: ${taskId}`);

  try {
    let result = await axios({
      url: `${globals.BACKEND_URL}/todo/task/${taskId}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse(result);
  } catch (error) {
    console.error("error for api ", error);
    handleError(error);
  }
};
