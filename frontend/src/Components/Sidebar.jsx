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
  CalendarDays,
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
  Select,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import { useSessionPicker, SESSIONS } from "../hooks/useSessionPicker";

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

function Sidebar({ collapsed, onCloseDrawer }) {
  const location = useLocation();
  const PATHROUTE = location.pathname;
  const userData = getUserId();
  const Role = userData?.access || "default";
  const userName = userData?.name || "User";

  const menuItems = useMemo(() => Menu[Role] || [], [Role]);
  const { session, changeSession, loading } = useSessionPicker();

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace("/");
  };

  return (
    <Flex
      direction="column"
      h="100vh"
      py={8}
      px={collapsed ? 2 : 5}
      bg="white"
      borderRight="1px"
      borderColor="gray.100"
      justify="space-between"
      transition="all 0.3s ease"
      overflowY="auto"
      overflowX="hidden"
    >
      <Box>
        {/* ── Logo ────────────────────────────────────────────── */}
        <Flex
          mb={6}
          align="center"
          justify={collapsed ? "center" : "flex-start"}
          px={collapsed ? 0 : 2}
          gap={3}
        >
          <Box
            flexShrink={0}
            p={2}
            bg="brand.primary"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Layers size={18} color="white" />
          </Box>
          {!collapsed && (
            <Heading
              size="md"
              color="gray.800"
              letterSpacing="tight"
              fontWeight="800"
              fontSize="lg"
              lineHeight="1"
            >
              SchoolPortal
            </Heading>
          )}
        </Flex>

        {/* ── Session Picker ───────────────────────────────────── */}
        {collapsed ? (
          // Compact badge when sidebar is collapsed
          <Tooltip label={`Session: ${session}`} placement="right" hasArrow>
            <Flex
              direction="column"
              align="center"
              mb={5}
              gap={1}
              cursor="default"
            >
              <Box
                p={1.5}
                borderRadius="lg"
                bg="brand.background"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <CalendarDays size={15} color="#4A6741" />
              </Box>
              <Text
                fontSize="9px"
                fontWeight="700"
                color="brand.primary"
                letterSpacing="-0.02em"
                lineHeight="1"
              >
                {session.slice(0, 4)}
              </Text>
            </Flex>
          </Tooltip>
        ) : (
          // Full session dropdown in expanded mode
          <Box
            mb={6}
            px={2}
            py={3}
            bg="brand.background"
            borderRadius="xl"
            border="1px solid"
            borderColor="brand.mid"
            opacity={0.95}
          >
            <Flex align="center" gap={2} mb={2} px={1}>
              <CalendarDays size={13} color="#4A6741" />
              <Text
                fontSize="10px"
                fontWeight="700"
                color="brand.primary"
                textTransform="uppercase"
                letterSpacing="1px"
              >
                Academic Session
              </Text>
              {loading && <Spinner size="xs" color="brand.primary" ml="auto" />}
            </Flex>
            <Select
              size="sm"
              value={session}
              onChange={(e) => changeSession(e.target.value)}
              borderRadius="lg"
              border="1px solid"
              borderColor="brand.mid"
              bg="white"
              color="brand.text"
              fontWeight="600"
              fontSize="13px"
              _focus={{
                borderColor: "brand.primary",
                boxShadow: "0 0 0 1px #4A6741",
              }}
              _hover={{ borderColor: "brand.primary" }}
              cursor="pointer"
              iconColor="brand.primary"
            >
              {SESSIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Box>
        )}

        {/* ── Navigation Items ────────────────────────────────── */}
        <VStack spacing={0.5} align="stretch">
          {menuItems.map((item, index) => {
            /* Section label */
            if (item.label) {
              return (
                !collapsed && (
                  <Text
                    key={`label-${index}`}
                    fontSize="10px"
                    fontWeight="700"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="1.5px"
                    mt={6}
                    mb={1}
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
              <Flex
                as={Link}
                to={item.route}
                onClick={onCloseDrawer}
                key={`link-${index}`}
                alignContent="center"                       /* single axis — guaranteed alignment */
                gap={3}
                justifyContent={'center'}
                py="10px"
                px={collapsed ? 0 : 3}
                borderRadius="xl"
                bg={isActive ? "brand.primary" : "transparent"}
                color={isActive ? "white" : "gray.500"}
                fontWeight={isActive ? "semibold" : "medium"}
                transition="all 0.18s ease"
                justify={collapsed ? "center" : "flex-start"}
                _hover={{
                  bg: isActive ? "brand.primary" : "gray.50",
                  color: isActive ? "white" : "brand.primary",
                  textDecoration: "none",
                }}
                textDecoration="none"
                role="group"
              >
                {/* Icon — fixed size, never stretches */}
                <Icon
                  as={LucideIcon}
                  boxSize="18px"           /* use boxSize, not fontSize */
                  flexShrink={0}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Label + active chevron */}
                {!collapsed && (
                  <>
                    <Text
                      flex="1"
                      fontSize="13.5px"
                      fontWeight="inherit"
                      color="inherit"
                      lineHeight="1"        /* remove extra line-height gap */
                      letterSpacing="-0.01em"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {item.name}
                    </Text>
                    {isActive && (
                      <ChevronRight
                        size={13}
                        style={{ opacity: 0.6, flexShrink: 0 }}
                      />
                    )}
                  </>
                )}
              </Flex>
            );
          })}
        </VStack>
      </Box>

      {/* ── User Actions ─────────────────────────────────────── */}
      <Box px={collapsed ? 0 : 1} pb={2}>
        <Divider mb={5} borderColor="gray.100" />

        {!collapsed ? (
          <VStack spacing={3} align="stretch">
            <Button
              leftIcon={<LogOut size={15} />}
              variant="ghost"
              w="100%"
              justifyContent="flex-start"
              colorScheme="red"
              color="gray.500"
              _hover={{ bg: "red.50", color: "red.600" }}
              onClick={handleLogout}
              borderRadius="xl"
              fontSize="13.5px"
              fontWeight="600"
              h="42px"
              px={3}
              gap={3}
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
              minW={0}
            >
              <LogOut size={18} />
            </Button>
          </VStack>
        )}
      </Box>
    </Flex>
  );
}

export default Sidebar;
