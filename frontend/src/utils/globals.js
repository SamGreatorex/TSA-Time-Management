const getBackendURL = () => {
  const host = window.location.host;

  if (host.includes("localhost")) {
    return "http://localhost:4000/dev";
  } else {
    return "https://my7yhf9xc7.execute-api.eu-west-2.amazonaws.com/prod";
  }
};

const getEnvironment = () => {
  const host = window.location.host;
  if (host.includes("localhost")) {
    return "localhost";
  } else {
    return "prod";
  }
};

export default {
  BACKEND_URL: getBackendURL(),
  ENV: getEnvironment(),
};

export const taskTypes = [
  { value: "Admin", label: "Admin" },
  { value: "NMT", label: "NMT", vivunItem: true },
  { value: "Level Up", label: "Level Up", vivunItem: true },
  {
    value: "Quarterly Tech Summits",
    label: "Quarterly Tech Summits",
    vivunItem: true,
  },
  { value: "Everest", label: "Everest", vivunItem: true },
  {
    value: "Preparation, doc, design",
    label: "Preparation, doc, design",
    vivunItem: true,
  },
  {
    value: "Equipment assessment, testing, demo",
    label: "Equipment assessment, testing, demo",
    vivunItem: true,
  },
  {
    value: "Setup, Event, Tear down",
    label: "Setup, Event, Tear down",
    vivunItem: true,
  },
  { value: "TMR", label: "TMR", vivunItem: true },
  {
    value: "Product Release Trainings",
    label: "Product Release Trainings",
    vivunItem: true,
  },
  {
    value: "Process Optimization",
    label: "Process Optimization",
    vivunItem: true,
  },
  {
    value: "Creating Training Material",
    label: "Creating Training Material",
    vivunItem: true,
  },
  {
    value: "Dragon Team Meetings",
    label: "Dragon Team Meetings",
    vivunItem: true,
  },
  {
    value: "Vivun / JIRA Processing",
    label: "Vivun / JIRA Processing",
    vivunItem: true,
  },
  { value: "FR Escalations", label: "TFR Escalations", vivunItem: true },
  {
    value: "Roadmap / New Product Presentations",
    label: "Roadmap / New Product Presentations",
    vivunItem: true,
  },
  {
    value: "Technical Escalations / Troubleshooting",
    label: "Technical Escalations / Troubleshooting",
    vivunItem: true,
  },
  { value: "Demos", label: "Demos", vivunItem: true },
  {
    value: "Feature pre-release testing",
    label: "Feature pre-release testing",
    vivunItem: true,
  },
  { value: "Beta support", label: "Beta support", vivunItem: true },
  {
    value: "Internal documentation",
    label: "Internal documentation",
    vivunItem: true,
  },
  {
    value: "External documentation",
    label: "External documentation",
    vivunItem: true,
  },
  {
    value: "Non-SE Enablement (insights, support etc)",
    label: "Non-SE Enablement (insights, support etc)",
    vivunItem: true,
  },
  { value: "RFP’s", label: "RFP’s", vivunItem: true },
  { value: "Event Prep", label: "Event Prep", vivunItem: true },
];
