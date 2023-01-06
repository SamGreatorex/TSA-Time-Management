
import React from 'react';
import logo from '../../Assets/logo.svg';
import { Menu, Layout  } from 'antd';
import "./header.css";
import { Link } from 'react-router-dom';
const { Header} = Layout;


function HeaderBar() {


  return (
    <Header>
      <div className="logo">
     <img src={logo} alt="Zoom Logo" />
     </div>

     <Menu
       theme="dark"
       mode="horizontal"
       defaultSelectedKeys={['1']}
       >
     <Menu.Item key="1"><Link to={'/'} className="nav-link"> Home </Link></Menu.Item>
     <Menu.Item key="2"><Link to={'/tasks'} className="nav-link"> Tasks</Link></Menu.Item>
     <Menu.Item key="3"><Link to={'/timecards'} className="nav-link"> Time Cards</Link></Menu.Item>
     </Menu>

    </Header>

  );
}




export default HeaderBar
