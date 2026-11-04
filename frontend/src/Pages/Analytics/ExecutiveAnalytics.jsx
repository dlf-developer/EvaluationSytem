import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Flex,
  Heading,
  Text,
  Badge,
  Progress,
  Divider,
  Tag,
  Select,
  HStack,
} from "@chakra-ui/react";
import {
  CheckCircleOutlined,
  FileDoneOutlined,
  UserOutlined,
  TrophyOutlined,
  ReloadOutlined,
  CalendarOutlined,
  FilterOutlined,
} from "../../Components/UI/Icons";
import { Button, Spin, Table, message } from "../../Components/UI";
import { axiosInstanceToken } from "../../redux/instence";
import { getAllTimes } from "../../Utils/auth";
import {
  ADMIN_SECRET_PIN,
  isAdminFeaturesUnlocked,
  setAdminFeaturesUnlocked,
} from "../../Utils/adminUnlock";

const TIMEFRAME_OPTIONS = [
  { key: "7days", label: "Last 7 Days", badge: "7D" },
  { key: "15days", label: "Last 15 Days", badge: "15D" },
  { key: "30days", label: "Last 30 Days", badge: "30D" },
  { key: "session", label: "Entire Session", badge: "Session" },
  { key: "1year", label: "Last Year", badge: "1 Year" },
  { key: "all", label: "All Time (Old Time)", badge: "All Time" },
];

export default function ExecutiveAnalytics() {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => isAdminFeaturesUnlocked());
  const [pinInput, setPinInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("session");
  const [data, setData] = useState(null);

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
      message.success("Access granted! Admin Analytics unlocked.");
    } else {
      message.error("Incorrect PIN. Access denied.");
    }
  };

  const handleLock = () => {
    setAdminFeaturesUnlocked(false);
    setIsAdminUnlocked(false);
    setPinInput("");
    message.info("Admin Analytics locked and hidden.");
  };

  const fetchAnalytics = async (selectedTf = timeframe) => {
    if (!isAdminUnlocked) return;
    setLoading(true);
    try {
      const res = await axiosInstanceToken.get("/analytics/executive", {
        params: { timeframe: selectedTf },
      });
      if (res?.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch executive analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      fetchAnalytics(timeframe);
    }
  }, [isAdminUnlocked, timeframe]);

  const handleTimeframeChange = (newTf) => {
    if (newTf !== timeframe) {
      setTimeframe(newTf);
    }
  };

  const StatCard = ({ title, value, subtext, icon, gradient }) => (
    <Box
      p={6}
      bg="white"
      borderRadius="2xl"
      boxShadow="sm"
      position="relative"
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.100"
    >
      <Box
        position="absolute"
        top="-20px"
        right="-20px"
        w="100px"
        h="100px"
        bgGradient={gradient}
        opacity={0.1}
        borderRadius="full"
        filter="blur(20px)"
      />
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.500">
          {title}
        </Text>
        <Box
          p={2.5}
          bgGradient={gradient}
          borderRadius="xl"
          color="white"
          shadow="sm"
        >
          {icon}
        </Box>
      </Flex>
      <Heading size="xl" color="gray.800" fontWeight="bold">
        {value}
      </Heading>
      {subtext && (
        <Text fontSize="xs" color="gray.400" mt={1}>
          {subtext}
        </Text>
      )}
    </Box>
  );

  if (!isAdminUnlocked) {
    return (
      <Box p={8} maxW="560px" mx="auto" textAlign="center" mt={16}>
        <Box bg="white" p={8} rounded="2xl" shadow="md" border="1px solid" borderColor="gray.200">
          <Flex direction="column" align="center" gap={5}>
            <Box p={4} bg="green.50" rounded="full" color="brand.primary">
              <TrophyOutlined style={{ fontSize: "40px", color: "#2D4027" }} />
            </Box>
            <Box>
              <Heading size="md" color="gray.800" mb={1}>
                Institutional Analytics Locked
              </Heading>
              <Text fontSize="xs" color="gray.500" maxW="sm" mx="auto">
                Executive Analytics and institutional data are restricted for administrative monitoring. Enter your 4-digit Security PIN to proceed.
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
          </Flex>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }}>
      {/* Header */}
      <Flex justify="space-between" align="flex-start" mb={4} wrap="wrap" gap={3}>
        <Box>
          <Flex align="center" gap={2}>
            <Heading size="lg" color="gray.800">
              Executive Analytics &amp; Institutional Insights
            </Heading>
            <Badge colorScheme="green" fontSize="xs" px={2} py={0.5} borderRadius="md">
              Institutional Monitoring
            </Badge>
          </Flex>
          <Text color="gray.500" fontSize="sm" mt={1}>
            High-level institutional intelligence across all evaluation proformas and pedagogical domains.
          </Text>
        </Box>
        <Flex align="center" gap={2}>
          <Button
            onClick={handleLock}
            className="flex items-center gap-1.5"
            style={{ color: "#ef4444", borderColor: "#fca5a5" }}
          >
            Lock
          </Button>
          <Button
            onClick={() => fetchAnalytics(timeframe)}
            className="bg-primary text-white flex items-center gap-1.5"
            disabled={loading}
          >
            <ReloadOutlined /> Refresh Data
          </Button>
        </Flex>
      </Flex>

      {/* Timeframe Filter Selection Bar */}
      <Box
        bg="white"
        p={4}
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        mb={6}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={3}
        >
          {/* Label & Active Range Indicator */}
          <Flex align="center" gap={2}>
            <Box p={2} bg="green.50" color="green.700" borderRadius="lg">
              <CalendarOutlined style={{ fontSize: "18px" }} />
            </Box>
            <Box>
              <Flex align="center" gap={2}>
                <Text fontSize="xs" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wider">
                  Timeframe Filter
                </Text>
                <Tag colorScheme="green" size="sm" borderRadius="full">
                  {data?.timeframeLabel || TIMEFRAME_OPTIONS.find((t) => t.key === timeframe)?.label}
                </Tag>
              </Flex>
              {data?.dateRange?.start && (
                <Text fontSize="xs" color="gray.400">
                  Range: {new Date(data.dateRange.start).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} – {new Date(data.dateRange.end || Date.now()).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </Text>
              )}
            </Box>
          </Flex>

          {/* Desktop/Tablet Pill Button Group */}
          <HStack
            spacing={1.5}
            display={{ base: "none", lg: "flex" }}
            bg="gray.50"
            p={1}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
          >
            {TIMEFRAME_OPTIONS.map((opt) => {
              const isSelected = timeframe === opt.key;
              return (
                <Box
                  as="button"
                  key={opt.key}
                  type="button"
                  onClick={() => handleTimeframeChange(opt.key)}
                  px={3}
                  py={1.5}
                  borderRadius="lg"
                  fontSize="xs"
                  fontWeight={isSelected ? "bold" : "medium"}
                  transition="all 0.2s ease"
                  bg={isSelected ? "brand.primary" : "transparent"}
                  color={isSelected ? "white" : "gray.600"}
                  boxShadow={isSelected ? "sm" : "none"}
                  _hover={!isSelected ? { bg: "gray.200", color: "gray.800" } : {}}
                  disabled={loading}
                >
                  {opt.label}
                </Box>
              );
            })}
          </HStack>

          {/* Mobile/Tablet Dropdown Select */}
          <Box display={{ base: "block", lg: "none" }} w={{ base: "full", md: "240px" }}>
            <Select
              size="sm"
              borderRadius="xl"
              value={timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              fontWeight="medium"
              borderColor="gray.300"
              disabled={loading}
            >
              {TIMEFRAME_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>
      </Box>

      {loading ? (
        <Flex justify="center" align="center" h="300px">
          <Spin size="large" />
        </Flex>
      ) : (
        <>
          {/* Zero evaluations alert if filter yields 0 */}
          {data?.totalEvaluations === 0 && (
            <Box
              bg="orange.50"
              border="1px solid"
              borderColor="orange.200"
              p={4}
              borderRadius="xl"
              mb={6}
            >
              <Flex align="center" gap={3}>
                <Box p={2} bg="orange.100" color="orange.700" borderRadius="md">
                  <FilterOutlined style={{ fontSize: "16px" }} />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="orange.800">
                    No evaluations recorded for {data?.timeframeLabel || "this timeframe"}
                  </Text>
                  <Text fontSize="xs" color="orange.600">
                    Try switching to "Last 30 Days", "Entire Session", or "All Time (Old Time)" to view recorded evaluations.
                  </Text>
                </Box>
              </Flex>
            </Box>
          )}

          {/* Key KPI Metrics */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5} mb={6}>
            <StatCard
              title="Overall Institutional Score"
              value={data?.totalEvaluations > 0 ? `${data?.overallAverageScore || 0}%` : "—"}
              subtext={data?.totalEvaluations > 0 ? "Cross-form weighted average" : "No evaluations in window"}
              icon={<TrophyOutlined style={{ fontSize: "20px" }} />}
              gradient="linear(to-br, #2D4027, #4A6741)"
            />
            <StatCard
              title="Evaluations Completed"
              value={data?.totalEvaluations || 0}
              subtext={`Within ${data?.timeframeLabel || "selected period"}`}
              icon={<FileDoneOutlined style={{ fontSize: "20px" }} />}
              gradient="linear(to-br, #1890ff, #096dd9)"
            />
            <StatCard
              title="Active Teaching Staff"
              value={data?.totalTeachers || 0}
              subtext="Registered in roster"
              icon={<UserOutlined style={{ fontSize: "20px" }} />}
              gradient="linear(to-br, #722ed1, #531dab)"
            />
            <StatCard
              title="Evaluation Leaders"
              value={data?.totalObservers || 0}
              subtext="Observers &amp; Coordinators"
              icon={<CheckCircleOutlined style={{ fontSize: "20px" }} />}
              gradient="linear(to-br, #52c41a, #389e0d)"
            />
          </SimpleGrid>

          {/* Pedagogical Domain Mastery & Grade Distribution */}
          <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={6} mb={8}>
            {/* Domain Mastery Breakdown */}
            <Box
              gridColumn={{ lg: "span 7" }}
              bg="white"
              p={6}
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
                <Box>
                  <Heading size="md" color="gray.800">
                    Pedagogical Domain Mastery
                  </Heading>
                  <Text fontSize="xs" color="gray.400">
                    Calculated from rubric criteria for {data?.timeframeLabel}
                  </Text>
                </Box>
                <Tag colorScheme="green" size="sm">Standard: 4.0 Rubric</Tag>
              </Flex>

              <Box mt={4}>
                {data?.domainPerformance?.map((domain, idx) => {
                  const isExceeding = domain.score >= domain.benchmark;
                  return (
                    <Box key={idx} mb={4}>
                      <Flex justify="space-between" align="center" mb={1.5}>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                          {domain.name}
                        </Text>
                        <Flex align="center" gap={2}>
                          <Text fontSize="sm" fontWeight="bold" color={isExceeding ? "green.600" : "orange.500"}>
                            {domain.score}%
                          </Text>
                          <Badge
                            colorScheme={isExceeding ? "green" : "orange"}
                            fontSize="2xs"
                            borderRadius="full"
                            px={2}
                          >
                            {isExceeding ? "Above Target" : "Target: " + domain.benchmark + "%"}
                          </Badge>
                        </Flex>
                      </Flex>
                      <Progress
                        value={domain.score}
                        size="sm"
                        borderRadius="full"
                        colorScheme={isExceeding ? "green" : "orange"}
                        bg="gray.100"
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Grade Standing & Velocity */}
            <Box
              gridColumn={{ lg: "span 5" }}
              bg="white"
              p={6}
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Heading size="md" color="gray.800" mb={1}>
                Grade Standing Distribution
              </Heading>
              <Text fontSize="xs" color="gray.400" mb={4}>
                Evaluation grade tiers for {data?.timeframeLabel}
              </Text>

              <SimpleGrid columns={2} spacing={3} mb={6}>
                <Box p={3} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                  <Text fontSize="xs" color="green.700" fontWeight="medium">Tier A+ (≥90%)</Text>
                  <Heading size="lg" color="green.800" mt={1}>
                    {data?.gradeDistribution?.["A+"] || 0}
                  </Heading>
                </Box>
                <Box p={3} bg="teal.50" borderRadius="xl" border="1px solid" borderColor="teal.200">
                  <Text fontSize="xs" color="teal.700" fontWeight="medium">Tier A (80-89%)</Text>
                  <Heading size="lg" color="teal.800" mt={1}>
                    {data?.gradeDistribution?.["A"] || 0}
                  </Heading>
                </Box>
                <Box p={3} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.200">
                  <Text fontSize="xs" color="blue.700" fontWeight="medium">Tier B (70-79%)</Text>
                  <Heading size="lg" color="blue.800" mt={1}>
                    {data?.gradeDistribution?.["B"] || 0}
                  </Heading>
                </Box>
                <Box p={3} bg="orange.50" borderRadius="xl" border="1px solid" borderColor="orange.200">
                  <Text fontSize="xs" color="orange.700" fontWeight="medium">Tier C / D (&lt;70%)</Text>
                  <Heading size="lg" color="orange.800" mt={1}>
                    {(data?.gradeDistribution?.["C"] || 0) + (data?.gradeDistribution?.["D"] || 0)}
                  </Heading>
                </Box>
              </SimpleGrid>

              <Divider mb={4} />

              <Heading size="sm" color="gray.700" mb={1}>
                {timeframe === "7days" || timeframe === "15days"
                  ? `Daily Observation Velocity (${TIMEFRAME_OPTIONS.find((t) => t.key === timeframe)?.label})`
                  : "Observation Velocity Trends"}
              </Heading>
              <Text fontSize="2xs" color="gray.400" mb={2}>
                Number of submitted evaluations over time
              </Text>

              <Flex align="flex-end" justify="space-between" h="90px" pt={2} px={1} overflowX="auto">
                {data?.monthlyTrends?.map((item, idx) => {
                  const maxCount = Math.max(...data.monthlyTrends.map((t) => t.evaluations), 4);
                  const barHeight = Math.max(8, Math.round((item.evaluations / maxCount) * 65));
                  return (
                    <Flex key={idx} direction="column" align="center" gap={1} minW="28px">
                      <Text fontSize="2xs" fontWeight="bold" color="gray.600">
                        {item.evaluations}
                      </Text>
                      <Box
                        w={{ base: "14px", md: "20px" }}
                        h={`${barHeight}px`}
                        bg="brand.primary"
                        borderRadius="md"
                        transition="all 0.3s"
                        _hover={{ bg: "brand.secondary" }}
                      />
                      <Text fontSize="3xs" color="gray.400" textAlign="center" noOfLines={1}>
                        {item.month}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            </Box>
          </SimpleGrid>

          {/* Recent Evaluations Table */}
          <Box
            bg="white"
            p={6}
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
              <Box>
                <Heading size="md" color="gray.800">
                  Evaluations in Selected Timeframe
                </Heading>
                <Text fontSize="xs" color="gray.400">
                  {data?.recentHighlights?.length || 0} observations found within {data?.timeframeLabel}
                </Text>
              </Box>
            </Flex>

            <Table
              dataSource={data?.recentHighlights || []}
              rowKey="id"
              pagination={false}
              locale={{
                emptyText: (
                  <Box py={8} textAlign="center" color="gray.400">
                    <Text fontSize="sm">No observations recorded in {data?.timeframeLabel}</Text>
                    <Text fontSize="xs" color="gray.400" mt={1}>Try selecting "Entire Session" or "All Time (Old Time)" above.</Text>
                  </Box>
                ),
              }}
              columns={[
                {
                  title: "Teacher",
                  dataIndex: "teacherName",
                  key: "teacherName",
                  render: (text) => <Text fontWeight="semibold" color="gray.800">{text}</Text>,
                },
                {
                  title: "Observer",
                  dataIndex: "observerName",
                  key: "observerName",
                },
                {
                  title: "Subject",
                  dataIndex: "subject",
                  key: "subject",
                },
                {
                  title: "Evaluation Type",
                  dataIndex: "formType",
                  key: "formType",
                  render: (val) => (
                    <Tag colorScheme={val === "Co-Scholastic" ? "purple" : "green"} size="sm">
                      {val}
                    </Tag>
                  ),
                },
                {
                  title: "Score",
                  dataIndex: "percentage",
                  key: "percentage",
                  render: (val, record) => (
                    <Flex align="center" gap={2}>
                      <Badge
                        colorScheme={val >= 80 ? "green" : val >= 65 ? "blue" : "orange"}
                        fontSize="xs"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                      >
                        {val}% ({record.grade})
                      </Badge>
                    </Flex>
                  ),
                },
                {
                  title: "Date",
                  dataIndex: "date",
                  key: "date",
                  render: (val) => <Text fontSize="xs" color="gray.500">{getAllTimes(val).formattedDate}</Text>,
                },
              ]}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
