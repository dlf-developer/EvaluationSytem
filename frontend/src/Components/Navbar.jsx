import React, { useState } from 'react';
import { getUserId, switchActiveRole } from '../Utils/auth';
import { useSelector } from 'react-redux';
import { Drawer, Dropdown, Menu, message } from 'antd';
import { BellFilled, MenuOutlined, SwapOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { BsHammer } from 'react-icons/bs';
import { Tag } from '@chakra-ui/react';
import Sidebar from './Sidebar';

function Navbar() {
  const user = getUserId();
  const role = user?.access;
  const isDualRole = user?.isDualRole;
  const userNotification = useSelector((state) => state.user.Notification);

  // Transform notifications into menu items
  const menuItems = (userNotification || []).map((item, index) => ({
    key: index.toString(),
    route: item.route,
    label: item.title,
  }));
  const navigate = useNavigate();
  const onClick = ({key}) => {
    const clickedNotification = userNotification[key];
    navigate(clickedNotification.route);
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
    <div style={{ width: "100%" }}>
      <div className="d-flex justify-content-between align-items-center gap-3 px-3">
        <div className='d-lg-none py-0 px-4' onClick={()=>showDrawer()}><MenuOutlined /></div>
        <div className="d-flex align-items-center gap-2">
          <p className="fs-5 mb-0 d-md-flex align-items-center gap-2 d-none">
            <span>👋 Hi, <span className="fw-bold">{user?.name}</span></span>
            {isDualRole ? (
              <Tag colorScheme="teal" variant="solid" fontWeight="bold" size="sm">
                OT ({role} Mode)
              </Tag>
            ) : (
              <Tag colorScheme={role === 'Teacher' ? 'green' : role === 'Observer' ? 'blue' : 'purple'} variant="subtle" size="sm">
                {role === 'Superadmin' ? 'Admin' : role}
              </Tag>
            )}
          </p>
        </div>

        <div className="d-flex align-items-center gap-3">
          {isDualRole && (
            <button
              onClick={() => switchActiveRole(role === 'Observer' ? 'Teacher' : 'Observer')}
              className="btn btn-sm text-white d-flex align-items-center gap-2 px-3 py-1 fw-bold shadow-sm"
              style={{
                borderRadius: "20px",
                fontSize: "12px",
                background: role === 'Observer' ? "rgba(40, 167, 69, 0.9)" : "rgba(13, 110, 253, 0.9)",
                border: "1px solid rgba(255,255,255,0.4)",
                transition: "all 0.2s ease"
              }}
              title={
                role === 'Observer'
                  ? "Switch to Teacher Mode to fill your reflections and view your evaluations"
                  : "Switch to Observer Mode to observe and evaluate teachers"
              }
            >
              <SwapOutlined />
              {role === 'Observer' ? 'Switch to Teacher View' : 'Switch to Observer View'}
            </button>
          )}

          <Dropdown overlay={menu} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()} className='position-relative d-block'>
              <BellFilled style={{ fontSize: '20px', cursor: 'pointer', color: "#fff", fontWeight: "500" }} />
              {menu?.props?.items && (
                <span className='bg-danger px-2 rounded-5 text-white position-absolute' style={{
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
                </span>
              )}
            </a>
          </Dropdown>
        </div>
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
