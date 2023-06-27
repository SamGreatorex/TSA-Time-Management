import React, { useState, useEffect } from "react";
import * as todoApi from "../../apis/todo";
import {
  Form,
  Popconfirm,
  Table,
  Typography,
  Input,
  DatePicker,
  Select,
  Tag,
  Button,
} from "antd";
import { v4 as uuid } from "uuid";
import moment from "moment";
const { TextArea } = Input;

function Todo() {
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

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    record,
    index,
    children,
    ...restProps
  }) => {
    let inputNode = <Input />;
    if (dataIndex === "ReviewDate")
      inputNode = <DatePicker format="DD-MM-YYYY" />;
    if (dataIndex === "Progress") inputNode = <TextArea />;
    if (dataIndex === "Status")
      inputNode = (
        <Select
          options={statusOptions}
          style={{
            width: 120,
          }}
        />
      );

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
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.Id === editingKey;

  useEffect(() => {
    if (data.length === 0) LoadData();

    if (data[0]?.hasOwnProperty("isNew")) edit(data[0]);
  }, [data]);

  const LoadData = async () => {
    const data = await todoApi.listTodo();
    if (data.length > 0)
      setData(data.sort((a, b) => moment(a.ReviewDate) - moment(b.ReviewDate)));
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
  const save = async (key) => {
    try {
      let row = await form.validateFields();
      console.log("Saving ROw", row);
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.Id);

      //Reformatt the date to use moment
      const date = row.ReviewDate.toString();
      row.ReviewDate = moment(date);

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

        newData.splice(index, 1, {
          ...item,
          ...row,
        });

        await todoApi.createTodo(newData[index]);
        setData(
          newData.sort((a, b) => moment(a.ReviewDate) - moment(b.ReviewDate))
        );

        setEditingKey("");
      } else {
        newData.push(row);
        await todoApi.createTodo(row);
        setData(
          newData.sort((a, b) => moment(a.ReviewDate) - moment(b.ReviewDate))
        );

        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "Task",
      dataIndex: "Task",
      width: "25%",
      editable: true,
    },
    {
      title: "Status",
      dataIndex: "Status",
      width: "10%",
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
      width: "40%",
      editable: true,
    },
    {
      title: "Review",
      dataIndex: "ReviewDate",
      width: "40%",
      editable: true,
      render: (record) => {
        return <div>{moment(record).format("dddd DD MMM")}</div>;
      },
    },
    {
      title: "operation",
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.Id)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => cancel(record)}
            >
              <a href="/">Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
          >
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
    });
    setData(updatedData);
  };

  return (
    <div>
      <Button onClick={OnAddNewRow}>Add New Record</Button>
      <Form form={form} component={false}>
        <Table
          style={{ whiteSpace: "pre" }}
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
    </div>
  );
}

export default Todo;
