const getBackendURL = () => {

    if (window.location.href.indexOf("localhost") > -1) {
      console.log('Setting backend URL as http://localhost:4000/dev');
      return 'http://localhost:4000/dev';
    }else
    {
      console.log('Setting backend URL as https://5n19gk22j9.execute-api.eu-west-2.amazonaws.com/dev');
      return 'https://5n19gk22j9.execute-api.eu-west-2.amazonaws.com/dev'
    }
  }
  
  export default {
      BACKEND_URL: getBackendURL()
    };
    
  
  