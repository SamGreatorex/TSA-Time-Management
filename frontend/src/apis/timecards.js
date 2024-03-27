import axios from "axios";
import { handleResponse, handleError } from "../utils/utils";
import globals from "../utils/globals";

export const listUserTimecards = async (userId) => {
  try {
    let result = await axios({
      url: `${globals.BACKEND_URL}/${userId}/timecard`,
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

export const postTimecard = async (timecard) => {
  try {
    let result = await axios({
      url: `${globals.BACKEND_URL}/timecard`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(timecard),
    });
    return handleResponse(result);
  } catch (error) {
    console.error("error for api ", error);
    handleError(error);
  }
};
