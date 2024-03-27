import React, { useEffect, useState } from "react";
import { Select, Row, Col, Table, Typography, Space, Button, Modal, Input, Tooltip, Form, Checkbox } from "antd";
import { convertMinToStringTime } from "../../utils/utils";
import * as tcActions from "../../redux/actions/timecards";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import { v4 as uuid } from "uuid";
import { taskTypes } from "../../utils/globals";

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

function DailyReport({ actions, timecards, tasks }) {
  const [weeksFilter, setweeksFilter] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(moment().startOf("isoWeek"));
  const [daysFilter, setdaysFilter] = useState([]);
  const [selectedDate, setselectedDate] = useState(moment());
  const [weeksTimecard, setWeeksTimecard] = useState([]);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    if (timecards.length === 0) {
      actions.getUserTimecards("samg");
      actions.getTasks();
    } else {
      resetData(selectedDate);
    }
  }, []);

  useEffect(() => {
    if (timecards.length > 0) {
      if (!weeksFilter.length > 0) populateWeeksFilter();
      if (!daysFilter.length > 0) populateDaysFilter(selectedWeek);
      resetData();
    }
  }, [timecards]);

  useEffect(() => {
    resetData();
  }, [selectedDate]);

  const populateWeeksFilter = async () => {
    let weekDates = timecards.map((x) => x.StartDate).sort((a, b) => moment(b) - moment(a));
    let minutes = data.length > 0 ? data.map((x) => x.totalDuration)?.reduce((sum, val) => sum + val) : 0;
    let total = await convertMinToStringTime(minutes);
    let remainingData = await convertMinToStringTime(40 * 5 - minutes);

    //Set the UI
    setweeksFilter([...weekDates]);

    //Set initial Weeks Timecard
    setWeeksTimecard(timecards.find((x) => moment(x.StartDate).toString() === selectedWeek.toString()));
  };

  const populateDaysFilter = async (startWeekDate) => {
    let availableDays = [];
    let selectedDate = moment(startWeekDate);

    for (let i = 0; i < 7; i++) {
      availableDays.push(moment(startWeekDate).add("days", i).toString());
    }
    setdaysFilter([...availableDays]);
    setselectedDate(moment(startWeekDate));
  };

  const OnWeekChanged = async (date) => {
    setSelectedWeek(moment(date));
    let currentTimecard = timecards.find((x) => moment(x.StartDate).toString() === date.toString());
    setWeeksTimecard(currentTimecard);
    populateDaysFilter(moment(date));
  };

  const resetData = async () => {
    setData([]);

    let allTasks = weeksTimecard?.Tasks || [];
    let todaysTasks = allTasks.filter((x) => moment(x.StartTime).startOf("day").toString() === moment(selectedDate).startOf("day").toString());
    let sortedTasks = todaysTasks.sort((a, b) => moment(b.StartTime) - moment(a.StartTime));
    setData(sortedTasks);
  };

  const UpdateRecord = (record) => {
    let notes = [];
    for (let i = 0; i < record.Notes.length; i++) {
      let note = record.Notes[i];
      if (!note.noteId) {
        notes.push({ ...note, noteId: uuid() });
      } else {
        notes.push({ ...note });
      }
    }
    let task = {
      IsInProgress: record.IsInProgress,
      StartTime: record.StartTime,
      totalDuration: record.totalDuration,
      TaskId: record.TaskId,
      TaskTypeId: record.TaskTypeId,
      Notes: notes,
    };

    setEditingTask(task);
    setIsModalOpen(true);
  };

  const OnSaveRecord = async () => {
    let updatedTask = { ...editingTask };

    //Update the value of totalDuration
    updatedTask.totalDuration = updatedTask.Notes.map((x) => x.duration)?.reduce((sum, val) => sum + val);

    setEditingTask({});
    await onUpdateTask(updatedTask);
  };

  const onCreateTask = async (task) => {
    let availableTasks = [...weeksTimecard.AvailableTasks];
    availableTasks.push(tasks.find((x) => x.TaskId === task.type));

    let _tasks = [...weeksTimecard.Tasks];

    //check if task already exists
    let newTask = {
      StartTime: moment(selectedDate).toISOString(),
      totalDuration: 0,
      TaskId: uuid(),
      TaskTypeId: task.type,
      Notes: [
        {
          noteId: uuid(),
          StartTime: moment(selectedDate).toISOString(),
          duration: 0,
          note: "",
        },
      ],
      IsInProgress: false,
    };
    _tasks.push(newTask);

    let timecard = { ...weeksTimecard };
    timecard.AvailableTasks = availableTasks;
    timecard.Tasks = _tasks;

    setWeeksTimecard(timecard);
    actions.updateTimecard(timecard);
    resetData();
    setIsTaskModalOpen(false);
  };

  const onUpdateTask = async (task) => {
    let updatedTasks = [...weeksTimecard.Tasks.filter((x) => x.TaskId !== task.TaskId)];
    updatedTasks = [...updatedTasks];
    updatedTasks.push(task);
    let updatedTimeCard = { ...weeksTimecard };
    updatedTimeCard.Tasks = updatedTasks;
    setWeeksTimecard(updatedTimeCard);
    await actions.updateTimecard(updatedTimeCard);
    setIsModalOpen(false);
  };

  const onInputChange = (e, key, index) => {
    let updatingTask = { ...editingTask };
    let taskNoteIndex = updatingTask.Notes.findIndex((x) => x.StartTime === index.StartTime && x.note === index.note);
    updatingTask.Notes[taskNoteIndex][key] = key === "duration" ? parseInt(e.target.value) : e.target.value;
    setEditingTask(updatingTask);
  };

  const OnAddNewNote = (record) => {
    let notes = [];
    notes.push({
      noteId: uuid(),
      StartTime: moment(selectedDate).toISOString(),
      duration: 15,
      note: "",
    });
    for (let i = 0; i < record.Notes.length; i++) {
      let note = record.Notes[i];
      notes.push({ ...note });
    }
    let task = {
      IsInProgress: record.IsInProgress,
      StartTime: record.StartTime,
      totalDuration: record.totalDuration,
      TaskId: record.TaskId,
      TaskTypeId: record.TaskTypeId,
      Notes: notes,
    };
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const recordColumns = [
    {
      title: "Start Time",
      key: "StartTime",
      width: "300px",
      render: (record, index) => <Input value={record.StartTime} onChange={(e) => onInputChange(e, "StartTime", index)} />,
    },
    {
      title: "Duration",
      key: "duration",
      render: (record, index) => <Input value={record.duration} onChange={(e) => onInputChange(e, "duration", index)} />,
    },
    {
      title: "Note",
      key: "note",
      width: "500px",
      render: (record, index) => <TextArea value={record.note} onChange={(e) => onInputChange(e, "note", index)} />,
    },
  ];

  const dataColumns = [
    {
      key: "TaskId",
      dataIndex: "TaskId",
      fixed: true,
      width: 350,
    },
    {
      title: "Task Name",
      key: "taskName",
      align: "center",
      render: (record) => {
        return <Space direction="vrtical">{tasks?.find((x) => x.TaskId === record.TaskTypeId)?.Name ?? ""}</Space>;
      },
    },
    {
      title: "Task Type",
      key: "TaskType",
      align: "center",
      render: (record) => {
        return <Space direction="vrtical">{tasks?.find((x) => x.TaskId === record.TaskTypeId)?.Type ?? ""}</Space>;
      },
    },
    {
      title: "Duration",
      key: "totalDuration",
      render: (record) => {
        const minutes = record.totalDuration;
        let hrs = Math.floor(minutes / 60);
        let min = minutes - hrs * 60;
        const display = `${hrs}hrs ${min}min`;
        return <Space direction="vertical">{display}</Space>;
      },
    },
    {
      title: "Notes",
      key: "Notes",
      width: "45%",
      render: (record) => {
        return (
          <Space direction="vertical">
            {Array.isArray(record.Notes) ? (
              record.Notes.map((note) => {
                let display = `${moment(note.StartTime).format("ddd Do HH:mm")} - (${note.duration}min) - ${note.note}`;
                return <div style={{ wordWrap: "break-word", wordBreak: "break-word" }}>{display}</div>;
              })
            ) : (
              <div style={{ wordWrap: "break-word", wordBreak: "break-word" }}>
                {moment(record.StartTime).format("ddd Do HH:mm")} - {record.totalDuration}min - {record.Notes}
              </div>
            )}
          </Space>
        );
      },
    },
    {
      key: "actions",
      render: (record) => {
        return (
          <>
            <Button onClick={() => UpdateRecord(record)}> Update Task </Button>
            <Button onClick={() => OnAddNewNote(record)}>Add New</Button>
          </>
        );
      },
    },
  ];

  return (
    <div>
      <Row>
        <Col>
          <Select disabled={timecards?.length === 0} style={{ width: "200px" }} onChange={OnWeekChanged} value={selectedWeek.format("Do MMM YY").toString()}>
            {weeksFilter.map((data) => (
              <Option key={data}>{moment(data).format("Do MMM YY")}</Option>
            ))}
          </Select>
          <Select disabled={timecards?.length === 0} style={{ width: "200px" }} onChange={(date) => setselectedDate(moment(date))} value={selectedDate.format("Do MMM YY").toString()}>
            {daysFilter.map((data) => (
              <Option key={data}>{moment(data).format("Do MMM YY")}</Option>
            ))}
          </Select>

          <Tooltip title="create-task">
            <Button type="primary" onClick={() => setIsTaskModalOpen(true)}>
              {" "}
              Add New Task{" "}
            </Button>
          </Tooltip>
        </Col>
      </Row>
      <Row>
        <Table
          style={{ marginTop: "4px", alignSelf: "center" }}
          bordered
          dataSource={data}
          rowKey={(record) => `${record.TaskId}|${record.StartTime}`}
          columns={dataColumns}
          pagination={{
            total: data ? data.length : 0,
            pageSize: 15,
            hideOnSinglePage: true,
          }}
          summary={(pageData) => {
            let minutes = pageData.length > 0 ? pageData.map((x) => x.totalDuration)?.reduce((sum, val) => sum + val) : 0;
            let hrs = Math.floor(minutes / 60);
            let min = minutes - hrs * 60;
            let display = `${hrs}hrs ${min}min`;
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell>Total Duration</Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={4}>
                    <Text type="danger">{display}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </Row>

      <Modal title="Basic Modal" open={isModalOpen} footer={null} onCancel={() => setIsModalOpen(false)} width="800px">
        <>
          <div>{JSON.stringify(editingTask)}</div>
          <Table rowKey="id" columns={recordColumns} dataSource={editingTask.Notes} pagination={false} />
          <Row>
            <Button onClick={() => OnSaveRecord()}>Save</Button>
          </Row>
        </>
      </Modal>

      <Modal title="Add Task" open={isTaskModalOpen} footer={null} onCancel={() => setIsTaskModalOpen(false)} width={800}>
        <Form name="createTask" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} form={form} onFinish={onCreateTask}>
          <Form.Item label="Task Type" name="type" rules={[{ required: true, message: "Please select a type!" }]}>
            <Select style={{ width: "500px" }}>
              {tasks
                ?.filter((x) => x.IsVisible)
                .sort((a, b) => (a.Type.toLowerCase() > b.Type.toLowerCase() ? 1 : -1))
                .map((tc) => (
                  <Option key={tc.TaskId}>
                    {tc.Type} - {tc.Name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Select
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
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
      getUserTimecards: bindActionCreators(tcActions.getUserTimecards, dispatch),
      getTasks: bindActionCreators(tcActions.getTasks, dispatch),
      updateTimecard: bindActionCreators(tcActions.updateTimecard, dispatch),
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DailyReport);
