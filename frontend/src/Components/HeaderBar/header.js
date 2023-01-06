
import React, {mapStateToProps} from 'react';
import logo from '../../Assets/logo.svg';
import { Menu, Layout } from 'antd';
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
     <Menu.Item key="2"><Link to={'/about'} className="nav-link">About</Link></Menu.Item>
     </Menu>
    </Header>
  //   <Header>
  //   <div className="logo">
  //   <img src={logo} alt="Zoom Logo" />
  //   </div>
  //   {navigation && 
  //   <Menu
  //     theme="dark"
  //     mode="horizontal"
  //     defaultSelectedKeys={['1']}
  //     >
  //     {navigation.map((nav) => (
  //         <Menu.Item key={nav.key} disabled={activeKey === nav.key}>
  //         <a
  //           href={nav.url}
  //           onClick={(e) => {
  //             e.preventDefault();
  //             navigate(nav.url);
  //           }}
  //         >
  //           {nav.display}
  //         </a>
  //       </Menu.Item>
  //       ))}
  //     </Menu>
  // }
  // </Header>

    

  );
}




export default HeaderBar
