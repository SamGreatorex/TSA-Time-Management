import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import Tasks from "./Components/Tasks/Tasks";
import TimeCards from "./Components/Timecards/Timecards";
import HeaderBar from "./Components/HeaderBar/header";
import "antd/dist/reset.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import DailyReport from "./Components/Reports/dailyReport";
import WeeklyReport from "./Components/Reports/weeklyReport";
import MonthlyReport from "./Components/Reports/monthlyReport";
import TmrData from "./Components/Reports/TmrData";
import ToDo from "./Components/ToDo/Todo";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <HeaderBar />
        <div>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/timecards" element={<TimeCards />} />
            <Route path="/reports-daily" element={<DailyReport />} />
            <Route path="/reports-weekly" element={<WeeklyReport />} />
            <Route path="/reports-monthly" element={<MonthlyReport />} />
            <Route path="/todo" element={<ToDo />} />
            <Route path="/tmr-data" element={<TmrData />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
