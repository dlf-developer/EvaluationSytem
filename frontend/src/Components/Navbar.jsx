import React, { useState, useRef, useEffect } from 'react';
import { getUserId, switchActiveRole } from '../Utils/auth';
import { useSelector, useDispatch } from 'react-redux';
import { Drawer } from './UI/Drawer';
import { BellFilled, MenuOutlined, SwapOutlined } from "./UI/Icons";
import { useNavigate } from 'react-router-dom';
import { Tag } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import { isCuteMalkinThemeActive } from '../Utils/cuteMalkinTheme';
import { axiosInstanceToken } from '../redux/instence';
import { getUserNotification } from '../redux/userSlice';

function Navbar() {
  const dispatch = useDispatch();
  const user = getUserId();
  const role = user?.access;
  const isDualRole = user?.isDualRole;
  const userNotification = useSelector((state) => state.user.Notification);
  const [isCute, setIsCute] = useState(() => isCuteMalkinThemeActive());

  useEffect(() => {
    const handleThemeChange = (e) => {
      setIsCute(Boolean(e.detail?.active));
    };
    window.addEventListener("cute-theme-changed", handleThemeChange);
    return () => {
      window.removeEventListener("cute-theme-changed", handleThemeChange);
    };
  }, []);

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifOpen]);

  const handleNotificationClick = async (item) => {
    setNotifOpen(false);
    if (item?._id && item?.status !== 'seen') {
      try {
        await axiosInstanceToken.put(`/notification/read/${item._id}`);
        dispatch(getUserNotification());
      } catch (e) {
        console.error("Failed to mark notification as read:", e);
      }
    }
    if (item?.route) {
      navigate(item.route);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstanceToken.put('/notification/mark-all-read');
      dispatch(getUserNotification());
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  };

  const handleClearAll = async () => {
    try {
      await axiosInstanceToken.delete('/notification/clear-all');
      dispatch(getUserNotification());
    } catch (e) {
      console.error("Failed to clear notifications:", e);
    }
  };

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const notificationList = userNotification || [];
  const unseenCount = notificationList.filter(n => n?.status !== 'seen').length;

  return (
    <div style={{ width: "100%" }}>
      <div className="d-flex justify-content-between align-items-center gap-3 px-3">
        <div className='d-lg-none py-0 px-4 cursor-pointer' onClick={() => showDrawer()}>
          <MenuOutlined size={22} className="text-white" />
        </div>
        <div className="d-flex align-items-center gap-2">
          <p className="fs-5 mb-0 d-md-flex align-items-center gap-2 d-none">
            <span>👋 Hi, <span className="fw-bold">{user?.name}</span></span>
            {isCute && (
              <Tag
                colorScheme="pink"
                variant="solid"
                fontWeight="bold"
                size="sm"
                borderRadius="full"
                boxShadow="0 2px 8px rgba(244,114,182,0.5)"
              >
                👑 Malkin 💖
              </Tag>
            )}
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
              <SwapOutlined size={14} />
              {role === 'Observer' ? 'Switch to Teacher View' : 'Switch to Observer View'}
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-1.5 rounded-full text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <BellFilled size={20} className="text-white" />
              {unseenCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-sm animate-pulse">
                  {unseenCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Notifications {unseenCount > 0 ? `(${unseenCount} new)` : ""}
                  </span>
                  {notificationList.length > 0 && (
                    <div className="flex items-center gap-2">
                      {unseenCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-brand-primary hover:underline font-medium text-green-700"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-[11px] text-gray-400 hover:text-red-500 transition-colors font-medium"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {notificationList.length > 0 ? (
                    notificationList.map((item, idx) => {
                      const isUnread = item?.status !== "seen";
                      return (
                        <button
                          key={item?._id || idx}
                          type="button"
                          onClick={() => handleNotificationClick(item)}
                          className={`w-full text-left px-4 py-2.5 transition-colors flex items-start gap-2.5 ${
                            isUnread ? "bg-green-50/40 hover:bg-green-50/70" : "hover:bg-gray-50"
                          }`}
                        >
                          {isUnread && (
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
                          )}
                          <div className="flex-1 flex flex-col gap-0.5">
                            <span className={`text-sm ${isUnread ? "font-semibold text-gray-900" : "font-normal text-gray-700"}`}>
                              {item.title}
                            </span>
                            {item.subtitle && (
                              <span className="text-xs text-gray-500">
                                {item.subtitle}
                              </span>
                            )}
                            {item.date && (
                              <span className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(item.date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-400 font-medium">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Drawer
        placement={'left'}
        closable={true}
        onClose={onClose}
        open={open}
      >
        <Sidebar onCloseDrawer={onClose} />
      </Drawer>
    </div>
  );
}

export default Navbar;
