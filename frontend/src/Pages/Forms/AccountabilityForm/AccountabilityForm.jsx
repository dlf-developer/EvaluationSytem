import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, message, Steps } from "antd";
import {
  getSingleAccountability,
  updateAccountabilityForm,
  publishAccountabilityForm,
} from "../../../redux/userSlice";
import { Box, Flex, HStack, Heading, Text, Button, Spinner } from "@chakra-ui/react";
import { SaveOutlined, SendOutlined } from "@ant-design/icons";

import Step1BasicDetails from "./Step1_BasicDetails";
import Step2TeacherScores from "./Step2_TeacherScores";
import Step3ClassResults from "./Step3_ClassResults";
import Step4Summary from "./Step4_Summary";

function AccountabilityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    loadData();
  }, [id, dispatch]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await dispatch(getSingleAccountability(id)).unwrap();
      if (res?.success) {
        setFormValues(res.data);
        form.setFieldsValue({
          ...res.data,
          teachers: res.data.teachers?.map((t) => t._id || t),
        });
      }
    } catch (err) {
      message.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const handleValuesChange = (changedValues, allValues) => {
    setFormValues(allValues);
  };

  const onSaveDraft = async () => {
    setSaving(true);
    try {
      const currentData = form.getFieldsValue(true);
      const res = await dispatch(
        updateAccountabilityForm({ id, data: currentData })
      ).unwrap();
      if (res?.success) {
        message.success("Draft saved successfully");
        setFormValues(res.data);
      }
    } catch (error) {
      message.error("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const onPublish = async () => {
    try {
      await form.validateFields();
      setPublishing(true);
      const currentData = form.getFieldsValue(true);
      const res = await dispatch(
        publishAccountabilityForm({ id, data: currentData })
      ).unwrap();
      if (res?.success) {
        message.success("Report published successfully");
        navigate("/accountability");
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Please fill all required fields before publishing");
      } else {
        message.error("Failed to publish report");
      }
    } finally {
      setPublishing(false);
    }
  };

  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(["formName", "fromDate", "toDate", "teachers"]);
      } else if (currentStep === 1) {
        const teacherScores = form.getFieldValue("teacherScores") || [];
        const scoreFields = [];
        teacherScores.forEach((_, index) => {
          scoreFields.push(["teacherScores", index, "lessonPlanScore"]);
          scoreFields.push(["teacherScores", index, "qualityOfQPScore"]);
        });
        if (scoreFields.length > 0) {
          await form.validateFields(scoreFields);
        }
      } else if (currentStep === 2) {
        const classResults = form.getFieldValue("classResults") || [];
        const resultFields = [];
        classResults.forEach((_, index) => {
          resultFields.push(["classResults", index, "T1DALow"]);
          resultFields.push(["classResults", index, "T1DAHigh"]);
          resultFields.push(["classResults", index, "sparkiesHighest"]);
          resultFields.push(["classResults", index, "Sec"]);
        });
        if (resultFields.length > 0) {
          await form.validateFields(resultFields);
        }
      }
      
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      message.error("Please fill all required fields before proceeding.");
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const steps = [
    {
      title: "Basic Details",
      content: <Step1BasicDetails form={form} formValues={formValues} setFormValues={setFormValues} id={id} />,
    },
    {
      title: "Teacher Scores",
      content: <Step2TeacherScores form={form} formValues={formValues} />,
    },
    {
      title: "Class Results",
      content: <Step3ClassResults form={form} formValues={formValues} />,
    },
    {
      title: "Summary & Text",
      content: <Step4Summary form={form} formValues={formValues} />,
    },
  ];

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="calc(100vh - 72px)">
        <Spinner size="lg" color="brand.primary" thickness="3px" />
      </Flex>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Box maxW="1200px" mx="auto">
        
        {/* Header outside the card */}
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" color="gray.800" mb={1}>
              Accountability Mechanism
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Complete the steps below to finalize the accountability report.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<SaveOutlined />}
              isLoading={saving}
              onClick={onSaveDraft}
              variant="outline"
              colorScheme="blue"
              bg="white"
              borderRadius="md"
            >
              Save Draft
            </Button>
            {currentStep === 3 && (
              <Button
                leftIcon={<SendOutlined />}
                isLoading={publishing}
                onClick={onPublish}
                bg="#4a6741"
                color="white"
                _hover={{ bg: "#3f5937" }}
                borderRadius="md"
              >
                Publish Report
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Steps outside the card */}
        <Box mb={8}>
          <Steps current={currentStep} items={steps} />
        </Box>

        {/* Form content inside the card */}
        <Box bg="white" borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100" p={8}>
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
            initialValues={formValues}
          >
            <Box mb={8}>{steps[currentStep].content}</Box>
          </Form>

          <Flex justify="space-between" mt={8} pt={6} borderTopWidth="1px" borderColor="gray.100">
            <Button
              onClick={prev}
              isDisabled={currentStep === 0}
              variant="ghost"
              colorScheme="gray"
            >
              Previous
            </Button>
            <Button
              onClick={next}
              isDisabled={currentStep === steps.length - 1}
              bg="#4a6741"
              color="white"
              _hover={{ bg: "#3f5937" }}
            >
              Next Step
            </Button>
          </Flex>
        </Box>

      </Box>
    </Box>
  );
}

export default AccountabilityForm;
