import React, { useEffect, useState } from "react";
import ReactPDF from "@react-pdf/renderer";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetCoScholasticForm } from "../../redux/Form/coScholasticSlice";
import { getAllTimes, getUserId } from "../../Utils/auth";
import { Box, Flex, Heading, Text, VStack, SimpleGrid, Button, Badge } from "@chakra-ui/react";
import { Spin } from "../../Components/UI";
import { DownloadOutlined } from "../../Components/UI/Icons";
import { recordFileDownloadAudit } from "../../Utils/auditLogger";
import CoScholasticDoc from "./Documents/CoScholasticDoc";

function CoScholasticReport() {
  const dispatch = useDispatch();
  const FormId = useParams()?.id;
  const [isDownloading, setIsDownloading] = useState(false);

  const { isLoading, formDataList } = useSelector(
    (state) => state?.coScholastic,
  );

  useEffect(() => {
    if (FormId) {
      dispatch(GetCoScholasticForm(FormId));
    }
  }, [dispatch, FormId]);

  const handleDownloadPDF = async () => {
    if (!formDataList) return;
    setIsDownloading(true);
    try {
      const blob = await ReactPDF.pdf(<CoScholasticDoc data={formDataList} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `Co-Scholastic-Report-${FormId || "report"}.pdf`;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      recordFileDownloadAudit({
        fileName,
        fileType: "PDF",
        module: "Co-Scholastic Report",
        extraDetails: `Form ID: ${FormId}`,
      });
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

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
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" color="gray.800" mb={1}>
              Co-Scholastic Classroom Observation Report
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Detailed assessment rubrics, observer feedback, and teacher reflection.
            </Text>
          </Box>
          <Button
            leftIcon={<DownloadOutlined />}
            bg="#1a4d2e"
            color="white"
            _hover={{ bg: "#133c23" }}
            size="md"
            borderRadius="xl"
            isLoading={isDownloading}
            loadingText="Generating PDF…"
            onClick={handleDownloadPDF}
            px={6}
          >
            Download PDF
          </Button>
        </Flex>
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

          {/* Teacher Reflection Section */}
          <Box mb={4}>
            <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
              <Heading size="md" color="gray.800">
                Teacher Reflection & Key Learnings
              </Heading>
              {formDataList?.isTeacherCompletes ? (
                <Badge colorScheme="green" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="700">
                  Reflection Completed
                </Badge>
              ) : (
                <Badge colorScheme="orange" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="700">
                  Awaiting Teacher Reflection
                </Badge>
              )}
            </Flex>

            {formDataList?.isTeacherCompletes && formDataList?.TeacherFeedback && formDataList.TeacherFeedback.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {formDataList.TeacherFeedback.map((item, index) => (
                  <Box
                    key={index}
                    p={5}
                    bg="#f0fdf4"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="#bbf7d0"
                  >
                    <Text color="#166534" fontWeight="600" mb={3} fontSize="sm">
                      {item?.question || `Reflection Prompt ${index + 1}`}
                    </Text>
                    <Text
                      color="gray.800"
                      bg="white"
                      p={3.5}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.200"
                      fontSize="sm"
                      lineHeight="tall"
                    >
                      {item?.answer || "No response provided."}
                    </Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Box
                p={5}
                bg="#fffbeb"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="#fde68a"
              >
                <Text color="#92400e" fontSize="sm" fontWeight="500">
                  The teacher has not yet submitted their reflection for this observation. Once submitted, their key learnings and reflections will appear here and in the generated PDF report.
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CoScholasticReport;
