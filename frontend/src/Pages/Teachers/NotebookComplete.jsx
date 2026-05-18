import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Button, message, Spin, Table, Tag } from "antd";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Divider,
  Textarea,
  Image,
} from "@chakra-ui/react";
import Logo from "../Reports/Imgs/Logo.png";
import LogoBanner from "../Reports/Imgs/image.png";
import {
  GetNoteBookForm,
  updateTeacherReflationFeedback,
} from "../../redux/Form/noteBookSlice";
import { getAllTimes, getUserId } from "../../Utils/auth";
import { useNavigate } from "react-router-dom";
import { CreateActivityApi } from "../../redux/Activity/activitySlice";
import DynamicScroreThree from "../../Components/DynamicScroreThree";

/* ── Shared table card — identical to NotebookPDF ── */
const TableCard = React.memo(({ title, dataSource }) => (
  <Box
    bg="white"
    mt={6}
    borderRadius="xl"
    boxShadow="sm"
    borderWidth="1px"
    borderColor="gray.100"
    overflow="hidden"
  >
    <Box
      bg="gray.50"
      px={4}
      py={3}
      borderBottomWidth="1px"
      borderColor="gray.200"
    >
      <Heading size="sm" color="gray.800">
        {title}
      </Heading>
    </Box>
    <Box>
      <Table
        pagination={false}
        dataSource={dataSource}
        columns={[
          {
            title: "Questions",
            dataIndex: "question",
            key: "question",
            render: (text) => <p className="mb-0">{text}</p>,
          },
          {
            title: "Answer",
            dataIndex: "answer",
            key: "answer",
            render: (text) => (
              <Tag
                color={
                  text === "1"
                    ? "yellow"
                    : text === "2"
                      ? "blue"
                      : text === "3"
                        ? "green"
                        : "red"
                }
              >
                {text}
              </Tag>
            ),
          },
          {
            title: "Remarks",
            dataIndex: "remark",
            key: "remark",
            render: (text) => <span>{text}</span>,
          },
        ]}
      />
    </Box>
  </Box>
));

function NotebookComplete() {
  const { id: Id } = useParams();
  const dispatch = useDispatch();
  const { formDataList, isLoading } = useSelector((state) => state.notebook);

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (Id) {
      dispatch(GetNoteBookForm(Id));
    }
  }, [Id, dispatch]);

  useEffect(() => {
    if (formDataList?.teacherReflationFeedback) {
      setInputValue(formDataList.teacherReflationFeedback);
    }
  }, [formDataList]);

  const navigate = useNavigate();
  const handleSubmit = () => {
    if (Id && inputValue.trim()) {
      dispatch(
        updateTeacherReflationFeedback({
          id: Id,
          data: { reflation: inputValue },
        }),
      )
        .then(async (res) => {
          if (res?.payload?.success) {
            const userInfo = res?.payload?.form?.grenralDetails;
            const activity = {
              observerMessage: `${getUserId()?.name} has completed the Notebook Checking Proforma Reflection Feedback For ${userInfo?.className} | ${userInfo?.Subject} | ${userInfo?.Section}.`,
              teacherMessage: `You have completed the Notebook Checking Proforma Reflection Feedback For ${userInfo?.className} | ${userInfo?.Subject} | ${userInfo?.Section}.`,
              route: `/notebook-checking-proforma/report/${res?.payload?.form?._id}`,
              date: new Date(),
              reciverId: userInfo?.NameofObserver,
              senderId: getUserId()?.id,
              fromNo: 3,
              data: res?.payload?.form,
            };

            const activitiRecord = await dispatch(CreateActivityApi(activity));
            if (!activitiRecord?.payload?.success) {
              message.error("Error on Activity Record");
            }

            navigate(`/notebook-checking-proforma/report/${Id}`);
          } else {
            console.log("Unexpected response:", res);
          }
        })
        .catch((error) => {
          console.error("Error updating teacher Reflection feedback:", error);
        });
    }
  };

  const keyObject = [
    "Maintenance Of Notebooks",
    "Quality Of Opportunities",
    "Quality Of Teacher Feedback",
    "Quality Of Learner",
  ];

  const getField = (field, type = "ObserverForm") =>
    formDataList?.[type]?.[field];

  return (
    <Box p={{ base: 4, md: 8 }} minH="100vh" bg="gray.50" position="relative">
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

      <Box maxW="1200px" mx="auto">
        {/* ── Main report card ── */}
        <Box
          bg="white"
          p={{ base: 4, md: 8 }}
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          {/* Logo header — identical to NotebookPDF */}
          <Flex
            justify="center"
            gap={8}
            mb={8}
            align="center"
            p={6}
            borderRadius="xl"
            bg="gray.50"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Image
              src={Logo}
              w={{ base: "100px", md: "100px" }}
              h="auto"
              alt="Logo"
            />
            <Image
              src={LogoBanner}
              w={{ base: "200px", md: "400px" }}
              h="auto"
              alt="Banner"
            />
          </Flex>

          {/* ── General Details ── */}
          <Box mb={8}>
            <Heading size="md" color="gray.800" mb={4}>
              General Details
            </Heading>
            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={4}
              p={6}
              bg="blue.50"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="blue.100"
            >
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Name Of Observer:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.NameofObserver?.name ||
                    formDataList?.createdBy?.name}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Name Of Teacher:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.teacherID?.name ||
                    formDataList?.createdBy?.name}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Grade:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.className}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Section:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.Section}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Subject:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.Subject}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Date:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {getAllTimes(formDataList?.grenralDetails?.DateOfObservation)
                    .formattedDate2}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* ── Notebook stat boxes (purple = Observer, teal = Teacher) ── */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
            <Box>
              <Heading size="sm" color="gray.700" mb={3}>
                Observer Notebook
              </Heading>
              <SimpleGrid
                columns={2}
                spacing={4}
                p={5}
                bg="purple.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="purple.100"
              >
                <Box>
                  <Text fontWeight="600" color="purple.900" display="inline">
                    Absentees:{" "}
                  </Text>
                  <Text display="inline" color="purple.800">
                    {formDataList?.NotebooksObserver?.Absentees}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="purple.900" display="inline">
                    Class Strength:{" "}
                  </Text>
                  <Text display="inline" color="purple.800">
                    {formDataList?.NotebooksObserver?.ClassStrength}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="purple.900" display="inline">
                    Defaulters:{" "}
                  </Text>
                  <Text display="inline" color="purple.800">
                    {formDataList?.NotebooksObserver?.Defaulters}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="purple.900" display="inline">
                    Submitted:{" "}
                  </Text>
                  <Text display="inline" color="purple.800">
                    {formDataList?.NotebooksObserver?.NotebooksSubmitted}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Box>
              <Heading size="sm" color="gray.700" mb={3}>
                Teacher Notebook
              </Heading>
              <SimpleGrid
                columns={2}
                spacing={4}
                p={5}
                bg="teal.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="teal.100"
              >
                <Box>
                  <Text fontWeight="600" color="teal.900" display="inline">
                    Absentees:{" "}
                  </Text>
                  <Text display="inline" color="teal.800">
                    {formDataList?.NotebooksTeacher?.Absentees}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="teal.900" display="inline">
                    Class Strength:{" "}
                  </Text>
                  <Text display="inline" color="teal.800">
                    {formDataList?.NotebooksTeacher?.ClassStrength}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="teal.900" display="inline">
                    Defaulters:{" "}
                  </Text>
                  <Text display="inline" color="teal.800">
                    {formDataList?.NotebooksTeacher?.Defaulters}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="teal.900" display="inline">
                    Submitted:{" "}
                  </Text>
                  <Text display="inline" color="teal.800">
                    {formDataList?.NotebooksTeacher?.NotebooksSubmitted}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>
          </SimpleGrid>

          {/* ── Two-column response tables (Teacher | Observer) ── */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
            <Box>
              <Heading
                size="md"
                color="brand.primary"
                mb={4}
                pb={2}
                borderBottom="2px solid"
                borderColor="brand.primary"
              >
                Teacher Response
              </Heading>
              <VStack align="stretch" spacing={0}>
                {keyObject.map((title, index) => (
                  <TableCard
                    key={`t-${index}`}
                    title={title}
                    dataSource={getField(
                      Object.keys(formDataList?.TeacherForm || {})[index],
                      "TeacherForm",
                    )}
                  />
                ))}
              </VStack>
            </Box>

            <Box>
              <Heading
                size="md"
                color="brand.secondary"
                mb={4}
                pb={2}
                borderBottom="2px solid"
                borderColor="brand.secondary"
              >
                Observer Response
              </Heading>
              <VStack align="stretch" spacing={0}>
                {keyObject.map((title, index) => (
                  <TableCard
                    key={`o-${index}`}
                    title={title}
                    dataSource={getField(
                      Object.keys(formDataList?.ObserverForm || {})[index],
                    )}
                  />
                ))}
              </VStack>
            </Box>
          </SimpleGrid>

          {/* ── Observer feedback display ── */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
            <Box
              bg="blue.50"
              p={6}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="blue.200"
            >
              <Heading size="sm" color="gray.800" mb={3}>
                Observer Feedback
              </Heading>
              <Text
                color="gray.700"
                bg="white"
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
                whiteSpace="pre-wrap"
              >
                {formDataList?.observerFeedback || "No feedback provided."}
              </Text>
            </Box>

            {/* Score cards */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <DynamicScroreThree
                col={12}
                formName={formDataList?.TeacherForm}
                className="w-full"
              />
              <DynamicScroreThree
                col={12}
                formName={formDataList?.ObserverForm}
                className="w-full"
              />
            </SimpleGrid>
          </SimpleGrid>

          {/* ── Teacher Reflection input ── */}
          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            boxShadow="md"
            borderWidth="1px"
            borderColor="gray.100"
            mt={4}
          >
            <Heading size="md" color="gray.800" mb={4}>
              Teacher Reflection
            </Heading>
            <Text color="gray.500" mb={4}>
              Enter your thoughts or reflection on this observation.
            </Text>
            <Textarea
              name="reflation"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Your Reflection..."
              size="lg"
              rows={5}
              resize="none"
              focusBorderColor="brand.primary"
              mb={6}
            />
            <Flex justify="flex-end">
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                style={{
                  borderRadius: "8px",
                  minWidth: "150px",
                  background: "#1a4d2e",
                }}
              >
                Submit Reflection
              </Button>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default NotebookComplete;
