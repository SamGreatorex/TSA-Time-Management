import React, { useEffect, useState } from "react";
import {
  Select,
  Row,
  Col,
  Tooltip,
  Button,
  Table,
  Input,
  Form,
  Cascader,
} from "antd";
import * as tcActions from "../../redux/actions/timecards";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment, { parseZone } from "moment";
import { v4 as uuid } from "uuid";
import {
  AddNewAvailableTask,
  CreateNewTimecard,
  OnAddNewTask,
  OnUpdateTask,
  GetTaskSelectOptions,
} from "../../utils/helpers";
const { TextArea } = Input;
const { Option } = Select;

function Timecards({ actions, timecards, tasks }) {
  const [form] = Form.useForm();
  const [lTimecards, setlTimecards] = useState([]);
  const [currentTimecard, setCurrentTimecard] = useState(null);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [tcDescription, setTCDescription] = useState("");
  const [taskSelectOptions, setTaskSelectOptions] = useState([]);

  useEffect(() => {
    actions.getUserTimecards("samg");
    actions.getTasks();
  }, []);

  useEffect(() => {
    setlTimecards(timecards);
    const cTimeCard = timecards.find(
      (x) =>
        moment(x.StartDate).toString() ===
        moment().startOf("isoWeek").toString()
    );
    console.log("!!!Curr", cTimeCard);
    setCurrentTimecard(cTimeCard);
    configureTaskSelectOptions();
  }, [timecards]);

  const timeCardsTasks = [
    {
      key: "taskId",
      dataIndex: "taskId",
      hidden: true,
    },
    {
      title: "Task Name",
      key: "Name",
      dataIndex: "Name",
      align: "center",
    },
    {
      title: "Type",
      key: "Type",
      dataIndex: "Type",
      align: "center",
    },
    {
      key: "actions",
      align: "center",
      render: (record) => {
        let tc =
          currentTimecard.Tasks?.find(
            (x) =>
              x.TaskTypeId === record.TaskId &&
              moment(x.StartTime).startOf("day").toString() ===
                moment().startOf("day").toString()
          ) || null;
        console.log("!!1, tc", record.TaskId, tc);
        const RecordUpdating = currentTimecard.Tasks?.find(
          (x) => x.IsInProgress && x.IsInProgress === true
        );
        return (
          <div>
            {/* Only Show start button if no other task is in progress*/}
            {!RecordUpdating && (
              <Tooltip title="Start Task">
                <Button onClick={() => OnStartTask(record)} type="primary">
                  Start{" "}
                </Button>
              </Tooltip>
            )}

            {RecordUpdating && tc?.IsInProgress === true && (
              <Row>
                <Col span={20}>
                  <TextArea
                    rows={2}
                    onChange={(e) => setTCDescription(e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Button type="primary" onClick={() => OnEndTask(record)}>
                    Submit
                  </Button>
                </Col>
              </Row>
            )}
          </div>
        );
      },
    },
  ];

  const configureTaskSelectOptions = async () => {
    let taskOption = await GetTaskSelectOptions();
    setTaskSelectOptions(taskOption);
  };

  const OnStartTask = async (record) => {
    await OnAddNewTask(currentTimecard.TimeCardId, record.TaskId);
    setUpdatingTask(true);
  };

  const OnEndTask = async (record) => {
    let task = { ...currentTimecard.Tasks.find((x) => x.IsInProgress) };
    //let notes = [...task.Notes];

    let startDate = await formatDate(moment(task.TaskStartTime));
    let endDate = await formatDate(moment());
    var duration = moment.duration(moment(endDate).diff(startDate));
    var minutes = duration.asMinutes() === 0 ? 15 : duration.asMinutes();

    let note = {
      noteId: uuid(),
      StartTime: task.TaskStartTime,
      duration: minutes,
      note: tcDescription,
    };
    let totalDuration = parseInt(minutes) + parseInt(task.totalDuration);
    await OnUpdateTask(
      currentTimecard.TimeCardId,
      task.TaskId,
      totalDuration,
      note,
      "false"
    );
    setUpdatingTask(false);
  };

  const OnTimeCardChanged = async (record) => {
    setCurrentTimecard(lTimecards.find((x) => x.TimeCardId === record));
  };

  const OnAddTask = async (task) => {
    await AddNewAvailableTask(task[1], currentTimecard.TimeCardId);
  };

  const onUpdateTask = async (task) => {
    let allTasks = [
      ...currentTimecard.Tasks.filter((x) => x.TaskId !== task.TaskId),
    ];
    allTasks.push(task);
    let updatedTimeCard = { ...currentTimecard };
    updatedTimeCard.Tasks = allTasks;
    actions.updateTimecard(updatedTimeCard);
  };

  const onCreateWeeksCard = async () => {
    await CreateNewTimecard("samg");
  };

  return (
    <div>
      <Row>
        <h2>Timecards</h2>
      </Row>
      <Row>
        <Col>Start Week:</Col>
        <Col>
          <Select
            disabled={timecards?.length === 0}
            style={{ width: "200px", paddingLeft: "10px" }}
            onChange={OnTimeCardChanged}
            defaultValue={() => moment().startOf("isoWeek").format("Do MMM YY")}
          >
            {lTimecards.map((tc) => (
              <Option key={tc.TimeCardId}>
                {moment(tc.StartDate).format("Do MMM YY")}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          {!timecards?.find(
            (x) =>
              moment(x.StartDate).toString() ===
              moment().startOf("isoWeek").toString()
          ) && (
            <Tooltip title="create-week-card">
              <Button type="primary" onClick={() => onCreateWeeksCard()}>
                {" "}
                Create Weeks Card{" "}
              </Button>
            </Tooltip>
          )}
        </Col>
        <Col>
          {currentTimecard && (
            <Cascader
              style={{ paddingLeft: "10px" }}
              options={taskSelectOptions || []}
              onChange={OnAddTask}
              placeholder="Add New Task"
            />
          )}
        </Col>
      </Row>
      <Row>
        {currentTimecard && (
          <Table
            style={{ marginTop: "4px", width: "100%" }}
            size="small"
            dataSource={
              !currentTimecard.AvailableTasks
                ? []
                : currentTimecard.AvailableTasks.sort((a, b) =>
                    a.Type.toLowerCase() > b.Type.toLowerCase() ? 1 : -1
                  )
            }
            rowKey={(record) => record.TaskId}
            columns={timeCardsTasks}
            pagination={{
              total: currentTimecard.AvailableTasks
                ? currentTimecard.AvailableTasks.length
                : 0,
              pageSize: 15,
              hideOnSinglePage: true,
            }}
          />
        )}
      </Row>
    </div>
  );
}

async function formatDate(date) {
  let minutes = date.minutes();
  let hour = date.hour();
  var day = date.date();
  var month = date.month();
  var year = date.year();
  if (minutes < 15) minutes = 15;
  if (minutes > 15 && minutes < 30) minutes = 30;
  if (minutes > 30 && minutes < 45) minutes = 45;
  if (minutes > 45) {
    minutes = 0;
    hour = hour + 1;
  }

  var newDate = new Date(year, month, day, hour, minutes);
  return moment(newDate).toString();
}

function mapStateToProps(state) {
  return {
    timecards: state.timecards.usercards,
    tasks: state.timecards.tasks,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      getUserTimecards: bindActionCreators(
        tcActions.getUserTimecards,
        dispatch
      ),
      updateTimecard: bindActionCreators(tcActions.updateTimecard, dispatch),
      getTasks: bindActionCreators(tcActions.getTasks, dispatch),
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Timecards);
