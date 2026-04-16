import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form, Input, message, Radio } from "antd";
import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import TextArea from "antd/es/input/TextArea";
import { BsEmojiFrown, BsEmojiNeutral, BsEmojiSmile } from "react-icons/bs";
import { EditNoteBook, GetNoteBookForm } from "../../redux/Form/noteBookSlice";
import { getAllTimes } from "../../Utils/auth";

function OB_Notebook() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const FormId = useParams()?.id;

  const { isLoading, formDataList } = useSelector((state) => state?.notebook);

  const [form] = Form.useForm();

  const Fectch = async () => {
    const data = await dispatch(GetNoteBookForm(FormId));
    // Set initial form values
    if (data?.payload) {
      form.setFieldsValue({
        ...data?.payload,
        ...data?.payload?.grenralDetails,
        ...data?.payload?.NotebooksObserver,
        maintenanceOfNotebooks: data?.payload?.TeacherForm?.maintenanceOfNotebooks,
        qualityOfOppurtunities: data?.payload?.TeacherForm?.qualityOfOppurtunities,
        qualityOfTeacherFeedback:
          data?.payload?.TeacherForm?.qualityOfTeacherFeedback,
        qualityOfLearner: data?.payload?.TeacherForm?.qualityOfLearner,
        observerFeedback: data?.payload?.observerFeedback,
      });
    }
  };

  useEffect(() => {
    if (FormId) {
      Fectch();
    }
  }, [dispatch, FormId]);

  const yesNoNAOptions = [
    { value: "0", label: <BsEmojiSmile size={25} /> },
    { value: "1", label: <BsEmojiNeutral size={25} /> },
    { value: "-1", label: <BsEmojiFrown size={25} /> },
  ];

  const generalDetailsConfig = [
    { name: "ClassStrength", label: "Class Strength", type: "input" },
    { name: "NotebooksSubmitted", label: "Notebooks Submitted", type: "input" },
    { name: "Absentees", label: "Absentees", type: "input" },
    { name: "Defaulters", label: "Defaulters", type: "input" },
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
        style={{ marginBottom: "20px" }}
      >
        {inputProps[type]}
      </Form.Item>
    );
  };

  const renderGeneralDetails = () =>
    generalDetailsConfig?.map((item) => (
      <Box key={item.name} w="100%">
        {renderFormItem(item)}
      </Box>
    ));

  const renderGeneralDetails2 = () =>
    generalDetailsConfig2?.map((item) => (
      <Box key={item.name} w="100%">
        {renderFormItem(item)}
      </Box>
    ));

  const RenderRadioFormItem = ({ name, label, question, isTextArea }) => {
    const [showRemark, setShowRemark] = useState(false);

    return (
      <>
        <Form.Item
          className="mb-0"
          name={[...name, "answer"]}
          label={
            <Text fontWeight="600" color="gray.700" fontSize="md" mb={2}>
              {label}
            </Text>
          }
          rules={[{ required: true, message: "Please select an answer!" }]}
        >
          <Radio.Group
            size="large"
            options={yesNoNAOptions.map((value) => ({
              label: value.label,
              value: value.value,
            }))}
            optionType="button"
            buttonStyle="solid"
          />
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
      <VStack spacing={4} align="stretch">
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
            <RenderRadioFormItem
              question
              name={[namePrefix, index]}
              label={question}
              isTextArea={true}
            />
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
      data,
      id: FormId,
    };

    const response = await dispatch(EditNoteBook(payload));
    if (response?.payload && response?.payload?.success) {
      navigate("/notebook-checking-proforma");
      message.success(response?.payload?.message);
    }
  };
  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)" bg="gray.50">
      <Box maxW="800px" mx="auto">
        <Box mb={6}>
          <Heading size="lg" color="gray.800" mb={1}>
            Notebook Checking
          </Heading>
          <Text color="gray.500">
            Evaluate notebook maintenance and grading quality.
          </Text>
        </Box>
        <Form form={form} layout="vertical">
          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
            mb={8}
          >
            <Heading size="md" color="gray.700" mb={6}>
              General Information
            </Heading>
            {renderGeneralDetails()}
          </Box>
          <Box>
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
          </Box>
          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
            mb={8}
          >
            <Heading size="md" color="gray.700" mb={6}>
              Observer Feedback
            </Heading>
            {renderGeneralDetails2()}
          </Box>
          <Flex justify="flex-end" mb={10}>
            <Button
              size="large"
              type="primary"
              onClick={handleNext}
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Submit Evaluation
            </Button>
          </Flex>
        </Form>
      </Box>
    </Box>
  );
}

export default OB_Notebook;
