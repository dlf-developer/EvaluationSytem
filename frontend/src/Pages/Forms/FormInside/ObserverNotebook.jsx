import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  GetNoteBookForm,
  ObserverNotebookComplete,
} from "../../../redux/Form/noteBookSlice";
import { Button, Form, Input, message, Radio, Spin } from "antd";
import { Box, Flex, SimpleGrid, Heading, Text, VStack } from "@chakra-ui/react";
import TextArea from "antd/es/input/TextArea";
import { getAllTimes, getUserId } from "../../../Utils/auth";
import { BsEmojiFrown, BsEmojiNeutral, BsEmojiSmile } from "react-icons/bs";
import "./css/Walkthrough.css";
import { CreateActivityApi } from "../../../redux/Activity/activitySlice";
function ObserverNotebook() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const FormId = useParams()?.id;

  const { isLoading, formDataList } = useSelector((state) => state?.notebook);
  const [form] = Form.useForm();
  const Fectch = async () => {
    const data = await dispatch(GetNoteBookForm(FormId));
    const { isObserverComplete } = data?.payload;
    if (isObserverComplete) {
      navigate(`/notebook-checking-proforma/report/${FormId}`);
    } else {
      message.success("Add your feedback");
    }
  };
  useEffect(() => {
    if (FormId) {
      Fectch();
    }
  }, [dispatch, FormId]);

  const yesNoNAOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "N/A", label: "N/A" },
  ];

  const generalDetailsConfig = [
    { name: "ClassStrength", label: "Class Strength", type: "input" },
    { name: "NotebooksSubmitted", label: "Notebooks Submitted", type: "input" },
    { name: "Absentees", label: "Absentees", type: "input" },
    { name: "Defaulters", label: "Defaulters", type: "input" },
    // { name: "observerFeedback", label: "Observer Feedback", type: "textarea" },
  ];

  const generalDetailsConfig2 = [
    { name: "observerFeedback", label: "Observer Feedback", type: "textarea" },
  ];
  const renderFormItem = ({ name, label, type }) => {
    const inputProps = {
      input: (
        <Input size="large" placeholder={`Enter ${label.toLowerCase()}`} />
      ),
      textarea: (
        <TextArea size="large" placeholder={`Enter ${label.toLowerCase()}`} />
      ),
    };

    return (
      <Form.Item
        name={name}
        label={
          <h5 className="text-gray" style={{ fontSize: 20 }}>
            {label}
          </h5>
        }
        rules={[
          {
            required: true,
            message: `Please provide a valid ${label.toLowerCase()}!`,
          },
        ]}
      >
        {inputProps[type]}
      </Form.Item>
    );
  };

  const renderGeneralDetails = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
      {generalDetailsConfig.map((item) => (
        <Box key={item.name}>{renderFormItem(item)}</Box>
      ))}
    </SimpleGrid>
  );

  const renderGeneralDetails2 = () => (
    <Box mt={6}>
      {generalDetailsConfig2.map((item) => (
        <Box key={item.name}>{renderFormItem(item)}</Box>
      ))}
    </Box>
  );

  const RenderRadioFormItem = ({ name, label, question, isTextArea }) => {
    const [showRemark, setShowRemark] = useState(false);
    return (
      <>
        <Form.Item
          className="mb-0 "
          name={[...name, "answer"]}
          // label={<h6 className="text-gray" style={{ fontSize: 16 }}>{label}</h6>}
          rules={[{ required: true, message: "Please select an answer!" }]}
        >
          <>
            <Radio.Group
              size="middle"
              className="radio-button-box"
              options={yesNoNAOptions.map((value) => ({
                label: value.label,
                value: value.value,
              }))}
              optionType="button"
              buttonStyle="solid"
            />
          </>
        </Form.Item>
        <Button
          className="mt-2"
          type="link"
          onClick={() => setShowRemark(!showRemark)}
          style={{ padding: 0 }}
        >
          {showRemark ? "Hide Remark" : "Add Remark"}
        </Button>
        <Form.Item
          className="hidden"
          hidden
          name={[...name, "question"]}
          initialValue={question}
        >
          <Input />
        </Form.Item>
        {showRemark && (
          <Form.Item
            name={[...name, "remark"]}
            rules={[{ required: false }]}
            style={{ marginTop: "1rem" }}
          >
            <Input.TextArea rows={3} placeholder="Add your remark here" />
          </Form.Item>
        )}
      </>
    );
  };

  const renderSections = (title, questions, namePrefix) => (
    <Box w="100%" mb={8}>
      <Heading
        size="md"
        color="brand.primary"
        bg="gray.50"
        p={4}
        borderRadius="lg"
        mb={6}
      >
        {title}
      </Heading>

      <SimpleGrid columns={1} spacing={6}>
        {questions?.map((question, index) => (
          <Box
            key={`${namePrefix}${index}`}
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={6}
              align={{ base: "stretch", md: "flex-start" }}
            >
              <Box flex={{ base: "1", md: "2" }}>
                <Text fontWeight="bold" color="gray.800" fontSize="lg" mb={4}>
                  {question}
                </Text>
                <RenderRadioFormItem
                  question={question}
                  name={[namePrefix, index]}
                  label={question}
                  isTextArea={true}
                />
              </Box>

              <Flex direction="column" flex="1" gap={4}>
                <Box
                  p={3}
                  bg="blue.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="blue.400"
                >
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                    fontWeight="bold"
                  >
                    Teacher Response
                  </Text>
                  <Text fontWeight="bold" mt={1}>
                    {formDataList?.TeacherForm?.[namePrefix]?.[index]?.answer ??
                      "No response"}
                  </Text>
                </Box>
                <Box
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="gray.400"
                >
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                    fontWeight="bold"
                  >
                    Teacher Remarks
                  </Text>
                  <Text mt={1}>
                    {formDataList?.TeacherForm?.[namePrefix]?.[index]?.remark ??
                      "No remark"}
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
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
      data,
      id: FormId,
    };
    const response = await dispatch(ObserverNotebookComplete(payload));
    if (response?.payload?.message) {
      message.success(response?.payload?.message);

      const userInfo = response?.payload?.data?.grenralDetails;
      const activity = {
        observerMessage: `You have completed Notebook Checking Proforma Form For ${userInfo?.className} | ${userInfo?.Subject} | ${userInfo?.Section}.`,
        teacherMessage: `${getUserId()?.name} has completed the Notebook Checking Proforma Form For ${userInfo?.className} | ${userInfo?.Subject} | ${userInfo?.Section}.`,
        route: `/notebook-checking-proforma/report/${response?.payload?.data?._id}`,
        date: new Date(),
        reciverId: response?.payload?.data?.createdBy,
        senderId: getUserId()?.id,
        fromNo: 3,
        data: response?.payload?.data,
      };

      const activitiRecord = await dispatch(CreateActivityApi(activity));
      if (!activitiRecord?.payload?.success) {
        message.error("Error on Activity Record");
      }

      navigate(`/notebook-checking-proforma/report/${FormId}`);
    } else {
      message.error(response?.payload?.message);
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="80vh" bg="gray.50">
      <Box maxW="1200px" mx="auto">
        {isLoading && (
          <Flex justify="center" align="center" minH="50vh">
            <Spin size="large" />
          </Flex>
        )}
        <Form form={form} layout="vertical">
          <Box
            bg="white"
            p={{ base: 4, md: 8 }}
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
            mb={8}
          >
            <Heading
              size="md"
              color="gray.800"
              mb={6}
              pb={4}
              borderBottom="1px solid"
              borderColor="gray.100"
            >
              Teacher Overview
            </Heading>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
              <Box
                p={5}
                bg="blue.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="blue.100"
              >
                <VStack align="flex-start" spacing={3}>
                  <Flex align="center">
                    <Text fontWeight="bold" w="150px">
                      Name:
                    </Text>
                    <Text>
                      {formDataList?.grenralDetails?.NameofObserver?.name}
                    </Text>
                  </Flex>
                  <Flex align="center">
                    <Text fontWeight="bold" w="150px">
                      Observation Date:
                    </Text>
                    <Text>
                      {
                        getAllTimes(
                          formDataList?.grenralDetails?.DateOfObservation,
                        ).formattedDate2
                      }
                    </Text>
                  </Flex>
                </VStack>
              </Box>

              <Box
                p={5}
                bg="gray.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <VStack align="flex-start" spacing={3}>
                  <Flex align="center">
                    <Text fontWeight="bold" w="180px">
                      Absentees:
                    </Text>
                    <Text>{formDataList?.NotebooksTeacher?.Absentees}</Text>
                  </Flex>
                  <Flex align="center">
                    <Text fontWeight="bold" w="180px">
                      Class Strength:
                    </Text>
                    <Text>{formDataList?.NotebooksTeacher?.ClassStrength}</Text>
                  </Flex>
                  <Flex align="center">
                    <Text fontWeight="bold" w="180px">
                      Defaulters:
                    </Text>
                    <Text>{formDataList?.NotebooksTeacher?.Defaulters}</Text>
                  </Flex>
                  <Flex align="center">
                    <Text fontWeight="bold" w="180px">
                      Notebooks Submitted:
                    </Text>
                    <Text>
                      {formDataList?.NotebooksTeacher?.NotebooksSubmitted}
                    </Text>
                  </Flex>
                </VStack>
              </Box>
            </SimpleGrid>

            {renderGeneralDetails()}

            {renderSections(
              "Maintenance Of Notebooks",
              [
                "I have checked that NBs are in a good physical condition.",
                "I have checked that the work presentation is neat.",
                "I have ensured that the work of the learners is complete.",
                "I have checked the appropriateness of Headings / CW / HW.",
                "There is no scribbling on the last page/any pages thereof.",
                "I have ensured that the child has implemented the previous feedback and done the correction work.",
              ],
              "maintenanceOfNotebooks",
            )}

            {renderSections(
              "Quality Of Oppurtunities",
              [
                "I have provided HOTs and VBQs with every chapter.",
                "I have made app. remarks about the quality of answers.",
                "I have developed vocab of students (pre-post activities).",
                "I have taken up at least 2 CSPs fortnightly with clear LOs.",
                "The quality questions given by me offer a scope for original thinking by learners.",
                "The writing tasks / questions given by me provide a scope for independent encounters.",
              ],
              "qualityOfOppurtunities",
            )}

            {renderSections(
              "Quality Of Teacher Feedback",
              [
                "I have provided timely and regular feedback.",
                "I have corrected all the notebook work.",
                "I have provided positive reinforcement.",
                "I have provided personalized feedback.",
                "My feedback provides learners directions for improvement.",
                "My feedback facilitates learners with clear directions on what good work looks like.",
              ],
              "qualityOfTeacherFeedback",
            )}

            {renderSections(
              "Quality Of Learner",
              [
                "I have checked / addressed the common misconceptions",
                "I have given remarks if the answers are copied or if there are common errors.",
              ],
              "qualityOfLearner",
            )}

            <Box bg="gray.50" p={6} borderRadius="xl" mt={8}>
              <Heading size="sm" mb={4}>
                Final Thoughts
              </Heading>
              {renderGeneralDetails2()}
            </Box>

            <Flex justify="flex-end" mt={8}>
              <Button
                size="large"
                type="primary"
                onClick={handleNext}
                style={{
                  minWidth: "200px",
                  borderRadius: "8px",
                  background: "#1a4d2e",
                }}
              >
                Submit
              </Button>
            </Flex>
          </Box>
        </Form>
      </Box>
    </Box>
  );
}

export default ObserverNotebook;
