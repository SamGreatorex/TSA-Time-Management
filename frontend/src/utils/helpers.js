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
