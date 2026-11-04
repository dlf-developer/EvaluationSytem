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
  Spin,
  Space,
} from "../../../Components/UI";
import { SaveOutlined } from "../../../Components/UI/Icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import {
  CreateCoScholastic,
  GetCoScholasticForm,
  EditUpdateCoScholasticForm,
} from "../../../redux/Form/coScholasticSlice";
import {
  getCreateClassSection,
  GetTeacherList,
} from "../../../redux/userSlice";
import { getUserId, getUserRoleTag } from "../../../Utils/auth";
import "./DetailsWalkthrough.css";
import { CreateActivityApi } from "../../../redux/Activity/activitySlice";
import RubricScaleSelector, { RUBRIC_LEVELS } from "../../../Components/Forms/RubricScaleSelector";
import { Check, Sparkles } from "lucide-react";

const { Option } = Select;
const { TextArea } = Input;

/* ─── Grade helpers ────────────────────────────────────────────────── */
const gradeColor = (g) => {
  if (g === "A" || g === "B") return "brand.primary";
  if (g === "C") return "#B45309";
  if (g) return "#B91C1C";
  return "gray.300";
};

function CoScholasticDetails() {
  const [currStep, setCurrStep] = useState(0);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const FormId = useParams()?.id;
  const [activeFormId, setActiveFormId] = useState(FormId);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loading, GetTeachersLists } = useSelector((state) => state?.user);
  const { isLoading } = useSelector((state) => state?.coScholastic);
  const [newData, setNewData] = useState([]);

  const fetchClassData = async () => {
    try {
      const res = await dispatch(getCreateClassSection());
      if (res?.payload?.success) {
        const sorted = (res?.payload?.classDetails || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setNewData(sorted);
        return sorted;
      } else {
        message.error("Failed to fetch class data.");
        return [];
      }
    } catch (error) {
      message.error("An error occurred while fetching class data.");
      return [];
    }
  };

  useEffect(() => {
    dispatch(GetTeacherList());
    fetchClassData().then((classes) => {
      if (FormId) {
        setActiveFormId(FormId);
        dispatch(GetCoScholasticForm(FormId)).then(({ payload }) => {
          if (!payload) return;
          const { isObserverCompleted, createdBy, grenralDetails, currentStep } = payload;
          if (isObserverCompleted && createdBy?._id === getUserId().id) {
            navigate(`/co-scholastic/report/${FormId}`);
            return;
          }

          if (currentStep !== undefined && !isNaN(currentStep)) {
            setCurrStep(Math.min(currentStep, 2));
          }

          // Resolve className to match class ID if possible
          let matchedClass = null;
          if (grenralDetails?.className && classes?.length) {
            matchedClass = classes.find(
              (c) =>
                c._id === grenralDetails.className ||
                c.className === grenralDetails.className,
            );
          }
          if (matchedClass) {
            setSectionState(matchedClass);
          }

          form.setFieldsValue({
            NameoftheVisitingTeacher:
              grenralDetails?.NameoftheVisitingTeacher?._id ||
              grenralDetails?.NameoftheVisitingTeacher,
            DateOfObservation: grenralDetails?.DateOfObservation
              ? moment(grenralDetails.DateOfObservation)
              : null,
            className: matchedClass ? matchedClass._id : grenralDetails?.className,
            Section: grenralDetails?.Section,
            Subject: grenralDetails?.Subject,
            Topic: grenralDetails?.Topic,
            classroomManagement: payload.classroomManagement,
            planningAndExecution: payload.planningAndExecution,
            studentEngagement: payload.studentEngagement,
            instructionAndFacilitation: payload.instructionAndFacilitation,
            ObserverFeedback: payload.ObserverFeedback,
          });

          calculateScore();
        });
      }
    });
  }, [FormId, dispatch, form]);

  const yesNoNAOptions = useMemo(() => ["1", "2", "3", "4", "N/A"], []);

  const steps = useMemo(
    () => [
      { title: "General Details" },
      { title: "Observation Details" },
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
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [sectionStats, setSectionStats] = useState({
    classroomManagement: 0,
    planningAndExecution: 0,
    studentEngagement: 0,
    instructionAndFacilitation: 0,
  });
  const totalQuestions = 12;

  const sections = [
    "classroomManagement",
    "planningAndExecution",
    "studentEngagement",
    "instructionAndFacilitation",
  ];

  const validValues = ["1", "2", "3", "4"];

  const calculateScore = () => {
    const formValues = form.getFieldsValue();
    let total = 0;
    let outOf = 0;
    let naCount = 0;
    let answered = 0;
    const progress = {
      classroomManagement: 0,
      planningAndExecution: 0,
      studentEngagement: 0,
      instructionAndFacilitation: 0,
    };

    sections.forEach((section) => {
      let secAnswered = 0;
      if (formValues[section]) {
        formValues[section].forEach((item) => {
          const answer = item?.answer;
          if (answer !== undefined && answer !== null && answer !== "") {
            answered++;
            secAnswered++;
          }
          if (validValues.includes(answer)) {
            total += parseInt(answer, 10);
            outOf += 4;
          }
          if (["N/A", "NA", "N"].includes(answer)) naCount++;
        });
      }
      progress[section] = secAnswered;
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
    setTotalAnswered(answered);
    setSectionStats(progress);

    form.setFieldsValue({
      totalScores: total,
      scoreOutof: outOf,
      percentageScore: pct,
      Grade: g,
      NumberofParametersNotApplicable: naCount,
    });
  };

  const SectionSubject = (value) => {
    if (value) {
      const filtered = newData.filter((d) => d?._id === value);
      setSectionState(filtered[0]);
    }
    return [];
  };

  /* ─── Render helpers ─────────────────────────────────────────────── */
  const renderRadioFormItem = ({
    name,
    index,
    question,
    isAnswered,
    rubricObj,
    isTextArea,
  }) => (
    <>
      <Flex justify="space-between" align="flex-start" gap={3} mb={3}>
        <Flex align="flex-start" gap={2.5}>
          <Badge
            flexShrink={0}
            fontSize="xs"
            fontWeight="800"
            borderRadius="md"
            bg={isAnswered ? "rgba(26,77,46,0.1)" : "gray.100"}
            color={isAnswered ? "#1a4d2e" : "gray.600"}
            px={2}
            py={0.5}
            mt="2px"
          >
            {String(index + 1).padStart(2, "0")}
          </Badge>
          <Text
            fontSize={{ base: "sm", md: "15px" }}
            color="gray.800"
            fontWeight="600"
            lineHeight="1.5"
          >
            {question}
          </Text>
        </Flex>

        {/* Status indicator on top-right */}
        {!isTextArea && (
          <Box flexShrink={0}>
            {isAnswered && rubricObj ? (
              <Badge
                variant="subtle"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="11px"
                fontWeight="700"
                bg={rubricObj.bg}
                color={rubricObj.activeText}
                borderWidth="1px"
                borderColor={rubricObj.border}
                display="inline-flex"
                alignItems="center"
                gap={1}
              >
                <Box
                  w="6px"
                  h="6px"
                  borderRadius="full"
                  bg={rubricObj.dotColor}
                />
                {rubricObj.title} · {rubricObj.label}
              </Badge>
            ) : (
              <Badge
                variant="subtle"
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="10px"
                fontWeight="600"
                colorScheme="gray"
              >
                Pending
              </Badge>
            )}
          </Box>
        )}
      </Flex>

      <Form.Item
        className="mb-0"
        name={[...name, "answer"]}
        rules={[{ required: true, message: "Please select an evaluation score!" }]}
      >
        {isTextArea ? (
          <TextArea
            rows={4}
            placeholder="Enter detailed observation notes, evidence, or next steps…"
            style={{
              borderRadius: 10,
              fontSize: "14px",
              padding: "10px 14px",
              borderColor: "#E2E8F0",
            }}
          />
        ) : (
          <RubricScaleSelector
            onChange={() => {
              // trigger calculation right after AntD updates
              setTimeout(calculateScore, 0);
            }}
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

  const renderSections = (title, questions, namePrefix) => {
    const secCount = sectionStats[namePrefix] || 0;
    const isAllComplete = secCount === questions.length;

    return (
      <Box w="100%" mb={8} id={`section-${namePrefix}`}>
        {/* Section header */}
        <Flex
          align="center"
          justify="space-between"
          gap={3}
          mb={4}
          pb={3}
          borderBottom="1.5px solid"
          borderColor="rgba(74,103,65,0.15)"
        >
          <Flex align="center" gap={3}>
            <Box
              w="4px"
              h="22px"
              bg={isAllComplete ? "#16A34A" : "brand.primary"}
              borderRadius="full"
              flexShrink={0}
            />
            <Heading size="sm" color="brand.secondary" fontWeight="700">
              {title}
            </Heading>
          </Flex>

          <Badge
            fontSize="11px"
            fontWeight="700"
            colorScheme={isAllComplete ? "green" : secCount > 0 ? "orange" : "gray"}
            variant="subtle"
            borderRadius="full"
            px={3}
            py={0.5}
          >
            {isAllComplete
              ? `✓ Complete (${questions.length}/${questions.length})`
              : `${secCount} of ${questions.length} answered`}
          </Badge>
        </Flex>

        <VStack spacing={3.5} align="stretch">
          {questions.map((question, index) => {
            const currentVal = form.getFieldValue([namePrefix, index, "answer"]);
            const isAnswered = currentVal !== undefined && currentVal !== null && currentVal !== "";
            const rubricObj = RUBRIC_LEVELS.find((l) => l.value === currentVal);

            return (
              <Box
                key={`${namePrefix}${index}`}
                bg="white"
                px={5}
                py={4}
                borderRadius="xl"
                borderWidth="1.5px"
                borderColor={isAnswered ? "rgba(26,77,46,0.18)" : "gray.100"}
                boxShadow={isAnswered ? "0 1px 3px rgba(0,0,0,0.03)" : "none"}
                _hover={{
                  borderColor: "rgba(74,103,65,0.4)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transform: "translateY(-1px)",
                }}
                transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                position="relative"
              >
                {/* Left accent indicator for answered question */}
                {isAnswered && (
                  <Box
                    position="absolute"
                    left="0"
                    top="14px"
                    bottom="14px"
                    w="3.5px"
                    bg={rubricObj?.activeColor || "#1a4d2e"}
                    borderTopRightRadius="md"
                    borderBottomRightRadius="md"
                  />
                )}
                {renderRadioFormItem({
                  name: [namePrefix, index],
                  index,
                  question,
                  isAnswered,
                  rubricObj,
                  isTextArea: currStep === 2,
                })}
              </Box>
            );
          })}
        </VStack>
      </Box>
    );
  };

  const sortedTeachers = useMemo(() => {
    if (!Array.isArray(GetTeachersLists)) return [];
    return [...GetTeachersLists]
      .filter((t) => t?._id !== getUserId()?.id && t?.isActive !== false)
      .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
  }, [GetTeachersLists]);

  const generalDetails = useMemo(
    () => [
      {
        name: "NameoftheVisitingTeacher",
        label: "Name of the Teacher",
        type: "select",
        options: sortedTeachers?.map((item) => ({
          id: item?._id,
          value: item?._id,
          name: `${item?.name} [${getUserRoleTag(item)}]`,
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
    [sortedTeachers, newData, sectionState],
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
                    (option?.label || option?.children || option?.name || "")
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
        "Classroom Management",
        [
          "Class begins on time with smooth transitions and effective time management throughout the session.",
          "Classroom expectations are clearly established; discipline is handled positively to maintain a focused learning environment.",
          "Teacher and learners communicate effectively using English/planned bilingual approach during interactions.",
        ],
        "classroomManagement",
      )}
      {renderSections(
        "Planning & Execution",
        [
          "Activities are well-planned, age-appropriate, and aligned with the intended learning outcomes.",
          "Teacher uses varied resources, spaces, audio-visual aids, and creative strategies to sustain student interest and participation.",
          "Session reflects balanced integration of theory, practical engagement, and meaningful follow-up/home tasks.",
        ],
        "planningAndExecution",
      )}
      {renderSections(
        "Student Engagement & Behavioral Climate",
        [
          "Teacher creates a warm, respectful, and inclusive environment where learners feel safe, valued, and encouraged to participate.",
          "Opportunities are provided for active participation of all learners, including shy and hesitant students, according to their strengths and talents.",
          "Positive reinforcement, engaging warm-ups, and student-friendly interactions help sustain enthusiasm and confidence.",
        ],
        "studentEngagement",
      )}
      {renderSections(
        "Instruction & Facilitation",
        [
          "Instructions are clear, well-paced, and connected to real-life experiences or learner contexts.",
          "Teacher encourages questioning, addresses doubts effectively, and provides constructive feedback/feedforward to enhance learning.",
          "Learning experiences are engaging, experiential, and promote creativity, collaboration, and critical thinking.",
        ],
        "instructionAndFacilitation",
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
      totalScores: total,
      scoreOutof: outOf,
      percentageScore: parseFloat(pct.toFixed(2)),
      Grade: g,
      NumberofParametersNotApplicable: naCount,
    };
  };

  const getStepFields = (step) => {
    if (step === 0) {
      return [
        "NameoftheVisitingTeacher",
        "DateOfObservation",
        "className",
        "Section",
        "Subject",
        "Topic",
      ];
    } else if (step === 1) {
      return [
        "classroomManagement",
        "planningAndExecution",
        "studentEngagement",
        "instructionAndFacilitation",
      ];
    } else if (step === 2) {
      return ["ObserverFeedback"];
    }
    return [];
  };

  // Helper to persist draft to DB
  const persistDraft = async (targetStep) => {
    const values = form.getFieldsValue(true);
    const scoreData = calculateScoreFromData(values);
    const stepToSave = targetStep !== undefined ? targetStep : currStep;

    const basePayload = {
      ...values,
      ...scoreData,
      isDraft: true,
      currentStep: stepToSave,
      isObserverCompleted: false,
      DateOfObservation: values.DateOfObservation
        ? values.DateOfObservation.toDate()
        : new Date(),
    };

    if (activeFormId) {
      await dispatch(
        EditUpdateCoScholasticForm({ id: activeFormId, data: basePayload }),
      );
    } else {
      const res = await dispatch(CreateCoScholastic(basePayload));
      if (res?.payload?.status && res?.payload?.form?._id) {
        const newId = res.payload.form._id;
        setActiveFormId(newId);
        window.history.replaceState(null, "", `/co-scholastic/create/${newId}`);
      }
    }
  };

  /* ─── Navigation ─────────────────────────────────────────────────── */
  const handleNext = async () => {
    try {
      const fields = getStepFields(currStep);
      await form.validateFields(fields);

      setIsSavingDraft(true);
      const nextStep = currStep + 1;
      await persistDraft(nextStep);
      setCurrStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Step validation failed", err);
      message.error("Please complete all required fields on this step.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleBack = async () => {
    if (currStep > 0) {
      setIsSavingDraft(true);
      const prevStep = currStep - 1;
      try {
        await persistDraft(prevStep);
      } catch (e) {
        console.warn("Silent draft save on Back", e);
      } finally {
        setIsSavingDraft(false);
        setCurrStep(prevStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      await persistDraft(currStep);
      message.success("Draft saved successfully to database!");
    } catch (e) {
      console.error("Draft save failed", e);
      message.error("Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setIsSubmitting(true);
      const values = form.getFieldsValue(true);
      const scoreData = calculateScoreFromData(values);

      const submissionData = {
        ...values,
        ...scoreData,
        isDraft: false,
        isObserverCompleted: true,
        currentStep: 2,
        DateOfObservation: values.DateOfObservation
          ? values.DateOfObservation.toDate()
          : new Date(),
      };

      let response;
      if (activeFormId) {
        response = await dispatch(
          EditUpdateCoScholasticForm({ id: activeFormId, data: submissionData }),
        );
      } else {
        response = await dispatch(CreateCoScholastic(submissionData));
      }

      const formResult = response?.payload?.form || response?.payload?.updatedForm;
      const isSuccess =
        response?.payload?.status ||
        response?.payload?.success ||
        Boolean(formResult?._id) ||
        Boolean(activeFormId && !response?.error);

      if (isSuccess) {
        const targetId = formResult?._id || activeFormId;
        const receiverId =
          formResult?.grenralDetails?.NameoftheVisitingTeacher ||
          formResult?.teacherID ||
          values?.NameoftheVisitingTeacher;
        const BasicData = formResult?.grenralDetails || values;

        const observerMessage = `You have completed the Co-Scholastic form for ${BasicData?.className} | ${BasicData?.Section} | ${BasicData?.Subject}.`;
        const teacherMessage = `A new Co-Scholastic form has been completed by ${getUserId()?.name} for ${BasicData?.className} | ${BasicData?.Section} | ${BasicData?.Subject}.`;
        const activity = {
          observerMessage,
          teacherMessage,
          route: `/co-scholastic/report/${targetId}`,
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
        message.success(response?.payload?.message || "Form submitted successfully!");
        navigate(`/co-scholastic/report/${targetId}`);
      } else {
        throw new Error(
          response?.payload?.message || "Error submitting the form.",
        );
      }
    } catch (err) {
      console.error("Submission error:", err);
      const isValidationError = err?.errorFields && err.errorFields.length > 0;
      message.error(
        isValidationError
          ? "Please complete all required fields before submitting."
          : (err?.message || "Error submitting the form.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Main render ────────────────────────────────────────────────── */
  return (
    <Box px={{ base: 4, md: 8 }} py={6} minH="80vh" bg="transparent">
      <Box maxW="1280px" mx="auto">
        {/* Page header */}
        <Box mb={6}>
          <Heading size="lg" color="brand.secondary" fontWeight="800" mb={1}>
            Co-Scholastic Classroom Observation Checklist
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Multi-step observation form with automatic draft saves at every step.
          </Text>
        </Box>

        {/* Stepper */}
        <Box
          mb={8}
          bg="white"
          px={6}
          py={5}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="gray.100"
          boxShadow="0 1px 4px rgba(0,0,0,0.05)"
        >
          <CommonStepper steps={steps} currentStep={currStep} />
        </Box>

        {/* Two-column layout */}
        <Flex direction={{ base: "column", lg: "row" }} gap={6} align="stretch">
          {/* ── Left: form ─────────────────────────────────────────── */}
          <Box flex="1" minW={0}>
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
                <Flex justify="space-between" align="center" mt={6}>
                  <Button
                    size="large"
                    disabled={currStep === 0}
                    onClick={handleBack}
                    style={{ borderRadius: "10px", minWidth: "120px" }}
                  >
                    ← Back
                  </Button>

                  <Space size="middle">
                    <Button
                      size="large"
                      icon={<SaveOutlined />}
                      onClick={handleSaveDraft}
                      loading={isSavingDraft}
                      style={{ borderRadius: "10px" }}
                    >
                      Save Draft
                    </Button>

                    {currStep < steps.length - 1 ? (
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleNext}
                        loading={isSavingDraft}
                        style={{
                          borderRadius: "10px",
                          minWidth: "140px",
                          background: "#4A6741",
                          border: "none",
                          fontWeight: 600,
                        }}
                      >
                        Next →
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        style={{
                          borderRadius: "10px",
                          minWidth: "150px",
                          background: "#1a4d2e",
                          border: "none",
                          fontWeight: 600,
                        }}
                      >
                        Submit Evaluation
                      </Button>
                    )}
                  </Space>
                </Flex>
              </Form>
            </Spin>
          </Box>

          {/* ── Right: score panel (sticky) ─────────────────────────── */}
          <Box w={{ base: "100%", lg: "300px" }} flexShrink={0}>
            <Box
              position={{ base: "relative", lg: "sticky" }}
              top="16px"
              bg="white"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="gray.100"
              boxShadow="0 4px 20px -2px rgba(0,0,0,0.06)"
              overflow="hidden"
            >
              {/* ── Header ── */}
              <Box px={5} pt={5} pb={4} bg="linear-gradient(180deg, #F9FBF8 0%, #FFFFFF 100%)">
                <Flex align="center" justify="space-between" mb={3}>
                  <Flex align="center" gap={1.5}>
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg="#16A34A"
                      boxShadow="0 0 0 3px rgba(22, 163, 74, 0.2)"
                    />
                    <Text
                      fontSize="11px"
                      fontWeight="800"
                      color="brand.primary"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                    >
                      Live Scorecard
                    </Text>
                  </Flex>
                  <Badge
                    fontSize="10px"
                    fontWeight="700"
                    colorScheme={currStep === 1 ? "green" : "gray"}
                    borderRadius="full"
                    px={2}
                    py={0.5}
                  >
                    {currStep === 1 ? "Step 2 of 3" : currStep === 0 ? "Step 1 of 3" : "Step 3 of 3"}
                  </Badge>
                </Flex>

                {/* Big percentage display with dynamic grade badge */}
                <Flex align="baseline" justify="space-between" mt={1}>
                  <Flex align="baseline" gap={1}>
                    <Text
                      fontSize="44px"
                      fontWeight="800"
                      color={
                        percentageScore >= 80
                          ? "#16A34A"
                          : percentageScore >= 60
                            ? "#D97706"
                            : percentageScore > 0
                              ? "#DC2626"
                              : "gray.300"
                      }
                      lineHeight="1"
                      letterSpacing="-0.03em"
                      transition="color 0.3s"
                    >
                      {percentageScore || "0"}
                    </Text>
                    <Text
                      fontSize="20px"
                      fontWeight="700"
                      color="gray.400"
                    >
                      %
                    </Text>
                  </Flex>

                  {/* Dynamic Grade Pill */}
                  <Box>
                    {grade ? (
                      <Badge
                        fontSize="13px"
                        fontWeight="800"
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg={
                          grade === "A"
                            ? "green.50"
                            : grade === "B"
                              ? "blue.50"
                              : grade === "C"
                                ? "orange.50"
                                : "red.50"
                        }
                        color={
                          grade === "A"
                            ? "#16A34A"
                            : grade === "B"
                              ? "#2563EB"
                              : grade === "C"
                                ? "#D97706"
                                : "#DC2626"
                        }
                        borderWidth="1px"
                        borderColor="currentColor"
                      >
                        Grade {grade}
                      </Badge>
                    ) : (
                      <Badge
                        fontSize="11px"
                        fontWeight="600"
                        colorScheme="gray"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                      >
                        No Grade
                      </Badge>
                    )}
                  </Box>
                </Flex>

                {/* Evaluation Progress Bar */}
                <Box mt={3.5}>
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <Text fontSize="11px" fontWeight="600" color="gray.500">
                      Evaluation Progress
                    </Text>
                    <Text fontSize="11px" fontWeight="700" color="#1a4d2e">
                      {totalAnswered} / {totalQuestions} answered
                    </Text>
                  </Flex>
                  <Box
                    h="6px"
                    bg="gray.100"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="100%"
                      w={`${(totalAnswered / totalQuestions) * 100}%`}
                      bg={
                        totalAnswered === totalQuestions
                          ? "#16A34A"
                          : totalAnswered > 0
                            ? "#4A6741"
                            : "transparent"
                      }
                      borderRadius="full"
                      transition="width 0.4s ease, background 0.3s"
                    />
                  </Box>
                </Box>
              </Box>

              <Divider borderColor="gray.100" />

              {/* ── Stat rows ── */}
              <Box px={5} py={3.5}>
                <SimpleGrid columns={2} spacing={3}>
                  <Box
                    p={2.5}
                    bg="gray.50"
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="gray.100"
                  >
                    <Text fontSize="11px" color="gray.500" fontWeight="600">
                      Points Earned
                    </Text>
                    <Flex align="baseline" gap={1} mt={0.5}>
                      <Text fontSize="18px" fontWeight="800" color="#1a4d2e">
                        {totalScore}
                      </Text>
                      <Text fontSize="12px" fontWeight="600" color="gray.400">
                        / {getOutOfScore || "—"}
                      </Text>
                    </Flex>
                  </Box>
                  <Box
                    p={2.5}
                    bg="gray.50"
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="gray.100"
                  >
                    <Text fontSize="11px" color="gray.500" fontWeight="600">
                      Not Applicable
                    </Text>
                    <Flex align="baseline" gap={1} mt={0.5}>
                      <Text fontSize="18px" fontWeight="800" color="gray.700">
                        {numOfParameters}
                      </Text>
                      <Text fontSize="11px" fontWeight="500" color="gray.400">
                        items
                      </Text>
                    </Flex>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Jump to section (Step 1 only) */}
              {currStep === 1 && (
                <>
                  <Divider borderColor="gray.100" />
                  <Box px={4} py={3}>
                    <Text fontSize="10px" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                      Jump To Section
                    </Text>
                    <VStack spacing={1.5} align="stretch">
                      {[
                        { key: "classroomManagement", name: "Classroom Management", count: 3 },
                        { key: "planningAndExecution", name: "Planning & Execution", count: 3 },
                        { key: "studentEngagement", name: "Student Engagement", count: 3 },
                        { key: "instructionAndFacilitation", name: "Instruction & Facilitation", count: 3 },
                      ].map((sec) => {
                        const secDone = sectionStats[sec.key] || 0;
                        const isComplete = secDone === sec.count;

                        return (
                          <Flex
                            key={sec.key}
                            as="button"
                            type="button"
                            onClick={() => {
                              document.getElementById(`section-${sec.key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            justify="space-between"
                            align="center"
                            px={2.5}
                            py={1.5}
                            borderRadius="lg"
                            fontSize="xs"
                            fontWeight="600"
                            color={isComplete ? "#1a4d2e" : "gray.600"}
                            bg={isComplete ? "green.50" : "transparent"}
                            _hover={{ bg: isComplete ? "green.100" : "gray.50" }}
                            transition="background 0.15s ease"
                            textAlign="left"
                            w="full"
                          >
                            <Text noOfLines={1} flex="1">
                              {sec.name}
                            </Text>
                            <Badge
                              fontSize="10px"
                              fontWeight="700"
                              colorScheme={isComplete ? "green" : "gray"}
                              borderRadius="full"
                              px={1.5}
                            >
                              {isComplete ? `${sec.count}/${sec.count} ✓` : `${secDone}/${sec.count}`}
                            </Badge>
                          </Flex>
                        );
                      })}
                    </VStack>
                  </Box>
                </>
              )}

              <Divider borderColor="gray.100" />

              {/* Rubric Quick Guide */}
              <Box px={4} py={3} bg="gray.50">
                <Text fontSize="10px" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="0.05em" mb={1.5}>
                  Rubric Scoring Scale
                </Text>
                <SimpleGrid columns={2} spacing={1.5}>
                  <Flex align="center" gap={1.5}>
                    <Box w="8px" h="8px" borderRadius="full" bg="#EF4444" />
                    <Text fontSize="10px" color="gray.600" fontWeight="600">1: Unsatisfactory</Text>
                  </Flex>
                  <Flex align="center" gap={1.5}>
                    <Box w="8px" h="8px" borderRadius="full" bg="#F59E0B" />
                    <Text fontSize="10px" color="gray.600" fontWeight="600">2: Basic</Text>
                  </Flex>
                  <Flex align="center" gap={1.5}>
                    <Box w="8px" h="8px" borderRadius="full" bg="#3B82F6" />
                    <Text fontSize="10px" color="gray.600" fontWeight="600">3: Proficient</Text>
                  </Flex>
                  <Flex align="center" gap={1.5}>
                    <Box w="8px" h="8px" borderRadius="full" bg="#16A34A" />
                    <Text fontSize="10px" color="gray.600" fontWeight="600">4: Distinguished</Text>
                  </Flex>
                </SimpleGrid>
                <Flex align="center" gap={1.5} mt={1}>
                  <Box w="8px" h="8px" borderRadius="full" bg="#64748B" />
                  <Text fontSize="10px" color="gray.500" fontWeight="500">N/A: Excluded from score</Text>
                </Flex>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

export default CoScholasticDetails;
