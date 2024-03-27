import React, { useEffect, useState } from "react";
import { Select, Row, Col, Space, Tooltip, Button, Table, Input, Modal, Form, Switch } from "antd";
import * as tcActions from "../../redux/actions/timecards";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { taskTypes } from "../../utils/globals";
import { v4 as uuid } from "uuid";

const { Option } = Select;

function Tasks({ actions, tasks }) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [form] = Form.useForm();

  const initialTask = { TaskId: uuid(), Default: false, Type: "", Name: "", IsVisible: true };
  useEffect(() => {
    if (tasks.length === 0) actions.getTasks();

    //initialize a new form
    form.setFieldsValue(initialTask);
  }, []);

  const taskColumns = [
    {
      key: "TaskId",
      dataIndex: "TaskId",
      hidden: true,
    },
    {
      title: "Type",
      key: "Type",
      dataIndex: "Type",
    },
    {
      title: "Name",
      key: "Name",
      dataIndex: "Name",
    },
    {
      title: "Default",
      key: "Default",
      render: (record) => {
        return <div>{JSON.stringify(record.Default)}</div>;
      },
    },
    {
      key: "actions",
      align: "center",
      render: (record) => {
        return (
          <Space direction="vrtical">
            {/* Only Show start button if no other task is in progress*/}
            <Tooltip title="Start Task">
              <Button onClick={() => OnDeleteTask(record)} type="primary">
                Delete
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ].filter((item) => !item.hidden);

  const OnDeleteTask = (task) => {
    actions.deleteTask(task);
  };

  const onCreateTask = async (task) => {
    await actions.updateTasks(task);
    form.resetFields();
    setIsTaskModalOpen(false);
  };

  return (
    <div>
      <Row>
        <h2>Tasks</h2>
      </Row>
      <Row>
        <Button type="primary" onClick={() => setIsTaskModalOpen(true)}>
          {" "}
          Create New Task{" "}
        </Button>
      </Row>
      <Row>
        <Table
          style={{ marginTop: "4px", width: "100%" }}
          size="small"
          dataSource={!tasks ? [] : tasks.filter((x) => x.IsVisible).sort((a, b) => (a.Type.toLowerCase() > b.Type.toLowerCase() ? 1 : -1))}
          rowKey={(record) => record.TaskId}
          columns={taskColumns}
          pagination={{
            total: tasks ? tasks.length : 0,
            pageSize: 15,
            hideOnSinglePage: true,
          }}
        />
      </Row>

      {/* Modal to create a new task */}

      <Modal title="Create Task" open={isTaskModalOpen} footer={null} onCancel={() => setIsTaskModalOpen(false)}>
        <Form name="createTask" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} form={form} onFinish={onCreateTask}>
          <Form.Item hidden="true" name="TaskId" />
          <Form.Item hidden="true" name="IsVisible" />
          <Form.Item label="Task Name" name="Name" rules={[{ required: true, message: "Please input a name" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Task Type" name="Type" rules={[{ required: true, message: "Please select a type!" }]}>
            <Select style={{ width: "300px" }}>
              {taskTypes?.map((t) => (
                <Option key={t.value}>{t.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Default Task" name="Default" rules={[{ required: true, message: "Please select a type!" }]}>
            <Switch />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
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
      getTasks: bindActionCreators(tcActions.getTasks, dispatch),
      updateTasks: bindActionCreators(tcActions.updateTasks, dispatch),
      deleteTask: bindActionCreators(tcActions.deleteTask, dispatch),
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Tasks);
