import React, { useMemo } from "react";
import { Menu } from "./Data";
import { getUserId } from "../Utils/auth";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  User,
  Layers,
  ClipboardList,
  CheckSquare,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react";
import {
  Box,
  VStack,
  Text,
  Flex,
  Icon,
  Button,
  Heading,
  Divider,
  Avatar,
  HStack,
} from "@chakra-ui/react";

// Mapping of menu item names to Lucide icons for a consistent modern look
const iconMap = {
  Dashboard: LayoutDashboard,
  Reports: FileText,
  User: Users,
  Profile: User,
  "Class / Section": Layers,
  "Fortnightly Monitor": ClipboardList,
  "Classroom Walkthrough": CheckSquare,
  "Notebook Checking": BookOpen,
  "Learning Progress Checklist": TrendingUp,
  "Wing Coordinator": ShieldCheck,
};

function Sidebar({ collapsed }) {
  const location = useLocation();
  const PATHROUTE = location.pathname;
  const userData = getUserId();
  const Role = userData?.access || "default";
  const userName = userData?.name || "User";

  const menuItems = useMemo(() => Menu[Role] || [], [Role]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace("/");
  };

  return (
    <Flex
      direction="column"
      h="100vh"
      py={8}
      px={collapsed ? 2 : 6}
      bg="white"
      borderRight="1px"
      borderColor="gray.100"
      justify="space-between"
      transition="all 0.3s ease"
    >
      <Box>
        {/* Logo Section */}
        <Flex
          mb={10}
          px={collapsed ? 0 : 3}
          align="center"
          justify={collapsed ? "center" : "flex-start"}
        >
          <Box
            p={2}
            bg="brand.primary"
            borderRadius="lg"
            mr={collapsed ? 0 : 3}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Layers size={20} color="white" />
          </Box>
          {!collapsed && (
            <Heading
              size="md"
              color="gray.800"
              letterSpacing="tight"
              fontWeight="800"
              fontSize="lg"
            >
              SchoolPortal
            </Heading>
          )}
        </Flex>

        {/* Navigation Items */}
        <VStack spacing={1} align="stretch">
          {menuItems.map((item, index) => {
            if (item.label) {
              return (
                !collapsed && (
                  <Text
                    key={`label-${index}`}
                    fontSize="11px"
                    fontWeight="bold"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="1.5px"
                    mt={6}
                    mb={2}
                    px={3}
                  >
                    {item.label}
                  </Text>
                )
              );
            }

            const isActive = PATHROUTE === item.route;
            const LucideIcon = iconMap[item.name] || FileText;

            return (
              <Box
                as={Link}
                to={item.route}
                key={`link-${index}`}
                py={2.5}
                px={collapsed ? 0 : 4}
                borderRadius="xl"
                bg={isActive ? "brand.primary" : "transparent"}
                color={isActive ? "white" : "gray.500"}
                fontWeight={isActive ? "semibold" : "medium"}
                transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
                _hover={{
                  bg: isActive ? "brand.primary" : "gray.50",
                  color: isActive ? "white" : "brand.primary",
                }}
                display="flex"
                alignItems="center"
                justifyContent={collapsed ? "center" : "flex-start"}
              >
                <Icon
                  as={LucideIcon}
                  fontSize={20}
                  mr={collapsed ? 0 : 4}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {!collapsed && (
                  <Flex flex={1} justify="space-between" align="center">
                    <Text fontSize="14px" letterSpacing="-0.01em">
                      {item.name}
                    </Text>
                    {isActive && <ChevronRight size={14} opacity={0.5} />}
                  </Flex>
                )}
              </Box>
            );
          })}
        </VStack>
      </Box>

      {/* User Actions Section */}
      <Box px={collapsed ? 0 : 2} pb={2}>
        <Divider mb={6} borderColor="gray.100" />

        {!collapsed ? (
          <VStack spacing={4} align="stretch">
            {/* <Flex
              p={3}
              bg="gray.50"
              borderRadius="xl"
              align="center"
              transition="all 0.2s"
              _hover={{ bg: "gray.100" }}
              cursor="pointer"
              as={Link}
              to="/profile"
            >
              <Avatar
                size="sm"
                name={userName}
                bg="brand.primary"
                color="white"
                mr={3}
              />
              <Box overflow="hidden">
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.800"
                  isTruncated
                >
                  {userName}
                </Text>
                <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                  {Role}
                </Text>
              </Box>
            </Flex> */}

            <Button
              leftIcon={<LogOut size={16} />}
              variant="ghost"
              w="100%"
              justifyContent="flex-start"
              colorScheme="red"
              color="gray.500"
              _hover={{ bg: "red.50", color: "red.600" }}
              onClick={handleLogout}
              borderRadius="xl"
              fontSize="sm"
              fontWeight="semibold"
              h="45px"
            >
              Log out
            </Button>
          </VStack>
        ) : (
          <VStack spacing={4} align="center">
            <Avatar
              size="sm"
              name={userName}
              bg="brand.primary"
              cursor="pointer"
              onClick={() => (window.location.href = "/profile")}
            />
            <Button
              variant="ghost"
              size="sm"
              colorScheme="red"
              color="gray.500"
              onClick={handleLogout}
              p={0}
            >
              <LogOut size={20} />
            </Button>
          </VStack>
        )}
      </Box>
    </Flex>
  );
}

export default Sidebar;
