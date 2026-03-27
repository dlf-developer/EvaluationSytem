import React, { memo, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getUserId } from "./auth";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { useDispatch } from "react-redux";
import { getUserNotification } from "../redux/userSlice";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";

const DashboardLayout = () => {
  const role = getUserId()?.access;
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    dispatch(getUserNotification());
  }, [dispatch]);

  const handleCollapse = (isCollapsed) => {
    setCollapsed(isCollapsed);
  };

  return role === "Superadmin" ? (
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
  ) : (
    <Navigate to="/login" />
  );
};

export default memo(DashboardLayout);
