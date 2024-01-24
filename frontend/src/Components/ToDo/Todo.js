import React, { useState, useEffect } from "react";
import * as todoApi from "../../apis/todo";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as tcActions from "../../redux/actions/timecards";
import { Form, Popconfirm, Table, Typography, Input, DatePicker, Select, Tag, Button, Cascader, Modal, List, Space } from "antd";
import { v4 as uuid } from "uuid";
import moment, { min } from "moment";
import { AddTaskNote, GetCurrentTimecard, GetSpecificTimecard, GetTaskSelectOptions } from "../../utils/helpers";

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

function Todo({ actions, timecards, tasks }) {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [taskSaving, setTaskSaving] = useState("");
  const [taskSelectOptions, setTaskSelectOptions] = useState(GetTaskSelectOptions);
  const isEditing = (record) => record.Id === editingKey;
  const [minutes, setMinutes] = useState(null);
  const [taskDate, setTaskDate] = useState(moment());

  useEffect(() => {
    console.log("!!!tasks", tasks);
    if (!timecards || timecards.length === 0) actions.getUserTimecards("samg");
    if (!tasks || tasks.length === 0) actions.getTasks();
    if (data.length === 0) LoadData();
    getSelectOptions();
  }, []);

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

  const LoadData = async () => {
    const data = await todoApi.listTodo();
    if (data.length > 0) setData(data.filter((x) => x.Status !== "Completed").sort((a, b) => moment(a.ReviewDate) - moment(b.ReviewDate)));
  };

  const edit = (record) => {
    console.log("Editing", record);
    const updatedDate = moment(record.ReviewDate);
    console.log(updatedDate);
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
      console.log(updatedData);
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
      console.log("Task Date is ", taskDate.toISOString());

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
      console.log("Saving ROw", row);
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.Id);

      //Reformatt the date to use moment
      const date = row.ReviewDate.toString();
      row.ReviewDate = moment(date);

      //update the task
      console.log("Updating row", row.TaskId[0]);
      row.TaskId = Array.isArray(row.TaskId) ? row.TaskId[1] : row.TaskId;

      //remove the isNew Property if it exists
      if (row?.hasOwnProperty("isNew")) {
        delete row.isNew;
      }

      console.log("ROW!", row);
      if (index > -1) {
        let item = newData[index];

        //remove the isNew Property if it exists
        if (item.hasOwnProperty("isNew")) {
          delete item.isNew;
        }

        newData.splice(index, 1, {
          ...item,
          ...row,
        });

        await todoApi.createTodo(newData[index]);
        setData(newData.sort((a, b) => moment(a.ReviewDate) - moment(b.ReviewDate)));

        setEditingKey("");
      } else {
        newData.push(row);
        await todoApi.createTodo(row);
        setData(newData.sort((a, b) => moment(a.ReviewDate) - moment(b.ReviewDate)));

        setEditingKey("");
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
      render: (record) => {
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
      width: "6%",
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
          <Typography.Link disabled={editingKey !== ""} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
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
    console.log("Adding new row");
    let updatedData = [...data];
    updatedData.unshift({
      Id: uuid().toString(),
      Task: "",
      Status: "New",
      Progress: "",
      ReviewDate: moment(),
      isNew: true,
      TaskId: "",
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
              console.log("Date is", value.toISOString());
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
    timecards: state.timecards.usercards,
    tasks: state.timecards.tasks,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      getUserTimecards: bindActionCreators(tcActions.getUserTimecards, dispatch),
      updateTimecard: bindActionCreators(tcActions.updateTimecard, dispatch),
      getTasks: bindActionCreators(tcActions.getTasks, dispatch),
    },
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Todo);
