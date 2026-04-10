import React, { useEffect, useState, useMemo } from "react";
import CommonStepper from "../../../Components/CommonStepper";
import {
  Box,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  Divider,
  Badge,
} from "@chakra-ui/react";
import {
  DatePicker,
  Select,
  Button,
  Form,
  message,
  Input,
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

/* ─── Grade helpers ────────────────────────────────────────────────── */
const gradeColor = (g) => {
  if (g === "A" || g === "B") return "brand.primary";
  if (g === "C") return "#B45309";
  if (g) return "#B91C1C";
  return "gray.300";
};

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
      message.error("An error occurred while fetching class data.");
    }
  };

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return current && current.toDate() > today;
  };

  const [totalScore, setTotalScore] = useState(0);
  const [numOfParameters, setNumOfParameters] = useState(0);
  const [percentageScore, setPercentageScore] = useState(0);
  const [getOutOfScore, setGetOutOfScore] = useState(0);
  const [grade, setGrade] = useState("");
  const [sectionState, setSectionState] = useState([]);

  const sections = [
    "essentialAggrements",
    "planingAndPreparation",
    "classRoomEnvironment",
    "instruction",
  ];

  const validValues = ["1", "2", "3", "4"];

  const calculateScore = () => {
    const formValues = form.getFieldsValue();
    let total = 0;
    let outOf = 0;
    let naCount = 0;

    sections.forEach((section) => {
      if (formValues[section]) {
        formValues[section].forEach((item) => {
          const answer = item?.answer;
          if (validValues.includes(answer)) {
            total += parseInt(answer, 10);
            outOf += 4;
          }
          if (["N/A", "NA", "N"].includes(answer)) naCount++;
        });
      }
    });

    const pct = outOf > 0 ? (total / outOf) * 100 : 0;
    const g =
      pct >= 90
        ? "A"
        : pct >= 80
          ? "B"
          : pct >= 70
            ? "C"
            : pct >= 60
              ? "D"
              : "F";

    setTotalScore(total);
    setGetOutOfScore(outOf);
    setNumOfParameters(naCount);
    setPercentageScore(parseFloat(pct.toFixed(2)));
    setGrade(g);

    form.setFieldsValue({
      totalScores: total,
      scoreOutof: outOf,
      percentageScore: pct,
      Grade: g,
      NumberofParametersNotApplicable: naCount,
    });
  };

  const resetState = () => setSectionState([]);

  const SectionSubject = (value) => {
    if (value) {
      const filtered = newData.filter((d) => d?._id === value);
      setSectionState(filtered[0]);
    }
    return [];
  };

  /* ─── Render helpers ─────────────────────────────────────────────── */
  const renderRadioFormItem = ({ name, label, question, isTextArea }) => (
    <>
      <Form.Item
        className="mb-0"
        name={[...name, "answer"]}
        label={
          <Text fontSize="sm" color="gray.700" fontWeight="500" mb={1}>
            {label}
          </Text>
        }
        rules={[{ required: true, message: "Please select an answer!" }]}
      >
        {isTextArea ? (
          <TextArea
            rows={4}
            placeholder="Enter your feedback…"
            style={{ borderRadius: 10 }}
          />
        ) : (
          <Radio.Group
            size="large"
            options={yesNoNAOptions.map((v) => ({ label: v, value: v }))}
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
      {/* Section header */}
      <Flex
        align="center"
        gap={3}
        mb={5}
        pb={3}
        borderBottom="1.5px solid"
        borderColor="rgba(74,103,65,0.15)"
      >
        <Box
          w={1}
          h="22px"
          bg="brand.primary"
          borderRadius="full"
          flexShrink={0}
        />
        <Heading size="sm" color="brand.secondary" fontWeight="700">
          {title}
        </Heading>
        <Badge
          ml="auto"
          fontSize="10px"
          colorScheme="green"
          variant="subtle"
          borderRadius="full"
          px={2}
        >
          {questions.length} items
        </Badge>
      </Flex>

      <VStack spacing={3} align="stretch">
        {questions.map((question, index) => (
          <Box
            key={`${namePrefix}${index}`}
            bg="white"
            px={5}
            py={4}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.100"
            _hover={{ borderColor: "rgba(74,103,65,0.25)", boxShadow: "sm" }}
            transition="all 0.18s ease"
          >
            {renderRadioFormItem({
              name: [namePrefix, index],
              label: `${index + 1}. ${question}`,
              question,
              isTextArea: currStep === 2,
            })}
          </Box>
        ))}
      </VStack>
    </Box>
  );

  const generalDetails = useMemo(
    () => [
      {
        name: "NameoftheVisitingTeacher",
        label: "Visiting Teacher",
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
        label: "Class / Section",
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
    <Box w="100%" mt={2}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        {generalDetails.map(({ name, label, type, options }) => (
          <Box key={name}>
            <Form.Item
              name={name}
              label={
                <Text fontSize="sm" fontWeight="600" color="gray.700">
                  {label}
                </Text>
              }
              rules={[
                {
                  required: true,
                  message: `Please provide ${label.toLowerCase()}.`,
                },
              ]}
            >
              {type === "select" ? (
                <Select
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children ?? "")
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="general-details-select"
                  placeholder={`Select ${label.toLowerCase()}`}
                  onChange={
                    name === "className"
                      ? (value) => SectionSubject(value)
                      : () => {}
                  }
                >
                  {options?.map((opt) => (
                    <Option key={opt?.id || opt} value={opt?.value || opt}>
                      {opt?.name || opt}
                    </Option>
                  ))}
                </Select>
              ) : type === "date" ? (
                <DatePicker
                  size="large"
                  className="general-details-datepicker w-100"
                  placeholder={`Select date`}
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
          "Classroom interactions among the teacher and individual students are highly respectful; active listening is encouraged.",
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
        "Observer Feedback",
        ["What went well?", "Areas that need work"],
        "ObserverFeedback",
      )}
    </>
  );

  /* ─── Navigation ─────────────────────────────────────────────────── */
  const handleNext = () => {
    form
      .validateFields()
      .then((values) => {
        setFormData((prev) => ({ ...prev, ...values }));
        if (currStep < steps.length - 1) {
          setCurrStep((prev) => prev + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          handleSubmit({ ...formData, ...values });
        }
      })
      .catch(() => message.error("Please complete all required fields."));
  };

  const calculateScoreFromData = (data) => {
    let total = 0;
    let outOf = 0;
    let naCount = 0;

    sections.forEach((section) => {
      if (data[section]) {
        data[section].forEach((item) => {
          const answer = item?.answer;
          if (validValues.includes(answer)) {
            total += parseInt(answer, 10);
            outOf += 4;
          }
          if (["N/A", "NA", "N"].includes(answer)) naCount++;
        });
      }
    });

    const pct = outOf > 0 ? (total / outOf) * 100 : 0;
    const g =
      pct >= 90
        ? "A"
        : pct >= 80
          ? "B"
          : pct >= 70
            ? "C"
            : pct >= 60
              ? "D"
              : "F";

    return {
      totalScore: total,
      getOutOfScore: outOf,
      percentageScore: parseFloat(pct.toFixed(2)),
      grade: g,
      numOfParameters: naCount,
    };
  };

  const handleSubmit = async (data) => {
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
      percentageScore,
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

  /* ─── Main render ────────────────────────────────────────────────── */
  return (
    <Box px={{ base: 4, md: 8 }} py={6} minH="80vh" bg="transparent">
      <Box maxW="1280px" mx="auto">
        {/* Page header */}
        <Box mb={6}>
          <Heading size="lg" color="brand.secondary" fontWeight="800" mb={1}>
            Classroom Walkthrough
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Complete all steps to submit the observation record.
          </Text>
        </Box>

        {/* Stepper */}
        <Box
          mb={8}
          bg="white"
          px={6}
          py={5}
          top="90"
          zIndex="1000"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="gray.100"
          boxShadow="0 1px 4px rgba(0,0,0,0.05)"
        >
          <CommonStepper steps={steps} current={currStep} />
        </Box>

        {/* Two-column layout */}
        <Flex direction={{ base: "column", lg: "row" }} gap={6} align="stretch">
          {/* ── Left: form ─────────────────────────────────────────── */}
          <Box  flex="1" minW={0}>
            <Spin spinning={loading || isLoading}>
              <Form
                form={form}
                layout="vertical"
                onValuesChange={calculateScore}
              >
                <Box
                  bg="white"
                  px={{ base: 5, md: 8 }}
                  py={{ base: 6, md: 8 }}
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor="gray.100"
                  boxShadow="0 1px 4px rgba(0,0,0,0.05)"
                  minH="50vh"
                >
                  {currStep === 0
                    ? renderGeneralDetails()
                    : currStep === 1
                      ? renderWalkthroughDetails()
                      : renderFinalDetails()}
                </Box>

                {/* Navigation buttons */}
                <Flex justify="space-between" mt={5}>
                  {currStep > 0 ? (
                    <Button
                      size="large"
                      onClick={() => {
                        setCurrStep((p) => p - 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      style={{ borderRadius: "10px", minWidth: "120px" }}
                    >
                      ← Back
                    </Button>
                  ) : (
                    <Box />
                  )}
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    style={{
                      borderRadius: "10px",
                      minWidth: "140px",
                      background: "#4A6741",
                      border: "none",
                      fontWeight: 600,
                    }}
                  >
                    {currStep < steps.length - 1 ? "Next →" : "Submit"}
                  </Button>
                </Flex>
              </Form>
            </Spin>
          </Box>

          {/* ── Right: score panel (sticky) ─────────────────────────── */}
          <Box
            w={{ base: "100%", lg: "280px" }}
            flexShrink={0}
          >
            <Box
            position={{ base: "sticky", md: "sticky" }}

              top="16px"
              bg="white"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="gray.100"
              overflow="hidden"
            >
              {/* ── Header ── */}
              <Box px={5} pt={5} pb={4}>
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="brand.primary"
                  textTransform="uppercase"
                  letterSpacing="1.5px"
                  mb={0.5}
                >
                  Live Score
                </Text>

                {/* Big percentage display */}
                <Flex align="baseline" gap={1} mt={3}>
                  <Text
                    fontSize="48px"
                    fontWeight="800"
                    color={percentageScore > 0 ? "brand.secondary" : "gray.200"}
                    lineHeight="1"
                    transition="color 0.3s"
                  >
                    {percentageScore || "0"}
                  </Text>
                  <Text
                    fontSize="18px"
                    fontWeight="600"
                    color="gray.400"
                    pb={1}
                  >
                    %
                  </Text>
                </Flex>

                {/* Thin progress bar */}
                <Box
                  mt={4}
                  h="4px"
                  bg="gray.100"
                  borderRadius="full"
                  overflow="hidden"
                >
                  <Box
                    h="100%"
                    w={`${percentageScore}%`}
                    bg={
                      percentageScore >= 80
                        ? "brand.primary"
                        : percentageScore >= 60
                          ? "#D97706"
                          : percentageScore > 0
                            ? "#DC2626"
                            : "transparent"
                    }
                    borderRadius="full"
                    transition="width 0.4s ease, background 0.3s"
                  />
                </Box>

                {/* Grade inline */}
                <Flex align="center" justify="space-between" mt={4}>
                  <Text fontSize="xs" color="gray.400" fontWeight="500">
                    Grade
                  </Text>
                  <Text
                    fontSize="22px"
                    fontWeight="800"
                    color={gradeColor(grade)}
                    lineHeight="1"
                    transition="color 0.3s"
                  >
                    {grade || "—"}
                  </Text>
                </Flex>
              </Box>

              <Divider borderColor="gray.100" />

              {/* ── Stat rows ── */}
              <VStack spacing={0} align="stretch" px={5} py={4}>
                {[
                  { label: "Score", value: totalScore },
                  { label: "Out of", value: getOutOfScore || "—" },
                  { label: "N/A", value: numOfParameters },
                ].map(({ label, value }, i, arr) => (
                  <Box key={label}>
                    <Flex justify="space-between" align="center" py={3}>
                      <Text fontSize="sm" color="gray.500" fontWeight="400">
                        {label}
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color={
                          label === "Score" && totalScore > 0
                            ? "brand.primary"
                            : "gray.700"
                        }
                      >
                        {value}
                      </Text>
                    </Flex>
                    {i < arr.length - 1 && <Divider borderColor="gray.50" />}
                  </Box>
                ))}
              </VStack>

              <Divider borderColor="gray.100" />

              {/* ── Legend ── */}
              <Box px={5} py={4}>
                <Text
                  fontSize="10px"
                  color="gray.400"
                  lineHeight="1.8"
                  fontWeight="400"
                >
                  1 Unsatisfactory · 2 Basic
                  <br />3 Proficient · 4 Distinguished
                </Text>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

export default DetailsWalkthrough;
