
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home/Home';
import Tasks from './Components/Tasks/Tasks';
import TimeCards from './Components/Timecards/Timecards';
import HeaderBar from './Components/HeaderBar/header';
import 'antd/dist/reset.css';
import { Provider } from "react-redux";
import store from "./redux/store";

function App() {
  return (
    <Provider store={store}>
    <Router>
            <HeaderBar/>
         <div>
          <Routes>
              <Route exact path='/' element={<Home/>} />
              <Route path='/tasks' element={<Tasks/>} />
              <Route path='/timecards' element={<TimeCards/>} />
          </Routes>
        </div>
      </Router>
      </Provider>
  );
}

export default App;
