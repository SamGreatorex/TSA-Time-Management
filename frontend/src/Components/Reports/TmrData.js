import React, { useEffect, useState } from "react";
import { Select, Row, Col, Table, Space } from "antd";
import * as tcActions from "../../redux/actions/timecards";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";

const { Option } = Select;

function TmrData({ timecards, actions }) {
  const [tmrData, setTMRData] = useState(null);
  const [tmrTasks, setTMRTasks] = useState([]);
  const [selectedTmrType, setSelectedTmrType] = useState(null);
  const [displayData, setDisplayData] = useState([]);
  useEffect(() => {
    if (timecards.length === 0) actions.getUserTimecards("samg");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("timecards updated", timecards);
    loadData(timecards);
  }, [timecards]);

  useEffect(() => {
    console.log("TMR Data", tmrData);
  }, [tmrData]);

  const dataColumns = [
    {
      title: "StartTime",
      dataIndex: "StartTime",
      align: "center",
      render: (record) => {
        return (
          <Space direction="vertical">
            {moment(record).format("dddd Do MMM hh:mm")}
          </Space>
        );
      },
      sorter: (a, b) => moment(a.StartTime) - moment(b.StartTime),
    },
    {
      title: "Task",
      align: "center",
      render: (record) => {
        let task = tmrTasks.find((x) => x.TaskId === record.TaskTypeId);
        return <Space direction="vertical">{task.Name}</Space>;
      },
    },
    {
      title: "Note",
      dataIndex: "note",
      align: "center",
      sorter: (a, b) => a.note - b.note,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      align: "center",
    },
  ];

  const loadData = async (timecards) => {
    //Get all tasks into an array
    let allTasks = timecards.map((x) => x.Tasks).flat();
    console.log("All Tasks", allTasks);
    //Get all TMR Tasks
    let tmrAvailableTasks = timecards
      .map((x) => x.AvailableTasks)
      .flat()
      .filter((x) => x.Type === "TMR");
    const filteredAvailableTasks = tmrAvailableTasks.reduce((acc, current) => {
      const x = acc.find((item) => item.TaskId === current.TaskId);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    setTMRTasks(filteredAvailableTasks);
    let tmrTasksTypeIds = filteredAvailableTasks.map((x) => x.TaskId);

    //Filter all tasks to get the ones for a TMR
    let tmrTasks = allTasks
      .map((task) => {
        let taskId = task.TaskTypeId;
        if (tmrTasksTypeIds.includes(taskId)) return task;

        return null;
      })
      .filter(function (element) {
        return element !== null;
      });

    let TMRData = [];

    for (var i = 0; i < tmrTasks.length; i++) {
      let taskData = { ...tmrTasks[i] };
      delete taskData.Notes;

      let notesdata = tmrTasks[i].Notes.map((note) => {
        return { ...note, ...taskData };
      });
      TMRData.push(...notesdata);
    }

    setTMRData(TMRData);
    setDisplayData(TMRData);
  };

  const OnTMRTypeChanged = async (type) => {
    setSelectedTmrType(type);
    setDisplayData([]);
    console.log("Changing type", type, tmrData);
    let newData = [...tmrData];
    console.log("New Data", newData);
    let data = newData.filter((x) => x.TaskTypeId === type);
    console.log("Data for type", data);
    setDisplayData(data);
  };

  return (
    <div>
      <Row>
        <Col>
          <Select
            style={{ width: "200px" }}
            onChange={(type) => OnTMRTypeChanged(type)}
          >
            {tmrTasks.map((task) => (
              <Option key={task.TaskId}>{task.Name}</Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row>
        <Table
          style={{ whiteSpace: "pre", marginTop: "4px", alignSelf: "center" }}
          bordered
          dataSource={displayData?.sort(
            (a, b) => moment(b.StartTime) - moment(a.StartTime)
          )}
          rowKey={(record) => `${record.noteId}`}
          columns={dataColumns}
        />
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
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TmrData);
