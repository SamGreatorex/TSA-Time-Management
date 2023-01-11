const getBackendURL = () => {

  const host = window.location.host;
  console.log('Host is:', host);
    if (host === "time-management-frontend-dev.s3-website.eu-west-2.amazonaws.com") {
      console.log('Setting Dev URL - https://pm2vq48up3.execute-api.eu-west-2.amazonaws.com/dev');
      return 'https://pm2vq48up3.execute-api.eu-west-2.amazonaws.com/dev';
    }else if (host === "time-management-frontend-prod.s3-website.eu-west-2.amazonaws.com") {
      console.log('Setting Prod URL - https://ofytpkmiue.execute-api.eu-west-2.amazonaws.com/prod');
        return 'https://ofytpkmiue.execute-api.eu-west-2.amazonaws.com/prod';
      }else
      {
        return 'http://localhost:4000';
      } 
  }
  
  const getEnvironment = () => {

    const host = window.location.host;
    console.log('Host is:', host);
    if (host === "time-management-frontend-dev.s3-website.eu-west-2.amazonaws.com") {
      return 'dev';
    }else if (host === "time-management-frontend-prod.s3-website.eu-west-2.amazonaws.com") {
      
        return 'prod';
      }else
      {
        return 'localhost';
      } 
    }

  export default {
      BACKEND_URL: getBackendURL(),
      ENV: getEnvironment()
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
    
    
