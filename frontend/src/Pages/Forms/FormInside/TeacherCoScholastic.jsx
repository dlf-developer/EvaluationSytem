import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  GetCoScholasticForm,
  TeacherCoScholasticComplete,
} from "../../../redux/Form/coScholasticSlice";
import { getAllTimes, getUserId } from "../../../Utils/auth";
import { Button, Form, Input, message, Spin } from "../../../Components/UI";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Badge,
  Tag,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { CreateActivityApi } from "../../../redux/Activity/activitySlice";
import { GraduationCap, MessageSquare, BookOpen, Check } from "lucide-react";

const { TextArea } = Input;

const MapColor = (Arrmap) => {
  const ans = String(Arrmap?.answer || "");
  if (ans === "1") return { bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5", label: "1 · Unsatisfactory" };
  if (ans === "2") return { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", label: "2 · Basic" };
  if (ans === "3") return { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE", label: "3 · Proficient" };
  if (ans === "4") return { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0", label: "4 · Distinguished" };
  return { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB", label: ans || "N/A" };
};

const TEACHER_FEEDBACK_QUESTIONS = [
  {
    key: 0,
    title: "1. What went well in the classroom?",
    question: "What went well in the classroom and how can you leverage it in future?",
    placeholder: "Share your reflection on the co-scholastic strengths of the activity, student engagement, and how you will leverage these in future sessions…",
  },
  {
    key: 1,
    title: "2. Key learnings from feedback session",
    question: "Describe key learning from your Feedback session",
    placeholder: "Describe the key insights gained from the feedback session and the actionable steps you will take to enhance future activities…",
  },
];

function TeacherCoScholastic() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const FormId = useParams()?.id;
  const [form] = Form.useForm();
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCompleted, setIsCompleted] = useState(false);

  const { isLoading, formDataList } = useSelector(
    (state) => state?.coScholastic
  );

  const fetchData = async () => {
    const data = await dispatch(GetCoScholasticForm(FormId));
    const payload = data?.payload;
    if (payload?.isTeacherCompletes) {
      setIsCompleted(true);
    }

    if (payload?.TeacherFeedback && Array.isArray(payload.TeacherFeedback) && payload.TeacherFeedback.length > 0) {
      const feedbackValues = payload.TeacherFeedback.map((item, idx) => ({
        answer: item?.answer || "",
        question: item?.question || TEACHER_FEEDBACK_QUESTIONS[idx]?.question || "",
      }));
      form.setFieldsValue({ TeacherFeedback: feedbackValues });
    }
  };

  useEffect(() => {
    if (FormId) {
      fetchData();
    }
  }, [dispatch, FormId]);

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const values = form.getFieldsValue();
      const feedbackList = (values.TeacherFeedback || []).map((item, idx) => ({
        answer: item?.answer || "",
        question: TEACHER_FEEDBACK_QUESTIONS[idx]?.question || item?.question || "",
      }));

      const payload = {
        data: {
          isTeacherCompletes: false,
          TeacherFeedback: feedbackList,
          isDraft: true,
        },
        id: FormId,
      };

      const res = await dispatch(TeacherCoScholasticComplete(payload));
      if (res?.payload) {
        message.success("Reflection draft saved successfully!");
      }
    } catch (e) {
      message.error("Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const feedbackList = (values.TeacherFeedback || []).map((item, idx) => ({
        answer: item?.answer || "",
        question: TEACHER_FEEDBACK_QUESTIONS[idx]?.question || item?.question || "",
      }));

      const payload = {
        data: {
          isTeacherCompletes: true,
          TeacherFeedback: feedbackList,
          isDraft: false,
        },
        id: FormId,
      };

      const response = await dispatch(TeacherCoScholasticComplete(payload));
      if (response?.payload?.message || response?.payload?.form) {
        message.success(response?.payload?.message || "Reflection submitted successfully!");

        const receiverId = formDataList?.createdBy?._id;
        const BasicData = formDataList?.grenralDetails;
        const observerMessage = `${BasicData?.NameoftheVisitingTeacher?.name || "Teacher"} has completed the Co-Scholastic reflection for ${BasicData?.className} | ${BasicData?.Section} | ${BasicData?.Subject}.`;
        const teacherMessage = `You have completed your Co-Scholastic reflection for ${BasicData?.className} | ${BasicData?.Section} | ${BasicData?.Subject}.`;
        const activity = {
          observerMessage,
          teacherMessage,
          route: `/co-scholastic/report/${formDataList?._id}`,
          date: new Date(),
          reciverId: receiverId,
          senderId: getUserId()?.id,
          fromNo: 2,
          data: response?.payload,
        };

        dispatch(CreateActivityApi(activity));
        navigate(`/co-scholastic/report/${FormId}`);
      } else {
        message.error(response?.payload?.message || "Failed to submit reflection.");
      }
    } catch (err) {
      message.error("Please answer both reflection questions before submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generalDetails = formDataList?.grenralDetails || {};
  const observationDate = generalDetails?.DateOfObservation
    ? getAllTimes(generalDetails.DateOfObservation).formattedDate2
    : "—";

  const renderCriteriaList = (items = []) => {
    if (!items || items.length === 0) {
      return (
        <Text fontSize="sm" color="gray.400" fontStyle="italic">
          No criteria recorded.
        </Text>
      );
    }

    return (
      <VStack spacing={2.5} align="stretch">
        {items.map((item, index) => {
          const badgeStyle = MapColor(item);
          return (
            <Flex
              key={index}
              justify="space-between"
              align="center"
              p={3}
              bg="gray.50"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="gray.100"
              gap={3}
            >
              <Text fontSize="13px" color="gray.700" fontWeight="500" flex="1">
                {item?.question}
              </Text>
              <Badge
                px={2.5}
                py={1}
                borderRadius="lg"
                fontSize="11px"
                fontWeight="700"
                bg={badgeStyle.bg}
                color={badgeStyle.text}
                borderWidth="1px"
                borderColor={badgeStyle.border}
                flexShrink={0}
              >
                {badgeStyle.label}
              </Badge>
            </Flex>
          );
        })}
      </VStack>
    );
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)" bg="gray.50">
      <Box maxW="1280px" mx="auto" position="relative">
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

        {/* ── Page Header ── */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          mb={6}
          gap={3}
        >
          <Box>
            <Flex align="center" gap={2} mb={1}>
              <Box as={GraduationCap} size={24} color="#1a4d2e" />
              <Heading size="lg" color="gray.800">
                Co-Scholastic Observation — Teacher Reflection
              </Heading>
            </Flex>
            <Text color="gray.500" fontSize="sm">
              Review observer ratings and submit your self-reflection to finalize this observation.
            </Text>
          </Box>
          {isCompleted ? (
            <Flex gap={2} align="center">
              <Tag colorScheme="green" size="lg" borderRadius="full" px={4} py={1.5} fontWeight="700">
                Reflection Submitted
              </Tag>
              <Button
                size="middle"
                onClick={() => navigate(`/co-scholastic/report/${FormId}`)}
                style={{ borderRadius: "8px", fontWeight: 600 }}
              >
                View Full Report
              </Button>
            </Flex>
          ) : (
            <Tag colorScheme="orange" size="lg" borderRadius="full" px={4} py={1.5} fontWeight="700">
              Awaiting Teacher Reflection
            </Tag>
          )}
        </Flex>

        {/* ── Observation Meta Banner ── */}
        <Box
          bg="white"
          p={5}
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          mb={6}
        >
          <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} spacing={4}>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                Teacher
              </Text>
              <Text fontSize="sm" fontWeight="600" color="gray.800" mt={0.5} noOfLines={1}>
                {generalDetails?.NameoftheVisitingTeacher?.name || "—"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                Observer
              </Text>
              <Text fontSize="sm" fontWeight="600" color="gray.800" mt={0.5} noOfLines={1}>
                {formDataList?.createdBy?.name || "Coordinator"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                Class & Section
              </Text>
              <Text fontSize="sm" fontWeight="600" color="gray.800" mt={0.5}>
                {generalDetails?.className || "—"} - {generalDetails?.Section || "—"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                Subject / Activity
              </Text>
              <Text fontSize="sm" fontWeight="600" color="gray.800" mt={0.5} noOfLines={1}>
                {generalDetails?.Subject || "—"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                Date Observed
              </Text>
              <Text fontSize="sm" fontWeight="600" color="gray.800" mt={0.5}>
                {observationDate}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                Observer Grade
              </Text>
              <Badge
                mt={0.5}
                colorScheme={
                  formDataList?.Grade === "A" || formDataList?.Grade === "B"
                    ? "green"
                    : formDataList?.Grade === "C"
                    ? "orange"
                    : "red"
                }
                borderRadius="md"
                px={2}
                py={0.5}
                fontSize="xs"
                fontWeight="800"
              >
                Grade {formDataList?.Grade || "N/A"} ({formDataList?.percentageScore || 0}%)
              </Badge>
            </Box>
          </SimpleGrid>
        </Box>

        {/* ── Two-Column Main Workspace ── */}
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={6} align="start">
          {/* ── Left Column: Active Teacher Reflection Form (Span 7) ── */}
          <Box gridColumn={{ lg: "span 7" }}>
            <Box
              bg="white"
              p={{ base: 5, md: 7 }}
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1.5px"
              borderColor="green.200"
            >
              <Flex align="center" gap={2} mb={2}>
                <Box as={MessageSquare} size={20} color="#1a4d2e" />
                <Heading size="md" color="#1a4d2e" fontWeight="800">
                  Your Reflection & Learning
                </Heading>
              </Flex>
              <Text color="gray.600" fontSize="sm" mb={6}>
                Please respond thoughtfully to both prompts based on the co-scholastic observation and discussion.
              </Text>

              <Form form={form} layout="vertical">
                {TEACHER_FEEDBACK_QUESTIONS.map((q, idx) => (
                  <Box
                    key={q.key}
                    mb={6}
                    p={5}
                    bg="#F4F8F4"
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="#C8DCC9"
                  >
                    <Text fontWeight="700" color="#1a4d2e" fontSize="15px" mb={2}>
                      {q.title}
                    </Text>
                    <Text fontSize="xs" color="gray.600" mb={3} fontStyle="italic">
                      "{q.question}"
                    </Text>

                    <Form.Item
                      name={["TeacherFeedback", idx, "answer"]}
                      rules={[
                        {
                          required: true,
                          message: "Please write your reflection for this prompt.",
                        },
                      ]}
                      className="mb-0"
                    >
                      <TextArea
                        rows={5}
                        placeholder={q.placeholder}
                        className="rounded-xl p-3 border-gray-200 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e]"
                        style={{ fontSize: "14px" }}
                      />
                    </Form.Item>

                    <Form.Item
                      hidden
                      name={["TeacherFeedback", idx, "question"]}
                      initialValue={q.question}
                    >
                      <Input />
                    </Form.Item>
                  </Box>
                ))}

                <Flex justify="space-between" align="center" pt={4} borderTop="1px solid" borderColor="gray.100" gap={3} flexWrap="wrap">
                  <Button
                    size="large"
                    onClick={handleSaveDraft}
                    loading={isSavingDraft}
                    style={{ borderRadius: "10px", fontWeight: 600 }}
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    style={{
                      borderRadius: "10px",
                      background: "#1a4d2e",
                      minWidth: "220px",
                      fontWeight: 700,
                      boxShadow: "0 2px 8px rgba(26,77,46,0.25)",
                    }}
                  >
                    {isCompleted ? "Update Reflection" : "Submit Reflection & Complete Form"}
                  </Button>
                </Flex>
              </Form>
            </Box>
          </Box>

          {/* ── Right Column: Observer Feedback & Criteria Reference (Span 5) ── */}
          <Box gridColumn={{ lg: "span 5" }}>
            <Box
              bg="white"
              p={{ base: 5, md: 6 }}
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Flex align="center" gap={2} mb={4}>
                <Box as={BookOpen} size={18} color="blue.600" />
                <Heading size="sm" color="gray.800" fontWeight="700">
                  Observer Feedback Reference
                </Heading>
              </Flex>

              {/* Observer qualitative feedback notes */}
              {formDataList?.ObserverFeedback && formDataList.ObserverFeedback.length > 0 ? (
                <VStack spacing={3} align="stretch" mb={6}>
                  {formDataList.ObserverFeedback.map((item, index) => (
                    <Box
                      key={index}
                      p={4}
                      bg="blue.50"
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor="blue.100"
                    >
                      <Text color="blue.900" fontWeight="700" fontSize="xs" textTransform="uppercase" mb={1.5}>
                        {item?.question || `Observer Feedback Note ${index + 1}`}
                      </Text>
                      <Text
                        color="gray.800"
                        fontSize="13px"
                        bg="white"
                        p={3}
                        borderRadius="lg"
                        borderWidth="1px"
                        borderColor="blue.100"
                        whiteSpace="pre-wrap"
                      >
                        {item?.answer || "No specific comment provided."}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Box p={4} bg="gray.50" borderRadius="xl" mb={6} textAlign="center">
                  <Text fontSize="xs" color="gray.500">
                    No qualitative observer feedback recorded.
                  </Text>
                </Box>
              )}

              <Divider my={4} borderColor="gray.100" />

              {/* Criteria Score Breakdown Accordion */}
              <Flex align="center" justify="space-between" mb={3}>
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                  Criteria Scorecard Reference
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Click to inspect ratings
                </Text>
              </Flex>

              <Accordion allowMultiple defaultIndex={[0]}>
                <AccordionItem border="none" mb={2}>
                  <h2>
                    <AccordionButton bg="gray.50" borderRadius="lg" _hover={{ bg: "gray.100" }} py={2.5}>
                      <Box as="span" flex="1" textAlign="left" fontSize="xs" fontWeight="700" color="gray.700">
                        Classroom Management ({formDataList?.classroomManagement?.length || 0})
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={3} pt={2}>
                    {renderCriteriaList(formDataList?.classroomManagement)}
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem border="none" mb={2}>
                  <h2>
                    <AccordionButton bg="gray.50" borderRadius="lg" _hover={{ bg: "gray.100" }} py={2.5}>
                      <Box as="span" flex="1" textAlign="left" fontSize="xs" fontWeight="700" color="gray.700">
                        Planning & Execution ({formDataList?.planningAndExecution?.length || 0})
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={3} pt={2}>
                    {renderCriteriaList(formDataList?.planningAndExecution)}
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem border="none" mb={2}>
                  <h2>
                    <AccordionButton bg="gray.50" borderRadius="lg" _hover={{ bg: "gray.100" }} py={2.5}>
                      <Box as="span" flex="1" textAlign="left" fontSize="xs" fontWeight="700" color="gray.700">
                        Student Engagement ({formDataList?.studentEngagement?.length || 0})
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={3} pt={2}>
                    {renderCriteriaList(formDataList?.studentEngagement)}
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem border="none">
                  <h2>
                    <AccordionButton bg="gray.50" borderRadius="lg" _hover={{ bg: "gray.100" }} py={2.5}>
                      <Box as="span" flex="1" textAlign="left" fontSize="xs" fontWeight="700" color="gray.700">
                        Instruction & Facilitation ({formDataList?.instructionAndFacilitation?.length || 0})
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={3} pt={2}>
                    {renderCriteriaList(formDataList?.instructionAndFacilitation)}
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
}

export default TeacherCoScholastic;
