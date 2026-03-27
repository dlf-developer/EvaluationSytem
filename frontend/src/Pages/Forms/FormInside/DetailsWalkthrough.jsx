import React, { useEffect, useState, useMemo } from "react";
import CommonStepper from "../../../Components/CommonStepper";
import { Box, Flex, SimpleGrid, Heading, Text, VStack } from "@chakra-ui/react";
import {
  DatePicker,
  Select,
  Button,
  Form,
  message,
  Input,
  Card,
  Radio,
  Spin,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  CreateWalkThrough,
  GetWalkThroughForm,
} from "../../../redux/Form/classroomWalkthroughSlice";
import {
  getCreateClassSection,
  GetTeacherList,
} from "../../../redux/userSlice";
import { getUserId } from "../../../Utils/auth";
import "./DetailsWalkthrough.css";
import { CreateActivityApi } from "../../../redux/Activity/activitySlice";

const { Option } = Select;
const { TextArea } = Input;

function DetailsWalkthrough() {
  const [currStep, setCurrStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const FormId = useParams()?.id;
  const { loading, GetTeachersLists } = useSelector((state) => state?.user);
  const { isLoading, formDataList } = useSelector(
    (state) => state?.walkThroughForm,
  );
  const [newData, setNewData] = useState([]);

  const fetchClassData = async () => {
    try {
      const res = await dispatch(getCreateClassSection());
      if (res?.payload?.success) {
        setNewData(
          res?.payload?.classDetails.sort(
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

  // Fetching Data
  useEffect(() => {
    if (FormId) {
      dispatch(GetWalkThroughForm(FormId)).then(({ payload }) => {
        const { isObserverCompleted, createdBy } = payload;
        if (isObserverCompleted && createdBy?._id === getUserId().id) {
          navigate(`/classroom-walkthrough/report/${FormId}`);
        } else {
          message.error("Something went wrong!");
        }
      });
    } else {
      dispatch(GetTeacherList());
      fetchClassData();
    }
  }, [FormId, dispatch]);

  const yesNoNAOptions = useMemo(() => ["1", "2", "3", "4", "N/A"], []);

  const steps = useMemo(
    () => [
      { title: "General Details" },
      { title: "Walkthrough Details" },
      { title: "Final" },
    ],
    [],
  );

  const disableFutureDates = (current) => {
    // Get the current date without the time part
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to 00:00:00 to compare only the date

    // Disable dates that are in the future
    return current && current.toDate() > today;
  };

  const [totalScore, setTotalScore] = useState(0);
  const [numOfParameters, setNumOfParameters] = useState(0);
  const [percentageScore, setPercentageScore] = useState(0);
  const [getOutOfScore, setGetOutOfScore] = useState(0);
  const [grade, setGrade] = useState("");
  const [sectionState, setSectionState] = useState([]);
  const [subject, setSubject] = useState([]);

  const sections = [
    "essentialAggrements",
    "planingAndPreparation",
    "classRoomEnvironment",
    "instruction",
  ];

  const validValues = ["1", "2", "3", "4"];

  // Calculate self-assessment score
  // Calculate Total Score and Out Of Score

  const calculateScore = () => {
    const formValues = form.getFieldsValue();
    let totalScore = 0; // Total points scored
    let outOfScore = 0; // Maximum possible score based on valid answers
    let numOfParametersNA = 0; // Counter for "N/A" answers

    sections.forEach((section) => {
      if (formValues[section]) {
        formValues[section].forEach((item) => {
          const answer = item?.answer;

          // Only consider valid answers for both totalScore and outOfScore
          if (validValues?.includes(answer)) {
            totalScore += parseInt(answer, 10); // Accumulate score
            outOfScore += 4; // Increment max score (4 points per question)
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

  const resetState = () => {
    setSectionState([]);
    setSubject([]);
  };

  // const updateState = (item) => {
  //   setSectionState(item?.sections);
  //   setSubject(item?.subjects);
  // };

  const SectionSubject = (value) => {
    if (value) {
      const filteredData = newData.filter((data) => data?._id === value);
      setSectionState(filteredData[0]);
      // return filteredData; // Return the filtered data if needed
    }
    return []; // Return an empty array if value is falsy
  };

  // Dynamic Rendering Helpers
  const renderRadioFormItem = ({ name, label, question, isTextArea }) => (
    <>
      <Form.Item
        className="mb-0"
        name={[...name, "answer"]}
        label={<h6 className="text-gray mb-0">{label}</h6>}
        rules={[{ required: true, message: "Please select an answer!" }]}
      >
        {isTextArea ? (
          <>
            <TextArea rows={4} placeholder="Enter Your Feedback" />
          </>
        ) : (
          <Radio.Group
            size="small"
            options={yesNoNAOptions.map((value) => ({
              label: value,
              value: value,
            }))}
            optionType="button"
            buttonStyle="solid"
          />
        )}
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
      <VStack spacing={4} align="stretch">
        {questions.map((question, index) => (
          <Box key={`${namePrefix}${index}`}>
            <Box
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
                isTextArea: currStep === 2,
              })}
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );
  const generalDetails = useMemo(
    () => [
      {
        name: "NameoftheVisitingTeacher",
        label: "Name of the Visiting Teacher",
        type: "select",
        options: GetTeachersLists?.map((item) => ({
          id: item?._id,
          value: item?._id,
          name: item?.name,
        })),
      },
      { name: "DateOfObservation", label: "Date of Observation", type: "date" },
      {
        name: "className",
        label: "Class Name / Section",
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
      { name: "Topic", label: "Topic", type: "input" },
    ],
    [GetTeachersLists, newData, sectionState],
  );

  const renderGeneralDetails = () => (
    <Box w="100%" mt={4}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {generalDetails.map(({ name, label, type, options }) => (
          <Box key={name}>
            <Form.Item
              key={name}
              name={name}
              label={
                <Text fontWeight="500" color="gray.700" mb={1}>
                  {label}
                </Text>
              }
              rules={[
                {
                  required: true,
                  message: `Please provide a valid ${label.toLowerCase()}!`,
                },
              ]}
            >
              {type === "select" ? (
                <Select
                  size="large"
                  className="general-details-select"
                  placeholder={`Select ${label.toLowerCase()}`}
                  onChange={
                    name === "className"
                      ? (value) => SectionSubject(value)
                      : () => {}
                  }
                >
                  {options?.map((option) => (
                    <Option
                      key={option?.id || option}
                      value={option?.value || option}
                    >
                      {option?.name || option}
                    </Option>
                  ))}
                </Select>
              ) : type === "date" ? (
                <DatePicker
                  size="large"
                  className="general-details-datepicker w-100"
                  placeholder={`Select ${label.toLowerCase()}`}
                  disabledDate={disableFutureDates}
                />
              ) : (
                <Input
                  size="large"
                  className="general-details-input"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              )}
            </Form.Item>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );

  const renderWalkthroughDetails = () => (
    <>
      {renderSections(
        "Essential Agreements",
        [
          "Teacher uses gender-neutral vocabulary and is sensitive to caste/class/gender in society.",
          "Teacher has established classroom rules and procedures, clear to both teacher and learners.",
          "Learners speak only when permitted (control with teacher).",
          "Student misbehavior is addressed promptly to maintain class focus.",
          "Teacher manages support roles well, including responses, praise, and decorum.",
        ],
        "essentialAggrements",
      )}
      {renderSections(
        "Planning and Preparation",
        [
          "Teacher displays extensive and deep knowledge of her discipline.",
          "Teacher's approach is interdisciplinary and contextual.",
          "Learning Outcomes are clear, actionable and permit viable methods of assessment.",
          "Teacher's conduct of the lesson is aligned with the expected Learning Outcomes.",
          "Teacher has adequate audio-visual aids / resources to share with the learners.",
          "Teacher creates opportunities for students to refer to text book, presentations and other required resources.",
          "Timings were managed well throughout the class.",
        ],
        "planingAndPreparation",
      )}

      {renderSections(
        "Classroom Environment",
        [
          "Classroom interactions among the teacher and individual students are highly respectful; active listening is encouraged .",
          "Teacher displays awareness of her students' backgrounds, cultures, skills, knowledge proficiency, interests and special needs.",
          "Teacher ensures that all students receive opportunities to respond to questions.",
          "Student thinking is visible through display of responses and doubts.",
          "Teacher uses positive reinforcement in the form of smileys, stickers and verbal appreciation.",
        ],
        "classRoomEnvironment",
      )}

      {renderSections(
        "Instruction",
        [
          "Appropriate Pre-Read/Pre-Watch was assigned as prior knowledge test.",
          "Teacher's instructions are clear and well paced.",
          "Teacher's instruction is coherent and takes students from surface to deep learning.",
          "Teacher has included BIG Question, Think lines and HOTS to stimulate and challenge student thinking.",
          "Questions/situations posed by the teacher relate to children's real life context or lend to invoking responses from children's experience.",
          "Self and Peer Assessment by students is used to monitor progress.",
          "Activities/Assessment are fully aligned with learning outcomes.",
          "Instruction is differentiated appropriately.",
          "Teacher provides good Feed forward such that it enables student learning.",
          "Teacher recapitulates the lesson /topic and checks for the attainment of the learning outcomes.",
        ],
        "instruction",
      )}
    </>
  );

  const renderFinalDetails = () => (
    <>
      {renderSections(
        "Feedback",
        ["What went well?", "Areas that need work"],
        "ObserverFeedback",
      )}
    </>
  );

  const handleNext = () => {
    form
      .validateFields()
      .then((values) => {
        setFormData((prev) => ({ ...prev, ...values }));
        if (currStep < steps.length - 1) {
          setCurrStep((prev) => prev + 1);
        } else {
          handleSubmit({ ...formData, ...values });
        }
      })
      .catch(() => message.error("Please complete all required fields."));
  };

  // const handleSubmit = async (data) => {
  //   const response = await dispatch(CreateWalkThrough(data));
  //   if (response?.payload?.status) {
  //     message.success(response?.payload?.message);
  //     navigate(`/classroom-walkthrough/report/${response?.payload?.form?._id}`);
  //   } else {
  //     message.error(response?.payload?.message);
  //   }
  // };

  //   const handleSubmit = async (data) => {
  //   // Add the calculated scores to the data object
  //   const submissionData = {
  //     ...data,
  //     totalScores: totalScore,
  //     scoreOutof: getOutOfScore,
  //     percentageScore: percentageScore,
  //     Grade: grade,
  //     NumberofParametersNotApplicable: numOfParameters,
  //   };

  //   // Dispatch the action to create the walkthrough with the updated data
  //   const response = await dispatch(CreateWalkThrough(submissionData));

  //   if (response?.payload?.status) {
  //     message.success(response?.payload?.message);
  //     navigate(`/classroom-walkthrough/report/${response?.payload?.form?._id}`);
  //   } else {
  //     message.error(response?.payload?.message);
  //   }
  // };

  const handleSubmit = async (data) => {
    // Calculate scores directly from form values
    const {
      totalScore,
      getOutOfScore,
      percentageScore,
      grade,
      numOfParameters,
    } = calculateScoreFromData(data);

    const submissionData = {
      ...data,
      totalScores: totalScore,
      scoreOutof: getOutOfScore,
      percentageScore: percentageScore,
      Grade: grade,
      NumberofParametersNotApplicable: numOfParameters,
    };

    const response = await dispatch(CreateWalkThrough(submissionData));
    if (response?.payload?.status) {
      const receiverId =
        response?.payload?.form?.grenralDetails?.NameoftheVisitingTeacher ||
        response?.payload?.form?.teacherID;
      const BasicData = response?.payload?.form?.grenralDetails;
      const observerMessage = `You have completed the walkthrough form for ${BasicData?.className} | ${BasicData?.Section} | ${BasicData?.Subject}.`;
      const teacherMessage = `A new walkthrough form has been completed by ${getUserId()?.name} for ${BasicData?.className} | ${BasicData?.Section} | ${BasicData?.Subject}.`;
      const activity = {
        observerMessage,
        teacherMessage,
        route: `/classroom-walkthrough/report/${response?.payload?.form?._id}`,
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
      message.success(response?.payload?.message);
      navigate(`/classroom-walkthrough/report/${response?.payload?.form?._id}`);
    } else {
      throw new Error(response.payload.message || "Error submitting the form.");
    }
  };

  const calculateScoreFromData = (data) => {
    let totalScore = 0;
    let outOfScore = 0;
    let numOfParametersNA = 0;

    sections.forEach((section) => {
      if (data[section]) {
        data[section].forEach((item) => {
          const answer = item?.answer;
          if (validValues?.includes(answer)) {
            totalScore += parseInt(answer, 10);
            outOfScore += 4;
          }
          if (["N/A", "NA", "N"].includes(answer)) {
            numOfParametersNA++;
          }
        });
      }
    });

    const percentage = outOfScore > 0 ? (totalScore / outOfScore) * 100 : 0;
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

    return {
      totalScore,
      getOutOfScore: outOfScore,
      percentageScore: parseFloat(percentage.toFixed(2)),
      grade,
      numOfParameters: numOfParametersNA,
    };
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
        >
          <CommonStepper steps={steps} current={currStep} />
        </Box>

        <Flex direction={{ base: "column", lg: "row" }} gap={8}>
          <Box flex="1">
            <Spin spinning={loading || isLoading}>
              <Form
                form={form}
                layout="vertical"
                onValuesChange={calculateScore}
              >
                <Box
                  bg="white"
                  p={{ base: 4, md: 8 }}
                  borderRadius="2xl"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                  minH="50vh"
                >
                  {currStep === 0
                    ? renderGeneralDetails()
                    : currStep === 1
                      ? renderWalkthroughDetails()
                      : renderFinalDetails()}
                </Box>

                <Flex justify="space-between" mt={6}>
                  {currStep > 0 ? (
                    <Button
                      size="large"
                      onClick={() => setCurrStep((prev) => prev - 1)}
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
                    {currStep < steps.length - 1 ? "Next" : "Submit"}
                  </Button>
                </Flex>
              </Form>
            </Spin>
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
              top="24px"
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
                  <Text color="brand.primary" fontWeight="bold" fontSize="lg">
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
      </Box>
    </Box>
  );
}

export default DetailsWalkthrough;
