import React, { memo, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken, getUserId } from "./auth";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { useDispatch } from "react-redux";
import { getUserNotification } from "../redux/userSlice";
import { Box, Flex } from "@chakra-ui/react";
import Unauthorized from "../Components/Unauthorized";

const DashboardLayout = () => {
  const token = getToken();
  const role = getUserId()?.access;
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (token && role === "Superadmin") {
      dispatch(getUserNotification());
    }
  }, [dispatch, token, role]);

  const handleCollapse = (isCollapsed) => {
    setCollapsed(isCollapsed);
  };

  // Not logged in → redirect to login
  if (!token) return <Navigate to="/login" replace />;
  // Logged in but wrong role → show Unauthorized
  if (role !== "Superadmin") return <Unauthorized />;

  return (
    <Flex minH="100vh" bg="brand.background" overflow="hidden">
      {/* Sidebar */}
      <Box
        w={{ base: "0", lg: collapsed ? "0" : "300px" }}
        display={{ base: collapsed ? "none" : "none", lg: "block" }}
        position="fixed"
        h="100vh"
        bg="white"
        boxShadow="sm"
        zIndex={999}
        transition="all 0.3s ease"
        overflow="hidden"
      >
        <Sidebar collapsed={collapsed} onCollapse={handleCollapse} />
      </Box>

      {/* Main Content Area */}
      <Flex
        direction="column"
        flex="1"
        ml={{ base: "0", lg: collapsed ? "0" : "300px" }}
        transition="all 0.3s ease"
        bg="brand.background"
        minWidth={0}
      >
        <Box
          as="header"
          bg="brand.primary"
          color="white"
          px={6}
          py={4}
          boxShadow="sm"
          zIndex={10}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Navbar />
        </Box>
        <Box as="main" flex="1" overflowY="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};

export default memo(DashboardLayout);
