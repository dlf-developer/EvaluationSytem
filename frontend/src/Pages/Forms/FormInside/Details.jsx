import React, { useEffect, useState, useMemo } from "react";
import {
  Row,
  Col,
  message,
  Spin,
  Card,
  Empty,
  Button,
  Select,
  DatePicker,
  Alert,
  Modal,
  Tag,
} from "antd";
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  GetSingleFormComplete,
  GetSingleFormsOne,
} from "../../../redux/Form/fortnightlySlice";
import { getUserId } from "../../../Utils/auth";
import { useDispatch, useSelector } from "react-redux";
import { UserRole } from "../../../config/config";
import {
  getCreateClassSection,
  GetObserverList,
} from "../../../redux/userSlice";
import {
  questions,
  questionsOld,
  cutoffDate,
} from "../../../Components/normalData";
import { CreateActivityApi } from "../../../redux/Activity/activitySlice";
import ModernRadioGroup from "../../../Components/ModernRadioGroup";
import moment from "moment";
import "../../../App.css";

const { Option } = Select;

const Details = () => {
  const [currStep, setCurrStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [classInfo, setClassInfo] = useState({
    className: "",
    section: "",
    date: null,
    coordinatorID: "",
  });
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formDetails, setFormDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionState, setSectionState] = useState();
  const [newData, setNewData] = useState(false);
  const [betaLoading, setBetaLoading] = useState(false);

  const Id = useParams().id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = getUserId();
  const GetUserAccess = currentUser?.access;
  const ObserverList = useSelector((state) => state.user.GetObserverLists);

  const steps = [
    { title: "Displays & Setup", key: "displays", total: 12 },
    { title: "Routines & Activities", key: "routines", total: 13 },
    { title: "Records & Registers", key: "records", total: 10 },
    { title: "Review & Submit", key: "review", total: 35 },
  ];

  const yesNoNAOptions = ["Yes", "No", "Sometimes", "N/A"];

  const activeQuestions = useMemo(() => {
    return formDetails?.createdAt < cutoffDate ? questionsOld : questions;
  }, [formDetails]);

  const step0Questions = useMemo(() => activeQuestions.slice(0, 12), [activeQuestions]);
  const step1Questions = useMemo(() => activeQuestions.slice(12, 25), [activeQuestions]);
  const step2Questions = useMemo(() => activeQuestions.slice(25), [activeQuestions]);

  const stepQuestionMap = useMemo(() => [
    step0Questions,
    step1Questions,
    step2Questions,
    [],
  ], [step0Questions, step1Questions, step2Questions]);

  // Fetch Class Data
  const fetchClassData = async () => {
    try {
      const res = await dispatch(getCreateClassSection());
      if (res?.payload?.success) {
        setNewData(
          res?.payload?.classDetails.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching class data:", error);
    }
  };

  // Fetch form details
  useEffect(() => {
    setIsLoading(true);
    fetchClassData();
    dispatch(GetSingleFormsOne(Id))
      .then((response) => {
        const loadedForm = response?.payload;
        setFormDetails(loadedForm);
        setIsLoading(false);

        if (loadedForm) {
          const isObserver = GetUserAccess === UserRole[1];
          const isComplete = isObserver
            ? loadedForm.isCoordinatorComplete
            : loadedForm.isTeacherComplete;
          const userAnswers = isObserver
            ? loadedForm.observerForm
            : loadedForm.teacherForm;

          if (userAnswers && typeof userAnswers === "object") {
            const initialAnswers = {};
            Object.entries(userAnswers).forEach(([k, v]) => {
              if (
                k !== "_id" &&
                k !== "totalScore" &&
                k !== "OutOf" &&
                k !== "ObservationDates" &&
                v !== null &&
                v !== undefined
              ) {
                initialAnswers[k] = v;
              }
            });
            setAnswers(initialAnswers);
          }

          setClassInfo({
            className: loadedForm.className || "",
            section: loadedForm.section || "",
            date: loadedForm.date ? moment(loadedForm.date) : null,
            coordinatorID:
              loadedForm.coordinatorID?._id || loadedForm.coordinatorID || "",
          });

          if (
            loadedForm.currentStep !== undefined &&
            loadedForm.currentStep !== null &&
            loadedForm.currentStep >= 0 &&
            loadedForm.currentStep <= 3
          ) {
            setCurrStep(loadedForm.currentStep);
          }

          const { className, date, section } = loadedForm;
          if (!className || !date || !section) {
            dispatch(GetObserverList());
            setBetaLoading(true);
          }

          if (
            loadedForm.isCoordinatorComplete &&
            loadedForm.isTeacherComplete
          ) {
            message.info("Form is already submitted!");
            navigate(`/fortnightly-monitor/report/${Id}`);
          } else if (
            GetUserAccess === UserRole[1] &&
            loadedForm.isCoordinatorComplete
          ) {
            message.info("Form is already submitted!");
            navigate(`/fortnightly-monitor/report/${Id}`);
          } else if (
            GetUserAccess === UserRole[2] &&
            loadedForm.isTeacherComplete
          ) {
            message.info("Form is already submitted!");
            navigate(`/fortnightly-monitor/report/${Id}`);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading form:", err);
        message.error("Error fetching form details.");
        setIsLoading(false);
      });
  }, [Id, navigate]);

  // Answer handler
  const handleAnswerChange = (questionKey, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: value,
    }));
    // Clear validation error when answered
    if (validationErrors[questionKey]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[questionKey];
        return next;
      });
    }
  };

  // Calculations
  const { s0Answered, s1Answered, s2Answered, totalAnswered, selfScore, outOfScore } =
    useMemo(() => {
      const count = (arr) => arr.filter((q) => !!answers[q.key]).length;
      const s0 = count(step0Questions);
      const s1 = count(step1Questions);
      const s2 = count(step2Questions);
      const total = s0 + s1 + s2;

      let score = 0;
      let outOf = 0;
      activeQuestions.forEach((q) => {
        const ans = answers[q.key];
        if (ans === "Yes") {
          score += 1;
          outOf += 1;
        } else if (ans === "Sometimes") {
          score += 0.5;
          outOf += 1;
        } else if (ans === "No") {
          outOf += 1;
        }
      });

      return {
        s0Answered: s0,
        s1Answered: s1,
        s2Answered: s2,
        totalAnswered: total,
        selfScore: score,
        outOfScore: outOf,
      };
    }, [answers, step0Questions, step1Questions, step2Questions, activeQuestions]);

  // Save Draft
  const saveDraft = async (answersToSave = answers, targetStep = currStep, showMessage = false) => {
    if (!Id || !GetUserAccess) return;
    const isObserver = GetUserAccess === UserRole[1];

    const payload = {
      id: Id,
      data: {
        isDraft: true,
        currentStep: targetStep,
        ...(isObserver
          ? { observerForm: answersToSave }
          : { teacherForm: answersToSave }),
        ...(classInfo.className ? { className: classInfo.className } : {}),
        ...(classInfo.section ? { Section: classInfo.section } : {}),
        ...(classInfo.date
          ? { date: classInfo.date.toISOString ? classInfo.date.toISOString() : classInfo.date }
          : {}),
      },
    };

    setIsSavingDraft(true);
    try {
      await dispatch(GetSingleFormComplete(payload));
      if (showMessage) {
        message.success("Draft saved successfully!");
      }
    } catch (e) {
      console.error("Draft save error:", e);
      if (showMessage) {
        message.error("Failed to save draft.");
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Validate current step questions
  const validateStep = (stepIndex) => {
    const currentQuestions = stepQuestionMap[stepIndex] || [];
    const errors = {};
    let firstMissingKey = null;

    if (stepIndex === 0 && betaLoading) {
      if (!classInfo.className) errors.className = true;
      if (!classInfo.section) errors.section = true;
      if (!classInfo.date) errors.date = true;
    }

    currentQuestions.forEach((q) => {
      if (!answers[q.key]) {
        errors[q.key] = true;
        if (!firstMissingKey) firstMissingKey = q.key;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      message.error("Please answer all required questions on this step before continuing.");
      if (firstMissingKey) {
        const el = document.getElementById(`question-card-${firstMissingKey}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return false;
    }

    setValidationErrors({});
    return true;
  };

  // Step Navigation
  const handleStepNext = async () => {
    if (currStep < 3) {
      const isValid = validateStep(currStep);
      if (!isValid) return;

      const nextStep = currStep + 1;
      await saveDraft(answers, nextStep, false);
      setCurrStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepBack = async () => {
    if (currStep > 0) {
      const prevStep = currStep - 1;
      await saveDraft(answers, prevStep, false);
      setCurrStep(prevStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = async (targetStep) => {
    if (targetStep === currStep) return;
    // Always save draft before jumping
    await saveDraft(answers, targetStep, false);
    setCurrStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Evaluation
  const handleSubmit = async () => {
    if (!Id || !GetUserAccess) {
      message.error("Invalid form submission!");
      return;
    }

    const isObserver = GetUserAccess === UserRole[1];
    let payload = {
      id: Id,
      data: {},
    };

    if (isObserver && !formDetails?.isCoordinatorComplete) {
      payload.data = {
        isCoordinatorComplete: true,
        observerForm: answers,
      };
    } else if (!isObserver && !formDetails?.isTeacherComplete) {
      payload.data = {
        isTeacherComplete: true,
        teacherForm: answers,
      };

      if (formDetails?.isObserverInitiation || betaLoading) {
        payload.data = {
          ...payload.data,
          className: classInfo.className,
          date: classInfo.date
            ? classInfo.date.toISOString
              ? classInfo.date.toISOString()
              : classInfo.date
            : new Date(),
          Section: classInfo.section,
        };
      }
    } else {
      message.error("You do not have permission to complete this form!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await dispatch(GetSingleFormComplete(payload));

      if (res.payload?.message || res.payload?.form) {
        message.success("Form submitted successfully!");
        setIsSubmitModalOpen(false);

        // Activity Record
        const receiverId =
          UserRole[2] === currentUser.access
            ? res?.payload?.form?.coordinatorID?._id ||
              res?.payload?.form?.userId?._id
            : formDetails?.teacherID?._id || formDetails?.userId?._id;

        const observerMessage = payload?.data?.className
          ? `${
              res?.payload?.form?.teacherID?.name ||
              res?.payload?.form?.userId?.name
            } has completed the Fortnightly Monitor Form for ${
              res?.payload?.form?.className
            } | ${res?.payload?.form?.section}`
          : UserRole[1] === currentUser.access
            ? `You have completed the Fortnightly Monitor Form for ${formDetails?.className} | ${formDetails?.section}`
            : `${
                formDetails?.teacherID?.name || formDetails?.userId?.name
              } has completed the Fortnightly Monitor Form for ${
                formDetails?.className
              } | ${formDetails?.section}`;

        const teacherMessage = payload?.data?.className
          ? `You have completed the Fortnightly Monitor Form for ${res?.payload?.form?.className} | ${res?.payload?.form?.section}`
          : UserRole[1] === currentUser.access
            ? `${
                formDetails?.coordinatorID?.name || formDetails?.userId?.name
              } has completed the Fortnightly Monitor Form for ${
                formDetails?.className
              } | ${formDetails?.section}`
            : `You have completed the Fortnightly Monitor Form for ${formDetails?.className} | ${formDetails?.section}`;

        const activity = {
          observerMessage,
          teacherMessage,
          route: `/fortnightly-monitor/report/${Id}`,
          date: new Date(),
          reciverId: receiverId,
          senderId: currentUser?.id,
          fromNo: 1,
          data: res.payload,
        };

        await dispatch(CreateActivityApi(activity));
        navigate(`/fortnightly-monitor/report/${Id}`);
      } else {
        throw new Error(res.payload?.message || "Error submitting the form.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      message.error(error.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableFutureDates = (current) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return current && current.toDate() > today;
  };

  const SectionSubject = (value) => {
    if (value && newData) {
      const filteredData = newData.filter((data) => data?._id === value);
      if (filteredData?.length > 0) {
        setSectionState(filteredData[0]);
        setClassInfo((prev) => ({ ...prev, className: filteredData[0].className }));
      }
    }
  };

  const stepCounts = [s0Answered, s1Answered, s2Answered, totalAnswered];

  return (
    <div className="modern-form-container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 16px" }}>
      {isLoading ? (
        <div className="modern-loader" style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="modern-form-header" style={{ marginBottom: "20px" }}>
            <div className="header-section" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h2 className="form-title" style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 }}>
                    Fortnightly Observation Form
                  </h2>
                  <div className="form-subtitle" style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                    Complete your evaluation step by step
                  </div>
                </div>

                {/* Progress counter pill */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  padding: "8px 16px",
                  borderRadius: "20px",
                }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#166534" }}>
                    Total Answered: <span style={{ fontSize: "16px", fontWeight: 800 }}>{totalAnswered}</span> / 35
                  </div>
                  {totalAnswered === 35 && (
                    <Tag color="success" style={{ margin: 0, borderRadius: "12px" }}>All Completed</Tag>
                  )}
                </div>
              </div>

              {/* Form Metadata Box */}
              {formDetails && (() => {
                const teacherName = formDetails?.teacherID?.name || formDetails?.userId?.name || "—";
                const observerName = formDetails?.teacherID
                  ? formDetails?.userId?.name || "—"
                  : formDetails?.coordinatorID?.name || "—";

                return (
                  <div style={{
                    marginTop: "16px",
                    padding: "16px 20px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px 32px",
                    fontSize: "14px",
                    color: "#4b5563",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, color: "#374151" }}>Teacher: </span>
                      {teacherName}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: "#374151" }}>Class & Section: </span>
                      {formDetails?.className ? `${formDetails.className} - ${formDetails.section || "—"}` : "—"}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: "#374151" }}>Date: </span>
                      {formDetails?.date
                        ? new Date(formDetails.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: "#374151" }}>Observer: </span>
                      {observerName}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Interactive Stepper Navigation */}
          <div style={{
            background: "#fff",
            padding: "16px 20px",
            borderRadius: "16px",
            marginBottom: "24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
            }}>
              {steps.map((step, idx) => {
                const isActive = currStep === idx;
                const answered = stepCounts[idx];
                const total = step.total;
                const isComplete = idx < 3 ? answered === total : totalAnswered === 35;

                return (
                  <div
                    key={step.key}
                    onClick={() => handleStepClick(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      border: isActive
                        ? "2px solid #4A6741"
                        : "1px solid #e5e7eb",
                      backgroundColor: isActive
                        ? "#f4f8f3"
                        : "#ffffff",
                    }}
                  >
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      backgroundColor: isActive
                        ? "#4A6741"
                        : isComplete
                          ? "#166534"
                          : "#e5e7eb",
                      color: isActive || isComplete ? "#ffffff" : "#6b7280",
                      flexShrink: 0,
                    }}>
                      {isComplete ? <CheckOutlined style={{ fontSize: "12px" }} /> : idx + 1}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: "13px",
                        fontWeight: isActive ? 700 : 600,
                        color: isActive ? "#2d4427" : "#374151",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: "12px", color: isComplete ? "#166534" : "#6b7280", fontWeight: 500 }}>
                        {idx < 3 ? `${answered} / ${total} answered` : `${totalAnswered} / 35 completed`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="modern-form">
            {/* Steps 0, 1, 2 Questions */}
            {[0, 1, 2].map((stepIdx) => {
              const qList = stepQuestionMap[stepIdx];
              const isCurrent = currStep === stepIdx;

              return (
                <div
                  key={stepIdx}
                  style={{ display: isCurrent ? "block" : "none" }}
                >
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={14}>
                      <div className="form-section">
                        {/* Class Info for initiation */}
                        {stepIdx === 0 && betaLoading && (
                          <div className="info-card" style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                            marginBottom: "24px",
                          }}>
                            <h3 className="section-title" style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>
                              Class Information
                            </h3>
                            <Row gutter={[16, 16]}>
                              <Col span={24}>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>
                                  Class <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <Select
                                  showSearch
                                  placeholder="Select a class"
                                  size="large"
                                  style={{ width: "100%" }}
                                  status={validationErrors.className ? "error" : ""}
                                  value={classInfo.className || undefined}
                                  onChange={(value) => {
                                    SectionSubject(value);
                                    setValidationErrors((prev) => ({ ...prev, className: false }));
                                  }}
                                  options={
                                    newData &&
                                    newData.map((item) => ({
                                      key: item?._id,
                                      value: item?._id,
                                      label: item?.className,
                                    }))
                                  }
                                  filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                  }
                                />
                              </Col>

                              <Col span={24}>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>
                                  Section <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <Select
                                  showSearch
                                  placeholder="Select a section"
                                  size="large"
                                  style={{ width: "100%" }}
                                  status={validationErrors.section ? "error" : ""}
                                  value={classInfo.section || undefined}
                                  onChange={(value) => {
                                    setClassInfo((prev) => ({ ...prev, section: value }));
                                    setValidationErrors((prev) => ({ ...prev, section: false }));
                                  }}
                                  options={sectionState?.sections?.map((item) => ({
                                    key: item._id,
                                    value: item.name,
                                    label: item.name,
                                  }))}
                                />
                              </Col>

                              <Col xs={24} sm={12}>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>
                                  Date <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <DatePicker
                                  className="w-100"
                                  size="large"
                                  format="YYYY-MM-DD"
                                  style={{ width: "100%" }}
                                  status={validationErrors.date ? "error" : ""}
                                  value={classInfo.date}
                                  onChange={(d) => {
                                    setClassInfo((prev) => ({ ...prev, date: d }));
                                    setValidationErrors((prev) => ({ ...prev, date: false }));
                                  }}
                                  disabledDate={disableFutureDates}
                                />
                              </Col>
                            </Row>
                          </div>
                        )}

                        {/* Questions for this step */}
                        <div className="questions-section">
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "16px",
                          }}>
                            <h3 className="section-title" style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#1f2937" }}>
                              {steps[stepIdx].title} ({qList.length} Questions)
                            </h3>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#4A6741" }}>
                              {stepCounts[stepIdx]} / {qList.length} Answered
                            </div>
                          </div>

                          {qList.map((field, idx) => {
                            const isAnswered = !!answers[field.key];
                            const isError = !!validationErrors[field.key];

                            return (
                              <div
                                id={`question-card-${field.key}`}
                                className="question-card"
                                key={field.key}
                                style={{
                                  background: "#ffffff",
                                  padding: "16px 20px",
                                  borderRadius: "12px",
                                  marginBottom: "14px",
                                  border: isError
                                    ? "1.5px solid #ef4444"
                                    : isAnswered
                                      ? "1px solid #d1fae5"
                                      : "1px solid #e5e7eb",
                                  backgroundColor: isError
                                    ? "#fff5f5"
                                    : "#ffffff",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <div style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: "12px",
                                  marginBottom: "12px",
                                }}>
                                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#1f2937", lineHeight: 1.5 }}>
                                    <span style={{ color: "#6b7280", marginRight: "8px" }}>
                                      {idx + 1}.
                                    </span>
                                    {field.name}
                                  </div>
                                  {isAnswered && (
                                    <CheckCircleFilled style={{ color: "#10b981", fontSize: "16px", marginTop: "2px" }} />
                                  )}
                                </div>

                                <ModernRadioGroup
                                  options={yesNoNAOptions}
                                  value={answers[field.key]}
                                  onChange={(val) => handleAnswerChange(field.key, val)}
                                />

                                {isError && (
                                  <div style={{ color: "#ef4444", fontSize: "12px", fontWeight: 500, marginTop: "8px" }}>
                                    Please select an answer
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Col>

                    {/* Sidebar: Observer View (When observer is observing teacher responses) */}
                    <Col xs={24} lg={10}>
                      <div className="sticky-sidebar" style={{ position: "sticky", top: "24px" }}>
                        {(GetUserAccess === UserRole[2] && !formDetails?.isCoordinatorComplete) ||
                        (GetUserAccess === UserRole[1] && !formDetails?.isTeacherComplete) ? (
                          <div className="empty-state" style={{
                            background: "#fff",
                            padding: "40px 20px",
                            borderRadius: "16px",
                            border: "1px solid #e5e7eb",
                            textAlign: "center",
                          }}>
                            <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description={
                                GetUserAccess === UserRole[1]
                                  ? "Waiting for teacher response"
                                  : "Coordinator observation will appear after review"
                              }
                            />
                          </div>
                        ) : null}

                        {GetUserAccess === UserRole[1] && formDetails?.isTeacherComplete && (
                          <div className="response-section" style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "16px",
                            border: "1px solid #e5e7eb",
                          }}>
                            <h3 className="section-title" style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
                              Teacher Responses ({steps[stepIdx]?.title})
                            </h3>
                            {qList.map((item, index) => {
                              const answer = formDetails?.teacherForm?.[item.key];
                              return (
                                <div className="response-card" key={index} style={{
                                  padding: "12px 0",
                                  borderBottom: "1px solid #f3f4f6",
                                }}>
                                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>
                                    {item.name}
                                  </div>
                                  <Tag
                                    color={
                                      answer === "Yes"
                                        ? "green"
                                        : answer === "No"
                                          ? "red"
                                          : answer === "Sometimes"
                                            ? "orange"
                                            : "default"
                                    }
                                    style={{ fontWeight: 600 }}
                                  >
                                    {answer || "—"}
                                  </Tag>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>
              );
            })}

            {/* Step 3: Review & Submit Step */}
            <div style={{ display: currStep === 3 ? "block" : "none" }}>
              <div style={{
                background: "#fff",
                padding: "32px",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
              }}>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                  Review & Submit Evaluation
                </h3>
                <p style={{ color: "#6b7280", marginBottom: "24px" }}>
                  Please review your responses before final submission. Click on any section to go back and edit answers.
                </p>

                {/* Status Alert Banner */}
                {totalAnswered < 35 ? (
                  <Alert
                    type="warning"
                    showIcon
                    icon={<ExclamationCircleFilled />}
                    message={
                      <span>
                        <strong>Incomplete:</strong> You have answered <strong>{totalAnswered} of 35</strong> questions.
                        Please complete all categories before final submission.
                      </span>
                    }
                    style={{ marginBottom: "24px", borderRadius: "10px" }}
                  />
                ) : (
                  <Alert
                    type="success"
                    showIcon
                    icon={<CheckCircleFilled />}
                    message={
                      <span>
                        <strong>All Completed:</strong> You have answered all 35 questions! You are ready to submit.
                      </span>
                    }
                    style={{ marginBottom: "24px", borderRadius: "10px" }}
                  />
                )}

                {/* Category Cards */}
                <Row gutter={[20, 20]}>
                  <Col xs={24} md={8}>
                    <Card
                      hoverable
                      onClick={() => handleStepClick(0)}
                      style={{
                        borderRadius: "14px",
                        border: s0Answered === 12 ? "1.5px solid #bbf7d0" : "1.5px solid #fed7aa",
                        backgroundColor: s0Answered === 12 ? "#f0fdf4" : "#fffaf0",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ fontWeight: 700, color: "#374151" }}>1. Displays & Setup</div>
                        {s0Answered === 12 ? (
                          <Tag color="success">Complete</Tag>
                        ) : (
                          <Tag color="warning">Pending</Tag>
                        )}
                      </div>
                      <div style={{
                        color: s0Answered === 12 ? "#15803d" : "#c2410c",
                        fontSize: "18px",
                        fontWeight: 800,
                      }}>
                        {s0Answered} / 12 Answered
                      </div>
                      <Button type="link" style={{ padding: 0, marginTop: "10px", fontWeight: 600 }}>
                        Review / Edit Section →
                      </Button>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card
                      hoverable
                      onClick={() => handleStepClick(1)}
                      style={{
                        borderRadius: "14px",
                        border: s1Answered === 13 ? "1.5px solid #bbf7d0" : "1.5px solid #fed7aa",
                        backgroundColor: s1Answered === 13 ? "#f0fdf4" : "#fffaf0",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ fontWeight: 700, color: "#374151" }}>2. Routines & Activities</div>
                        {s1Answered === 13 ? (
                          <Tag color="success">Complete</Tag>
                        ) : (
                          <Tag color="warning">Pending</Tag>
                        )}
                      </div>
                      <div style={{
                        color: s1Answered === 13 ? "#15803d" : "#c2410c",
                        fontSize: "18px",
                        fontWeight: 800,
                      }}>
                        {s1Answered} / 13 Answered
                      </div>
                      <Button type="link" style={{ padding: 0, marginTop: "10px", fontWeight: 600 }}>
                        Review / Edit Section →
                      </Button>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card
                      hoverable
                      onClick={() => handleStepClick(2)}
                      style={{
                        borderRadius: "14px",
                        border: s2Answered === 10 ? "1.5px solid #bbf7d0" : "1.5px solid #fed7aa",
                        backgroundColor: s2Answered === 10 ? "#f0fdf4" : "#fffaf0",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ fontWeight: 700, color: "#374151" }}>3. Records & Registers</div>
                        {s2Answered === 10 ? (
                          <Tag color="success">Complete</Tag>
                        ) : (
                          <Tag color="warning">Pending</Tag>
                        )}
                      </div>
                      <div style={{
                        color: s2Answered === 10 ? "#15803d" : "#c2410c",
                        fontSize: "18px",
                        fontWeight: 800,
                      }}>
                        {s2Answered} / 10 Answered
                      </div>
                      <Button type="link" style={{ padding: 0, marginTop: "10px", fontWeight: 600 }}>
                        Review / Edit Section →
                      </Button>
                    </Card>
                  </Col>
                </Row>

                {/* Score Summary Box */}
                <div style={{
                  marginTop: "24px",
                  padding: "20px 24px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "24px",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                      {GetUserAccess === UserRole[1] ? "Observer Score" : "Self Assessment Score"}
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#111827" }}>
                      {selfScore} <span style={{ fontSize: "16px", color: "#9ca3af", fontWeight: 500 }}>/ {outOfScore}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>Total Completed Questions</div>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: totalAnswered === 35 ? "#166534" : "#ea580c" }}>
                      {totalAnswered} / 35
                    </div>
                  </div>
                </div>

                {/* All Responses Detailed Preview */}
                <div style={{ marginTop: "32px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#374151", marginBottom: "16px" }}>
                    Full Response Summary
                  </h4>
                  <div style={{
                    maxHeight: "360px",
                    overflowY: "auto",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "8px 16px",
                  }}>
                    {activeQuestions.map((q, i) => {
                      const ans = answers[q.key];
                      return (
                        <div
                          key={q.key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderBottom: i < activeQuestions.length - 1 ? "1px solid #f3f4f6" : "none",
                            gap: "16px",
                          }}
                        >
                          <div style={{ fontSize: "14px", color: "#374151" }}>
                            <span style={{ color: "#9ca3af", marginRight: "8px" }}>{i + 1}.</span>
                            {q.name}
                          </div>
                          <Tag
                            color={
                              ans === "Yes"
                                ? "green"
                                : ans === "No"
                                  ? "red"
                                  : ans === "Sometimes"
                                    ? "orange"
                                    : ans === "N/A"
                                      ? "blue"
                                      : "default"
                            }
                            style={{ fontWeight: 600, minWidth: "70px", textAlign: "center" }}
                          >
                            {ans || "Not Answered"}
                          </Tag>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Navigation Footer */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid #e5e7eb",
            }}>
              {currStep > 0 ? (
                <Button
                  size="large"
                  onClick={handleStepBack}
                  icon={<ArrowLeftOutlined />}
                  style={{ borderRadius: "8px", minWidth: "120px" }}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Button
                  size="large"
                  loading={isSavingDraft}
                  icon={<SaveOutlined />}
                  onClick={() => saveDraft(answers, currStep, true)}
                  style={{ borderRadius: "8px" }}
                >
                  Save Draft
                </Button>

                {currStep < 3 ? (
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleStepNext}
                    style={{
                      borderRadius: "8px",
                      minWidth: "140px",
                      background: "#4A6741",
                      borderColor: "#4A6741",
                      fontWeight: 600,
                    }}
                  >
                    Next <ArrowRightOutlined />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setIsSubmitModalOpen(true)}
                    style={{
                      borderRadius: "8px",
                      minWidth: "160px",
                      background: "#166534",
                      borderColor: "#166534",
                      fontWeight: 700,
                      boxShadow: "0 2px 4px rgba(22, 101, 52, 0.2)",
                    }}
                  >
                    Submit Evaluation
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Submission Confirmation Modal */}
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "17px" }}>
                {totalAnswered === 35 ? (
                  <CheckCircleFilled style={{ color: "#166534" }} />
                ) : (
                  <ExclamationCircleFilled style={{ color: "#ea580c" }} />
                )}
                Confirm Evaluation Submission
              </div>
            }
            open={isSubmitModalOpen}
            onCancel={() => setIsSubmitModalOpen(false)}
            footer={[
              <Button key="back" size="large" onClick={() => setIsSubmitModalOpen(false)}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                size="large"
                loading={isSubmitting}
                onClick={handleSubmit}
                style={{
                  background: "#166534",
                  borderColor: "#166534",
                  fontWeight: 600,
                }}
              >
                Yes, Submit Evaluation
              </Button>,
            ]}
          >
            <div style={{ padding: "16px 0" }}>
              {totalAnswered < 35 ? (
                <div>
                  <p style={{ color: "#c2410c", fontWeight: 600, marginBottom: "8px" }}>
                    Warning: You have only answered {totalAnswered} of 35 questions.
                  </p>
                  <p style={{ color: "#4b5563" }}>
                    Submitting now will leave unanswered questions blank. Are you sure you want to proceed with submission?
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ color: "#166534", fontWeight: 600, marginBottom: "8px" }}>
                    All 35 questions have been completed!
                  </p>
                  <p style={{ color: "#4b5563" }}>
                    Self Assessment Score: <strong>{selfScore} / {outOfScore}</strong>.
                  </p>
                  <p style={{ color: "#4b5563" }}>
                    Once submitted, your evaluation will be finalized and sent to your observer.
                  </p>
                </div>
              )}
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Details;
