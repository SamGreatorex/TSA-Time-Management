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
    
  
    
    export const taskTypes = [
      { value: 'Admin', label: 'Admin' },
      { value: 'NMT', label: 'NMT' },
      { value: 'Level Up', label: 'Level Up' },
      { value: 'Preparation, doc, design', label: 'Preparation, doc, design' },
      { value: 'Equipment assessment, testing, demo', label: 'Equipment assessment, testing, demo' },
      { value: 'Setup, Event, Tear down', label: 'Setup, Event, Tear down' },
      { value: 'TMR', label: 'TMR' },
    ];
    
    