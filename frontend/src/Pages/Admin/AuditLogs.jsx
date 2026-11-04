import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  SimpleGrid,
  Button as ChakraButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select as ChakraSelect,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import {
  Search,
  RotateCw,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  PlusCircle,
  FileEdit,
  Trash2,
  MessageSquare,
  ArrowRight,
  Info,
  Download,
  Bell,
  Eye,
  ArrowLeftRight,
  CheckCircle,
} from "lucide-react";
import { axiosInstanceToken } from "../../redux/instence";
import SmartTable from "../../Components/SmartTable";
import {
  ADMIN_SECRET_PIN,
  isAdminFeaturesUnlocked,
  setAdminFeaturesUnlocked,
} from "../../Utils/adminUnlock";
import { message } from "../../Components/UI";

export default function AuditLogs() {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => isAdminFeaturesUnlocked());
  const [pinInput, setPinInput] = useState("");

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    loginCount: 0,
    createCount: 0,
    updateCount: 0,
    deleteCount: 0,
    todayCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");

  // Inspect Changes Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeLog, setActiveLog] = useState(null);

  // Sync unlock state across tabs & components
  useEffect(() => {
    const handleUnlockChange = (e) => {
      setIsAdminUnlocked(Boolean(e.detail?.unlocked));
    };
    window.addEventListener("admin-features-unlock-changed", handleUnlockChange);
    return () => {
      window.removeEventListener("admin-features-unlock-changed", handleUnlockChange);
    };
  }, []);

  const handleUnlock = (val) => {
    const clean = (val !== undefined ? val : pinInput).trim();
    if (clean === ADMIN_SECRET_PIN) {
      setAdminFeaturesUnlocked(true);
      setIsAdminUnlocked(true);
      setPinInput("");
      message.success("Access granted! Audit Logs unlocked.");
    } else {
      message.error("Incorrect PIN. Access denied.");
    }
  };

  const handleLock = () => {
    setAdminFeaturesUnlocked(false);
    setIsAdminUnlocked(false);
    setPinInput("");
    message.info("Audit logs locked and hidden.");
  };

  // Fetch Logs
  const fetchLogs = useCallback(async () => {
    if (!isAdminUnlocked) return;
    setLoading(true);
    try {
      const params = {
        limit: 1000,
      };
      if (search.trim()) params.search = search.trim();
      if (actionFilter) params.action = actionFilter;
      if (moduleFilter) params.module = moduleFilter;

      const [logsRes, statsRes] = await Promise.all([
        axiosInstanceToken.get("/audit-logs", { params }),
        axiosInstanceToken.get("/audit-logs/stats").catch(() => ({ data: { data: {} } })),
      ]);

      if (logsRes.data?.data) {
        setLogs(logsRes.data.data);
      }
      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [isAdminUnlocked, search, actionFilter, moduleFilter]);

  useEffect(() => {
    if (isAdminUnlocked) {
      fetchLogs();
    }
  }, [isAdminUnlocked, fetchLogs]);

  // Open Changes modal
  const handleInspectChanges = (record) => {
    setActiveLog(record);
    onOpen();
  };

  // Format Date cleanly
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "—";
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return String(timestamp);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // SmartTable Columns
  const columns = useMemo(
    () => [
      {
        title: "Timestamp",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 170,
        render: (val) => (
          <Text fontSize="12px" fontWeight="600" color="gray.700" whiteSpace="nowrap">
            {formatDateTime(val)}
          </Text>
        ),
      },
      {
        title: "User / Actor",
        dataIndex: "userName",
        key: "userName",
        width: 220,
        render: (_, record) => {
          const role = record.userRole || "User";
          const roleColorScheme =
            role === "Superadmin"
              ? "purple"
              : role === "Observer"
              ? "blue"
              : role === "Teacher"
              ? "green"
              : "gray";

          return (
            <VStack align="start" spacing={0.5}>
              <HStack spacing={1.5}>
                <Text fontSize="13px" fontWeight="700" color="gray.800" noOfLines={1}>
                  {record.userName}
                </Text>
                <Badge colorScheme={roleColorScheme} fontSize="10px" px={1.5} py={0.2} rounded="md">
                  {role}
                </Badge>
              </HStack>
              <Text fontSize="11px" color="gray.500" noOfLines={1}>
                {record.userEmail}
              </Text>
            </VStack>
          );
        },
      },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        width: 130,
        render: (val) => {
          const action = String(val || "").toUpperCase();
          let bg = "gray.100";
          let color = "gray.700";
          let IconComponent = Info;

          if (action === "LOGIN") {
            bg = "#dcfce7";
            color = "#15803d";
            IconComponent = LogIn;
          } else if (action === "CREATE" || action === "BULK_CREATE") {
            bg = "#dbeafe";
            color = "#1d4ed8";
            IconComponent = PlusCircle;
          } else if (action === "UPDATE") {
            bg = "#fef3c7";
            color = "#b45309";
            IconComponent = FileEdit;
          } else if (action === "DELETE") {
            bg = "#fee2e2";
            color = "#b91c1c";
            IconComponent = Trash2;
          } else if (action === "DOWNLOAD" || action === "EXPORT") {
            bg = "#e0f2fe";
            color = "#0369a1";
            IconComponent = Download;
          } else if (action === "REMINDER") {
            bg = "#ffedd5";
            color = "#c2410c";
            IconComponent = Bell;
          } else if (action === "VIEW") {
            bg = "#f3e8ff";
            color = "#7e22ce";
            IconComponent = Eye;
          } else if (action === "ROLE_SWITCH") {
            bg = "#ede9fe";
            color = "#6d28d9";
            IconComponent = ArrowLeftRight;
          } else if (action === "STATUS_CHANGE") {
            bg = "#f0fdf4";
            color = "#15803d";
            IconComponent = CheckCircle;
          } else if (action === "COMMENT") {
            bg = "#ccfbf1";
            color = "#0f766e";
            IconComponent = MessageSquare;
          }

          return (
            <HStack
              bg={bg}
              color={color}
              px={2.5}
              py={1}
              rounded="full"
              spacing={1.5}
              display="inline-flex"
            >
              <IconComponent size={12} />
              <Text fontSize="11px" fontWeight="700" letterSpacing="wider">
                {action}
              </Text>
            </HStack>
          );
        },
      },
      {
        title: "Module / Task",
        dataIndex: "module",
        key: "module",
        width: 180,
        render: (val) => (
          <Badge
            variant="outline"
            colorScheme="teal"
            fontSize="11px"
            fontWeight="600"
            px={2}
            py={0.5}
            rounded="md"
          >
            {val || "General"}
          </Badge>
        ),
      },
      {
        title: "IP Address",
        dataIndex: "ipAddress",
        key: "ipAddress",
        width: 140,
        render: (val) => {
          const isLocal = val === "127.0.0.1" || val === "::1" || val?.includes("127.0.0.1");
          return (
            <Badge
              bg="gray.100"
              color="gray.700"
              fontSize="11px"
              fontFamily="mono"
              px={2}
              py={0.5}
              rounded="md"
              border="1px solid"
              borderColor="gray.200"
            >
              {isLocal ? "127.0.0.1 (Local)" : val || "Unknown"}
            </Badge>
          );
        },
      },
      {
        title: "Activity Details",
        dataIndex: "details",
        key: "details",
        render: (val, record) => (
          <VStack align="start" spacing={1} maxW="400px">
            <Text fontSize="12.5px" color="gray.800" fontWeight="500">
              {val || "No details recorded"}
            </Text>
            {record.targetId && (
              <Text fontSize="10px" color="gray.400" fontFamily="mono">
                ID: {record.targetId}
              </Text>
            )}
          </VStack>
        ),
      },
      {
        title: "Changes Captured",
        dataIndex: "changes",
        key: "changes",
        width: 160,
        render: (val, record) => {
          const hasChanges = Array.isArray(val) && val.length > 0;
          if (!hasChanges) {
            return (
              <Text fontSize="11px" color="gray.400" fontStyle="italic">
                No diff
              </Text>
            );
          }

          return (
            <ChakraButton
              size="xs"
              variant="outline"
              colorScheme="orange"
              rounded="md"
              leftIcon={<FileEdit size={12} />}
              onClick={() => handleInspectChanges(record)}
            >
              View {val.length} change{val.length === 1 ? "" : "s"}
            </ChakraButton>
          );
        },
      },
    ],
    []
  );

  // If locked, render administrative Security PIN prompt
  if (!isAdminUnlocked) {
    return (
      <Box p={8} maxW="560px" mx="auto" textAlign="center" mt={16}>
        <VStack spacing={5} bg="white" p={8} rounded="2xl" shadow="md" border="1px solid" borderColor="gray.200">
          <Box p={4} bg="green.50" rounded="full" color="brand.primary">
            <ShieldCheck size={48} color="#2D4027" />
          </Box>
          <Box>
            <Heading size="md" color="gray.800" mb={1}>
              Administrative Feature Locked
            </Heading>
            <Text fontSize="xs" color="gray.500" maxW="sm" mx="auto">
              System Audit Logs are restricted for administrative monitoring. Enter your 4-digit Security PIN to view audit logs and user activity.
            </Text>
          </Box>
          <Box w="full" maxW="280px" position="relative">
            <input
              type="password"
              placeholder="Enter PIN"
              value={pinInput}
              maxLength={6}
              onChange={(e) => {
                setPinInput(e.target.value);
                if (e.target.value.trim() === ADMIN_SECRET_PIN) {
                  handleUnlock(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUnlock(pinInput);
              }}
              style={{
                width: "100%",
                height: "42px",
                padding: "8px 65px 8px 14px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "14px",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => handleUnlock(pinInput)}
              style={{
                position: "absolute",
                right: "5px",
                top: "5px",
                bottom: "5px",
                padding: "0 14px",
                backgroundColor: "#2D4027",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4A6741")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2D4027")}
            >
              PIN
            </button>
          </Box>
          <Badge colorScheme="green" px={3} py={1} rounded="full" fontSize="10px">
            MONITORING STATUS: ACTIVE
          </Badge>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }} maxW="1600px" mx="auto">
      {/* ── Top Header & Badges ─────────────────────────────────────────────── */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        gap={3}
        mb={6}
      >
        <Box>
          <HStack spacing={2.5} align="center">
            <Heading size="lg" color="gray.800" fontWeight="800">
              System Audit Logs
            </Heading>
            <Tooltip
              label="Audit logs are strictly append-only. Nobody—including Superadmin—can edit or delete any log."
              hasArrow
            >
              <Badge
                bg="emerald.50"
                color="green.700"
                px={2.5}
                py={0.8}
                rounded="full"
                fontSize="11px"
                fontWeight="700"
                border="1px solid"
                borderColor="green.300"
                display="inline-flex"
                alignItems="center"
                gap={1}
              >
                <ShieldCheck size={13} />
                IMMUTABLE
              </Badge>
            </Tooltip>
          </HStack>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Real-time immutable activity trail recording form creation, updates, deletions, and user logins with IP addresses.
          </Text>
        </Box>

        <HStack spacing={2}>
          <ChakraButton
            size="sm"
            variant="outline"
            colorScheme="red"
            color="red.600"
            borderColor="red.200"
            rounded="xl"
            onClick={handleLock}
          >
            Lock
          </ChakraButton>
          <ChakraButton
            leftIcon={<RotateCw size={14} className={loading ? "animate-spin" : ""} />}
            size="sm"
            variant="outline"
            colorScheme="gray"
            onClick={fetchLogs}
            isLoading={loading}
          >
            Refresh
          </ChakraButton>
        </HStack>
      </Flex>

      {/* ── Metric Summary Cards ────────────────────────────────────────────── */}
      <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} spacing={3.5} mb={6}>
        <Box p={3.5} rounded="xl" bg="white" border="1px solid" borderColor="gray.200" shadow="2xs">
          <Text fontSize="11px" fontWeight="600" color="gray.500" textTransform="uppercase">
            Total Logged Events
          </Text>
          <Text fontSize="22px" fontWeight="800" color="gray.900" mt={1}>
            {stats.totalCount || logs.length}
          </Text>
        </Box>

        <Box p={3.5} rounded="xl" bg="white" border="1px solid" borderColor="green.200" shadow="2xs">
          <Text fontSize="11px" fontWeight="600" color="green.700" textTransform="uppercase">
            User Logins (with IP)
          </Text>
          <Text fontSize="22px" fontWeight="800" color="green.700" mt={1}>
            {stats.loginCount || 0}
          </Text>
        </Box>

        <Box p={3.5} rounded="xl" bg="white" border="1px solid" borderColor="blue.200" shadow="2xs">
          <Text fontSize="11px" fontWeight="600" color="blue.700" textTransform="uppercase">
            Forms & Users Created
          </Text>
          <Text fontSize="22px" fontWeight="800" color="blue.700" mt={1}>
            {stats.createCount || 0}
          </Text>
        </Box>

        <Box p={3.5} rounded="xl" bg="white" border="1px solid" borderColor="amber.200" shadow="2xs">
          <Text fontSize="11px" fontWeight="600" color="amber.700" textTransform="uppercase">
            Forms Edited (with Diff)
          </Text>
          <Text fontSize="22px" fontWeight="800" color="amber.700" mt={1}>
            {stats.updateCount || 0}
          </Text>
        </Box>

        <Box p={3.5} rounded="xl" bg="white" border="1px solid" borderColor="cyan.200" shadow="2xs">
          <Text fontSize="11px" fontWeight="600" color="cyan.700" textTransform="uppercase">
            Downloads & Exports
          </Text>
          <Text fontSize="22px" fontWeight="800" color="cyan.700" mt={1}>
            {stats.downloadCount || 0}
          </Text>
        </Box>

        <Box p={3.5} rounded="xl" bg="white" border="1px solid" borderColor="orange.200" shadow="2xs">
          <Text fontSize="11px" fontWeight="600" color="orange.700" textTransform="uppercase">
            Reminders Sent
          </Text>
          <Text fontSize="22px" fontWeight="800" color="orange.700" mt={1}>
            {stats.reminderCount || 0}
          </Text>
        </Box>
      </SimpleGrid>

      {/* ── Filter Toolbar ─────────────────────────────────────────────────── */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        bg="white"
        p={3.5}
        rounded="xl"
        border="1px solid"
        borderColor="gray.200"
        shadow="2xs"
        mb={5}
        align="center"
      >
        <InputGroup maxW={{ base: "100%", md: "360px" }}>
          <InputLeftElement pointerEvents="none">
            <Search size={16} color="#9ca3af" />
          </InputLeftElement>
          <Input
            placeholder="Search by user, email, module, details, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fontSize="13px"
            rounded="lg"
          />
        </InputGroup>

        <ChakraSelect
          maxW={{ base: "100%", md: "200px" }}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          fontSize="13px"
          rounded="lg"
        >
          <option value="">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DOWNLOAD">DOWNLOAD / EXPORT</option>
          <option value="REMINDER">REMINDER</option>
          <option value="COMMENT">COMMENT</option>
          <option value="VIEW">VIEW</option>
          <option value="ROLE_SWITCH">ROLE SWITCH</option>
          <option value="DELETE">DELETE</option>
        </ChakraSelect>

        <ChakraSelect
          maxW={{ base: "100%", md: "240px" }}
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          fontSize="13px"
          rounded="lg"
        >
          <option value="">All Modules</option>
          <option value="Notebook Checking">Notebook Checking</option>
          <option value="Classroom Walkthrough">Classroom Walkthrough</option>
          <option value="Fortnightly Monitor">Fortnightly Monitor</option>
          <option value="Co-Scholastic">Co-Scholastic</option>
          <option value="Learning Progress">Learning Progress</option>
          <option value="Wing Coordinator Report">Wing Coordinator Report</option>
          <option value="Accountability Mechanism Report">Accountability Mechanism</option>
          <option value="User Management">User Management</option>
          <option value="Server System Logs">Server System Logs</option>
          <option value="Frontend Diagnostics">Frontend Diagnostics</option>
          <option value="Authentication">Authentication</option>
        </ChakraSelect>

        {(search || actionFilter || moduleFilter) && (
          <ChakraButton
            size="sm"
            variant="ghost"
            color="red.600"
            onClick={() => {
              setSearch("");
              setActionFilter("");
              setModuleFilter("");
            }}
          >
            Reset Filters
          </ChakraButton>
        )}
      </Flex>

      {/* ── SmartTable ────────────────────────────────────────────────────── */}
      <SmartTable
        title="Audit Logs"
        columns={columns}
        data={logs}
        loading={loading}
        rowKey="_id"
        pageSize={20}
        downloadFileName="system_audit_logs"
      />

      {/* ── Changes Diff Inspector Modal ───────────────────────────────────── */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <ModalContent rounded="2xl" overflow="hidden">
          <ModalHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.100" py={4}>
            <HStack spacing={2}>
              <FileEdit size={18} color="#d97706" />
              <Heading size="sm" color="gray.800">
                Changes Captured for {activeLog?.module || "Form"}
              </Heading>
            </HStack>
            <Text fontSize="12px" color="gray.500" fontWeight="normal" mt={1}>
              Edited by <b>{activeLog?.userName}</b> ({activeLog?.userRole}) on {formatDateTime(activeLog?.createdAt)}
            </Text>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={4} maxH="65vh" overflowY="auto">
            {activeLog?.changes && activeLog.changes.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {activeLog.changes.map((change, idx) => (
                  <Box
                    key={idx}
                    p={3.5}
                    rounded="xl"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Text fontSize="12px" fontWeight="700" color="gray.700" mb={2}>
                      Field: <span style={{ fontFamily: "monospace", color: "#4f46e5" }}>{change.field}</span>
                    </Text>

                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} align="center">
                      <Box p={2.5} rounded="lg" bg="red.50" border="1px solid" borderColor="red.200">
                        <Text fontSize="10px" fontWeight="700" color="red.700" textTransform="uppercase" mb={1}>
                          Previous Value
                        </Text>
                        <Text
                          fontSize="12px"
                          color="red.900"
                          fontFamily="mono"
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                        >
                          {change.oldValue === null || change.oldValue === undefined || change.oldValue === ""
                            ? "(empty)"
                            : typeof change.oldValue === "object"
                            ? JSON.stringify(change.oldValue, null, 2)
                            : String(change.oldValue)}
                        </Text>
                      </Box>

                      <Box p={2.5} rounded="lg" bg="green.50" border="1px solid" borderColor="green.200">
                        <Text fontSize="10px" fontWeight="700" color="green.700" textTransform="uppercase" mb={1}>
                          New Updated Value
                        </Text>
                        <Text
                          fontSize="12px"
                          color="green.900"
                          fontFamily="mono"
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                        >
                          {change.newValue === null || change.newValue === undefined || change.newValue === ""
                            ? "(empty)"
                            : typeof change.newValue === "object"
                            ? JSON.stringify(change.newValue, null, 2)
                            : String(change.newValue)}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text fontSize="sm" color="gray.500" textAlign="center" py={6}>
                No specific field-level diff was captured for this record.
              </Text>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" py={3}>
            <ChakraButton size="sm" onClick={onClose}>
              Close
            </ChakraButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

