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

const TableCard = React.memo(({ title, dataSource }) => (
  <Box
    bg="white"
    borderRadius="2xl"
    boxShadow="sm"
    borderWidth="1px"
    borderColor="gray.100"
    p={5}
    mt={6}
    w="100%"
    overflowX="auto"
  >
    <Heading size="md" mb={4} color="gray.700">
      {title}
    </Heading>
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
    <Box
      p={{ base: 4, md: 8 }}
      minH="calc(100vh - 72px)"
      bg="gray.50"
      position="relative"
    >
      {isLoading && (
        <Flex
          justify="center"
          align="center"
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(255,255,255,0.7)"
          zIndex={10}
        >
          <Spin size="large" />
        </Flex>
      )}
      <Box maxW="1200px" mx="auto">
        <Flex justify="center" gap={4} mb={8} align="center">
          <Image src={Logo} alt="Logo" h="80px" objectFit="contain" />
          <Image src={LogoBanner} alt="Banner" h="80px" objectFit="contain" />
        </Flex>

        <Box
          bg="white"
          p={8}
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          mb={8}
        >
          <Heading size="md" color="brand.primary" mb={6}>
            General Details
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Name Of Observer
              </Text>
              <Text fontWeight="600" color="gray.800">
                {formDataList?.grenralDetails?.NameofObserver?.name || "N/A"}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Grade
              </Text>
              <Text fontWeight="600" color="gray.800">
                {formDataList?.grenralDetails?.className || "N/A"}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Section
              </Text>
              <Text fontWeight="600" color="gray.800">
                {formDataList?.grenralDetails?.Section || "N/A"}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Subject
              </Text>
              <Text fontWeight="600" color="gray.800">
                {formDataList?.grenralDetails?.Subject || "N/A"}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Date Of Observation
              </Text>
              <Text fontWeight="600" color="gray.800">
                {formDataList?.grenralDetails?.DateOfObservation
                  ? getAllTimes(formDataList?.grenralDetails?.DateOfObservation)
                      .formattedDate2
                  : "N/A"}
              </Text>
            </Box>
          </SimpleGrid>

          <Divider mb={8} />

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Box>
              <Heading size="sm" color="gray.700" mb={4}>
                Observer Notebook
              </Heading>
              <VStack align="stretch" spacing={2}>
                <Flex justify="space-between">
                  <Text color="gray.500">Absentees:</Text>{" "}
                  <Text fontWeight="600">
                    {formDataList?.NotebooksObserver?.Absentees || "0"}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Class Strength:</Text>{" "}
                  <Text fontWeight="600">
                    {formDataList?.NotebooksObserver?.ClassStrength || "0"}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Defaulters:</Text>{" "}
                  <Text fontWeight="600">
                    {formDataList?.NotebooksObserver?.Defaulters || "0"}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Notebooks Submitted:</Text>{" "}
                  <Text fontWeight="600">
                    {formDataList?.NotebooksObserver?.NotebooksSubmitted || "0"}
                  </Text>
                </Flex>
              </VStack>
            </Box>

            <Box>
              <Heading size="sm" color="gray.700" mb={4}>
                Teacher Notebook
              </Heading>
              <VStack align="stretch" spacing={2}>
                <Flex justify="space-between">
                  <Text color="gray.500">Absentees:</Text>{" "}
                  <Text fontWeight="600">
                    {formDataList?.NotebooksTeacher?.Absentees || "0"}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Class Strength:</Text>{" "}
                  <Text fontWeight="600">
                    {formDataList?.NotebooksTeacher?.ClassStrength || "0"}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Defaulters:</Text>{" "}
                  <Text fontWeight="600">
                    {formDataList?.NotebooksTeacher?.Defaulters || "0"}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Notebooks Submitted:</Text>{" "}
                  <Text fontWeight="600">
                    {formDataList?.NotebooksTeacher?.NotebooksSubmitted || "0"}
                  </Text>
                </Flex>
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>

        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8} mb={8}>
          <Box>
            <Heading size="lg" mb={4} color="gray.800">
              Observer Response
            </Heading>
            {keyObject.map((title, index) => (
              <TableCard
                key={index}
                title={title}
                dataSource={getField(
                  Object.keys(formDataList?.ObserverForm || {})[index],
                )}
              />
            ))}

            <Box
              mt={6}
              bg="white"
              p={6}
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="brand.primary"
            >
              <Heading size="md" color="brand.primary" mb={4}>
                Observer Feedback
              </Heading>
              <Text color="gray.700" whiteSpace="pre-wrap">
                {formDataList?.observerFeedback || "No feedback provided."}
              </Text>
            </Box>
          </Box>

          <Box>
            <Heading size="lg" mb={4} color="gray.800">
              Teacher Response
            </Heading>
            {keyObject.map((title, index) => (
              <TableCard
                key={index + 4}
                title={title}
                dataSource={getField(
                  Object.keys(formDataList?.TeacherForm || {})[index],
                  "TeacherForm",
                )}
              />
            ))}
          </Box>
        </SimpleGrid>

        <Box
          bg="white"
          p={8}
          borderRadius="2xl"
          boxShadow="md"
          borderWidth="1px"
          borderColor="gray.100"
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
              style={{ borderRadius: "8px", minWidth: "150px" }}
            >
              Submit Reflection
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

export default NotebookComplete;
