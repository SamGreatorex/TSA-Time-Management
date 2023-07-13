import React, { useEffect, useState } from "react";
import { Select, Row, Col, Table, List, Cascader } from "antd";
import * as tcActions from "../../redux/actions/timecards";
import * as todoApi from "../../apis/todo";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import { GetTaskSelectOptions } from "../../utils/helpers";
import TextArea from "antd/es/input/TextArea";

function WorkSummary({ timecards, actions, tasks }) {
  const [taskSelectOptions, setTaskSelectOptions] = useState([]);
  const [toDoItems, setToDoItems] = useState(null);

  useEffect(() => {
    if (timecards?.length === 0) actions.getUserTimecards("samg");
    if (tasks?.length === 0) actions.getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    configureTaskSelectOptions();
  }, [tasks]);

  const configureTaskSelectOptions = async () => {
    let taskOption = await GetTaskSelectOptions();
    setTaskSelectOptions(taskOption);
  };

  const OnSelectTask = async (task) => {
    let taskId = task[1];
    const todoItems = await todoApi.getTodo(taskId);
    setToDoItems(todoItems);
  };

  const dataColumns = [
    {
      title: "Status",
      dataIndex: "Status",
      width: "10%",
    },
    {
      title: "Task",
      dataIndex: "Task",
      align: "center",
      width: "20%",
    },
    {
      title: "Review Date",
      align: "center",
      width: "20%",
      render: (record) => {
        return moment(record.ReviewDate).format("ddd DD MMM YY");
      },
    },
    {
      title: "Progress",
      dataIndex: "Progress",
      render: (record) => {
        const rows = record.split("\n") || [];
        return (
          <List>
            {rows.map((row, index) => {
              return (
                <List.Item style={{ padding: "0px" }} key={index}>
                  {row}
                </List.Item>
              );
            })}
          </List>
        );
      },
    },
  ];

  return (
    <div>
      <Row>
        <Col>
          <Cascader
            style={{ paddingLeft: "10px" }}
            options={taskSelectOptions || []}
            onChange={OnSelectTask}
            placeholder="Select Task"
          />
        </Col>
      </Row>
      <Row>
        {toDoItems && (
          <Table
            style={{ marginTop: "4px", alignSelf: "center" }}
            bordered
            dataSource={toDoItems.sort(
              (a, b) => moment(a.ReviewDate) - moment(b.ReviewDate)
            )}
            rowKey={(record) => `${record.taskId}`}
            columns={dataColumns}
          />
        )}
      </Row>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    timecards: state.timecards.usercards,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      getUserTimecards: bindActionCreators(
        tcActions.getUserTimecards,
        dispatch
      ),
      getTasks: bindActionCreators(tcActions.getTasks, dispatch),
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkSummary);
