import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Flex,
  Heading,
  Text,
  Badge,
  Avatar,
  Tag,
} from "@chakra-ui/react";
import {
  SmileOutlined,
  BulbOutlined,
  ReloadOutlined,
  PrinterOutlined,
} from "../../Components/UI/Icons";
import { Button, Spin, Table } from "../../Components/UI";
import { axiosInstanceToken } from "../../redux/instence";
import { getAllTimes, getUserId } from "../../Utils/auth";

export default function TeacherPortfolio() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const currentUser = getUserId();

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await axiosInstanceToken.get("/analytics/portfolio");
      if (res?.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch teacher portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <Box>
          <Flex align="center" gap={2}>
            <Heading size="lg" color="gray.800">
              Teacher Growth Portfolio
            </Heading>
            <Badge colorScheme="purple" fontSize="xs" px={2} py={0.5} borderRadius="md">
              Dev Mode
            </Badge>
          </Flex>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Your continuous professional development journey, evaluation trajectory, and observer feedback synthesis.
          </Text>
        </Box>
        <Flex gap={2}>
          <Button
            onClick={fetchPortfolio}
            className="flex items-center gap-1.5"
            disabled={loading}
          >
            <ReloadOutlined /> Refresh
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-primary text-white flex items-center gap-1.5"
          >
            <PrinterOutlined /> Print Portfolio
          </Button>
        </Flex>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" h="300px">
          <Spin size="large" />
        </Flex>
      ) : (
        <>
          {/* Teacher Profile Banner */}
          <Box
            bg="white"
            p={6}
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
            mb={6}
          >
            <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
              <Flex align="center" gap={4}>
                <Avatar
                  name={data?.teacher?.name || currentUser?.name || "Teacher"}
                  size="lg"
                  bg="brand.primary"
                  color="white"
                />
                <Box>
                  <Heading size="md" color="gray.800">
                    {data?.teacher?.name || currentUser?.name}
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    {data?.teacher?.email || currentUser?.email}
                  </Text>
                  <Flex gap={2} mt={1}>
                    <Tag size="sm" colorScheme="green">
                      ID: {data?.teacher?.employeeId || "Staff"}
                    </Tag>
                    <Tag size="sm" colorScheme="blue">
                      Role: {data?.teacher?.access || "Teacher"}
                    </Tag>
                  </Flex>
                </Box>
              </Flex>

              <Flex gap={4} wrap="wrap">
                <Box p={3} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200" minW="130px" textAlign="center">
                  <Text fontSize="xs" color="green.700" fontWeight="medium">
                    Overall Rating
                  </Text>
                  <Heading size="lg" color="green.800" mt={1}>
                    {data?.summary?.averageScore || 0}%
                  </Heading>
                </Box>
                <Box p={3} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.200" minW="130px" textAlign="center">
                  <Text fontSize="xs" color="blue.700" fontWeight="medium">
                    Observations
                  </Text>
                  <Heading size="lg" color="blue.800" mt={1}>
                    {data?.summary?.totalEvaluations || 0}
                  </Heading>
                </Box>
                <Box p={3} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.200" minW="130px" textAlign="center">
                  <Text fontSize="xs" color="purple.700" fontWeight="medium">
                    Commendations
                  </Text>
                  <Heading size="lg" color="purple.800" mt={1}>
                    {data?.summary?.commendationsCount || 0}
                  </Heading>
                </Box>
              </Flex>
            </Flex>
          </Box>

          {/* Feedback Matrix: Commendations vs Focus Areas */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
            {/* Commendations */}
            <Box
              bg="white"
              p={6}
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="green.100"
            >
              <Flex align="center" gap={2} mb={4}>
                <SmileOutlined style={{ color: "#389e0d", fontSize: "20px" }} />
                <Heading size="md" color="green.800">
                  Commended Strengths &amp; Highlights
                </Heading>
              </Flex>
              <Text fontSize="xs" color="gray.500" mb={4}>
                Aggregated observer feedforward on what went particularly well in your sessions:
              </Text>

              {data?.commendations && data.commendations.length > 0 ? (
                <Flex direction="column" gap={3}>
                  {data.commendations.map((item, idx) => (
                    <Box
                      key={idx}
                      p={3.5}
                      bg="green.50/50"
                      borderRadius="xl"
                      borderLeftWidth="4px"
                      borderLeftColor="green.500"
                    >
                      <Text fontSize="sm" color="gray.800" fontStyle="italic">
                        "{item.text}"
                      </Text>
                      {item.observer && (
                        <Flex justify="space-between" mt={1.5}>
                          <Text fontSize="2xs" color="green.700" fontWeight="semibold">
                            — {item.observer}
                          </Text>
                          {item.date && (
                            <Text fontSize="2xs" color="gray.400">
                              {getAllTimes(item.date).formattedDate}
                            </Text>
                          )}
                        </Flex>
                      )}
                    </Box>
                  ))}
                </Flex>
              ) : (
                <Text fontSize="sm" color="gray.400" py={6} textAlign="center">
                  No commendations recorded yet. Complete upcoming classroom walkthroughs to populate.
                </Text>
              )}
            </Box>

            {/* Focus Areas */}
            <Box
              bg="white"
              p={6}
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="orange.100"
            >
              <Flex align="center" gap={2} mb={4}>
                <BulbOutlined style={{ color: "#d46b08", fontSize: "20px" }} />
                <Heading size="md" color="orange.800">
                  Growth Opportunities &amp; Focus Areas
                </Heading>
              </Flex>
              <Text fontSize="xs" color="gray.500" mb={4}>
                Actionable observer recommendations for your upcoming instructional planning:
              </Text>

              {data?.focusAreas && data.focusAreas.length > 0 ? (
                <Flex direction="column" gap={3}>
                  {data.focusAreas.map((item, idx) => (
                    <Box
                      key={idx}
                      p={3.5}
                      bg="orange.50/50"
                      borderRadius="xl"
                      borderLeftWidth="4px"
                      borderLeftColor="orange.500"
                    >
                      <Text fontSize="sm" color="gray.800">
                        {item.text}
                      </Text>
                      {item.observer && (
                        <Flex justify="space-between" mt={1.5}>
                          <Text fontSize="2xs" color="orange.700" fontWeight="semibold">
                            Observer: {item.observer}
                          </Text>
                          {item.date && (
                            <Text fontSize="2xs" color="gray.400">
                              {getAllTimes(item.date).formattedDate}
                            </Text>
                          )}
                        </Flex>
                      )}
                    </Box>
                  ))}
                </Flex>
              ) : (
                <Text fontSize="sm" color="gray.400" py={6} textAlign="center">
                  No focus areas flagged. All observed areas meet expectations.
                </Text>
              )}
            </Box>
          </SimpleGrid>

          {/* Evaluation Trajectory History Table */}
          <Box
            bg="white"
            p={6}
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Heading size="md" color="gray.800" mb={1}>
              Observation History &amp; Growth Trajectory
            </Heading>
            <Text fontSize="xs" color="gray.400" mb={4}>
              Record of all formal walkthroughs and co-scholastic observations
            </Text>

            <Table
              dataSource={data?.trajectory || []}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              columns={[
                {
                  title: "Date",
                  dataIndex: "date",
                  key: "date",
                  render: (val) => <Text fontSize="xs">{getAllTimes(val).formattedDate}</Text>,
                },
                {
                  title: "Type",
                  dataIndex: "type",
                  key: "type",
                  render: (val) => (
                    <Tag colorScheme={val === "Co-Scholastic" ? "purple" : "green"} size="sm">
                      {val}
                    </Tag>
                  ),
                },
                {
                  title: "Subject & Topic",
                  key: "subject",
                  render: (_, r) => (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">{r.subject}</Text>
                      {r.topic && <Text fontSize="xs" color="gray.400">{r.topic}</Text>}
                    </Box>
                  ),
                },
                {
                  title: "Observer",
                  dataIndex: "observer",
                  key: "observer",
                },
                {
                  title: "Score & Grade",
                  dataIndex: "percentageScore",
                  key: "percentageScore",
                  render: (val, record) => (
                    <Badge
                      colorScheme={val >= 80 ? "green" : val >= 65 ? "blue" : "orange"}
                      fontSize="xs"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                    >
                      {val}% (Grade {record.grade})
                    </Badge>
                  ),
                },
              ]}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
