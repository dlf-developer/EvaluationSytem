import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  GetWalkThroughForm,
  TeacherWalkThroughComplete,
} from "../../../redux/Form/classroomWalkthroughSlice";
import { getAllTimes, getUserId } from "../../../Utils/auth";
import { Button, Form, Input, message, Radio, Spin } from "antd";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Grid,
} from "@chakra-ui/react";
import TextArea from "antd/es/input/TextArea";
import { CreateActivityApi } from "../../../redux/Activity/activitySlice";

function TeacherWalkthrough() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const FormId = useParams()?.id;

  const { isLoading, formDataList } = useSelector(
    (state) => state?.walkThroughForm,
  );
  const [form] = Form.useForm();
  const Fectch = async () => {
    const data = await dispatch(GetWalkThroughForm(FormId));
    const { isTeacherCompletes } = data?.payload;
    if (isTeacherCompletes) {
      navigate(`/classroom-walkthrough/report/${FormId}`);
    } else {
      message.success("Add your feedback");
    }
  };
  useEffect(() => {
    if (FormId) {
      Fectch();
    }
  }, [dispatch, FormId]);

  const renderRadioFormItem = ({ name, label, question, isTextArea }) => (
    <>
      <Form.Item
        name={[...name, "answer"]}
        label={<h6 className="text-gray">{label}</h6>}
        rules={[{ required: true, message: "Please select an answer!" }]}
      >
        <>
          <TextArea rows={4} placeholder="Enter Your Feedback" />
        </>
      </Form.Item>
      <Form.Item
        className="hidden"
        hidden
        name={[...name, "question"]}
        initialValue={question}
      >
        <Input />
      </Form.Item>
    </>
  );
  const renderSections = (title, questions, namePrefix) => (
    <Box mt={8}>
      <Heading
        size="md"
        color="gray.800"
        mb={6}
        pb={2}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        {title}
      </Heading>
      <VStack spacing={4} align="stretch">
        {questions.map((question, index) => (
          <Box
            key={`${namePrefix}${index}`}
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
          >
            {renderRadioFormItem({
              name: [namePrefix, index],
              label: question,
              question,
              isTextArea: true,
            })}
          </Box>
        ))}
      </VStack>
    </Box>
  );

  const handleNext = () => {
    form
      .validateFields()
      .then((values) => {
        setFormData((prev) => ({ ...prev, ...values }));
        handleSubmit({ ...formData, ...values });
      })
      .catch(() => message.error("Please complete all required fields."));
  };

  const handleSubmit = async (data) => {
    const payload = {
      data: {
        isTeacherCompletes: true,
        TeacherFeedback: data?.TeacherFeedback,
      },
      data: {
        isTeacherCompletes: true,
        TeacherFeedback: data?.TeacherFeedback,
      },
      id: FormId,
    };

    const response = await dispatch(TeacherWalkThroughComplete(payload));
    if (response?.payload?.message) {
      message.success(response?.payload?.message);
      const receiverId = formDataList?.createdBy?._id;
      const observerMessage = `${formDataList?.grenralDetails?.NameoftheVisitingTeacher?.name} has been completed Classroom Walkthrough Form for ${formDataList?.grenralDetails?.className} | ${formDataList?.grenralDetails?.Section} | ${formDataList?.grenralDetails?.Subject}.`;
      const teacherMessage = `You have been completed Clasroom Walkthrough form for ${formDataList?.grenralDetails?.className} | ${formDataList?.grenralDetails?.Section} | ${formDataList?.grenralDetails?.Subject}.`;
      const activity = {
        observerMessage,
        teacherMessage,
        route: `/classroom-walkthrough/report/${formDataList?._id}`,
        date: new Date(),
        reciverId: receiverId,
        senderId: getUserId()?.id,
        fromNo: 2,
        data: response?.payload,
      };

      const activitiRecord = await dispatch(CreateActivityApi(activity));
      if (!activitiRecord?.payload?.success) {
        message.error("Error on Activity Record");
      }

      navigate(`/classroom-walkthrough/report/${FormId}`);
    } else {
      message.error(response?.payload?.message);
    }
  };

  const MapColor = (Arrmap) => {
    return Arrmap?.answer === "1"
      ? "bg-red-200 border-red-400 shadow-red-300"
      : Arrmap?.answer === "2"
        ? "bg-yellow-100 border-yellow-300 shadow-yellow-200" // Light Yellow
        : Arrmap?.answer === "3"
          ? "bg-yellow-300 border-yellow-300 shadow-yellow-300" // Dark Yellow
          : Arrmap?.answer === "4"
            ? "bg-green-200 border-green-400 shadow-green-300"
            : "bg-gray-200 border-gray-400 shadow-gray-300";
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="80vh" bg="gray.50">
      <Box maxW="1000px" mx="auto" position="relative">
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
            Observer Response
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
                  {
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

          <Box mb={8}>
            <Heading size="md" color="gray.800" mb={4}>
              Essential Aggrements
            </Heading>
            <VStack spacing={3} align="stretch">
              {formDataList?.essentialAggrements?.map((item, index) => (
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
              Planing And Preparation
            </Heading>
            <VStack spacing={3} align="stretch">
              {formDataList?.planingAndPreparation?.map((item, index) => (
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
              Class Room Environment
            </Heading>
            <VStack spacing={3} align="stretch">
              {formDataList?.classRoomEnvironment?.map((item, index) => (
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
              Instruction
            </Heading>
            <VStack spacing={3} align="stretch">
              {formDataList?.instruction?.map((item, index) => (
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

          <Form
            form={form}
            layout="vertical"
            className="mt-8 pt-8 border-t border-gray-200"
          >
            <Box
              bg="green.50"
              p={6}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="green.100"
            >
              {renderSections(
                "Your Feedback",
                [
                  "What went well in the classroom and how can you leverage it in future?",
                  "Describe key learning from your Feedback session",
                ],
                "TeacherFeedback",
              )}
              <Flex justify="flex-end" mt={6}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleNext}
                  style={{
                    minWidth: "200px",
                    borderRadius: "8px",
                    background: "#1a4d2e",
                  }}
                >
                  Submit Feedback
                </Button>
              </Flex>
            </Box>
          </Form>
        </Box>
      </Box>
    </Box>
  );
}

export default TeacherWalkthrough;
