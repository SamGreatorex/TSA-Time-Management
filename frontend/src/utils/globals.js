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
        return 'http://localhost:4000/dev';
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
      { value: 'Quarterly Tech Summits', label: 'Quarterly Tech Summits'},
      { value: 'Everest', label: 'Everest'},
      { value: 'Preparation, doc, design', label: 'Preparation, doc, design' },
      { value: 'Equipment assessment, testing, demo', label: 'Equipment assessment, testing, demo' },
      { value: 'Setup, Event, Tear down', label: 'Setup, Event, Tear down' },
      { value: 'TMR', label: 'TMR' },
      { value: 'Product Release Trainings', label: 'Product Release Trainings' },
      { value: 'Process Optimization', label: 'Process Optimization' },
      { value: 'Creating Training Material', label: 'Creating Training Material' },
      { value: 'Dragon Team Meetings', label: 'Dragon Team Meetings' },
      { value: 'Vivun / JIRA Processing', label: 'Vivun / JIRA Processing' },
      { value: 'FR Escalations', label: 'TFR Escalations' },
      { value: 'Roadmap / New Product Presentations', label: 'Roadmap / New Product Presentations' },
      { value: 'Technical Escalations / Troubleshooting', label: 'Technical Escalations / Troubleshooting' },
      { value: 'Demos', label: 'Demos' },
      { value: 'Feature pre-release testing', label: 'Feature pre-release testing' },
      { value: 'Beta support', label: 'Beta support' },
      { value: 'Internal documentation', label: 'Internal documentation' },
      { value: 'External documentation', label: 'External documentation' },
      { value: 'Non-SE Enablement (insights, support etc)', label: 'Non-SE Enablement (insights, support etc)' },
      { value: 'RFP’s', label: 'RFP’s' },
      { value: 'Event Prep', label: 'Event Prep' }
    ];
    
    
