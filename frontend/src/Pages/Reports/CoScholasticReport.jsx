import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetCoScholasticForm } from "../../redux/Form/coScholasticSlice";
import { getAllTimes, getUserId } from "../../Utils/auth";
import { Box, Flex, Heading, Text, VStack, SimpleGrid } from "@chakra-ui/react";
import { Spin } from "antd";

function CoScholasticReport() {
  const dispatch = useDispatch();
  const FormId = useParams()?.id;

  const { isLoading, formDataList } = useSelector(
    (state) => state?.coScholastic,
  );

  useEffect(() => {
    if (FormId) {
      dispatch(GetCoScholasticForm(FormId));
    }
  }, [dispatch, FormId]);

  const MapColor = (Arrmap) => {
    return Arrmap?.answer === "1"
      ? "bg-red-200 border-red-400 shadow-red-300"
      : Arrmap?.answer === "2"
        ? "bg-yellow-100 border-yellow-300 shadow-yellow-200"
        : Arrmap?.answer === "3"
          ? "bg-yellow-300 border-yellow-300 shadow-yellow-300"
          : Arrmap?.answer === "4"
            ? "bg-green-200 border-green-400 shadow-green-300"
            : "bg-gray-200 border-gray-400 shadow-gray-300";
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Box position="relative" maxW="1280px" mx="auto">
        <Heading size="lg" color="gray.800" mb={6}>
          Co-Scholastic Classroom Observation Report
        </Heading>
        {isLoading && (
          <Flex
            justify="center"
            align="center"
            position="absolute"
            inset={0}
            bg="whiteAlpha.800"
            zIndex={20}
            borderRadius="2xl"
          >
            <Spin size="large" />
          </Flex>
        )}
        <Box
          bg="white"
          p={{ base: 4, md: 8 }}
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Heading size="lg" color="brand.primary" mb={6}>
            Observer Responses
          </Heading>

          <Box
            bg="blue.50"
            p={6}
            borderRadius="xl"
            mb={8}
            borderWidth="1px"
            borderColor="blue.100"
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>
                <Text fontWeight="bold" color="blue.900" display="inline">
                  Name:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.NameoftheVisitingTeacher?.name}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="blue.900" display="inline">
                  Date:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.DateOfObservation &&
                    getAllTimes(formDataList?.grenralDetails?.DateOfObservation)
                      .formattedDate2
                  }
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="blue.900" display="inline">
                  Class:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.className}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="blue.900" display="inline">
                  Section:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.Section}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="blue.900" display="inline">
                  Subject:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.Subject}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="blue.900" display="inline">
                  Topic:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.Topic}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Score Summary Box */}
          <Box
            bg="green.50"
            p={6}
            borderRadius="xl"
            mb={8}
            borderWidth="1px"
            borderColor="green.100"
          >
            <Heading size="md" color="green.800" mb={4}>
              Evaluation Summary
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Box>
                <Text fontWeight="bold" color="green.900">Total Score</Text>
                <Text color="green.800" fontSize="xl" fontWeight="600">
                  {formDataList?.totalScores} <Text as="span" fontSize="md" color="green.700">/ {formDataList?.scoreOutof}</Text>
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="green.900">Percentage</Text>
                <Text color="green.800" fontSize="xl" fontWeight="600">
                  {formDataList?.percentageScore}%
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="green.900">Grade</Text>
                <Text color="green.800" fontSize="xl" fontWeight="600">
                  {formDataList?.Grade}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="green.900">N/A Parameters</Text>
                <Text color="green.800" fontSize="xl" fontWeight="600">
                  {formDataList?.NumberofParametersNotApplicable}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          <Box mb={8}>
            <Heading size="md" color="gray.800" mb={4}>
              Classroom Management
            </Heading>
            <VStack spacing={3} align="stretch">
              {formDataList?.classroomManagement?.map((item, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  p={4}
                  bg="gray.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.100"
                >
                  <Text flex="1" pr={4} color="gray.700" fontWeight="500">
                    {item?.question}
                  </Text>
                  <Box
                    className={`px-4 py-2 text-sm rounded-md font-bold shadow-sm ${MapColor(item)} min-w-[100px] text-center`}
                  >
                    {item?.answer}
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box mb={8}>
            <Heading size="md" color="gray.800" mb={4}>
              Planning & Execution
            </Heading>
            <VStack spacing={3} align="stretch">
              {formDataList?.planningAndExecution?.map((item, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  p={4}
                  bg="gray.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.100"
                >
                  <Text flex="1" pr={4} color="gray.700" fontWeight="500">
                    {item?.question}
                  </Text>
                  <Box
                    className={`px-4 py-2 text-sm rounded-md font-bold shadow-sm ${MapColor(item)} min-w-[100px] text-center`}
                  >
                    {item?.answer}
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box mb={8}>
            <Heading size="md" color="gray.800" mb={4}>
              Student Engagement & Behavioral Climate
            </Heading>
            <VStack spacing={3} align="stretch">
              {formDataList?.studentEngagement?.map((item, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  p={4}
                  bg="gray.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.100"
                >
                  <Text flex="1" pr={4} color="gray.700" fontWeight="500">
                    {item?.question}
                  </Text>
                  <Box
                    className={`px-4 py-2 text-sm rounded-md font-bold shadow-sm ${MapColor(item)} min-w-[100px] text-center`}
                  >
                    {item?.answer}
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box mb={8}>
            <Heading size="md" color="gray.800" mb={4}>
              Instruction & Facilitation
            </Heading>
            <VStack spacing={3} align="stretch">
              {formDataList?.instructionAndFacilitation?.map((item, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  p={4}
                  bg="gray.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.100"
                >
                  <Text flex="1" pr={4} color="gray.700" fontWeight="500">
                    {item?.question}
                  </Text>
                  <Box
                    className={`px-4 py-2 text-sm rounded-md font-bold shadow-sm ${MapColor(item)} min-w-[100px] text-center`}
                  >
                    {item?.answer}
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box mb={8}>
            <Heading size="md" color="gray.800" mb={4}>
              Observer Feedback
            </Heading>
            <VStack spacing={3} align="stretch">
              {formDataList?.ObserverFeedback?.map((item, index) => (
                <Box
                  key={index}
                  p={5}
                  bg="blue.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="blue.100"
                >
                  <Text color="blue.900" fontWeight="600" mb={3}>
                    {item?.question}
                  </Text>
                  <Text
                    color="gray.700"
                    bg="white"
                    p={3}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    {item?.answer}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CoScholasticReport;
