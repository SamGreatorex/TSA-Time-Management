import React, { useState } from "react";
import {
  Form,
  Popconfirm,
  Table,
  Typography,
  Input,
  DatePicker,
  Select,
  Tag,
} from "antd";
import moment from "moment";
const { TextArea } = Input;

function Todo() {
  const originData = [];
  for (let i = 0; i < 10; i++) {
    originData.push({
      id: i.toString(),
      task: `Edward ${i}`,
      status: "New",
      progress: `London Park no. ${i}`,
      reviewDate: moment(),
    });
  }

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
    if (dataIndex === "reviewDate")
      inputNode = <DatePicker formate="DD-MM-YYYY" />;
    if (dataIndex === "progress") inputNode = <TextArea />;
    if (dataIndex === "status")
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
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
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
  const [data, setData] = useState(originData);
  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.id === editingKey;
  const edit = (record) => {
    console.log("Editing", record);
    form.setFieldsValue({
      task: "",
      status: "",
      progress: "",
      reviewDate: "",
      ...record,
    });
    setEditingKey(record.id);
  };
  const cancel = () => {
    setEditingKey("");
  };
  const save = async (key) => {
    try {
      let row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.id);

      //Refort the date to use moment
      const date = row.reviewDate.toString();
      row.reviewDate = moment(date);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };
  const columns = [
    {
      title: "Task",
      dataIndex: "task",
      width: "25%",
      editable: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: "10%",
      editable: true,
      render: (record) => {
        let tagColor = "blue";
        if (record === "In Progress") tagColor = "Orange";
        if (record === "Waiting") tagColor = "Red";
        if (record === "Completed") tagColor = "Green";
        return (
          <Tag color={tagColor} key={record.id}>
            {record}
          </Tag>
        );
      },
    },
    {
      title: "Progress",
      dataIndex: "progress",
      width: "40%",
      editable: true,
    },
    {
      title: "Review",
      dataIndex: "reviewDate",
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
              onClick={() => save(record.id)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
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

  return (
    <Form form={form} component={false}>
      <Table
        style={{ whiteSpace: "pre" }}
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
}

export default Todo;
