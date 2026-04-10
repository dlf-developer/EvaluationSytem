import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Radio,
  Select,
  Spin,
} from "antd";
import { Box, Flex, SimpleGrid, Heading, Text, VStack } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import CommonStepper from "../../../Components/CommonStepper";
import {
  getCreateClassSection,
  GetObserverList,
} from "../../../redux/userSlice";
import { BsEmojiFrown, BsEmojiNeutral, BsEmojiSmile } from "react-icons/bs";
import {
  CreateNoteBookForm,
  GetNoteBookForm,
} from "../../../redux/Form/noteBookSlice";
import { getUserId } from "../../../Utils/auth";
import { UserRole } from "../../../config/config";
import { CreateActivityApi } from "../../../redux/Activity/activitySlice";

const { Option } = Select;

const NoteBookDetails = () => {
  const [currStep, setCurrStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [newData, setNewData] = useState([]);
  const [sectionState, setSectionState] = useState([]);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const FormId = useParams()?.id;
  const { loading, GetObserverLists } = useSelector((state) => state?.user);
  //   const {isLoading,formDataList} = useSelector((state)=>state?.walkThroughForm)
  // Fetch notebook form details
  const fetchNoteBookForm = async () => {
    try {
      const response = await dispatch(GetNoteBookForm(FormId));
      const { isTeacherComplete, createdBy, isObserverComplete } =
        response?.payload;
      const userId = getUserId().id;
      const userAccess = getUserId().access;

      if (
        (isTeacherComplete &&
          createdBy?._id === userId &&
          userAccess === UserRole[2]) ||
        (isObserverComplete &&
          createdBy?._id === userId &&
          userAccess === UserRole[1])
      ) {
        navigate(`/notebook-checking-proforma/report/${FormId}`);
      } else {
        message.error("Something went wrong!");
      }
    } catch (error) {
      console.error("Error fetching notebook form:", error);
      message.error("Failed to fetch notebook form details.");
    }
  };

  // Fetch class and section data
  const fetchClassData = async () => {
    try {
      const response = await dispatch(getCreateClassSection());
      if (response?.payload?.success) {
        setNewData(
          response?.payload?.classDetails.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        );
      } else {
        message.error("Failed to fetch class data.");
      }
    } catch (error) {
      console.error("Error fetching class data:", error);
      message.error("An error occurred while fetching class data.");
    }
  };

  useEffect(() => {
    fetchClassData();
    if (FormId) {
      fetchNoteBookForm();
    } else {
      dispatch(GetObserverList());
    }
  }, [dispatch, FormId]);

  const disableFutureDates = (current) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return current && current.toDate() > today;
  };

  const steps = [{ title: "General Details" }, { title: "Final" }];

  const yesNoNAOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "N/A", label: "N/A" },
  ];

  const SectionSubject = (value) => {
    if (value) {
      const filteredData = newData.filter((data) => data?._id === value);
      if (filteredData.length > 0) {
        setSectionState(filteredData[0]);
      }
    }

    return []; // Return an empty array if value is falsy
  };

  const generalDetailsConfig = useMemo(
    () => [
      {
        name: "NameofObserver",
        label: "Name of Observer",
        type: "select",
        options: GetObserverLists?.map((item) => ({
          id: item?._id,
          value: item?._id,
          name: item?.name,
        })),
        list: "Observer",
      },
      { name: "DateOfObservation", label: "Date of Observation", type: "date" },
      {
        name: "className",
        label: "Class Name",
        type: "select",
        options: newData?.map((item) => ({
          id: item._id,
          value: item?._id,
          name: item.className,
        })),
      },
      {
        name: "Section",
        label: "Section",
        type: "select",
        options: sectionState?.sections?.map((item) => ({
          id: item._id,
          value: item?.name,
          name: item.name,
        })),
      },
      {
        name: "Subject",
        label: "Subject",
        type: "select",
        options: sectionState?.subjects?.map((item) => ({
          id: item._id,
          value: item?.name,
          name: item.name,
        })),
      },
      { name: "ClassStrength", label: "Class Strength", type: "input" },
      {
        name: "NotebooksSubmitted",
        label: "Notebooks Submitted",
        type: "input",
      },
      { name: "Absentees", label: "Absentees", type: "input" },
      { name: "Defaulters", label: "Defaulters", type: "input" },
    ],
    [GetObserverLists, newData, sectionState],
  );

  const renderFormItem = ({ name, label, type, options, list }) => {
    const inputProps = {
      select: (
        <Select
          size="large"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children ?? "").toString().toLowerCase().includes(input.toLowerCase())
          }
          placeholder={`Select ${label.toLowerCase()}`}
          onChange={(value) => SectionSubject(value)}
        >
          {options?.map((option) => (
            <Option key={option?.id || option} value={option?.value || option}>
              {option?.name || option}
            </Option>
          ))}
        </Select>
      ),
      date: (
        <DatePicker
          size="large"
          className="w-100"
          placeholder={`Select ${label.toLowerCase()}`}
          disabledDate={disableFutureDates}
        />
      ),
      input: (
        <Input size="large" placeholder={`Enter ${label.toLowerCase()}`} />
      ),
    };

    return (
      <Form.Item
        name={name}
        label={<h5 className="text-gray">{label}</h5>}
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

  const renderGeneralDetails = () =>
    generalDetailsConfig.map((item) => (
      <div key={item.name}>{renderFormItem(item)}</div>
    ));

  const Questions = {
    maintenanceOfNotebooks: [
      "I have checked that NBs are in a good physical condition.",
      "I have checked that the work presentation is neat.",
      "I have ensured that the work of the learners is complete.",
      "I have checked the appropriateness of Headings / CW / HW.",
      "There is no scribbling on the last page/any pages thereof.",
      "I have ensured that the child has implemented the previous feedback and done the correction work.",
    ],
    qualityOfOppurtunities: [
      "I have provided HOTs and VBQs with every chapter.",
      "I have made app. remarks about the quality of answers.",
      "I have developed vocab of students (pre-post activities).",
      "I have taken up at least 2 CSPs fortnightly with clear LOs.",
      "The quality questions given by me offer a scope for original thinking by learners.",
      "The writing tasks / questions given by me provide a scope for independent encounters.",
    ],
    qualityOfTeacherFeedback: [
      "I have provided timely and regular feedback.",
      "I have corrected all the notebook work.",
      "I have provided positive reinforcement.",
      "I have provided personalized feedback.",
      "My feedback provides learners directions for improvement.",
      "My feedback facilitates learners with clear directions on what good work looks like.",
    ],
    qualityOfLearner: [
      "I have checked / addressed the common misconceptions",
      "I have given remarks if the answers are copied or if there are common errors.",
    ],
  };

  const RadioFormItem = ({ name, question }) => {
    const [showRemark, setShowRemark] = useState(false);

    return (
      <div>
        {/* Answer Field */}
        <Form.Item
          name={[...name, "answer"]}
          label={
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="text-gray mb-0">{question}</h5>
            </div>
          }
          rules={[{ required: true, message: "Please select an answer!" }]}
        >
          <Radio.Group
            size="large"
            options={yesNoNAOptions.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>
        <Button
          type="link"
          onClick={() => setShowRemark(!showRemark)}
          style={{ padding: 0 }}
        >
          {showRemark ? "Hide Remark" : "Add Remark"}
        </Button>

        {/* Hidden Question Field */}
        <Form.Item name={[...name, "question"]} initialValue={question} hidden>
          <Input />
        </Form.Item>

        {/* Remark Field */}
        <Form.Item
          hidden={!showRemark}
          name={[...name, "remark"]}
          rules={[{ required: false }]}
          style={{ marginTop: "1rem" }}
        >
          <Input.TextArea rows={3} placeholder="Add your remark here" />
        </Form.Item>
      </div>
    );
  };

  const renderMaintenanceQuestions = () => (
    <Box w="100%" mb={8}>
      <Heading
        size="md"
        color="brand.primary"
        bg="gray.50"
        p={4}
        borderRadius="lg"
        mb={6}
      >
        Maintenance Of Notebooks
      </Heading>
      <VStack spacing={4} align="stretch">
        {Questions["maintenanceOfNotebooks"].map((question, index) => (
          <Box key={`maintenanceOfNotebooks-${index}`}>
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <RadioFormItem
                name={["maintenanceOfNotebooks", index]}
                question={question}
              />
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );

  const renderQualityOfOppurtunities = () => (
    <Box w="100%" mb={8}>
      <Heading
        size="md"
        color="brand.primary"
        bg="gray.50"
        p={4}
        borderRadius="lg"
        mb={6}
      >
        Quality Of Oppurtunities
      </Heading>
      <VStack spacing={4} align="stretch">
        {Questions["qualityOfOppurtunities"].map((question, index) => (
          <Box key={`qualityOfOppurtunities-${index}`}>
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <RadioFormItem
                name={["qualityOfOppurtunities", index]}
                question={question}
              />
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );

  const renderQualityOfTeacherFeedback = () => (
    <Box w="100%" mb={8}>
      <Heading
        size="md"
        color="brand.primary"
        bg="gray.50"
        p={4}
        borderRadius="lg"
        mb={6}
      >
        Quality Of TeacherFeedback
      </Heading>
      <VStack spacing={4} align="stretch">
        {Questions["qualityOfTeacherFeedback"].map((question, index) => (
          <Box key={`qualityOfTeacherFeedback-${index}`}>
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <RadioFormItem
                name={["qualityOfTeacherFeedback", index]}
                question={question}
              />
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );

  const renderQualityOfLearner = () => (
    <Box w="100%" mb={8}>
      <Heading
        size="md"
        color="brand.primary"
        bg="gray.50"
        p={4}
        borderRadius="lg"
        mb={6}
      >
        Quality Of Learner
      </Heading>
      <VStack spacing={4} align="stretch">
        {Questions["qualityOfLearner"].map((question, index) => (
          <Box key={`qualityOfLearner-${index}`}>
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <RadioFormItem
                name={["qualityOfLearner", index]}
                question={question}
              />
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );

  const handleNext = () => {
    form
      .validateFields()
      .then((values) => {
        // Merge current step data with existing formData
        setFormData((prev) => ({
          ...prev,
          ...values,
        }));

        // Determine if it's the last step
        const isLastStep = currStep >= steps.length - 1;

        if (isLastStep) {
          handleSubmit({ ...formData, ...values });
        } else {
          setCurrStep((prevStep) => prevStep + 1);
        }
      })
      .catch((errorInfo) => {
        const fieldErrors = errorInfo.errorFields
          .map((field) => field.name)
          .join(", ");
        message.error(`Please complete all required fields`);
      });
  };

  const handleSubmit = async (finalData) => {
    const data = await dispatch(CreateNoteBookForm(finalData));
    if (data?.payload?.status) {
      message.success(data?.payload?.message);
      const userInfo = data?.payload?.form?.grenralDetails;
      const activity = {
        observerMessage: `${getUserId()?.name} has completed the Notebook Checking Proforma Form For ${userInfo?.className} | ${userInfo?.Subject} | ${userInfo?.Section}.`,
        teacherMessage: `You have completed Notebook Checking Proforma Form For ${userInfo?.className} | ${userInfo?.Subject} | ${userInfo?.Section}..`,
        route: `/notebook-checking-proforma/report/${data?.payload?.form?._id}`,
        date: new Date(),
        reciverId: userInfo?.NameofObserver,
        senderId: getUserId()?.id,
        fromNo: 3,
        data: data?.payload?.form,
      };

      const activitiRecord = await dispatch(CreateActivityApi(activity));
      if (!activitiRecord?.payload?.success) {
        message.error("Error on Activity Record");
      }

      navigate(
        `/notebook-checking-proforma/report/${data?.payload?.form?._id}`,
      );
    } else {
      message.success(data?.payload?.message);
    }
  };

  const [totalScore, setTotalScore] = useState(0);
  const [numOfParameters, setNumOfParameters] = useState(0);
  const [percentageScore, setPercentageScore] = useState(0);
  const [getOutOfScore, setGetOutOfScore] = useState(0);
  const [grade, setGrade] = useState("");

  const validValues = ["1", "2", "3"];
  const calculateSelfAssessmentScore = () => {
    // // Array of keys to iterate over
    const keyObject = [
      "maintenanceOfNotebooks",
      "qualityOfOppurtunities",
      "qualityOfTeacherFeedback",
      "qualityOfLearner",
    ];

    const formValues = form.getFieldsValue();
    let totalScore = 0; // Total points scored
    let outOfScore = 0; // Maximum possible score based on valid answers
    let numOfParametersNA = 0; // Counter for "N/A" answers

    keyObject.forEach((section) => {
      if (formValues[section]) {
        formValues[section].forEach((item) => {
          const answer = item?.answer;

          // Only consider valid answers for both totalScore and outOfScore
          if (validValues?.includes(answer)) {
            totalScore += parseInt(answer, 10); // Accumulate score
            outOfScore += 3; // Increment max score (4 points per question)
          }

          // Count "N/A" answers
          if (["N/A", "NA", "N"].includes(answer)) {
            numOfParametersNA++; // Increment the count for "N/A"
          }
        });
      }
    });

    setTotalScore(totalScore); // Set total score
    setGetOutOfScore(outOfScore); // Set maximum possible score
    setNumOfParameters(numOfParametersNA); // Update state with total "N/A" answers

    // Calculate percentage
    const percentage = outOfScore > 0 ? (totalScore / outOfScore) * 100 : 0;
    setPercentageScore(parseFloat(percentage.toFixed(2))); // Set percentage

    // Determine grade
    const grade =
      percentage >= 90
        ? "A"
        : percentage >= 80
          ? "B"
          : percentage >= 70
            ? "C"
            : percentage >= 60
              ? "D"
              : "F";
    setGrade(grade); // Set grade

    // Update form values
    form.setFieldsValue({
      totalScores: totalScore,
      scoreOutof: outOfScore,
      percentageScore: percentage,
      Grade: grade,
      NumberofParametersNotApplicable: numOfParametersNA, // Add the N/A count
    });
  };
  const getPercentafe = (get, from) => {
    const numberVal = (get / from) * 100;
    return numberVal || "0";
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="80vh" bg="transparent">
      <Box maxW="1200px" mx="auto">
        <Box
          mb={8}
          bg="white"
          p={6}
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          position="sticky"
          top="0"
          zIndex={10}
        >
          <CommonStepper currentStep={currStep} steps={steps} />
        </Box>

        <Box position="relative">
          {loading && (
            <Flex
              justify="center"
              align="center"
              position="absolute"
              inset={0}
              bg="whiteAlpha.800"
              zIndex={20}
            >
              <Spin size="large" />
            </Flex>
          )}

          <Form
            form={form}
            layout="vertical"
            onValuesChange={(changedValues, allValues) => {
              calculateSelfAssessmentScore(allValues);
            }}
          >
            <Flex direction={{ base: "column", lg: "row" }} gap={8}>
              <Box flex="1" overflowY="auto" maxH="75vh" pr={2}>
                <Box
                  bg="white"
                  p={{ base: 4, md: 8 }}
                  borderRadius="2xl"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                  minH="50vh"
                >
                  {currStep === 0 && (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {renderGeneralDetails()}
                    </SimpleGrid>
                  )}
                  {currStep === 1 && (
                    <>
                      {renderMaintenanceQuestions()}
                      {renderQualityOfOppurtunities()}
                      {renderQualityOfTeacherFeedback()}
                      {renderQualityOfLearner()}
                    </>
                  )}
                </Box>

                <Flex justify="space-between" mt={6} pt={6} pb={8}>
                  {currStep > 0 ? (
                    <Button
                      size="large"
                      onClick={() => setCurrStep(currStep - 1)}
                      style={{ borderRadius: "8px", minWidth: "120px" }}
                    >
                      Back
                    </Button>
                  ) : (
                    <Box />
                  )}
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    style={{
                      borderRadius: "8px",
                      minWidth: "120px",
                      background: "#1a4d2e",
                    }}
                  >
                    {currStep === steps.length - 1 ? "Submit" : "Next"}
                  </Button>
                </Flex>
              </Box>

              <Box w={{ base: "100%", lg: "350px" }}>
                <Box
                  p={6}
                  borderRadius="2xl"
                  boxShadow="sm"
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.100"
                  position="sticky"
                  top="120px"
                >
                  <Heading
                    size="md"
                    color="gray.800"
                    mb={6}
                    pb={4}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                  >
                    Score Summary
                  </Heading>

                  <VStack spacing={4} align="stretch">
                    <Flex
                      justify="space-between"
                      p={3}
                      bg="gray.50"
                      borderRadius="lg"
                    >
                      <Text color="gray.600" fontWeight="500">
                        Total Score
                      </Text>
                      <Text
                        color="brand.primary"
                        fontWeight="bold"
                        fontSize="lg"
                      >
                        {totalScore}
                      </Text>
                    </Flex>

                    <Flex
                      justify="space-between"
                      p={3}
                      bg="gray.50"
                      borderRadius="lg"
                    >
                      <Text color="gray.600" fontWeight="500">
                        Out of
                      </Text>
                      <Text color="gray.800" fontWeight="bold">
                        {getOutOfScore}
                      </Text>
                    </Flex>

                    <Flex
                      justify="space-between"
                      p={3}
                      bg="blue.50"
                      borderRadius="lg"
                    >
                      <Text color="blue.700" fontWeight="500">
                        Percentage
                      </Text>
                      <Text color="blue.700" fontWeight="bold">
                        {percentageScore}%
                      </Text>
                    </Flex>

                    <Flex
                      justify="space-between"
                      p={3}
                      bg={
                        grade === "A" || grade === "B"
                          ? "green.50"
                          : grade === "C"
                            ? "yellow.50"
                            : "red.50"
                      }
                      borderRadius="lg"
                    >
                      <Text color="gray.700" fontWeight="500">
                        Grade
                      </Text>
                      <Text
                        color={
                          grade === "A" || grade === "B"
                            ? "green.600"
                            : grade === "C"
                              ? "yellow.600"
                              : "red.600"
                        }
                        fontWeight="bold"
                        fontSize="xl"
                      >
                        {grade}
                      </Text>
                    </Flex>

                    <Flex
                      justify="space-between"
                      p={3}
                      bg="gray.100"
                      borderRadius="lg"
                      mt={2}
                    >
                      <Text color="gray.600" fontSize="sm">
                        Excluded Parameters (N/A)
                      </Text>
                      <Text color="gray.600" fontWeight="bold">
                        {numOfParameters}
                      </Text>
                    </Flex>
                  </VStack>
                </Box>
              </Box>
            </Flex>
          </Form>
        </Box>
      </Box>
    </Box>
  );
};

export default NoteBookDetails;
