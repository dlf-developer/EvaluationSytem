import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCreateClassSection,
  GetObserverList,
  GetTeacherList,
  initiateFromObserver,
  UpdateFromObserver,
  getAllWeeklyFromById,
} from "../../redux/userSlice";
import { useParams, useSearchParams } from "react-router-dom";
import { Form, Select, Button, Input, Radio, message, Space, Card, Tag, Divider, Spin } from "antd";
import { Box, Flex, Heading, Text, SimpleGrid } from "@chakra-ui/react";
import { getUserId } from "../../Utils/auth";
import "./Weekly4Form.css";
import { UserRole } from "../../config/config";
import TextArea from "antd/es/input/TextArea";
import { MinusCircleOutlined, PlusOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { CreateActivityApi } from "../../redux/Activity/activitySlice";
import CommonStepper from "../../Components/CommonStepper";

const QUESTIONS = [
  "I have completed last week's plan.",
  "I have uploaded experiential/active Lesson Plan for the next week that includes triggers/visual or auditory stimulus.",
  "My last corrected work is not beyond a fortnight.",
  "Name of L.O.W. Students with Class & Section.",
  "Name of I Care Forms filled along with reason",
];

const WIZARD_STEPS = [
  { title: "Planning & Lessons", description: "Weekly plans" },
  { title: "Marking & Notebooks", description: "Work correction" },
  { title: "Student Care & L.O.W.", description: "Student support" },
  { title: "Review & Submit", description: "Final verification" },
];

function Weekly4Form() {
  const [isInitiate, setIsInitiate] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const [currStep, setCurrStep] = useState(0);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const dispatch = useDispatch();
  const { GetTeachersLists, GetObserverLists } = useSelector(
    (state) => state.user,
  );
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [classList, setClassList] = useState([]);
  const [ObsereverId, setObsereverId] = useState();
  const routeFormId = useParams().id;
  const [activeFormId, setActiveFormId] = useState(routeFormId);

  const yesNoNAOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
    { value: "N/A", label: "N/A" },
  ];

  const GetImportantDetails = async () => {
    const cls = await dispatch(getCreateClassSection());
    if (cls?.payload?.success) {
      setClassList(cls?.payload?.classDetails || []);
    }
  };

  useEffect(() => {
    const initiateValue = searchParams.get("Initiate");
    if (UserRole[1] === getUserId().access && initiateValue === "true") {
      setIsInitiate(true);
    } else {
      GetImportantDetails();
    }
  }, [searchParams]);

  useEffect(() => {
    if (isInitiate) {
      dispatch(GetTeacherList());
    } else {
      dispatch(GetObserverList());
    }
  }, [isInitiate, dispatch]);

  // Load existing form data if editing / resuming an initiated or draft form
  useEffect(() => {
    if (routeFormId) {
      setActiveFormId(routeFormId);
      setIsLoadingForm(true);
      dispatch(getAllWeeklyFromById(routeFormId))
        .then((res) => {
          if (res?.payload?.success && res?.payload?.form) {
            const formRecord = res.payload.form;
            if (formRecord.currentStep !== undefined && !isNaN(formRecord.currentStep)) {
              setCurrStep(Math.min(formRecord.currentStep, WIZARD_STEPS.length - 1));
            }
            if (formRecord.isInitiated?.Observer) {
              const obs = formRecord.isInitiated.Observer;
              setObsereverId(typeof obs === "object" ? obs._id : obs);
            }
            if (formRecord.FormData && Array.isArray(formRecord.FormData)) {
              form.setFieldsValue({
                FormData: formRecord.FormData,
              });
            }
          }
        })
        .finally(() => {
          setIsLoadingForm(false);
        });
    }
  }, [routeFormId, dispatch, form]);

  const getSectionsForClass = (classId) => {
    if (!classId || !classList?.length) return [];
    const found = classList.find(
      (c) => c._id === classId || c.className === classId,
    );
    return found?.sections || [];
  };

  // Helper to persist draft to DB
  const persistDraft = async (targetStep) => {
    const values = form.getFieldsValue(true);
    const stepToSave = targetStep !== undefined ? targetStep : currStep;
    const basePayload = {
      ...values,
      date: new Date(),
      isDraft: true,
      currentStep: stepToSave,
    };

    if (activeFormId) {
      const payload = {
        id: activeFormId,
        data: {
          ...basePayload,
        },
      };
      await dispatch(UpdateFromObserver(payload));
    } else if (!isInitiate) {
      const payload = {
        ...basePayload,
        isCompleted: false,
        isInitiated: {
          status: false,
          Observer: ObsereverId,
        },
      };
      const res = await dispatch(initiateFromObserver(payload));
      if (res?.payload?.success && res?.payload?.data?._id) {
        const newId = res.payload.data._id;
        setActiveFormId(newId);
        window.history.replaceState(null, "", `/weekly4form/create/${newId}`);
      }
    }
  };

  const validateStepFields = async (step) => {
    if (step === 0) {
      if (!activeFormId && !ObsereverId) {
        message.warning("Please select an Observer before proceeding.");
        return false;
      }
      await form.validateFields([
        ["FormData", 0, "answer"],
        ["FormData", 1, "answer"],
      ]);
      return true;
    } else if (step === 1) {
      await form.validateFields([["FormData", 2, "sections"]]);
      return true;
    } else if (step === 2) {
      await form.validateFields([
        ["FormData", 4, "answer"],
        ["FormData", 4, "textArea"],
      ]);
      return true;
    }
    return true;
  };

  const handleNext = async () => {
    try {
      const isValid = await validateStepFields(currStep);
      if (!isValid) return;

      setIsSavingDraft(true);
      const nextStep = currStep + 1;
      await persistDraft(nextStep);
      setCurrStep(nextStep);
    } catch (err) {
      console.error("Validation error", err);
      message.error("Please answer all required questions on this step.");
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

      const basePayload = {
        ...values,
        date: new Date(),
        dateOfSubmission: new Date(),
        isCompleted: true,
        isDraft: false,
        currentStep: WIZARD_STEPS.length - 1,
      };

      if (isInitiate) {
        // Observer initiating checklist for teacher(s)
        const payload = {
          ...basePayload,
          isInitiated: {
            status: true,
            Observer: getUserId()?.id,
          },
        };

        const res = await dispatch(initiateFromObserver(payload));
        if (res?.payload?.success) {
          const userInfo = res?.payload?.data[0]?.teacherId;
          const activity = {
            observerMessage: `You have Initiated the Learning Progress Checklist.`,
            teacherMessage: `${getUserId()?.name} has Initiated the Learning Progress Checklist.`,
            route: `/weekly4form/create/${res?.payload?.data[0]?._id}`,
            date: new Date(),
            reciverId: userInfo,
            senderId: getUserId()?.id,
            fromNo: 4,
            data: res?.payload?.data,
          };

          const activitiRecord = await dispatch(CreateActivityApi(activity));
          if (!activitiRecord?.payload?.success) {
            message.error("Error on Activity Record");
          }
          setThankYou(true);
          setTimeout(() => (window.location.href = "/weekly4form"), 2000);
        } else {
          message.error("Something went wrong!");
        }
      } else if (!activeFormId) {
        // Teacher creating new non-initiated entry
        const payload = {
          ...basePayload,
          isInitiated: {
            status: false,
            Observer: ObsereverId,
          },
        };

        const res = await dispatch(initiateFromObserver(payload));
        if (res?.payload?.success) {
          const userInfo = res?.payload?.data?.isInitiated?.Observer;
          const activity = {
            observerMessage: `You have completed the Learning Progress Checklist.`,
            teacherMessage: `${getUserId()?.name} has completed the Learning Progress Checklist.`,
            route: `/weekly4form/report/${res?.payload?.data?._id}`,
            date: new Date(),
            reciverId: userInfo,
            senderId: getUserId()?.id,
            fromNo: 4,
            data: res?.payload?.data,
          };

          const activitiRecord = await dispatch(CreateActivityApi(activity));
          if (!activitiRecord?.payload?.success) {
            message.error("Error on Activity Record");
          }

          setThankYou(true);
          setTimeout(() => (window.location.href = "/weekly4form"), 1500);
        } else {
          message.error("Something went wrong!");
        }
      } else {
        // Teacher submitting existing initiated or draft entry
        const payload = {
          id: activeFormId,
          data: {
            ...basePayload,
          },
        };

        const res = await dispatch(UpdateFromObserver(payload));
        if (res?.payload?.isCompleted || res?.payload?._id) {
          const userInfo = res?.payload?.isInitiated?.Observer?._id;
          const activity = {
            observerMessage: `${getUserId()?.name} has completed your initiated Learning Progress Checklist Form.`,
            teacherMessage: `You have completed the Learning Progress Checklist.`,
            route: `/weekly4form/report/${res?.payload?._id || activeFormId}`,
            date: new Date(),
            reciverId: userInfo,
            senderId: getUserId()?.id,
            fromNo: 4,
            data: res?.payload,
          };

          const activitiRecord = await dispatch(CreateActivityApi(activity));
          if (!activitiRecord?.payload?.success) {
            message.error("Error on Activity Record");
          }

          message.success("Evaluation submitted successfully!");
          setTimeout(() => (window.location.href = "/weekly4form"), 1000);
        } else {
          message.error("Something went wrong!");
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      message.error("Please complete all required fields before submitting!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render question hidden field helper
  const renderHiddenQuestionField = (index, questionText) => (
    <Form.Item
      className="hidden"
      hidden
      name={["FormData", index, "question"]}
      initialValue={questionText}
    >
      <Input />
    </Form.Item>
  );

  // Render Review Step
  const renderReviewStep = () => {
    const currentValues = form.getFieldsValue(true);
    const formData = currentValues?.FormData || [];

    return (
      <Box display="flex" flexDirection="column" gap={6}>
        <Card
          title={
            <Flex justify="space-between" align="center">
              <Text fontWeight="600" fontSize="md">
                1. Planning & Lessons
              </Text>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => setCurrStep(0)}
              >
                Edit
              </Button>
            </Flex>
          }
          bordered
        >
          <Box mb={3}>
            <Text fontWeight="500" color="gray.700">
              Q1. {QUESTIONS[0]}
            </Text>
            <Tag color={formData[0]?.answer === "Yes" ? "green" : "orange"} style={{ marginTop: "4px" }}>
              {formData[0]?.answer || "Not Answered"}
            </Tag>
          </Box>
          <Divider style={{ margin: "12px 0" }} />
          <Box>
            <Text fontWeight="500" color="gray.700">
              Q2. {QUESTIONS[1]}
            </Text>
            <Tag color={formData[1]?.answer === "Yes" ? "green" : "orange"} style={{ marginTop: "4px" }}>
              {formData[1]?.answer || "Not Answered"}
            </Tag>
          </Box>
        </Card>

        <Card
          title={
            <Flex justify="space-between" align="center">
              <Text fontWeight="600" fontSize="md">
                2. Marking & Notebooks
              </Text>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => setCurrStep(1)}
              >
                Edit
              </Button>
            </Flex>
          }
          bordered
        >
          <Text fontWeight="500" color="gray.700" mb={2}>
            Q3. {QUESTIONS[2]}
          </Text>
          {formData[2]?.sections && formData[2].sections.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              {formData[2].sections.map((sec, i) => {
                const className =
                  classList?.find((c) => c._id === sec.classId)?.className ||
                  sec.classId ||
                  "Class";
                return (
                  <Box
                    key={i}
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <Text fontSize="sm" fontWeight="600">
                      {className} - Section {sec.section || "N/A"}
                    </Text>
                    <Tag color={sec.answer === "Yes" ? "green" : "orange"} style={{ marginTop: "4px" }}>
                      {sec.answer || "N/A"}
                    </Tag>
                  </Box>
                );
              })}
            </SimpleGrid>
          ) : (
            <Text color="gray.400" fontSize="sm">
              No sections entered
            </Text>
          )}
        </Card>

        <Card
          title={
            <Flex justify="space-between" align="center">
              <Text fontWeight="600" fontSize="md">
                3. Student Care & L.O.W.
              </Text>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => setCurrStep(2)}
              >
                Edit
              </Button>
            </Flex>
          }
          bordered
        >
          <Box mb={4}>
            <Text fontWeight="500" color="gray.700" mb={2}>
              Q4. {QUESTIONS[3]}
            </Text>
            {formData[3]?.lowStudents && formData[3].lowStudents.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {formData[3].lowStudents.map((st, i) => (
                  <Box
                    key={i}
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <Text fontWeight="600" fontSize="sm">
                      {st.name || "Student"} ({st.classSection || "Class/Sec"})
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Subject: {st.subject || "N/A"}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Remarks: {st.remarks || "N/A"}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Text color="gray.400" fontSize="sm">
                No L.O.W. students recorded
              </Text>
            )}
          </Box>

          <Divider style={{ margin: "12px 0" }} />

          <Box>
            <Text fontWeight="500" color="gray.700">
              Q5. {QUESTIONS[4]}
            </Text>
            <Tag color={formData[4]?.answer === "Yes" ? "green" : "orange"} style={{ marginTop: "4px" }}>
              {formData[4]?.answer || "Not Answered"}
            </Tag>
            {formData[4]?.textArea && (
              <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.700">
                  Reason/Details: {formData[4].textArea}
                </Text>
              </Box>
            )}
          </Box>
        </Card>
      </Box>
    );
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)" bg="gray.50">
      <Box maxW="1200px" mx="auto">
        <Box mb={6}>
          <Heading size="lg" color="gray.800" mb={1}>
            Learning Progress Checklist (Weekly 4)
          </Heading>
          <Text color="gray.500">
            Multi-step checklist with automatic draft saves at every step.
          </Text>
        </Box>

        {isInitiate ? (
          /* Observer Initiate View */
          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
            py={10}
          >
            {thankYou ? (
              <Flex
                justify="center"
                align="center"
                direction="column"
                minH="50vh"
              >
                <Heading color="green.500" mb={4} className="fade-in">
                  Form Successfully Initiated!
                </Heading>
                <Text color="gray.600" fontSize="lg" className="fade-in">
                  Redirecting you...
                </Text>
              </Flex>
            ) : (
              <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Flex justify="center" align="center" minH="50vh">
                  <Box w={{ base: "100%", md: "50%" }}>
                    <Form.Item
                      className="w-100"
                      label={<Text fontWeight="500">Assign to Teacher(s)</Text>}
                      name="teacherId"
                      rules={[
                        { required: true, message: "Please select a Teacher!" },
                      ]}
                    >
                      <Select
                        size="large"
                        mode="multiple"
                        allowClear
                        showSearch
                        placeholder="Select Teacher(s)"
                        options={GetTeachersLists?.map((item) => ({
                          value: item._id,
                          label: item.name,
                        }))}
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={isSubmitting}
                      style={{
                        borderRadius: "8px",
                        width: "100%",
                        backgroundColor: "#1a4d2e",
                      }}
                    >
                      Initiate Checklist
                    </Button>
                  </Box>
                </Flex>
              </Form>
            )}
          </Box>
        ) : (
          /* Teacher Multi-Step Form */
          <Box>
            <Box mb={6} bg="white" p={6} borderRadius="2xl" boxShadow="sm">
              <CommonStepper
                currentStep={currStep}
                steps={WIZARD_STEPS}
              />
            </Box>

            {isLoadingForm ? (
              <Flex justify="center" align="center" minH="300px" bg="white" borderRadius="2xl">
                <Spin tip="Loading your saved checklist..." size="large" />
              </Flex>
            ) : (
              <Form form={form} layout="vertical">
                {/* Step 0: Planning & Lessons */}
                {currStep === 0 && (
                  <Box
                    bg="white"
                    p={{ base: 4, md: 8 }}
                    borderRadius="2xl"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                  >
                    {!activeFormId && (
                      <Box
                        mb={6}
                        bg="gray.50"
                        p={5}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor="gray.100"
                      >
                        <Heading size="sm" mb={3} color="gray.700">
                          Select Observer
                        </Heading>
                        <Select
                          size="large"
                          className="w-100"
                          allowClear
                          showSearch
                          value={ObsereverId}
                          placeholder="Select Observer"
                          onChange={(value) => setObsereverId(value)}
                          options={GetObserverLists?.map((item) => ({
                            value: item._id,
                            label: item.name,
                          }))}
                          filterOption={(input, option) =>
                            option.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      </Box>
                    )}

                    <Box display="flex" flexDirection="column" gap={6}>
                      <Box
                        p={6}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor="gray.100"
                        bg="white"
                      >
                        <Heading size="sm" color="gray.700" mb={3}>
                          1. {QUESTIONS[0]}
                        </Heading>
                        <Form.Item
                          name={["FormData", 0, "answer"]}
                          rules={[
                            { required: true, message: "Please select an answer!" },
                          ]}
                        >
                          <Radio.Group
                            size="large"
                            options={yesNoNAOptions}
                            optionType="button"
                            buttonStyle="solid"
                          />
                        </Form.Item>
                        {renderHiddenQuestionField(0, QUESTIONS[0])}
                      </Box>

                      <Box
                        p={6}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor="gray.100"
                        bg="white"
                      >
                        <Heading size="sm" color="gray.700" mb={3}>
                          2. {QUESTIONS[1]}
                        </Heading>
                        <Form.Item
                          name={["FormData", 1, "answer"]}
                          rules={[
                            { required: true, message: "Please select an answer!" },
                          ]}
                        >
                          <Radio.Group
                            size="large"
                            options={yesNoNAOptions}
                            optionType="button"
                            buttonStyle="solid"
                          />
                        </Form.Item>
                        {renderHiddenQuestionField(1, QUESTIONS[1])}
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Step 1: Marking & Notebooks */}
                {currStep === 1 && (
                  <Box
                    bg="white"
                    p={{ base: 4, md: 8 }}
                    borderRadius="2xl"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                  >
                    <Heading size="sm" color="gray.700" mb={4}>
                      3. {QUESTIONS[2]}
                    </Heading>
                    {renderHiddenQuestionField(2, QUESTIONS[2])}

                    <Form.List
                      name={["FormData", 2, "sections"]}
                      rules={[
                        {
                          validator: async (_, sections) => {
                            if (!sections || sections.length < 1) {
                              return Promise.reject(
                                new Error("At least one class section is required"),
                              );
                            }
                          },
                        },
                      ]}
                    >
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, fieldKey, ...restField }) => {
                            const selectedClassId = form.getFieldValue([
                              "FormData",
                              2,
                              "sections",
                              name,
                              "classId",
                            ]);
                            const availableSections =
                              getSectionsForClass(selectedClassId);

                            return (
                              <SimpleGrid
                                columns={{ base: 1, md: 3 }}
                                spacing={4}
                                key={key}
                                mb={4}
                                p={5}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor="gray.100"
                                bg="gray.50"
                              >
                                <Box>
                                  <Form.Item
                                    {...restField}
                                    name={[name, "classId"]}
                                    fieldKey={[fieldKey, "classId"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Select class",
                                      },
                                    ]}
                                  >
                                    <Select
                                      allowClear
                                      showSearch
                                      placeholder="Select Class"
                                      options={classList?.map((item) => ({
                                        value: item?._id,
                                        label: `${item?.className}`,
                                      }))}
                                      onChange={() => {
                                        form.setFieldValue(
                                          [
                                            "FormData",
                                            2,
                                            "sections",
                                            name,
                                            "section",
                                          ],
                                          undefined,
                                        );
                                      }}
                                    />
                                  </Form.Item>
                                </Box>

                                <Box>
                                  <Form.Item
                                    {...restField}
                                    name={[name, "section"]}
                                    fieldKey={[fieldKey, "section"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Select section",
                                      },
                                    ]}
                                  >
                                    <Select
                                      allowClear
                                      showSearch
                                      placeholder="Select Section"
                                      options={availableSections.map(
                                        (item) => ({
                                          value: item?.name,
                                          label: `${item?.name}`,
                                        }),
                                      )}
                                    />
                                  </Form.Item>
                                </Box>

                                <Box>
                                  <Form.Item
                                    {...restField}
                                    name={[name, "answer"]}
                                    fieldKey={[fieldKey, "answer"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Select answer",
                                      },
                                    ]}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <Radio.Group
                                        size="middle"
                                        options={yesNoNAOptions}
                                        optionType="button"
                                        buttonStyle="solid"
                                      />
                                      <MinusCircleOutlined
                                        style={{
                                          marginLeft: "8px",
                                          cursor: "pointer",
                                          color: "red",
                                          fontSize: "18px",
                                        }}
                                        onClick={() => remove(name)}
                                      />
                                    </div>
                                  </Form.Item>
                                </Box>
                              </SimpleGrid>
                            );
                          })}

                          {fields.length < 8 && (
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Class Section
                              </Button>
                            </Form.Item>
                          )}
                        </>
                      )}
                    </Form.List>
                  </Box>
                )}

                {/* Step 2: Student Care & L.O.W. */}
                {currStep === 2 && (
                  <Box
                    bg="white"
                    p={{ base: 4, md: 8 }}
                    borderRadius="2xl"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                  >
                    {/* Q4: L.O.W. Students */}
                    <Box mb={8}>
                      <Heading size="sm" color="gray.700" mb={4}>
                        4. {QUESTIONS[3]}
                      </Heading>
                      {renderHiddenQuestionField(3, QUESTIONS[3])}

                      <Form.List name={["FormData", 3, "lowStudents"]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(
                              ({
                                key,
                                name: fieldName,
                                fieldKey,
                                ...restField
                              }) => (
                                <SimpleGrid
                                  columns={{ base: 1, md: 4 }}
                                  spacing={4}
                                  key={key}
                                  mb={4}
                                  p={5}
                                  borderRadius="xl"
                                  borderWidth="1px"
                                  borderColor="gray.100"
                                  bg="gray.50"
                                >
                                  <Box>
                                    <Form.Item
                                      {...restField}
                                      name={[fieldName, "name"]}
                                      fieldKey={[fieldKey, "name"]}
                                      label="Name"
                                      rules={[
                                        {
                                          required: true,
                                          message: "Required",
                                        },
                                      ]}
                                    >
                                      <Input placeholder="Student Name" />
                                    </Form.Item>
                                  </Box>
                                  <Box>
                                    <Form.Item
                                      {...restField}
                                      name={[fieldName, "classSection"]}
                                      fieldKey={[fieldKey, "classSection"]}
                                      label="Class Section"
                                      rules={[
                                        {
                                          required: true,
                                          message: "Required",
                                        },
                                      ]}
                                    >
                                      <Input placeholder="Class Section" />
                                    </Form.Item>
                                  </Box>
                                  <Box>
                                    <Form.Item
                                      {...restField}
                                      name={[fieldName, "subject"]}
                                      fieldKey={[fieldKey, "subject"]}
                                      label="Subject"
                                      rules={[
                                        {
                                          required: true,
                                          message: "Required",
                                        },
                                      ]}
                                    >
                                      <Input placeholder="Subject" />
                                    </Form.Item>
                                  </Box>
                                  <Box>
                                    <Form.Item
                                      {...restField}
                                      name={[fieldName, "remarks"]}
                                      fieldKey={[fieldKey, "remarks"]}
                                      label="Remarks"
                                      rules={[
                                        {
                                          required: true,
                                          message: "Required",
                                        },
                                      ]}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                        }}
                                      >
                                        <Input placeholder="Remarks" />
                                        <MinusCircleOutlined
                                          style={{
                                            cursor: "pointer",
                                            color: "red",
                                            fontSize: "18px",
                                          }}
                                          onClick={() => remove(fieldName)}
                                        />
                                      </div>
                                    </Form.Item>
                                  </Box>
                                </SimpleGrid>
                              ),
                            )}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add L.O.W. Student Row
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Box>

                    {/* Q5: I Care Forms */}
                    <Box
                      p={6}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor="gray.100"
                      bg="gray.50"
                    >
                      <Heading size="sm" color="gray.700" mb={3}>
                        5. {QUESTIONS[4]}
                      </Heading>
                      {renderHiddenQuestionField(4, QUESTIONS[4])}

                      <Form.Item
                        name={["FormData", 4, "answer"]}
                        rules={[
                          {
                            required: true,
                            message: "Please select an answer!",
                          },
                        ]}
                      >
                        <Radio.Group
                          size="large"
                          options={yesNoNAOptions}
                          optionType="button"
                          buttonStyle="solid"
                        />
                      </Form.Item>

                      <Form.Item
                        name={["FormData", 4, "textArea"]}
                        label="Details / Reason"
                        rules={[
                          {
                            required: true,
                            message: "Please provide reason or details",
                          },
                        ]}
                      >
                        <TextArea
                          rows={3}
                          placeholder="Provide student names and reasons for I Care forms..."
                        />
                      </Form.Item>
                    </Box>
                  </Box>
                )}

                {/* Step 3: Review & Submit */}
                {currStep === 3 && (
                  <Box
                    bg="white"
                    p={{ base: 4, md: 8 }}
                    borderRadius="2xl"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                  >
                    <Heading size="md" color="gray.800" mb={4}>
                      Review Your Checklist Responses
                    </Heading>
                    <Text color="gray.500" mb={6}>
                      Please verify all sections before finalizing your submission. You can click Edit to change responses.
                    </Text>
                    {renderReviewStep()}
                  </Box>
                )}

                {/* Multi-Step Bottom Controls */}
                <Flex
                  justify="space-between"
                  align="center"
                  mt={8}
                  pt={4}
                  borderTop="1px solid"
                  borderColor="gray.200"
                >
                  <Button
                    size="large"
                    disabled={currStep === 0}
                    onClick={handleBack}
                    style={{ borderRadius: "8px" }}
                  >
                    Previous
                  </Button>

                  <Space size="middle">
                    <Button
                      size="large"
                      icon={<SaveOutlined />}
                      onClick={handleSaveDraft}
                      loading={isSavingDraft}
                      style={{ borderRadius: "8px" }}
                    >
                      Save Draft
                    </Button>

                    {currStep < WIZARD_STEPS.length - 1 ? (
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleNext}
                        loading={isSavingDraft}
                        style={{ borderRadius: "8px", minWidth: "120px" }}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        style={{
                          borderRadius: "8px",
                          minWidth: "160px",
                          backgroundColor: "#1a4d2e",
                        }}
                      >
                        Submit Evaluation
                      </Button>
                    )}
                  </Space>
                </Flex>
              </Form>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Weekly4Form;
