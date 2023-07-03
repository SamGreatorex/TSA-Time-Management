import { updateTimecard } from "../redux/actions/timecards";
import store from "../redux/store";
import moment from "moment";
import { v4 as uuid } from "uuid";

//Function to create a new Weekly Timecard
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

//Function add a new Task to a timecard. Will add to Available tasks
export async function AddNewAvailableTask(taskId, timecardId) {
  //get the actual task
  const state = store.getState();
  const task = state.timecards.tasks?.find((x) => x.TaskId === taskId);
  const timecard = state.timecards.usercards.find(
    (x) => x.TimeCardId === timecardId
  );

  let updatedTasks = [...timecard.AvailableTasks];
  if (!updatedTasks.find((x) => x.TaskId === taskId)) {
    updatedTasks.push({ ...task });
    let updatedTimecard = { ...timecard };
    updatedTimecard.AvailableTasks = updatedTasks;
    store.dispatch(updateTimecard(updatedTimecard));
  }
}

//Function add a new Task to a timecard. Will add to Available tasks
export async function OnAddNewTask(timecardId, tasktypeId) {
  const state = store.getState();
  const timecard = state.timecards.usercards.find(
    (x) => x.TimeCardId === timecardId
  );

  //Does the task already exist for the day.
  let existingTask = {
    ...timecard.Tasks?.find(
      (x) =>
        x.TaskTypeId === tasktypeId &&
        moment(x.StartTime).startOf("day").toString() ===
          moment().startOf("day").toString()
    ),
  };

  //if task does not exist create new
  let newTask = {
    StartTime: existingTask?.StartTime
      ? existingTask.StartTime
      : moment().toISOString(),
    totalDuration: existingTask?.totalDuration ? existingTask.totalDuration : 0,
    TaskId: existingTask?.TaskId ? existingTask.TaskId : uuid(),
    TaskTypeId: tasktypeId,
    Notes: existingTask?.Notes ? existingTask.Notes : [],
    IsInProgress: true,
    TaskStartTime: moment().toISOString(),
  };

  let allTasks = [...timecard.Tasks.filter((x) => x.TaskId !== newTask.TaskId)];
  allTasks.push(newTask);
  let updatedTimeCard = { ...timecard };
  updatedTimeCard.Tasks = allTasks;
  store.dispatch(updateTimecard(updatedTimeCard));
}

export async function OnUpdateTask(
  timecardId,
  taskId,
  duration,
  note,
  IsInProgress
) {
  const state = store.getState();
  const timecard = state.timecards.usercards.find(
    (x) => x.TimeCardId === timecardId
  );

  //Get the Existing Task.
  let existingTask = {
    ...timecard.Tasks?.find((x) => x.TaskId === taskId),
  };

  let existingNotes = [...existingTask.Notes];
  if (note) {
    existingNotes.push(note);
  }
  //if task does not exist create new
  let updatedTask = {
    StartTime: existingTask?.StartTime,
    totalDuration: duration ? duration : existingTask.totalDuration,
    TaskId: existingTask.TaskId,
    TaskTypeId: existingTask.TaskTypeId,
    Notes: existingNotes,
    IsInProgress: IsInProgress ? IsInProgress : existingTask.IsInProgress,
    TaskStartTime: existingTask.TaskStartTime,
  };

  let allTasks = [...timecard.Tasks.filter((x) => x.TaskId !== taskId)];
  allTasks.push(updatedTask);
  let updatedTimeCard = { ...timecard };
  updatedTimeCard.Tasks = allTasks;
  store.dispatch(updateTimecard(updatedTimeCard));
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

//Function to create a new task
// export async function onCreateTaskTimeEntry(currentTimecard, task) {
//   let existingTask = {
//     ...currentTimecard.Tasks?.find(
//       (x) =>
//         x.TaskTypeId === task.taskId &&
//         moment(x.StartTime).startOf("day").toString() ===
//           moment().startOf("day").toString()
//     ),
//   };

//   //check if task already exists
//   let newTask = {
//     StartTime: existingTask?.StartTime
//       ? existingTask.StartTime
//       : moment().toISOString(),
//     totalDuration: existingTask?.totalDuration ? existingTask.totalDuration : 0,
//     TaskId: existingTask?.TaskId ? existingTask.TaskId : uuid(),
//     TaskTypeId: task.TaskId,
//     Notes: existingTask?.Notes ? existingTask.Notes : [],
//     IsInProgress: true,
//     TaskStartTime: moment().toISOString(),
//   };

//   onUpdateTask(currentTimecard, newTask);
// }

// const onUpdateTask = async (currentTimecard, task) => {
//   let allTasks = [
//     ...currentTimecard.Tasks.filter((x) => x.TaskId !== task.TaskId),
//   ];
//   allTasks.push(task);
//   let updatedTimeCard = { ...currentTimecard };
//   updatedTimeCard.Tasks = allTasks;
//   store.dispatch(updateTimecard(updatedTimeCard));
// };
