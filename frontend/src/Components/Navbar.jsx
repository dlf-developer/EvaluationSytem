import React, { useState } from 'react';
import { getUserId } from '../Utils/auth';
import { useSelector } from 'react-redux';
import { Drawer, Dropdown, Menu, message } from 'antd';
import { BellFilled, MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { BsHammer } from 'react-icons/bs';
import Sidebar from './Sidebar';

function Navbar() {
  const role = getUserId().access;
  const userNotification = useSelector((state) => state.user.Notification);

  // Transform notifications into menu items
  const menuItems = (userNotification || []).map((item, index) => ({
    key: index.toString(),
    route: item.route,
    label: item.title,
  }));
const navigate = useNavigate()
  const onClick = ({key}) => {
    const clickedNotification = userNotification[key];
    navigate(clickedNotification.route)
  };

  const menu = <Menu items={menuItems} onClick={onClick} />;

  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
 

  return (
    <div>
      <div className="d-flex  justify-content-between align-items-center gap-3 px-3">
        <div className='d-lg-none py-0 px-4' onClick={()=>showDrawer()}><MenuOutlined /></div>
        <p className="fs-5  mb-0 d-md-block d-none">
          👋Hi, <span className="fw-bold">{getUserId()?.name}</span> you are an
          {role === 'Superadmin' && ' Admin'}
          {role === 'Observer' && ' Observer'}
          {role === 'Teacher' && ' Teacher'}
        </p>

        <Dropdown overlay={menu} trigger={['click']}>
          <a onClick={(e) => e.preventDefault()}  className='position-relative d-block'>
            <BellFilled style={{ fontSize: '20px', cursor: 'pointer',color:"#fff", fontWeight:"500" }} />
            {menu?.props?.items && 
            <span className='bg-danger px-2 rounded-5 text-white position-absolute' style={{width:"fit-content", height:"40px",
              width: "fit-content",
              height: 20,
              textAlign: 'center',
              top: 12,
              left: 9,
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"

         }}>
          {menu?.props?.items?.length}
           </span>}
          </a>
        </Dropdown>
      </div>

      <Drawer
        placement={'left'}
        closable={true}
        onClose={onClose}
        open={open}
        key={'left'}
        size='default'
      >
        <Sidebar onCloseDrawer={onClose} />
      </Drawer>
    </div>
  );
}

export default Navbar;
