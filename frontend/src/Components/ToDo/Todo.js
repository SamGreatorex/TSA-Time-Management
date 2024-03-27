import React, { useEffect, useState } from "react";
import * as todoApi from "../../apis/todo";
import { Tabs } from "antd";

import ToDoTask from "./Todo_Task";
import ToDoProject from "./Todo_Project";

function Todo() {
  const [todoData, setTodoData] = useState([]);
  const [taskType, setTaskType] = useState("Task");

  useEffect(() => {
    if (todoData.length === 0) LoadData();
  }, []);

  const LoadData = async () => {
    const data = await todoApi.listTodo();
    setTodoData(data);
  };

  const OnUpdateToDoData = async (record) => {
    console.log("Updating Data", record);
    //Update the record in the DB
    await todoApi.createTodo(record);

    //Update the newData
    const newData = [...todoData];
    const index = newData.findIndex((item) => item.Id === record.Id);
    let item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...record,
    });
    setTodoData(newData);
  };
  return (
    <div>
      <Tabs defaultActiveKey="task">
        <Tabs.TabPane tab="Tasks" key="task">
          <ToDoTask todoData={todoData} onUpdateData={OnUpdateToDoData} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Projects" key="projects">
          <ToDoProject todoData={todoData} onUpdateData={OnUpdateToDoData} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default Todo;
