import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  EditNoteBook,
  GetNoteBookForm,
} from "../../redux/Form/noteBookSlice";
import { Button, Form, Input, message, Spin, TextArea } from "../../Components/UI";
import {
  Box,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { getUserId } from "../../Utils/auth";
import ChoiceScaleSelector from "../../Components/Forms/ChoiceScaleSelector";
import {
  BookOpen,
  BookCheck,
  Users,
  UserX,
  AlertTriangle,
  ChevronLeft,
  Check,
  Clock,
  UserCheck,
  MessageSquare,
  Sparkles,
  GraduationCap,
} from "lucide-react";

const SCALE_OPTIONS = ["1", "2", "3", "N/A"];

const SECTIONS_CONFIG = [
  {
    title: "Maintenance Of Notebooks",
    namePrefix: "maintenanceOfNotebooks",
    icon: <BookCheck size={20} />,
    accent: "#1a4d2e",
    questions: [
      "I have checked that NBs are in a good physical condition.",
      "I have checked that the work presentation is neat.",
      "I have ensured that the work of the learners is complete.",
      "I have checked the appropriateness of Headings / CW / HW.",
      "There is no scribbling on the last page/any pages thereof.",
      "I have ensured that the child has implemented the previous feedback and done the correction work.",
    ],
  },
  {
    title: "Quality Of Opportunities",
    namePrefix: "qualityOfOppurtunities",
    icon: <Sparkles size={20} />,
    accent: "#2563EB",
    questions: [
      "I have provided HOTs and VBQs with every chapter.",
      "I have made app. remarks about the quality of answers.",
      "I have developed vocab of students (pre-post activities).",
      "I have taken up at least 2 CSPs fortnightly with clear LOs.",
      "The quality questions given by me offer a scope for original thinking by learners.",
      "The writing tasks / questions given by me provide a scope for independent encounters.",
    ],
  },
  {
    title: "Quality Of Teacher Feedback",
    namePrefix: "qualityOfTeacherFeedback",
    icon: <MessageSquare size={20} />,
    accent: "#D97706",
    questions: [
      "I have provided timely and regular feedback.",
      "I have corrected all the notebook work.",
      "I have provided positive reinforcement.",
      "I have provided personalized feedback.",
      "My feedback provides learners directions for improvement.",
      "My feedback facilitates learners with clear directions on what good work looks like.",
    ],
  },
  {
    title: "Quality Of Learner",
    namePrefix: "qualityOfLearner",
    icon: <GraduationCap size={20} />,
    accent: "#7C3AED",
    questions: [
      "I have checked / addressed the common misconceptions",
      "I have given remarks if the answers are copied or if there are common errors.",
    ],
  },
];

function OB_Notebook() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const FormId = useParams()?.id;

  const { isLoading, formDataList } = useSelector((state) => state?.notebook);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchFormData = async () => {
    try {
      const res = await dispatch(GetNoteBookForm(FormId));
      const data = res?.payload;
      if (data) {
        form.setFieldsValue({
          ClassStrength:
            data?.NotebooksObserver?.ClassStrength ||
            data?.NotebooksTeacher?.ClassStrength ||
            "",
          NotebooksSubmitted:
            data?.NotebooksObserver?.NotebooksSubmitted ||
            data?.NotebooksTeacher?.NotebooksSubmitted ||
            "",
          Absentees:
            data?.NotebooksObserver?.Absentees ||
            data?.NotebooksTeacher?.Absentees ||
            "",
          Defaulters:
            data?.NotebooksObserver?.Defaulters ||
            data?.NotebooksTeacher?.Defaulters ||
            "",
          maintenanceOfNotebooks:
            data?.ObserverForm?.maintenanceOfNotebooks ||
            data?.TeacherForm?.maintenanceOfNotebooks ||
            [],
          qualityOfOppurtunities:
            data?.ObserverForm?.qualityOfOppurtunities ||
            data?.TeacherForm?.qualityOfOppurtunities ||
            [],
          qualityOfTeacherFeedback:
            data?.ObserverForm?.qualityOfTeacherFeedback ||
            data?.TeacherForm?.qualityOfTeacherFeedback ||
            [],
          qualityOfLearner:
            data?.ObserverForm?.qualityOfLearner ||
            data?.TeacherForm?.qualityOfLearner ||
            [],
          observerFeedback:
            data?.observerFeedback || data?.observerComment || "",
        });
      }
    } catch (err) {
      console.error("Failed to load notebook form:", err);
      message.error("Error loading notebook form details.");
    }
  };

  useEffect(() => {
    if (FormId) {
      fetchFormData();
    }
  }, [dispatch, FormId]);

  const observerUser = formDataList?.grenralDetails?.NameofObserver;
  const loggedInUser = getUserId();
  const canAddComment = Boolean(
    loggedInUser?.canAddNotebookComment === true ||
      loggedInUser?.canAddNotebookComment === "true" ||
      observerUser?.canAddNotebookComment === true ||
      observerUser?.canAddNotebookComment === "true"
  );

  const teacherName =
    formDataList?.teacherID?.name ||
    formDataList?.createdBy?.name ||
    formDataList?.grenralDetails?.teacherIDs?.name ||
    "Assigned Teacher";
  const className = formDataList?.grenralDetails?.className || "-";
  const section = formDataList?.grenralDetails?.Section || "";
  const subject = formDataList?.grenralDetails?.Subject || "-";
  const isTeacherComplete = Boolean(formDataList?.isTeacherComplete);

  const handleNext = () => {
    form
      .validateFields()
      .then((values) => {
        handleSubmit(values);
      })
      .catch((err) => {
        console.error("Validation error:", err);
        message.error("Please fill in all required attendance stats and criteria ratings.");
      });
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        data: { ...values, isObserverComplete: true },
        id: FormId,
      };
      const response = await dispatch(EditNoteBook(payload));
      if (response?.payload?.success) {
        navigate("/notebook-checking-proforma");
        message.success(response?.payload?.message || "Notebook Evaluation updated successfully!");
      } else {
        message.error(response?.payload?.message || "Failed to update evaluation.");
      }
    } catch (error) {
      console.error("Error updating notebook evaluation:", error);
      message.error("Error updating notebook evaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  // Render teacher's self-evaluation preview
  const renderTeacherResponse = (teacherData) => {
    const hasResponse = Boolean(teacherData?.answer);
    if (!hasResponse) {
      return (
        <Box
          p={3.5}
          bg="gray.50"
          borderRadius="xl"
          border="1px dashed"
          borderColor="gray.200"
          h="full"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Flex align="center" gap={1.5} color="gray.400" mb={1}>
            <Clock size={13} />
            <Text
              fontSize="11px"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              Teacher Response
            </Text>
          </Flex>
          <Text fontSize="xs" color="gray.500" fontStyle="italic">
            Awaiting teacher self-assessment
          </Text>
        </Box>
      );
    }

    const ratingTheme = {
      "1": {
        bg: "#FEF2F2",
        text: "#991B1B",
        border: "#FCA5A5",
        label: "1 • Unsatisfactory",
      },
      "2": {
        bg: "#FFFBEB",
        text: "#92400E",
        border: "#FDE68A",
        label: "2 • Basic",
      },
      "3": {
        bg: "#EFF6FF",
        text: "#1E40AF",
        border: "#BFDBFE",
        label: "3 • Proficient",
      },
      "N/A": {
        bg: "#F8FAFC",
        text: "#475569",
        border: "#E2E8F0",
        label: "N/A",
      },
    }[teacherData.answer] || {
      bg: "#F1F5F9",
      text: "#334155",
      border: "#CBD5E1",
      label: teacherData.answer,
    };

    return (
      <Box
        p={3.5}
        bg="blue.50"
        borderRadius="xl"
        border="1px solid"
        borderColor="blue.100"
        h="full"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Flex align="center" justify="space-between" mb={1.5}>
            <Flex align="center" gap={1.5} color="blue.700">
              <UserCheck size={13} />
              <Text
                fontSize="11px"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Teacher Self-Assessment
              </Text>
            </Flex>
            <Badge
              px={2}
              py={0.5}
              borderRadius="md"
              fontSize="xs"
              fontWeight="700"
              style={{
                background: ratingTheme.bg,
                color: ratingTheme.text,
                border: `1px solid ${ratingTheme.border}`,
              }}
            >
              {ratingTheme.label}
            </Badge>
          </Flex>
        </Box>

        {teacherData?.remark ? (
          <Box
            p={2}
            bg="white"
            borderRadius="md"
            borderLeft="3px solid"
            borderColor="blue.400"
            fontSize="xs"
            color="gray.600"
          >
            <Text
              fontWeight="600"
              color="gray.500"
              fontSize="10px"
              textTransform="uppercase"
            >
              Teacher Remark:
            </Text>
            <Text fontStyle="italic">"{teacherData.remark}"</Text>
          </Box>
        ) : (
          <Text fontSize="11px" color="gray.400" fontStyle="italic">
            No remark provided
          </Text>
        )}
      </Box>
    );
  };

  // Render question with ChoiceScaleSelector and Remark toggle
  const RenderRadioFormItem = ({ name, question }) => {
    const [showRemark, setShowRemark] = useState(false);

    return (
      <Box>
        <Form.Item
          name={[...name, "answer"]}
          rules={[{ required: true, message: "Please select a rating!" }]}
          className="mb-2"
        >
          <ChoiceScaleSelector options={SCALE_OPTIONS} size="large" />
        </Form.Item>

        <Form.Item
          className="hidden"
          hidden
          name={[...name, "question"]}
          initialValue={question}
        >
          <Input />
        </Form.Item>

        <Flex align="center" gap={2} mt={2}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowRemark(!showRemark)}
            className="text-xs text-brand-700 hover:text-brand-900 flex items-center gap-1.5 p-0"
          >
            <MessageSquare size={13} />
            {showRemark ? "Hide Remark" : "Add Remark"}
          </Button>
        </Flex>

        {showRemark && (
          <Form.Item
            name={[...name, "remark"]}
            rules={[{ required: false }]}
            className="mt-3 mb-0"
          >
            <TextArea
              rows={2}
              placeholder="Add your observation remark for this criteria..."
              className="text-sm rounded-lg"
            />
          </Form.Item>
        )}
      </Box>
    );
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
          {/* Top Header & Context Metadata Banner */}
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={4}
            mb={6}
          >
            <Box>
              <Flex align="center" gap={2} mb={1}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/notebook-checking-proforma")}
                  className="text-gray-500 hover:text-gray-800 flex items-center gap-1.5 p-0"
                >
                  <ChevronLeft size={16} />
                  Back to All Notebook Forms
                </Button>
              </Flex>
              <Heading size="lg" color="gray.800" fontWeight="700">
                Edit Notebook Checking Proforma
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={0.5}>
                Update notebook maintenance, grading quality, and teacher feedback
              </Text>
            </Box>

            {/* Quick Meta Chips */}
            <Flex wrap="wrap" gap={2}>
              <Badge
                px={3}
                py={1.5}
                borderRadius="full"
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                color="gray.700"
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                <Users size={13} className="text-emerald-700" />
                Teacher: <b>{teacherName}</b>
              </Badge>
              <Badge
                px={3}
                py={1.5}
                borderRadius="full"
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                color="gray.700"
              >
                Class: <b>{className} {section}</b>
              </Badge>
              <Badge
                px={3}
                py={1.5}
                borderRadius="full"
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                color="gray.700"
              >
                Subject: <b>{subject}</b>
              </Badge>
              <Badge
                px={3}
                py={1.5}
                borderRadius="full"
                bg={isTeacherComplete ? "green.50" : "amber.50"}
                color={isTeacherComplete ? "green.700" : "amber.700"}
                borderWidth="1px"
                borderColor={isTeacherComplete ? "green.200" : "amber.200"}
              >
                {isTeacherComplete
                  ? "Teacher Submitted"
                  : "Awaiting Teacher Evaluation"}
              </Badge>
            </Flex>
          </Flex>

          {/* Notebook & Attendance Statistics Card */}
          <Box
            bg="white"
            p={{ base: 5, md: 6 }}
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
            mb={8}
          >
            <Flex
              align="center"
              justify="space-between"
              mb={4}
              pb={3}
              borderBottom="1px solid"
              borderColor="gray.100"
            >
              <Flex align="center" gap={2.5}>
                <Box p={2} bg="emerald.50" color="#1a4d2e" borderRadius="lg">
                  <BookOpen size={18} />
                </Box>
                <Box>
                  <Heading size="sm" color="gray.800">
                    Notebook Statistics & Attendance
                  </Heading>
                  <Text fontSize="xs" color="gray.500">
                    Record student attendance and notebook submissions for this evaluation session
                  </Text>
                </Box>
              </Flex>
            </Flex>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
              <Box
                p={4}
                bg="gray.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Flex align="center" gap={2} mb={2}>
                  <Users size={16} className="text-gray-500" />
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.600"
                    textTransform="uppercase"
                  >
                    Class Strength *
                  </Text>
                </Flex>
                <Form.Item
                  name="ClassStrength"
                  rules={[{ required: true, message: "Required" }]}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    type="number"
                    placeholder="e.g. 40"
                    className="bg-white"
                  />
                </Form.Item>
              </Box>

              <Box
                p={4}
                bg="gray.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Flex align="center" gap={2} mb={2}>
                  <BookCheck size={16} className="text-emerald-600" />
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.600"
                    textTransform="uppercase"
                  >
                    Notebooks Submitted *
                  </Text>
                </Flex>
                <Form.Item
                  name="NotebooksSubmitted"
                  rules={[{ required: true, message: "Required" }]}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    type="number"
                    placeholder="e.g. 36"
                    className="bg-white"
                  />
                </Form.Item>
              </Box>

              <Box
                p={4}
                bg="gray.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Flex align="center" gap={2} mb={2}>
                  <UserX size={16} className="text-amber-600" />
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.600"
                    textTransform="uppercase"
                  >
                    Absentees *
                  </Text>
                </Flex>
                <Form.Item
                  name="Absentees"
                  rules={[{ required: true, message: "Required" }]}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    type="number"
                    placeholder="e.g. 3"
                    className="bg-white"
                  />
                </Form.Item>
              </Box>

              <Box
                p={4}
                bg="gray.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Flex align="center" gap={2} mb={2}>
                  <AlertTriangle size={16} className="text-red-500" />
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.600"
                    textTransform="uppercase"
                  >
                    Defaulters *
                  </Text>
                </Flex>
                <Form.Item
                  name="Defaulters"
                  rules={[{ required: true, message: "Required" }]}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    type="number"
                    placeholder="e.g. 1"
                    className="bg-white"
                  />
                </Form.Item>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Evaluation Sections */}
          {SECTIONS_CONFIG.map((sec) => (
            <Box key={sec.namePrefix} mb={8}>
              {/* Section Header Banner */}
              <Flex
                align="center"
                justify="space-between"
                bg="white"
                p={4}
                px={6}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
                boxShadow="sm"
                mb={4}
              >
                <Flex align="center" gap={3}>
                  <Box
                    p={2.5}
                    bg="emerald.50"
                    color="#1a4d2e"
                    borderRadius="lg"
                  >
                    {sec.icon}
                  </Box>
                  <Box>
                    <Heading size="md" color="gray.800" fontWeight="700">
                      {sec.title}
                    </Heading>
                    <Text fontSize="xs" color="gray.500">
                      Evaluate all {sec.questions.length} criteria on a scale of 1 to 3, or N/A
                    </Text>
                  </Box>
                </Flex>
                <Badge
                  colorScheme="green"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="600"
                >
                  {sec.questions.length} Criteria
                </Badge>
              </Flex>

              {/* Question Cards */}
              <VStack spacing={4} align="stretch">
                {sec.questions.map((question, index) => (
                  <Box
                    key={`${sec.namePrefix}_${index}`}
                    bg="white"
                    p={{ base: 4, md: 5 }}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="gray.200"
                    boxShadow="sm"
                    _hover={{ borderColor: "brand.300", boxShadow: "md" }}
                    transition="all 0.18s ease-in-out"
                  >
                    <SimpleGrid
                      columns={{ base: 1, lg: 12 }}
                      spacing={5}
                      alignItems="center"
                    >
                      {/* Left: Question + Rating (8 columns on desktop) */}
                      <Box gridColumn={{ lg: "span 8" }}>
                        <Flex align="flex-start" gap={3} mb={3}>
                          <Badge
                            bg="gray.100"
                            color="gray.700"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                            fontSize="xs"
                            fontWeight="700"
                            mt={0.5}
                          >
                            #{index + 1}
                          </Badge>
                          <Text
                            fontWeight="600"
                            color="gray.800"
                            fontSize="15px"
                            lineHeight="1.4"
                          >
                            {question}
                          </Text>
                        </Flex>

                        <RenderRadioFormItem
                          name={[sec.namePrefix, index]}
                          question={question}
                        />
                      </Box>

                      {/* Right: Teacher Response Comparison (4 columns on desktop) */}
                      <Box gridColumn={{ lg: "span 4" }} h="full">
                        {renderTeacherResponse(
                          formDataList?.TeacherForm?.[sec.namePrefix]?.[index]
                        )}
                      </Box>
                    </SimpleGrid>
                  </Box>
                ))}
              </VStack>
            </Box>
          ))}

          {/* Observer Overall Feedback Comments */}
          <Box
            bg="white"
            p={{ base: 5, md: 6 }}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="sm"
            mb={8}
          >
            <Flex align="center" gap={2.5} mb={3}>
              <Box p={2} bg="emerald.50" color="#1a4d2e" borderRadius="lg">
                <MessageSquare size={18} />
              </Box>
              <Box>
                <Heading size="sm" color="gray.800">
                  Observer Evaluation Comments & Recommendations
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Provide holistic qualitative feedback, strengths observed in notebooks, and areas for teacher improvement
                </Text>
              </Box>
            </Flex>
            <Form.Item name="observerFeedback" className="mb-0">
              <TextArea
                rows={4}
                placeholder="Write your comprehensive evaluation comments, strengths observed in notebooks, and actionable areas for improvement..."
                className="rounded-xl p-3 text-sm"
              />
            </Form.Item>
          </Box>

          {/* Bottom Action Footer */}
          <Box
            bg="white"
            p={4}
            px={6}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="0 4px 20px -2px rgba(0,0,0,0.06)"
            mt={8}
          >
            <Flex
              justify="space-between"
              align="center"
              direction={{ base: "column", sm: "row" }}
              gap={4}
            >
              <Button
                variant="outline"
                onClick={() => navigate("/notebook-checking-proforma")}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-xl"
              >
                Cancel & Return to Table
              </Button>

              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                loading={submitting}
                className="bg-brand-800 hover:bg-brand-900 text-white font-semibold px-8 py-2.5 rounded-xl flex items-center gap-2 shadow-sm"
                style={{ background: "#1a4d2e" }}
              >
                <Check size={18} />
                Update Completed Evaluation
              </Button>
            </Flex>
          </Box>
        </Form>
      </Box>
    </Box>
  );
}

export default OB_Notebook;
