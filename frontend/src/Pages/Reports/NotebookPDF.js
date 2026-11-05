import React, { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin, Table, Tag, TextArea, message } from "../../Components/UI";
import { DownloadOutlined } from "../../Components/UI/Icons";
import {
  Box,
  Flex,
  SimpleGrid,
  Grid,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
} from "@chakra-ui/react";
import ReactPDF from "@react-pdf/renderer";
import { LOGO_BASE64, BANNER_BASE64 } from "./logoAssets";
import { GetNoteBookForm, EditNoteBook } from "../../redux/Form/noteBookSlice";
import NoteBookDoc from "./Documents/NoteBookDoc";
import { getAllTimes, getUserId } from "../../Utils/auth";
import DynamicScroreThree from "../../Components/DynamicScroreThree";
import { recordFileDownloadAudit } from "../../Utils/auditLogger";
import { Edit3, Check, MessageSquare } from "lucide-react";

const TableCard = React.memo(({ title, dataSource = [] }) => (
  <Box
    bg="white"
    mt={6}
    borderRadius="xl"
    boxShadow="sm"
    borderWidth="1px"
    borderColor="gray.100"
    overflow="hidden"
  >
    <Box
      bg="gray.50"
      px={4}
      py={3}
      borderBottomWidth="1px"
      borderColor="gray.200"
    >
      <Heading size="sm" color="gray.800">
        {title}
      </Heading>
    </Box>
    <Box>
      <Table
        pagination={false}
        dataSource={Array.isArray(dataSource) ? dataSource : []}
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
  </Box>
));

function NotebookPDF() {
  const { id: Id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = getUserId();
  const { formDataList, isLoading } = useSelector((state) => state?.notebook);

  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);

  useEffect(() => {
    if (formDataList?.observerFeedback !== undefined) {
      setFeedbackDraft(formDataList.observerFeedback || "");
    }
  }, [formDataList]);

  const canEdit = Boolean(
    user?.access === "Superadmin" ||
      user?.access === "Admin" ||
      user?.access === "Observer" ||
      user?.id === (formDataList?.grenralDetails?.NameofObserver?._id || formDataList?.grenralDetails?.NameofObserver)
  );

  const handleSaveFeedback = async () => {
    setSavingFeedback(true);
    try {
      const response = await dispatch(
        EditNoteBook({
          id: Id,
          data: { observerFeedback: feedbackDraft },
        })
      );
      if (response?.payload?.success) {
        message.success("Observer comments updated successfully!");
        setIsEditingFeedback(false);
        dispatch(GetNoteBookForm(Id));
      } else {
        message.error(response?.payload?.message || "Failed to update comments.");
      }
    } catch (e) {
      console.error(e);
      message.error("Error saving observer comments.");
    } finally {
      setSavingFeedback(false);
    }
  };

  const downloadPDF = useCallback(async () => {
    const blob = await ReactPDF.pdf(
      <NoteBookDoc data={formDataList} />,
    ).toBlob();
    const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement("a");
    link.href = url;
    const pdfName = `notebook-checking-proforma-${Id}.pdf`;
    link.download = pdfName;
    link.click();

    // Clean up the object URL
    URL.revokeObjectURL(url);

    recordFileDownloadAudit({
      fileName: pdfName,
      fileType: "PDF",
      module: "Notebook Checking Proforma",
      extraDetails: `Form ID: ${Id}`,
    });
  }, [formDataList, Id]);

  useEffect(() => {
    if (Id) {
      dispatch(GetNoteBookForm(Id));
    }
  }, [Id, dispatch]);

  const notebookSections = [
    { title: "Maintenance Of Notebooks", field: "maintenanceOfNotebooks" },
    { title: "Quality Of Opportunities", field: "qualityOfOppurtunities" },
    { title: "Quality Of Teacher Feedback", field: "qualityOfTeacherFeedback" },
    { title: "Quality Of Learner", field: "qualityOfLearner" },
  ];

  return (
    <Box p={{ base: 4, md: 8 }} minH="100vh" bg="gray.50" position="relative">
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

      <Box maxW="1200px" mx="auto">
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
          <Button
            type="primary"
            size="large"
            onClick={downloadPDF}
            style={{ borderRadius: "8px", background: "#1a4d2e" }}
          >
            <DownloadOutlined /> Download PDF
          </Button>

          {canEdit && (
            <Button
              size="large"
              variant="outline"
              onClick={() => navigate(`/notebook-checking-proforma/edit/${Id}`)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-xl"
            >
              <Edit3 size={16} /> Edit Full Evaluation
            </Button>
          )}
        </Flex>

        <Box
          bg="white"
          p={{ base: 4, md: 8 }}
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Flex
            justify="center"
            gap={8}
            mb={8}
            align="center"
            p={6}
            borderRadius="xl"
            bg="gray.50"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Image
              src={LOGO_BASE64}
              w={{ base: "100px", md: "100px" }}
              h="auto"
              alt="Logo"
            />
            <Image
              src={BANNER_BASE64}
              w={{ base: "200px", md: "400px" }}
              h="auto"
              alt="Banner"
            />
          </Flex>

          <Box mb={8}>
            <Heading size="md" color="gray.800" mb={4}>
              General Details
            </Heading>
            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={4}
              p={6}
              bg="blue.50"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="blue.100"
            >
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Name Of Observer:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.NameofObserver?.name ||
                    formDataList?.createdBy?.name}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Name Of Teacher:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.teacherID?.name ||
                    formDataList?.createdBy?.name}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Grade:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.className}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Section:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.Section}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Subject:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {formDataList?.grenralDetails?.Subject}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="600" color="blue.900" display="inline">
                  Date:{" "}
                </Text>
                <Text display="inline" color="blue.800">
                  {
                    getAllTimes(formDataList?.grenralDetails?.DateOfObservation)
                      .formattedDate2
                  }
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
              <Box>
              <Heading size="sm" color="gray.700" mb={3}>
                Teacher Notebook
              </Heading>
              <SimpleGrid
                columns={2}
                spacing={4}
                p={5}
                bg="teal.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="teal.100"
              >
                <Box>
                  <Text fontWeight="600" color="teal.900" display="inline">
                    Absentees:{" "}
                  </Text>
                  <Text display="inline" color="teal.800">
                    {formDataList?.NotebooksTeacher?.Absentees}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="teal.900" display="inline">
                    Class Strength:{" "}
                  </Text>
                  <Text display="inline" color="teal.800">
                    {formDataList?.NotebooksTeacher?.ClassStrength}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="teal.900" display="inline">
                    Defaulters:{" "}
                  </Text>
                  <Text display="inline" color="teal.800">
                    {formDataList?.NotebooksTeacher?.Defaulters}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="teal.900" display="inline">
                    Submitted:{" "}
                  </Text>
                  <Text display="inline" color="teal.800">
                    {formDataList?.NotebooksTeacher?.NotebooksSubmitted}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>
            <Box>
              <Heading size="sm" color="gray.700" mb={3}>
                Observer Notebook
              </Heading>
              <SimpleGrid
                columns={2}
                spacing={4}
                p={5}
                bg="purple.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="purple.100"
              >
                <Box>
                  <Text fontWeight="600" color="purple.900" display="inline">
                    Absentees:{" "}
                  </Text>
                  <Text display="inline" color="purple.800">
                    {formDataList?.NotebooksObserver?.Absentees}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="purple.900" display="inline">
                    Class Strength:{" "}
                  </Text>
                  <Text display="inline" color="purple.800">
                    {formDataList?.NotebooksObserver?.ClassStrength}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="purple.900" display="inline">
                    Defaulters:{" "}
                  </Text>
                  <Text display="inline" color="purple.800">
                    {formDataList?.NotebooksObserver?.Defaulters}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="600" color="purple.900" display="inline">
                    Submitted:{" "}
                  </Text>
                  <Text display="inline" color="purple.800">
                    {formDataList?.NotebooksObserver?.NotebooksSubmitted}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

          
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
            <Box>
              <Heading
                size="md"
                color="brand.primary"
                mb={4}
                pb={2}
                borderBottom="2px solid"
                borderColor="brand.primary"
              >
                Teacher Response
              </Heading>
              <VStack align="stretch" spacing={0}>
                {notebookSections.map((sec, index) => (
                  <TableCard
                    key={`t-${index}`}
                    title={sec.title}
                    dataSource={formDataList?.TeacherForm?.[sec.field] || []}
                  />
                ))}
              </VStack>
            </Box>

            <Box>
              <Heading
                size="md"
                color="brand.secondary"
                mb={4}
                pb={2}
                borderBottom="2px solid"
                borderColor="brand.secondary"
              >
                Observer Response
              </Heading>
              <VStack align="stretch" spacing={0}>
                {notebookSections.map((sec, index) => (
                  <TableCard
                    key={`o-${index}`}
                    title={sec.title}
                    dataSource={formDataList?.ObserverForm?.[sec.field] || []}
                  />
                ))}
              </VStack>
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: formDataList?.observerComment ? 3 : 2 }} spacing={8} mb={8}>
            <Box
              bg="green.50"
              p={6}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="green.200"
            >
              <Heading size="sm" color="gray.800" mb={3}>
                Teacher Reflection Feedback
              </Heading>
              <Text
                color="gray.700"
                bg="white"
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
              >
                {formDataList?.teacherReflationFeedback || "No feedback"}
              </Text>
            </Box>
            <Box
              bg="blue.50"
              p={6}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="blue.200"
            >
              <Flex align="center" justify="space-between" mb={3}>
                <Flex align="center" gap={2}>
                  <MessageSquare size={16} className="text-blue-700" />
                  <Heading size="sm" color="gray.800">
                    Observer Comments
                  </Heading>
                </Flex>
                {canEdit && !isEditingFeedback && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setFeedbackDraft(formDataList?.observerFeedback || "");
                      setIsEditingFeedback(true);
                    }}
                    className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1.5 p-0"
                  >
                    <Edit3 size={13} />
                    {formDataList?.observerFeedback ? "Edit Comment" : "Add Comment"}
                  </Button>
                )}
              </Flex>

              {isEditingFeedback ? (
                <Box
                  bg="white"
                  p={4}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="blue.300"
                  boxShadow="sm"
                >
                  <TextArea
                    rows={4}
                    value={feedbackDraft}
                    onChange={(e) => setFeedbackDraft(e.target.value)}
                    placeholder="Enter your observation comments, strengths, and recommendations..."
                    className="text-sm rounded-lg mb-3"
                  />
                  <Flex justify="flex-end" gap={2}>
                    <Button
                      size="sm"
                      onClick={() => setIsEditingFeedback(false)}
                      disabled={savingFeedback}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      type="primary"
                      onClick={handleSaveFeedback}
                      loading={savingFeedback}
                      style={{ background: "#1a4d2e" }}
                      className="flex items-center gap-1.5 text-white"
                    >
                      <Check size={14} /> Save Comment
                    </Button>
                  </Flex>
                </Box>
              ) : (
                <Text
                  color={formDataList?.observerFeedback ? "gray.700" : "gray.400"}
                  bg="white"
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                  whiteSpace="pre-wrap"
                  fontStyle={formDataList?.observerFeedback ? "normal" : "italic"}
                >
                  {formDataList?.observerFeedback || "No comments provided."}
                </Text>
              )}
            </Box>
            {formDataList?.observerComment && (
              <Box
                bg="purple.50"
                p={6}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="purple.200"
              >
                <Heading size="sm" color="gray.800" mb={3}>
                  Overview Comments
                </Heading>
                <Text
                  color="gray.700"
                  bg="white"
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                  whiteSpace="pre-wrap"
                >
                  {formDataList.observerComment}
                </Text>
              </Box>
            )}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            <DynamicScroreThree
              col={12}
              formName={formDataList?.TeacherForm}
              className="w-full"
            />
            <DynamicScroreThree
              col={12}
              formName={formDataList?.ObserverForm}
              className="w-full"
            />
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
}

export default NotebookPDF;
