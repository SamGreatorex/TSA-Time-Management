import { updateTimecard } from "../redux/actions/timecards";
import store from "../redux/store";
import moment from "moment";
import { v4 as uuid } from "uuid";

export async function CreateNewTimecard(user) {
  //get all available tasks
  const state = store.getState();
  const tasks = state.timecards.tasks;
  let timecard = {
    UserId: user,
    TimeCardId: uuid(),
    AvailableTasks: tasks.filter((x) => x.Default === true),
    StartDate: moment().startOf("isoWeek").toString(),
    EndDate: moment().endOf("isoWeek").toString(),
    Tasks: [],
  };
  store.dispatch(updateTimecard(timecard));
}

export async function getTaskSelectOptions(tasks) {
  const options = [];
  if (tasks?.length === 0) return;
  let taskSorted = tasks
    .filter((x) => x.IsVisible)
    .sort((a, b) => (a.Name.toLowerCase() > b.Name.toLowerCase() ? 1 : -1));
  for (let i = 0; i < taskSorted.length; i++) {
    let d = taskSorted[i];
    options.find((x) => x.value === d.Type)
      ? options
          .find((x) => x.value === d.Type)
          .children.push({ value: d.TaskId, label: d.Name })
      : options.push({
          value: d.Type,
          label: d.Type,
          children: [{ value: d.TaskId, label: d.Name }],
        });
  }
  return options;
}

//Function that adds a task to a current timecard
export async function addTaskToTimecards(currentTimecard, tasks, task) {
  let updatedTasks = [...currentTimecard.AvailableTasks];
  if (!updatedTasks.find((x) => x.TaskId === task[1])) {
    updatedTasks.push(tasks.find((x) => x.TaskId === task[1]));
    let updatedTimecard = { ...currentTimecard };
    updatedTimecard.AvailableTasks = updatedTasks;
    store.dispatch(updateTimecard(updatedTimecard));
  }
}

//Function to create a new task
export async function onCreateTaskTimeEntry(currentTimecard, task) {
  let existingTask = {
    ...currentTimecard.Tasks?.find(
      (x) =>
        x.TaskTypeId === task.taskId &&
        moment(x.StartTime).startOf("day").toString() ===
          moment().startOf("day").toString()
    ),
  };

  //check if task already exists
  let newTask = {
    StartTime: existingTask?.StartTime
      ? existingTask.StartTime
      : moment().toISOString(),
    totalDuration: existingTask?.totalDuration ? existingTask.totalDuration : 0,
    TaskId: existingTask?.TaskId ? existingTask.TaskId : uuid(),
    TaskTypeId: task.TaskId,
    Notes: existingTask?.Notes ? existingTask.Notes : [],
    IsInProgress: true,
    TaskStartTime: moment().toISOString(),
  };

  onUpdateTask(currentTimecard, newTask);
}

const onUpdateTask = async (currentTimecard, task) => {
  let allTasks = [
    ...currentTimecard.Tasks.filter((x) => x.TaskId !== task.TaskId),
  ];
  allTasks.push(task);
  let updatedTimeCard = { ...currentTimecard };
  updatedTimeCard.Tasks = allTasks;
  store.dispatch(updateTimecard(updatedTimeCard));
};
