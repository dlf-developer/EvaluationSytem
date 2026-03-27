import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Activity } from "lucide-react";
import { Typography } from "antd";
import {
  getRecentActivities,
  getSingleActivityApi,
} from "../../redux/Activity/activitySlice";
import { getUserId } from "../../Utils/auth";
import Skeleton from "react-loading-skeleton";

import DashboardCard from "../../Components/DashboardCard";
import { FromDataAuth } from "../../redux/userSlice";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

const ObserverDashboard = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [FromOne, setFromOne] = useState("");
  const [FromTwo, setFromTwo] = useState("");
  const [FromThree, setFromThree] = useState("");
  const [FromFour, setFromFour] = useState("");
  const [stats, setStats] = useState([]);
  const [stateLoading, setStateLoading] = useState(false);
  const UserId = getUserId()?.id;

  useEffect(() => {
    const payload = {
      id: UserId,
      fromNo: 1,
    };
    const payload2 = {
      id: UserId,
      fromNo: 2,
    };
    const payload3 = {
      id: UserId,
      fromNo: 3,
    };
    const payload4 = {
      id: UserId,
      fromNo: 4,
    };
    setIsLoading(true);
    dispatch(getRecentActivities());
    dispatch(getSingleActivityApi(payload))
      .unwrap()
      .then((res) => {
        setFromOne(res?.activities);
        setIsLoading(false);
      });
    //
    //
    dispatch(getSingleActivityApi(payload2))
      .unwrap()
      .then((res) => {
        setFromTwo(res?.activities);
        setIsLoading(false);
      });

    dispatch(getSingleActivityApi(payload3))
      .unwrap()
      .then((res) => {
        setFromThree(res?.activities);
        setIsLoading(false);
      });
    dispatch(getSingleActivityApi(payload4))
      .unwrap()
      .then((res) => {
        setFromFour(res?.activities);
        setIsLoading(false);
      });
    GetDashbardData();
  }, [dispatch]);

  const GetDashbardData = async () => {
    setStateLoading(true);
    const response = await dispatch(FromDataAuth()).unwrap();
    if (response) {
      setStateLoading(false);
      setStats(response);
    }
  };

  const recentEntrySort = (activities) => {
    if (!activities || activities.length === 0) {
      return null; // Return null if array is empty
    }

    return [...activities] // Create a copy to avoid mutating the original array
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]; // Get the most recent entry
  };

  const recentEntry = recentEntrySort(FromOne);
  const recentEntry2 = recentEntrySort(FromTwo);
  const recentEntry3 = recentEntrySort(FromThree);
  const recentEntry4 = recentEntrySort(FromFour);

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Box mb={6}>
        <Heading size="lg" color="gray.800" mb={1}>
          Observer Dashboard
        </Heading>
        <Text color="gray.500">
          Welcome back. Here is your evaluation overview and recent activity.
        </Text>
      </Box>

      <Flex flexWrap="wrap" mx="-8px" mb={8}>
        {stats.map((stat, index) =>
          stateLoading ? (
            <Box
              key={index}
              px="8px"
              w={{ base: "100%", sm: "50%", md: "25%" }}
              mb={4}
            >
              <Skeleton height="120px" borderRadius="16px" />
            </Box>
          ) : (
            <Box
              key={index}
              px="8px"
              w={{ base: "100%", sm: "50%", md: "25%" }}
              mb={4}
            >
              <DashboardCard index={index} stat={stat} />
            </Box>
          ),
        )}
      </Flex>

      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="md"
        borderWidth="1px"
        borderColor="gray.100"
        overflow="hidden"
      >
        <Flex
          px={{ base: 4, md: 6 }}
          py={4}
          borderBottomWidth="1px"
          borderColor="gray.100"
          align="center"
          gap={3}
        >
          <Activity size={24} color="var(--chakra-colors-brand-primary)" />
          <Heading size="md" color="gray.700" fontWeight="bold">
            Recent Activity
          </Heading>
        </Flex>

        {/* Form 1 */}
        <Box
          p={{ base: 4, md: 6 }}
          _hover={{ bg: "gray.50" }}
          transition="all 0.2s"
          borderBottomWidth="1px"
          borderColor="gray.50"
        >
          <Flex align="center" justify="space-between" mb={2}>
            <Flex align="center" gap={3}>
              <Box
                bg="green.50"
                color="green.600"
                fontSize="sm"
                fontWeight="bold"
                px={3}
                py={1}
                borderRadius="md"
              >
                Fortnightly Monitor
              </Box>
              <Text fontSize="sm" color="gray.500">
                {recentEntry?.createdAt === recentEntry?.updatedAt &&
                recentEntry?.createdAt
                  ? `Created At: ${new Date(recentEntry.createdAt).toLocaleString()}`
                  : "No Recent Activity"}
              </Text>
            </Flex>
          </Flex>
          <Text color="gray.700" w="full">
            {isLoading ? (
              <Skeleton width="60%" />
            ) : (
              recentEntry?.observerMessage || "No Recent Activity"
            )}
          </Text>
        </Box>

        {/* Form 2 */}
        <Box
          p={{ base: 4, md: 6 }}
          _hover={{ bg: "gray.50" }}
          transition="all 0.2s"
          borderBottomWidth="1px"
          borderColor="gray.50"
        >
          <Flex align="center" justify="space-between" mb={2}>
            <Flex align="center" gap={3}>
              <Box
                bg="orange.50"
                color="orange.600"
                fontSize="sm"
                fontWeight="bold"
                px={3}
                py={1}
                borderRadius="md"
              >
                Classroom Walkthrough
              </Box>
              <Text fontSize="sm" color="gray.500">
                {recentEntry2?.createdAt === recentEntry2?.updatedAt &&
                recentEntry2?.createdAt
                  ? `Created At: ${new Date(recentEntry2.createdAt).toLocaleString()}`
                  : "No Recent Activity"}
              </Text>
            </Flex>
          </Flex>
          <Text color="gray.700" w="full">
            {isLoading ? (
              <Skeleton width="60%" />
            ) : (
              recentEntry2?.observerMessage || "No Recent Activity"
            )}
          </Text>
        </Box>

        {/* Form 3 */}
        <Box
          p={{ base: 4, md: 6 }}
          _hover={{ bg: "gray.50" }}
          transition="all 0.2s"
          borderBottomWidth="1px"
          borderColor="gray.50"
        >
          <Flex align="center" justify="space-between" mb={2}>
            <Flex align="center" gap={3}>
              <Box
                bg="blue.50"
                color="blue.600"
                fontSize="sm"
                fontWeight="bold"
                px={3}
                py={1}
                borderRadius="md"
              >
                NoteBook Checking Proforma
              </Box>
              <Text fontSize="sm" color="gray.500">
                {recentEntry3?.createdAt === recentEntry3?.updatedAt &&
                recentEntry3?.createdAt
                  ? `Created At: ${new Date(recentEntry3.createdAt).toLocaleString()}`
                  : "No Recent Activity"}
              </Text>
            </Flex>
          </Flex>
          <Text color="gray.700" w="full">
            {isLoading ? (
              <Skeleton width="60%" />
            ) : (
              recentEntry3?.observerMessage || "No Recent Activity"
            )}
          </Text>
        </Box>

        {/* Form 4 */}
        <Box
          p={{ base: 4, md: 6 }}
          _hover={{ bg: "gray.50" }}
          transition="all 0.2s"
        >
          <Flex align="center" justify="space-between" mb={2}>
            <Flex align="center" gap={3}>
              <Box
                bg="yellow.50"
                color="yellow.600"
                fontSize="sm"
                fontWeight="bold"
                px={3}
                py={1}
                borderRadius="md"
              >
                Learning Progress Checklist
              </Box>
              <Text fontSize="sm" color="gray.500">
                {recentEntry4?.createdAt === recentEntry4?.updatedAt &&
                recentEntry4?.createdAt
                  ? `Created At: ${new Date(recentEntry4.createdAt).toLocaleString()}`
                  : "No Recent Activity"}
              </Text>
            </Flex>
          </Flex>
          <Text color="gray.700" w="full">
            {isLoading ? (
              <Skeleton width="60%" />
            ) : (
              recentEntry4?.observerMessage || "No Recent Activity"
            )}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ObserverDashboard;
