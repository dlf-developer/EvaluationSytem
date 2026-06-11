import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, message, Steps, Alert } from "antd";
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
  const [hasRestoredLocal, setHasRestoredLocal] = useState(false);
  const [dbDataSnapshot, setDbDataSnapshot] = useState(null);

  useEffect(() => {
    loadData();
  }, [id, dispatch]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await dispatch(getSingleAccountability(id)).unwrap();
      if (res?.success) {
        const dbData = {
          ...res.data,
          teachers: res.data.teachers?.map((t) => t._id || t),
        };
        
        setDbDataSnapshot(dbData);

        const localDraftStr = localStorage.getItem(`accountability_form_${id}`);
        let dataToUse = dbData;
        let restoredFromLocal = false;

        if (localDraftStr) {
          try {
            const localDraft = JSON.parse(localDraftStr);
            const localTeachersNormalized = localDraft.teachers?.map((t) => t?._id || t) || [];
            const localDraftNormalized = { ...localDraft, teachers: localTeachersNormalized };
            
            const cleanDbData = { ...dbData, teachers: dbData.teachers || [] };
            const cleanLocalData = { ...localDraftNormalized, teachers: localTeachersNormalized };
            
            delete cleanDbData.updatedAt;
            delete cleanDbData.createdAt;
            delete cleanLocalData.updatedAt;
            delete cleanLocalData.createdAt;

            if (JSON.stringify(cleanLocalData) !== JSON.stringify(cleanDbData)) {
              dataToUse = { ...dbData, ...localDraftNormalized };
              restoredFromLocal = true;
            }
          } catch (e) {
            console.error("Error parsing local draft", e);
          }
        }

        setFormValues(dataToUse);
        form.setFieldsValue(dataToUse);
        setHasRestoredLocal(restoredFromLocal);
      }
    } catch (err) {
      message.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDatabase = () => {
    if (dbDataSnapshot) {
      setFormValues(dbDataSnapshot);
      form.setFieldsValue({
        ...dbDataSnapshot,
        teachers: dbDataSnapshot.teachers?.map((t) => t._id || t),
      });
      localStorage.removeItem(`accountability_form_${id}`);
      setHasRestoredLocal(false);
      message.success("Discarded local changes and reverted to database draft.");
    }
  };

  const handleValuesChange = (changedValues, allValues) => {
    setFormValues(allValues);
    localStorage.setItem(`accountability_form_${id}`, JSON.stringify(allValues));
  };

  const onSaveDraft = async (silent = false) => {
    const isSilent = silent === true;
    if (!isSilent) setSaving(true);
    try {
      const currentData = form.getFieldsValue(true);
      const res = await dispatch(
        updateAccountabilityForm({ id, data: currentData })
      ).unwrap();
      if (res?.success) {
        if (!isSilent) message.success("Draft saved successfully");
        const formattedData = {
          ...res.data,
          teachers: res.data.teachers?.map((t) => t._id || t),
        };
        setFormValues(formattedData);
        setDbDataSnapshot(formattedData);
        form.setFieldsValue(formattedData);
        localStorage.setItem(`accountability_form_${id}`, JSON.stringify(formattedData));
        setHasRestoredLocal(false);
      }
    } catch (error) {
      if (!isSilent) message.error("Failed to save draft");
    } finally {
      if (!isSilent) setSaving(false);
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
        localStorage.removeItem(`accountability_form_${id}`);
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
      
      // Auto-save silently to database before moving to next step
      await onSaveDraft(true);

      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      message.error("Please fill all required fields before proceeding.");
    }
  };

  const prev = async () => {
    // Auto-save silently to database before moving to prev step
    await onSaveDraft(true);
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
      content: <Step2TeacherScores form={form} formValues={formValues} id={id} />,
    },
    {
      title: "Class Results",
      content: <Step3ClassResults form={form} formValues={formValues} id={id} />,
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

        {hasRestoredLocal && (
          <Box mb={6}>
            <Alert
              message="Unsaved changes restored"
              description={
                <span>
                  We found unsaved changes in your local browser storage and loaded them.{" "}
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="link"
                    onClick={handleResetToDatabase}
                    style={{ textDecoration: "underline", marginLeft: 4 }}
                  >
                    Reset to Database Version
                  </Button>
                </span>
              }
              type="warning"
              showIcon
              closable
              onClose={() => setHasRestoredLocal(false)}
            />
          </Box>
        )}

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
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={next}
                bg="#4a6741"
                color="white"
                _hover={{ bg: "#3f5937" }}
              >
                Next Step
              </Button>
            ) : (
              <Button
                leftIcon={<SendOutlined />}
                isLoading={publishing}
                onClick={onPublish}
                bg="#4a6741"
                color="white"
                _hover={{ bg: "#3f5937" }}
                borderRadius="md"
              >
                Publish
              </Button>
            )}
          </Flex>
        </Box>

      </Box>
    </Box>
  );
}

export default AccountabilityForm;
