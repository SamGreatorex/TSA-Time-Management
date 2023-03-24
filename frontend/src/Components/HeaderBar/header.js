
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
     <Menu.SubMenu title="Reports">
     <Menu.Item key="4"><Link to={'/reports-daily'} className="nav-link"> Daily Reports</Link></Menu.Item>
     <Menu.Item key="5"><Link to={'/reports-weekly'} className="nav-link"> Weekly Reports</Link></Menu.Item>
     <Menu.Item key="6"><Link to={'/reports-monthly'} className="nav-link"> Monthly Reports</Link></Menu.Item>
     <Menu.Item key="7"><Link to={'/tmr-data'} className="nav-link"> TMR Data</Link></Menu.Item>
      </Menu.SubMenu>

     </Menu>

    </Header>

  );
}




export default HeaderBar
