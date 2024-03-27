import globals from "./globals";

export async function handleResponse(response) {
  if (response.status < 200 || response.status > 299) handleError(response.statusText);
  return response.data;
}

export async function handleResponseNoBody(response) {
  if (response.status < 200 || response.status > 299) handleError(response.statusText);
}

export function handleError(error, custom401page = null) {
  if (!error || (error.response && error.response.status === 401)) {
    if (custom401page) {
      window.location.href = custom401page;
    } else {
      //TODO: Need to add logout function here
    }
    return;
  }
  console.error("API call failed:" + error);
  throw error;
}

//Function that gets the URL based oin currnet logged
export function getAuthUrl() {
  let url = globals.PROD_AUTH_URL;

  if (window.location.href.indexOf("localhost") > -1) {
    url = globals.LOCALHOST_AUTH_URL;
  }
  return url;
}

export function getRedirectUrl() {
  let url = globals.PROD_AUTH_URL;

  if (window.location.href.indexOf("localhost") > -1) {
    url = globals.LOCALHOST_AUTH_URL;
  }
  const queryParams = new URLSearchParams(url);
  const redirectUrl = queryParams.get("redirect_uri");
  return redirectUrl;
}

export async function convertMinToStringTime(minutes) {
  let hrs = Math.floor(minutes / 60);
  let min = minutes - hrs * 60;
  return `${hrs}hrs ${min}min`;
}
