import React, { useState, useEffect } from "react";
import * as todoApi from "../../apis/todo";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as tcActions from "../../redux/actions/timecards";
import { Form, Popconfirm, Table, Typography, Input, DatePicker, Select, Tag, Button, Cascader, Modal, List, Space, Row } from "antd";
import { v4 as uuid } from "uuid";
import moment, { min } from "moment";
import { AddTaskNote, GetCurrentTimecard, GetSpecificTimecard, GetTaskSelectOptions } from "../../utils/helpers";
import { TaskAbortError } from "@reduxjs/toolkit";

const taskType = "Task";

const { TextArea } = Input;

const statusOptions = [
  {
    value: "New",
    label: "New",
  },
  {
    value: "In Progress",
    label: "In Progress",
  },
  {
    value: "Completed",
    label: "Completed",
  },
  {
    value: "Waiting",
    label: "Waiting",
  },
];

function ToDoTask({ actions, tasks, todoData, onUpdateData }) {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [taskSaving, setTaskSaving] = useState("");
  const [taskSelectOptions, setTaskSelectOptions] = useState(GetTaskSelectOptions);
  const isEditing = (record) => record.Id === editingKey;
  const [minutes, setMinutes] = useState(null);
  const [taskDate, setTaskDate] = useState(moment());

  useEffect(() => {
    if (!tasks || tasks.length === 0) actions.getTasks();
    // if (data.length === 0) LoadData();
    getSelectOptions();
  }, []);

  useEffect(() => {
    console.log("TODO data changed", todoData, taskType);
    setData(todoData.filter((x) => x.Status !== "Completed" && (!x.hasOwnProperty("TaskType") || x.TaskType === taskType)).sort((a, b) => moment(a.ReviewDate) - moment(b.ReviewDate)));
  }, [todoData]);

  useEffect(() => {
    if (data[0]?.hasOwnProperty("isNew")) edit(data[0]);
  }, [data]);

  useEffect(() => {
    if (tasks.length > 0) getSelectOptions();
  }, [tasks]);

  const EditableCell = ({ editing, dataIndex, title, record, index, children, ...restProps }) => {
    let inputNode = <Input />;
    if (dataIndex === "ReviewDate") inputNode = <DatePicker format="DD-MM-YYYY" />;
    if (dataIndex === "Task") {
      const rows = record.Progress.split("\n");
      inputNode = <TextArea rows={rows.length + 1} />;
    }
    if (dataIndex === "Progress") {
      const rows = record.Progress.split("\n");
      inputNode = <TextArea rows={rows.length + 1} />;
    }
    if (dataIndex === "Status")
      inputNode = (
        <Select
          options={statusOptions}
          style={{
            width: 120,
          }}
        />
      );
    if (dataIndex === "TaskId") {
      inputNode = <Cascader style={{ paddingLeft: "10px" }} options={taskSelectOptions} placeholder="Select Task" />;
    }
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const getSelectOptions = async () => {
    const selectOptions = await GetTaskSelectOptions();
    setTaskSelectOptions(selectOptions);
  };

  const edit = (record) => {
    const updatedDate = moment(record.ReviewDate);

    record["ReviewDate"] = updatedDate;
    form.setFieldsValue({
      Task: "",
      Status: "",
      Progress: "",
      ReviewDate: "",
      TaskId: "",
      ...record,
    });
    setEditingKey(record.Id);
  };

  const cancel = (record) => {
    if (record.isNew) {
      let updatedData = [...data];
      updatedData.shift();

      setData(updatedData);
    }

    setEditingKey("");
  };

  const OnSaveWithMinutes = async () => {
    //save timecard entry
    let row = await form.validateFields();
    let progressNote = row.Progress.split("\n")[0];

    let taskId = Array.isArray(row.TaskId) ? row.TaskId[1] : row.TaskId;

    if (taskId) {
      //Need to save the time to the task

      const timecard = await GetSpecificTimecard(taskDate.toISOString());

      let note = {
        noteId: uuid(),
        StartTime: taskDate.toISOString(),
        duration: parseInt(minutes),
        note: progressNote,
      };
      await AddTaskNote(timecard.TimeCardId, taskId, note);
      await save(taskSaving);

      setMinutes(null);
      setTaskSaving(null);
    }
  };
  const save = async (key) => {
    try {
      let row = await form.validateFields();

      const newData = [...data];
      const index = newData.findIndex((item) => key === item.Id);

      //Reformatt the date to use moment
      const date = row.ReviewDate.toString();
      row.ReviewDate = moment(date);

      //update the task

      row.TaskId = Array.isArray(row.TaskId) ? row.TaskId[1] : row.TaskId;

      //remove the isNew Property if it exists
      if (row?.hasOwnProperty("isNew")) {
        delete row.isNew;
      }

      if (index > -1) {
        let item = newData[index];

        //remove the isNew Property if it exists
        if (item.hasOwnProperty("isNew")) {
          delete item.isNew;
        }
        item.TaskType = taskType;
        newData.splice(index, 1, {
          ...item,
          ...row,
        });

        onUpdateData(newData[index]);
        setEditingKey("");
      } else {
        newData.push(row);
        // await todoApi.createTodo(row);
        // setData(newData.sort((a, b) => moment(a.ReviewDate) - moment(b.ReviewDate)));
        onUpdateData(row);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const updateTaskStatus = async (record, newTaskType) => {
    try {
      const newData = [...data];
      const index = newData.findIndex((item) => item.Id === record.Id);

      if (index > -1) {
        let item = newData[index];
        item.TaskType = newTaskType;
        onUpdateData(item);
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "Work Task",
      dataIndex: "Task",
      width: "20%",
      editable: true,
    },
    {
      title: "Task",
      dataIndex: "TaskId",
      width: "15%",
      editable: true,
      filters: tasks
        .filter(function (item) {
          return [...new Set(data.map((x) => x.TaskId))].indexOf(item.TaskId) !== -1;
        })
        .map((t) => ({ value: t.TaskId, text: `${t.Type} - ${t.Name}` })),
      onFilter: (value, record) => record.TaskId.indexOf(value) === 0,
      render: (record) => {
        let foundTask = tasks?.find((x) => x.TaskId === record);
        return <div>{foundTask ? foundTask.Name : ""}</div>;
      },
    },
    {
      title: "Status",
      dataIndex: "Status",
      width: "5%",
      editable: true,
      filters: [...new Set(data.map((x) => x.Status))].map((s) => ({ value: s, text: s })),
      onFilter: (value, record) => record.Status.indexOf(value) === 0,
      render: (record, allData) => {
        let tagColor = "blue";
        if (record === "In Progress") tagColor = "Orange";
        if (record === "Waiting") tagColor = "Red";
        if (record === "Completed") tagColor = "Green";
        return (
          <Tag color={tagColor} key={record.Id}>
            {record}
          </Tag>
        );
      },
    },
    {
      title: "Progress",
      dataIndex: "Progress",
      width: "35%",
      editable: true,
      render: (record) => {
        const rows = record.split("\n");
        return (
          <List>
            {rows.map((row, index) => {
              return (
                <List.Item style={{ padding: "0px" }} key={index}>
                  <div style={{ wordWrap: "break-word", wordBreak: "break-word" }}>{row}</div>
                </List.Item>
              );
            })}
          </List>
        );
      },
    },
    {
      title: "Person",
      dataIndex: "Person",
      editable: true,
    },
    {
      title: "Review",
      dataIndex: "ReviewDate",
      width: "5%",
      editable: true,
      render: (record) => {
        return <div>{moment(record).format("ddd DD MMM YY")}</div>;
      },
    },
    {
      title: "operation",
      dataIndex: "operation",
      width: "8%",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space direction="vertical">
            <Typography.Link
              onClick={() => save(record.Id)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            {record.TaskId !== "" && (
              <Typography.Link
                onClick={() => setTaskSaving(record.Id)}
                style={{
                  marginRight: 8,
                }}
              >
                Save (+time)
              </Typography.Link>
            )}
            <Popconfirm title="Sure to cancel?" onConfirm={() => cancel(record)}>
              <a href="/">Cancel</a>
            </Popconfirm>
          </Space>
        ) : (
          <div>
            <Row>
              <Typography.Link disabled={editingKey !== ""} onClick={() => edit(record)}>
                Edit
              </Typography.Link>
            </Row>
            <Row>
              <Typography.Link disabled={editingKey !== ""} onClick={() => updateTaskStatus(record, taskType === "Project" ? "Task" : "Project")}>
                Make {taskType === "Project" ? "Task" : "Project"}
              </Typography.Link>
            </Row>
          </div>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const OnAddNewRow = async () => {
    let updatedData = [...data];
    updatedData.unshift({
      Id: uuid().toString(),
      Task: "",
      Status: "New",
      Progress: "",
      ReviewDate: moment(),
      isNew: true,
      TaskId: "",
      TaskType: taskType,
    });
    setData(updatedData);
  };

  return (
    <div>
      <Button onClick={OnAddNewRow}>Add New Record</Button>
      <Form form={form} component={false}>
        <Table
          style={{ padding: "10px" }}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowKey="Id"
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>
      <Modal
        title="Input Total Minutes On Task"
        open={taskSaving}
        onOk={OnSaveWithMinutes}
        onCancel={() => {
          setMinutes(null);
          setTaskDate(moment());
          setTaskSaving(null);
        }}
      >
        <div>
          Minutes:
          <Input onChange={(value) => setMinutes(value.target.value)} />
          <DatePicker
            placeholder="Date time spent"
            defaultValue={taskDate}
            onChange={(value) => {
              setTaskDate(value);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    tasks: state.timecards.tasks,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      updateTimecard: bindActionCreators(tcActions.updateTimecard, dispatch),
      getTasks: bindActionCreators(tcActions.getTasks, dispatch),
    },
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ToDoTask);
