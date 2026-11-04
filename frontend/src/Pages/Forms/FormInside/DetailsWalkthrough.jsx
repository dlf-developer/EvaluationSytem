import React, { useEffect, useState, useMemo, useRef } from "react";
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
} from "../../../Components/UI";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  CreateWalkThrough,
  GetWalkThroughForm,
  EditUpdateClassForm,
} from "../../../redux/Form/classroomWalkthroughSlice";
import {
  getCreateClassSection,
  GetTeacherList,
} from "../../../redux/userSlice";
import { getUserId, getUserRoleTag } from "../../../Utils/auth";
import "./DetailsWalkthrough.css";
import { CreateActivityApi } from "../../../redux/Activity/activitySlice";
import moment from "moment";
import RubricScaleSelector, { RUBRIC_LEVELS } from "../../../Components/Forms/RubricScaleSelector";
import { Check, Sparkles } from "lucide-react";
import { WALKTHROUGH_QUESTIONS } from "./walkthroughQuestions";

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
  const [savedFormId, setSavedFormId] = useState(FormId || null);
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
    dispatch(GetTeacherList());
    fetchClassData();
    if (FormId) {
      setSavedFormId(FormId);
      dispatch(GetWalkThroughForm(FormId)).then(({ payload }) => {
        if (payload) {
          const { isObserverCompleted, isDraft, createdBy, grenralDetails, currentStep } = payload;
          if (isObserverCompleted && !isDraft && createdBy?._id === getUserId().id) {
            navigate(`/classroom-walkthrough/report/${FormId}`);
            return;
          }
          let matchedClass = null;
          if (grenralDetails?.className && newData?.length) {
            matchedClass = newData.find(
              (c) => c._id === grenralDetails.className || c.className === grenralDetails.className
            );
          }
          if (matchedClass) {
            setSectionState(matchedClass);
          }
          form.setFieldsValue({
            ...payload,
            ...grenralDetails,
            className: matchedClass ? matchedClass._id : grenralDetails?.className,
            NameoftheVisitingTeacher: grenralDetails?.NameoftheVisitingTeacher?._id || grenralDetails?.NameoftheVisitingTeacher,
            DateOfObservation: grenralDetails?.DateOfObservation ? moment(grenralDetails.DateOfObservation) : null,
          });
          setFormData(payload);
          if (currentStep !== undefined && currentStep !== null && currentStep >= 0 && currentStep <= 2) {
            setCurrStep(currentStep);
          }
        }
      });
    }
  }, [FormId, dispatch]);

  useEffect(() => {
    if (newData?.length && formData?.grenralDetails?.className) {
      const current = formData.grenralDetails.className;
      const matched = newData.find(
        (c) => c._id === current || c.className === current
      );
      if (matched) {
        setSectionState(matched);
        form.setFieldsValue({ className: matched._id });
      }
    }
  }, [newData, formData]);

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
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [sectionStats, setSectionStats] = useState({
    essentialAggrements: 0,
    planingAndPreparation: 0,
    classRoomEnvironment: 0,
    instruction: 0,
  });
  const [, setFormTick] = useState(0);
  const isCalculatingRef = useRef(false);

  // Subscribe to form store so DetailsWalkthrough re-renders live whenever any answer is selected
  useEffect(() => {
    if (form?._store) {
      return form._store.subscribe(() => {
        setFormTick((t) => t + 1);
      });
    }
  }, [form]);

  const totalQuestions = 27;

  const sections = [
    "essentialAggrements",
    "planingAndPreparation",
    "classRoomEnvironment",
    "instruction",
  ];

  const validValues = ["1", "2", "3", "4"];

  const calculateScore = (changedOrAllValues, maybeAllValues) => {
    if (isCalculatingRef.current) return;
    const formValues =
      maybeAllValues ||
      (changedOrAllValues && !changedOrAllValues.target ? changedOrAllValues : null) ||
      form.getFieldsValue();

    let total = 0;
    let outOf = 0;
    let naCount = 0;
    let answered = 0;
    const progress = {
      essentialAggrements: 0,
      planingAndPreparation: 0,
      classRoomEnvironment: 0,
      instruction: 0,
    };

    sections.forEach((section) => {
      let secAnswered = 0;
      const secData = formValues?.[section];
      if (secData) {
        const items = Array.isArray(secData) ? secData : Object.values(secData);
        items.forEach((item) => {
          const answer = item?.answer;
          if (answer !== undefined && answer !== null && answer !== "") {
            answered++;
            secAnswered++;
          }
          if (validValues.includes(String(answer))) {
            total += parseInt(answer, 10);
            outOf += 4;
          }
          if (["N/A", "NA", "N"].includes(String(answer).trim().toUpperCase())) {
            naCount++;
          }
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

    isCalculatingRef.current = true;
    try {
      form.setFieldsValue({
        totalScores: total,
        scoreOutof: outOf,
        percentageScore: pct,
        Grade: g,
        NumberofParametersNotApplicable: naCount,
      });
    } finally {
      isCalculatingRef.current = false;
    }
  };

  useEffect(() => {
    calculateScore();
  }, [currStep]);

  const resetState = () => setSectionState([]);

  const SectionSubject = (value) => {
    if (value) {
      const filtered = newData.filter((d) => d?._id === value || d?.className === value);
      setSectionState(filtered[0] || null);
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
                variant="outline"
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="10px"
                color="gray.400"
                borderColor="gray.200"
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
        rules={[{ required: true, message: "Please select an evaluation rating!" }]}
      >
        {isTextArea ? (
          <TextArea
            rows={4}
            placeholder="Provide specific, actionable feedback…"
            className="w-full text-sm rounded-xl p-3 border-gray-200 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e]"
          />
        ) : (
          <RubricScaleSelector />
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
    const answeredInSec = sectionStats[namePrefix] || 0;
    const totalInSec = questions.length;
    const isSecComplete = answeredInSec === totalInSec;

    return (
      <Box w="100%" mb={8} id={`section-${namePrefix}`}>
        {/* Section header */}
        <Flex
          align={{ base: "flex-start", sm: "center" }}
          justify="space-between"
          direction={{ base: "column", sm: "row" }}
          gap={3}
          mb={5}
          pb={3}
          borderBottom="2px solid"
          borderColor="rgba(74,103,65,0.18)"
        >
          <Flex align="center" gap={3}>
            <Box
              w="5px"
              h="24px"
              bg="#1a4d2e"
              borderRadius="full"
              flexShrink={0}
            />
            <Heading size="md" color="#1a4d2e" fontWeight="800" letterSpacing="-0.01em">
              {title}
            </Heading>
          </Flex>

          {/* Section progress badge */}
          {namePrefix !== "ObserverFeedback" && (
            <Flex align="center" gap={2}>
              <Badge
                fontSize="xs"
                bg={isSecComplete ? "green.50" : "gray.100"}
                color={isSecComplete ? "green.800" : "gray.600"}
                borderWidth="1px"
                borderColor={isSecComplete ? "green.300" : "gray.200"}
                borderRadius="full"
                px={3}
                py={1}
                fontWeight="700"
                display="inline-flex"
                alignItems="center"
                gap={1.5}
              >
                {isSecComplete ? (
                  <>
                    <Box as={Check} size={13} strokeWidth={3} />
                    Complete ({answeredInSec}/{totalInSec})
                  </>
                ) : (
                  <>
                    {answeredInSec} of {totalInSec} answered
                  </>
                )}
              </Badge>
            </Flex>
          )}
        </Flex>

        <VStack spacing={4} align="stretch">
          {questions.map((question, index) => {
            const currentAnswer = form.getFieldValue([namePrefix, index, "answer"]);
            const isAnswered = currentAnswer !== undefined && currentAnswer !== null && currentAnswer !== "";
            const rubricObj = RUBRIC_LEVELS.find((l) => String(l.value) === String(currentAnswer));

            return (
              <Box
                key={`${namePrefix}${index}`}
                bg="white"
                p={{ base: 4, sm: 5 }}
                borderRadius="2xl"
                borderWidth="1.5px"
                borderColor={isAnswered ? (rubricObj ? rubricObj.border : "rgba(74,103,65,0.3)") : "gray.200"}
                boxShadow={
                  isAnswered
                    ? "0 2px 8px rgba(0,0,0,0.03)"
                    : "0 1px 3px rgba(0,0,0,0.02)"
                }
                _hover={{
                  borderColor: isAnswered ? rubricObj?.activeBorder || "#1a4d2e" : "rgba(74,103,65,0.4)",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
                }}
                transition="all 0.2s ease"
                position="relative"
                overflow="hidden"
              >
                {/* Answered left border accent */}
                {isAnswered && (
                  <Box
                    position="absolute"
                    left="0"
                    top="0"
                    bottom="0"
                    w="4px"
                    bg={rubricObj?.dotColor || "#1a4d2e"}
                  />
                )}

                {/* Question item */}
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
        "Essential Agreements",
        WALKTHROUGH_QUESTIONS.essentialAggrements,
        "essentialAggrements",
      )}
      {renderSections(
        "Planning and Preparation",
        WALKTHROUGH_QUESTIONS.planingAndPreparation,
        "planingAndPreparation",
      )}
      {renderSections(
        "Classroom Environment",
        WALKTHROUGH_QUESTIONS.classRoomEnvironment,
        "classRoomEnvironment",
      )}
      {renderSections(
        "Instruction",
        WALKTHROUGH_QUESTIONS.instruction,
        "instruction",
      )}
    </>
  );

  const renderFinalDetails = () => (
    <>
      {renderSections(
        "Observer Feedback",
        WALKTHROUGH_QUESTIONS.ObserverFeedback,
        "ObserverFeedback",
      )}
    </>
  );

  const enrichWithQuestions = (data) => {
    if (!data) return data;
    const enriched = { ...data };
    Object.keys(WALKTHROUGH_QUESTIONS).forEach((key) => {
      if (enriched[key]) {
        const canonical = WALKTHROUGH_QUESTIONS[key];
        const raw = enriched[key];
        const list = Array.isArray(raw) ? raw : Object.values(raw);
        enriched[key] = list.map((item, idx) => ({
          ...(item || {}),
          question: (item && item.question) || canonical[idx] || "",
        }));
      }
    });
    return enriched;
  };

  /* ─── Navigation ─────────────────────────────────────────────────── */
  const saveDraftData = async (data, targetStep) => {
    const enrichedData = enrichWithQuestions(data);
    const {
      totalScore,
      getOutOfScore,
      percentageScore,
      grade,
      numOfParameters,
    } = calculateScoreFromData(enrichedData);

    let resolvedClassName = enrichedData.className;
    if (enrichedData.className && newData?.length) {
      const matched = newData.find(
        (c) => c._id === enrichedData.className || c.className === enrichedData.className
      );
      if (matched?.className) {
        resolvedClassName = matched.className;
      }
    }

    const payloadData = {
      ...enrichedData,
      className: resolvedClassName,
      totalScores: totalScore,
      scoreOutof: getOutOfScore,
      percentageScore,
      Grade: grade,
      NumberofParametersNotApplicable: numOfParameters,
      isDraft: true,
      currentStep: targetStep !== undefined ? targetStep : currStep,
    };

    try {
      if (savedFormId) {
        await dispatch(EditUpdateClassForm({ id: savedFormId, data: payloadData }));
      } else {
        const res = await dispatch(CreateWalkThrough(payloadData));
        if (res?.payload?.form?._id) {
          setSavedFormId(res.payload.form._id);
        }
      }
    } catch (e) {
      console.error("Draft save error:", e);
    }
  };

  const handleNext = () => {
    form
      .validateFields()
      .then(async (values) => {
        const mergedData = { ...formData, ...values };
        setFormData(mergedData);
        if (currStep < steps.length - 1) {
          await saveDraftData(mergedData, currStep + 1);
          setCurrStep((prev) => prev + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          handleSubmit(mergedData);
        }
      })
      .catch(() => message.error("Please complete all required fields on this step."));
  };

  const handleBack = async () => {
    const currentValues = form.getFieldsValue();
    const mergedData = { ...formData, ...currentValues };
    setFormData(mergedData);
    await saveDraftData(mergedData, currStep - 1);
    setCurrStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calculateScoreFromData = (data) => {
    let total = 0;
    let outOf = 0;
    let naCount = 0;

    sections.forEach((section) => {
      const secData = data?.[section];
      if (secData) {
        const items = Array.isArray(secData) ? secData : Object.values(secData);
        items.forEach((item) => {
          const answer = item?.answer;
          if (validValues.includes(String(answer))) {
            total += parseInt(answer, 10);
            outOf += 4;
          }
          if (["N/A", "NA", "N"].includes(String(answer).trim().toUpperCase())) {
            naCount++;
          }
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
    const enrichedData = enrichWithQuestions(data);
    const {
      totalScore,
      getOutOfScore,
      percentageScore,
      grade,
      numOfParameters,
    } = calculateScoreFromData(enrichedData);

    let resolvedClassName = enrichedData.className;
    if (enrichedData.className && newData?.length) {
      const matched = newData.find(
        (c) => c._id === enrichedData.className || c.className === enrichedData.className
      );
      if (matched?.className) {
        resolvedClassName = matched.className;
      }
    }

    const submissionData = {
      ...enrichedData,
      className: resolvedClassName,
      totalScores: totalScore,
      scoreOutof: getOutOfScore,
      percentageScore,
      Grade: grade,
      NumberofParametersNotApplicable: numOfParameters,
      isDraft: false,
      isFinalSubmit: true,
      isObserverCompleted: true,
      currentStep: 2,
    };

    let response;
    if (savedFormId) {
      response = await dispatch(EditUpdateClassForm({ id: savedFormId, data: submissionData }));
    } else {
      response = await dispatch(CreateWalkThrough(submissionData));
    }

    const formResult = response?.payload?.form || response?.payload?.updatedForm;
    if (response?.payload?.status || response?.payload?.success) {
      const receiverId =
        formResult?.grenralDetails?.NameoftheVisitingTeacher ||
        formResult?.teacherID;
      const BasicData = formResult?.grenralDetails;
      const observerMessage = `You have completed the walkthrough form for ${BasicData?.className} | ${BasicData?.Section} | ${BasicData?.Subject}.`;
      const teacherMessage = `A new walkthrough form has been completed by ${getUserId()?.name} for ${BasicData?.className} | ${BasicData?.Section} | ${BasicData?.Subject}.`;
      const activity = {
        observerMessage,
        teacherMessage,
        route: `/classroom-walkthrough/report/${formResult?._id}`,
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
      navigate(`/classroom-walkthrough/report/${formResult?._id}`);
    } else {
      throw new Error(response?.payload?.message || "Error submitting the form.");
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
                <Flex justify="space-between" align="center" mt={6} pt={4} borderTop="1px solid" borderColor="gray.100" flexWrap="wrap" gap={3}>
                  {currStep > 0 ? (
                    <Button
                      size="large"
                      onClick={handleBack}
                      style={{ borderRadius: "12px", minWidth: "120px", fontWeight: 600 }}
                    >
                      ← Back
                    </Button>
                  ) : (
                    <Box />
                  )}
                  <Flex gap={3} align="center">
                    <Button
                      size="large"
                      onClick={async () => {
                        const values = form.getFieldsValue();
                        const merged = { ...formData, ...values };
                        setFormData(merged);
                        await saveDraftData(merged, currStep);
                        message.success("Draft saved successfully!");
                      }}
                      style={{ borderRadius: "12px", fontWeight: 600 }}
                    >
                      Save Draft
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleNext}
                      style={{
                        borderRadius: "12px",
                        minWidth: "140px",
                        background: "#1a4d2e",
                        border: "none",
                        fontWeight: 700,
                        boxShadow: "0 2px 8px rgba(26, 77, 46, 0.25)",
                      }}
                    >
                      {currStep < steps.length - 1 ? "Next Step →" : "Complete & Submit"}
                    </Button>
                  </Flex>
                </Flex>
              </Form>
            </Spin>
          </Box>

          {/* ── Right: Live Scorecard (sticky) ─────────────────────────── */}
          <Box
            w={{ base: "100%", lg: "320px" }}
            flexShrink={0}
            position={{ base: "static", lg: "sticky" }}
            top="24px"
            alignSelf="flex-start"
            zIndex={10}
          >
            <Box
              bg="white"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="gray.200"
              boxShadow="0 4px 20px rgba(0,0,0,0.06)"
              overflow="hidden"
              maxH="calc(100vh - 48px)"
              overflowY="auto"
            >
              {/* Header with Live indicator */}
              <Flex
                px={5}
                py={3.5}
                bg="#1a4d2e"
                color="white"
                align="center"
                justify="space-between"
              >
                <Flex align="center" gap={2}>
                  <Box as={Sparkles} size={15} color="#EAF0E8" />
                  <Text
                    fontSize="11px"
                    fontWeight="800"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                  >
                    Live Evaluation
                  </Text>
                </Flex>
                <Badge
                  bg="rgba(255,255,255,0.2)"
                  color="white"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  display="inline-flex"
                  alignItems="center"
                  gap={1.5}
                >
                  <Box
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg="#4ADE80"
                    boxShadow="0 0 6px #4ADE80"
                  />
                  ACTIVE
                </Badge>
              </Flex>

              {/* Main Score & Grade Hero */}
              <Box px={5} pt={5} pb={4}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text fontSize="11px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                      Overall Score
                    </Text>
                    <Flex align="baseline" gap={1} mt={0.5}>
                      <Text
                        fontSize="44px"
                        fontWeight="900"
                        color={
                          percentageScore >= 80
                            ? "#1a4d2e"
                            : percentageScore >= 60
                            ? "#D97706"
                            : percentageScore > 0
                            ? "#DC2626"
                            : "gray.300"
                        }
                        lineHeight="1"
                        letterSpacing="-0.02em"
                      >
                        {percentageScore}
                      </Text>
                      <Text fontSize="18px" fontWeight="700" color="gray.400">
                        %
                      </Text>
                    </Flex>
                  </Box>

                  {/* Grade Pill */}
                  <Box textAlign="right">
                    <Text fontSize="11px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="0.05em" mb={1}>
                      Grade
                    </Text>
                    <Badge
                      fontSize="18px"
                      fontWeight="900"
                      px={3.5}
                      py={1}
                      borderRadius="xl"
                      bg={
                        grade === "A"
                          ? "green.50"
                          : grade === "B"
                          ? "blue.50"
                          : grade === "C"
                          ? "orange.50"
                          : grade === "D" || grade === "F"
                          ? "red.50"
                          : "gray.100"
                      }
                      color={
                        grade === "A"
                          ? "green.700"
                          : grade === "B"
                          ? "blue.700"
                          : grade === "C"
                          ? "orange.700"
                          : grade === "D" || grade === "F"
                          ? "red.700"
                          : "gray.400"
                      }
                      borderWidth="1.5px"
                      borderColor={
                        grade === "A"
                          ? "green.300"
                          : grade === "B"
                          ? "blue.300"
                          : grade === "C"
                          ? "orange.300"
                          : grade === "D" || grade === "F"
                          ? "red.300"
                          : "gray.200"
                      }
                    >
                      {grade || "—"}
                    </Badge>
                  </Box>
                </Flex>

                {/* Score Progress Bar */}
                <Box mt={3.5} h="6px" bg="gray.100" borderRadius="full" overflow="hidden">
                  <Box
                    h="100%"
                    w={`${Math.min(percentageScore, 100)}%`}
                    bg={
                      percentageScore >= 80
                        ? "linear-gradient(90deg, #16A34A, #22C55E)"
                        : percentageScore >= 60
                        ? "linear-gradient(90deg, #D97706, #F59E0B)"
                        : percentageScore > 0
                        ? "linear-gradient(90deg, #DC2626, #EF4444)"
                        : "transparent"
                    }
                    borderRadius="full"
                    transition="width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  />
                </Box>
              </Box>

              <Divider borderColor="gray.100" />

              {/* Progress Count (Questions Evaluated) */}
              <Box px={5} py={3.5} bg="#FAFAF8">
                <Flex justify="space-between" align="center" mb={1.5}>
                  <Text fontSize="xs" fontWeight="600" color="gray.600">
                    Evaluation Progress
                  </Text>
                  <Text fontSize="xs" fontWeight="700" color="#1a4d2e">
                    {totalAnswered} / {totalQuestions} ({Math.round((totalAnswered / totalQuestions) * 100)}%)
                  </Text>
                </Flex>
                <Box h="5px" bg="gray.200" borderRadius="full" overflow="hidden">
                  <Box
                    h="100%"
                    w={`${Math.round((totalAnswered / totalQuestions) * 100)}%`}
                    bg="#1a4d2e"
                    borderRadius="full"
                    transition="width 0.3s ease"
                  />
                </Box>
              </Box>

              <Divider borderColor="gray.100" />

              {/* Stat grid */}
              <SimpleGrid columns={2} spacing={2} p={4}>
                <Box bg="gray.50" p={2.5} borderRadius="xl" border="1px solid" borderColor="gray.100">
                  <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">
                    Points Earned
                  </Text>
                  <Text fontSize="md" fontWeight="800" color="#1a4d2e" mt={0.5}>
                    {totalScore} <Text as="span" fontSize="xs" fontWeight="500" color="gray.400">/ {getOutOfScore || "—"}</Text>
                  </Text>
                </Box>

                <Box bg="gray.50" p={2.5} borderRadius="xl" border="1px solid" borderColor="gray.100">
                  <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">
                    Not Applicable
                  </Text>
                  <Text fontSize="md" fontWeight="800" color="gray.700" mt={0.5}>
                    {numOfParameters} <Text as="span" fontSize="xs" fontWeight="500" color="gray.400">items</Text>
                  </Text>
                </Box>
              </SimpleGrid>

              {/* Section Jump Nav (on step 1) */}
              {currStep === 1 && (
                <>
                  <Divider borderColor="gray.100" />
                  <Box px={4} py={3}>
                    <Text fontSize="10px" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                      Jump To Section
                    </Text>
                    <VStack spacing={1.5} align="stretch">
                      {[
                        { key: "essentialAggrements", name: "Essential Agreements", count: 5 },
                        { key: "planingAndPreparation", name: "Planning & Preparation", count: 7 },
                        { key: "classRoomEnvironment", name: "Classroom Environment", count: 5 },
                        { key: "instruction", name: "Instruction", count: 10 },
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

export default DetailsWalkthrough;
