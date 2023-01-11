export var currentEnv = {
   
    settings: {
      adminUrl: '',
    },
  };
  export var gcEnv = null;
  export var gcToken = null;
  export var twilioAccountSid = null;
  export var twilioAuthToken = null;
  
  export const setCurrentEnv = (value) => {
    currentEnv = value;
  };

  const resolveEnvironment = (state) => {
    const host = window.location.host;
    // console.log(`The application seems to be requested as: ${host}`);
    for (const e of state.envList) {
      if (!e.pattern) {
        // console.log(`The default environment is resolved: ${JSON.stringify(e)}`);
        return { ...e };
      }
      if (e.pattern.test(host)) {
        // console.log(`Following environment is resolved: ${JSON.stringify(e)}`);
        return { ...e };
      }
    }
    throw new Error('FATAL ERROR: environment could not be resolved');
  };
  