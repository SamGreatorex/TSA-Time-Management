import React, { useEffect, useState } from "react";
import {
  Select,
  Row,
  Col,
  Table,
  Typography,
  Space,
  Radio,
  Checkbox,
} from "antd";
import * as tcActions from "../../redux/actions/timecards";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import { convertMinToStringTime } from "../../utils/utils";
import { current } from "@reduxjs/toolkit";
import { taskTypes } from "../../utils/globals";

const { Option } = Select;
const { Text } = Typography;

function WeeklyReport({ actions, timecards, tasks }) {
  const [data, setData] = useState([]);
  const [dataFilter, setDataFilter] = useState([]);
  const [weeksTimecard, setWeeksTimecard] = useState([]);
  const [groupByFunction, setGroupByFunction] = useState("Task");
  const [currentDateFilter, setCurrentDateFilter] = useState(
    moment().startOf("isoWeek")
  );
  const [summaryData, setSummaryData] = useState({ Total: "", Remaining: "" });

  useEffect(() => {
    if (timecards.length === 0) {
      actions.getUserTimecards("samg");
      actions.getTasks();
    } else {
      resetData(currentDateFilter, groupByFunction);
    }
  }, []);

  useEffect(() => {
    if (timecards.length > 0) {
      resetData(currentDateFilter, groupByFunction);
    }
  }, [timecards]);

  const OnWeekChanged = async (date) => {
    setCurrentDateFilter(date);
    resetData(date, groupByFunction);
  };

  const onRadioChanged = async (value) => {
    setGroupByFunction(value.target.value);
    resetData(currentDateFilter, value.target.value);
  };

  const resetData = async (date, groupType) => {
    let currentTimecard = timecards.find(
      (x) => moment(x.StartDate).toString() === moment(date).toString()
    );
    setWeeksTimecard(currentTimecard);

    let allTasks = currentTimecard?.Tasks || [];

    //Group by Task
    if (groupType === "Task") {
      var result = [];
      allTasks.reduce(function (res, value) {
        if (!res[value.TaskTypeId]) {
          res[value.TaskTypeId] = {
            TaskId: value.TaskId,
            TaskTypeId: value.TaskTypeId,
            totalDuration: 0,
            Notes: [],
            addedVivun: value.addedVivun ?? false,
            StartTime: currentTimecard.StartDate,
          };
          result.push(res[value.TaskTypeId]);
        }
        res[value.TaskTypeId].totalDuration += value.totalDuration;
        if (Array.isArray(value.Notes)) {
          res[value.TaskTypeId].Notes.push(...value.Notes);
        } else {
          res[value.TaskTypeId].Notes.push({
            StartTime: value.StartTime,
            duration: value.totalDuration,
            note: value.Notes,
          });
        }
        return res;
      }, {});
      allTasks = result;
    }

    if (groupType === "TaskType") {
      var result = [];
      allTasks.reduce(function (res, value) {
        let task = tasks.find((x) => x.TaskId === value.TaskTypeId);

        if (!res[task.Type]) {
          res[task.Type] = {
            TaskId: task.TaskId,
            TaskTypeId: task.TaskTypeId,
            TaskType: task.Type,
            totalDuration: 0,
            Notes: [],
            StartTime: currentTimecard.StartDate,
          };
          result.push(res[task.Type]);
        }
        res[task.Type].totalDuration += value.totalDuration;

        //res[task.Type].Notes += `${moment(value.StartTime).format('dddd Do')}: ${value.Notes} (${task.Name})\n`;
        if (Array.isArray(value.Notes)) {
          res[task.Type].Notes.push(...value.Notes);
        } else {
          res[task.Type].Notes.push({
            TaskId: task.TaskId,
            TaskTypeId: task.TaskTypeId,
            StartTime: value.StartTime,
            duration: value.totalDuration,
            note: value.Notes,
          });
        }
        return res;
      }, {});
      allTasks = result;
    }

    //Set weekdates filter
    let weekDates = timecards
      .map((x) => x.StartDate)
      .sort((a, b) => moment(b) - moment(a));
    let minutes =
      data.length > 0
        ? data.map((x) => x.totalDuration)?.reduce((sum, val) => sum + val)
        : 0;
    let total = await convertMinToStringTime(minutes);
    let remainingData = await convertMinToStringTime(40 * 5 - minutes);
    let summaryData = { Total: total, Remaining: remainingData };

    //Set the UI
    setDataFilter([...weekDates]);
    console.log(
      "Resetting Data",
      allTasks.sort(
        (a, b) => moment(b.Notes[0].StartTime) - moment(a.Notes[0].StartTime)
      )
    );
    setData(allTasks);
  };

  const dataColumns = [
    {
      title: "Date",
      align: "center",
      render: (record) => {
        return (
          <Space direction="vertical">
            {moment(record.StartTime).format("dddd Do")}
          </Space>
        );
      },
    },
    {
      title: "Task Name",
      key: "taskName",
      align: "center",
      render: (record) => {
        return (
          <Space direction="vertical">
            {tasks?.find((x) => x.TaskId === record.TaskTypeId)?.Name ?? ""}
          </Space>
        );
      },
    },
    {
      title: "Task Type",
      key: "TaskType",
      align: "center",
      render: (record) => {
        return (
          <Space direction="vertical">
            {record.TaskType
              ? record.TaskType
              : tasks?.find((x) => x.TaskId === record.TaskTypeId)?.Type ?? ""}
          </Space>
        );
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
      title: "Added To Vivun",
      key: "addedVivun",
      render: (record) => {
        const taskType =
          tasks?.find((x) => x.TaskId === record.TaskTypeId)?.Type ?? "";
        const isVivun =
          taskTypes.find((x) => x.value === taskType)?.vivunItem || false;
        return (
          isVivun && (
            <Checkbox
              onChange={(cb) => onVivunCheckboxChanged(cb, record)}
              checked={record.addedVivun}
            />
          )
        );
      },
    },
    {
      title: "Notes",
      key: "Notes",
      render: (record) => {
        return (
          <Space direction="vertical">
            {Array.isArray(record.Notes) ? (
              record.Notes.map((note) => {
                let display = `${moment(note.StartTime).format(
                  "ddd Do HH:mm"
                )} - ${note.duration}min - ${note.note}`;
                return <div>{display}</div>;
              })
            ) : (
              <div>
                {moment(record.StartTime).format("ddd Do HH:mm")} -{" "}
                {record.totalDuration}min - {record.Notes}
              </div>
            )}
          </Space>
        );
      },
    },
  ];

  const onVivunCheckboxChanged = async (e, record) => {
    console.log(`target = ${JSON.stringify(record.TaskId)}`);
    console.log(`checked = ${e.target.checked}`, weeksTimecard);

    let tasks = weeksTimecard.Tasks.filter(
      (x) => x.TaskTypeId === record.TaskTypeId
    );
    let updatedTasks = [
      ...weeksTimecard.Tasks.filter((x) => x.TaskTypeId !== record.TaskTypeId),
    ];
    updatedTasks = [...updatedTasks];

    for (let i = 0; i < tasks.length; i++) {
      let amendedTask = { ...tasks[i] };
      amendedTask.addedVivun = e.target.checked;
      console.log("UpdatedTask", amendedTask);
      updatedTasks.push({ ...amendedTask });
    }
    console.log("Tasks Changing", tasks);

    let updatedTimeCard = { ...weeksTimecard };
    updatedTimeCard.Tasks = updatedTasks;
    setWeeksTimecard(updatedTimeCard);
    await actions.updateTimecard(updatedTimeCard);
  };

  return (
    <div>
      <Row>
        <Col>
          <Select
            disabled={timecards?.length === 0}
            style={{ width: "200px" }}
            onChange={OnWeekChanged}
            defaultValue={() => currentDateFilter.toString()}
          >
            {dataFilter.map((data) => (
              <Option key={data}>{moment(data).format("Do MMM YY")}</Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Radio.Group onChange={onRadioChanged} value={groupByFunction}>
            <Radio value={"All"}>All</Radio>
            <Radio value={"Task"}>Group By Task</Radio>
            <Radio value={"TaskType"}>Group By Task Type</Radio>
          </Radio.Group>
        </Col>
      </Row>
      <Row>
        <Table
          style={{ whiteSpace: "pre", marginTop: "4px", alignSelf: "center" }}
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
            let minutes =
              pageData.length > 0
                ? pageData
                    .map((x) => x.totalDuration)
                    ?.reduce((sum, val) => sum + val)
                : 0;
            let hrs = Math.floor(minutes / 60);
            let min = minutes - hrs * 60;
            let display = `${hrs}hrs ${min}min`;

            let rem_minutes = 2400 - minutes;
            let rem_hrs = Math.floor(rem_minutes / 60);
            let rem_min = rem_minutes - rem_hrs * 60;
            let rem_display = `${rem_hrs}hrs ${rem_min}min`;
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell>Total Duration</Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2}>
                    <Text type="danger">{display}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>Hours Left</Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2}>
                    <Text type="danger">{rem_display}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </Row>
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
      getUserTimecards: bindActionCreators(
        tcActions.getUserTimecards,
        dispatch
      ),
      getTasks: bindActionCreators(tcActions.getTasks, dispatch),
      updateTimecard: bindActionCreators(tcActions.updateTimecard, dispatch),
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(WeeklyReport);
