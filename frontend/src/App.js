
import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Components/Home/Home';
import About from './Components/About/About';
import HeaderBar from './Components/HeaderBar/header';
import 'antd/dist/reset.css';


function App() {
  return (
    <Router>
            <HeaderBar/>
         <div>
          {/* <h2>Welcome to React Router Tutorial</h2> */}
          {/* <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <ul className="navbar-nav mr-auto">
            <li><Link to={'/'} className="nav-link"> Home </Link></li>
            <li><Link to={'/about'} className="nav-link">About</Link></li>
          </ul>
          </nav> */}
          <hr />
          <Routes>
              <Route exact path='/' element={<Home/>} />
              <Route path='/about' element={<About/>} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
