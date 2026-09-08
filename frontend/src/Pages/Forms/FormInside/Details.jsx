import React, { useEffect, useState } from "react";
import {
  Form,
  InputNumber,
  Row,
  Col,
  message,
  Spin,
  Radio,
  Tag,
  Table,
  Descriptions,
  Card,
  Empty,
  Button,
  Select,
  DatePicker,
  Input,
  Alert,
} from "antd";
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
import CommonStepper from "../../../Components/CommonStepper";
import "../../../App.css"; // Import the custom CSS

const { Option } = Select;

const Details = () => {
  const [form] = Form.useForm();
  const [currStep, setCurrStep] = useState(0);
  const [formDetails, setFormDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [selfAssessmentScore, setSelfAssessmentScore] = useState(0);
  const [ObserverID, setObserverID] = useState("");
  const [sectionState, setSectionState] = useState();
  const Id = useParams().id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const GetUserAccess = getUserId()?.access;
  const isLoading2 = useSelector((state) => state?.Forms?.loading);
  const [betaLoading, setBetaLoading] = useState(false);
  const [appnewData, setAppnewData] = useState(null);
  const [newData, setNewData] = useState(false);
  const CurrectUserRole = getUserId().access;
  const ObserverList = useSelector((state) => state.user.GetObserverLists);

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
      console.error("Error fetching class data:", error);
      message.error("An error occurred while fetching class data.");
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
          const userAnswers = GetUserAccess === UserRole[1] ? loadedForm.observerForm : loadedForm.teacherForm;
          if (userAnswers) {
            form.setFieldsValue(userAnswers);
          }
          if (loadedForm.currentStep !== undefined && loadedForm.currentStep !== null && loadedForm.currentStep >= 0 && loadedForm.currentStep <= 3) {
            setCurrStep(loadedForm.currentStep);
          }
        }
        const { className, date, section } = response?.payload || {};
        if (!className || !date || !section) {
          dispatch(GetObserverList());
          setBetaLoading(!className || !date || !section);
          message.success("Fill All the data!");
        } else if (
          response?.payload?.isCoordinatorComplete &&
          response?.payload?.isTeacherComplete
        ) {
          message.success("Form is already submitted!");
          navigate(`/fortnightly-monitor/report/${Id}`);
        } else if (
          GetUserAccess === UserRole[1] &&
          response?.payload?.isCoordinatorComplete
        ) {
          message.success("Form is already submitted!");
          navigate(`/fortnightly-monitor/report/${Id}`);
        } else if (
          GetUserAccess === UserRole[2] &&
          response?.payload?.isTeacherComplete
        ) {
          message.success("Form is already submitted!");
          navigate(`/fortnightly-monitor/report/${Id}`);
        }
      })
      .catch(() => {
        message.error("Error fetching form details.");
        setIsLoading(false);
      });
  }, [Id, navigate, !ObserverID]);

  // Enum options
  const yesNoNAOptions = ["Yes", "No", "Sometimes", "N/A"];

  const steps = [
    { title: "Displays & Setup" },
    { title: "Routines & Activities" },
    { title: "Records & Registers" },
    { title: "Review & Submit" },
  ];

  const saveDraft = async (values, targetStep) => {
    if (!Id || !GetUserAccess) return;
    const isObserver = GetUserAccess === UserRole[1];
    const payload = {
      id: Id,
      data: {
        isDraft: true,
        currentStep: targetStep !== undefined ? targetStep : currStep,
        ...(isObserver ? { observerForm: values } : { teacherForm: values }),
        ...(values?.className ? { className: values.className } : {}),
        ...(values?.section ? { Section: values.section } : {}),
        ...(values?.date ? { date: values.date } : {}),
      },
    };
    try {
      await dispatch(GetSingleFormComplete(payload));
    } catch (e) {
      console.error("Draft save error:", e);
    }
  };

  const handleStepNext = async () => {
    try {
      const activeQuestions = formDetails?.createdAt < cutoffDate ? questionsOld : questions;
      let fieldsToValidate = [];
      if (currStep === 0) {
        if (betaLoading) {
          fieldsToValidate.push("className", "section", "date");
        }
        fieldsToValidate.push(...activeQuestions.slice(0, 12).map((q) => q.key));
      } else if (currStep === 1) {
        fieldsToValidate.push(...activeQuestions.slice(12, 25).map((q) => q.key));
      } else if (currStep === 2) {
        fieldsToValidate.push(...activeQuestions.slice(25).map((q) => q.key));
      }
      await form.validateFields(fieldsToValidate);
      const values = form.getFieldsValue();
      await saveDraft(values, currStep + 1);
      setCurrStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      message.error("Please answer all required questions on this step before continuing.");
    }
  };

  const handleStepBack = async () => {
    const values = form.getFieldsValue();
    await saveDraft(values, currStep - 1);
    setCurrStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [totalCount, setTotalCount] = useState(0);
  const [totalCountMein, setTotalCountMein] = useState(0);
  const type = "teacherForm";

  useEffect(() => {
    if (!formDetails || !formDetails[type]) return;

    const validValues2 = ["Yes", "Sometimes"];
    const Assesscount = Object.values(formDetails[type]).filter((value) =>
      validValues2.includes(value),
    ).length;

    const validValues = ["Yes", "No", "Sometimes"]; // Include these values
    const count = Object.values(formDetails[type]).filter((value) =>
      validValues.includes(value),
    ).length;

    setTotalCount(count);
  }, [formDetails, type]);

  const onFinish = async (values) => {
    if (!Id || !GetUserAccess) {
      message.error("Invalid form submission!");
      return;
    }

    let payload = {
      id: Id,
      data: {},
    };

    // Assign payload based on user role and form status
    if (GetUserAccess === UserRole[1] && !formDetails?.isCoordinatorComplete) {
      payload.data = {
        isCoordinatorComplete: true,
        observerForm: values,
      };
    } else if (
      GetUserAccess === UserRole[2] &&
      !formDetails?.isTeacherComplete
    ) {
      payload.data = {
        isTeacherComplete: true,
        teacherForm: values,
      };

      if (formDetails.isObserverInitiation) {
        payload.data = {
          ...payload.data,
          className: values?.className,
          date: values?.date,
          Section: values?.section,
        };
      }
    } else {
      message.error("You do not have permission to complete this form!");
      return;
    }

    setIsLoading(true);
    try {
      // Dispatch form submission
      const res = await dispatch(GetSingleFormComplete(payload));

      if (res.payload.message) {
        setIsLoading(false);
        setAppnewData(res?.payload?.form);
        message.success("Form submitted successfully!");
        // Activity object
        const receiverId =
          UserRole[2] === getUserId().access
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
          : UserRole[1] === getUserId().access
            ? `You have completed the Fortnightly Monitor Form for ${formDetails?.className} | ${formDetails?.section}`
            : `${
                formDetails?.teacherID?.name || formDetails?.userId?.name
              } has completed the Fortnightly Monitor Form for ${
                formDetails?.className
              } | ${formDetails?.section}`;

        const teacherMessage = payload?.data?.className
          ? `You have completed the Fortnightly Monitor Form for ${res?.payload?.form?.className} | ${res?.payload?.form?.section}`
          : UserRole[1] === getUserId().access
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
          senderId: getUserId()?.id,
          fromNo: 1,
          data: res.payload,
        };

        const activitiRecord = await dispatch(CreateActivityApi(activity));
        if (!activitiRecord?.payload?.success) {
          message.error("Error on Activity Record");
        }
        navigate(`/fortnightly-monitor/report/${Id}`);
      } else {
        throw new Error(res.payload.message || "Error submitting the form.");
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // Calculate self-assessment score
  const calculateScore = () => {
    const values = form.getFieldsValue();
    let score = 0;

    const currentQuestions =
      formDetails?.createdAt < cutoffDate ? questionsOld : questions;

    currentQuestions.forEach((key) => {
      const answer = values[key?.key];
      if (answer === "Yes")
        score += 1; // Add 1 for "Yes"
      else if (answer === "No")
        score += 0; // No points for "No"
      else if (answer === "Sometimes") score += 0.5; // Add 0.5 for "0.5"
      // Ignore "N/A" (or any undefined answer)
    });
    setSelfAssessmentScore(score);
    getTotalScorevalu(values);
  };

  const getTotalScorevalu = (formValue) => {
    const validValues = ["Yes", "No", "Sometimes"]; // Include these values
    const count = Object.values(formValue).filter((value) =>
      validValues.includes(value),
    ).length;
    setTotalCountMein(count);
  };

  const getTotalScore = (type) => {
    if (!formDetails) return 0;

    // Count "Yes", "Sometimes", and "No" as 1
    const validValues = ["Yes", "Sometimes", "No"];
    const scores = Object.values(formDetails[type]).reduce((sum, value) => {
      return sum + (validValues.includes(value) ? 1 : 0); // Add 1 if value matches
    }, 0);

    return scores; // Return total score
  };

  const getSelfAssemnetScrore = (type) => {
    if (!formDetails) return 0;
    const validValues = { Yes: 1, Sometimes: 0.5 };
    const scores = Object.values(formDetails[type]).reduce((sum, value) => {
      return sum + (validValues[value] || 0); // Add score if value matches, otherwise add 0
    }, 0);
    return scores;
  };

  const disableFutureDates = (current) => {
    // Get the current date without the time part
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to 00:00:00 to compare only the date

    // Disable dates that are in the future
    return current && current.toDate() > today;
  };

  const SideQuestion = document.querySelectorAll("#SideQuestion");
  const heights = Array.from(SideQuestion).map(
    (element) => element.offsetHeight,
  );

  const SectionSubject = (value) => {
    if (value) {
      const filteredData = newData?.filter((data) => data?._id === value);
      if (filteredData?.length > 0) {
        setSectionState(filteredData[0]); // Set the filtered data to sectionState
      }
    }

    return []; // Return an empty array if the value is falsy
  };

  return (
    <div className="modern-form-container">
      {isLoading ? (
        <div className="modern-loader">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="modern-form-header">
            <div className="header-section" style={{ width: "100%" }}>
              <h2 className="form-title">Observation Form</h2>
              <div className="form-subtitle">Complete your evaluation</div>
              
              {formDetails && (() => {
                const teacherName = formDetails?.teacherID?.name || formDetails?.userId?.name || "—";
                const observerName = formDetails?.teacherID ? (formDetails?.userId?.name || "—") : (formDetails?.coordinatorID?.name || "—");
                
                return (
                  <div style={{
                    marginTop: "16px",
                    padding: "16px 24px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "24px 32px",
                    fontSize: "14px",
                    color: "#4b5563",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
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
                      {formDetails?.date ? new Date(formDetails.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }) : "—"}
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

          <div style={{
            background: "#fff",
            padding: "20px 24px",
            borderRadius: "16px",
            marginBottom: "24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <CommonStepper steps={steps} currentStep={currStep} />
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={calculateScore}
            className="modern-form"
          >
            {(() => {
              const activeQuestions = formDetails?.createdAt < cutoffDate ? questionsOld : questions;
              const stepQuestions =
                currStep === 0
                  ? activeQuestions.slice(0, 12)
                  : currStep === 1
                    ? activeQuestions.slice(12, 25)
                    : currStep === 2
                      ? activeQuestions.slice(25)
                      : [];

              if (currStep === 3) {
                // Review & Final Confirmation Step
                const formValues = form.getFieldsValue();
                const countAnswered = (arr) => arr.filter((q) => !!formValues[q.key]).length;
                const s0Answered = countAnswered(activeQuestions.slice(0, 12));
                const s1Answered = countAnswered(activeQuestions.slice(12, 25));
                const s2Answered = countAnswered(activeQuestions.slice(25));
                const totalAnswered = s0Answered + s1Answered + s2Answered;

                return (
                  <div style={{ background: "#fff", padding: "32px", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                      Review & Submit Evaluation
                    </h3>
                    <p style={{ color: "#6b7280", marginBottom: "24px" }}>
                      Please review your responses before final submission. You can click on any section to go back and make changes.
                    </p>

                    <Row gutter={[20, 20]}>
                      <Col xs={24} md={8}>
                        <Card
                          hoverable
                          onClick={() => setCurrStep(0)}
                          style={{ borderRadius: "12px", borderColor: "#e5e7eb" }}
                        >
                          <div style={{ fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                            1. Displays & Setup
                          </div>
                          <div style={{ color: "#059669", fontSize: "15px", fontWeight: 600 }}>
                            {s0Answered} / 12 Answered
                          </div>
                          <Button type="link" style={{ padding: 0, marginTop: "8px" }}>
                            Review / Edit →
                          </Button>
                        </Card>
                      </Col>

                      <Col xs={24} md={8}>
                        <Card
                          hoverable
                          onClick={() => setCurrStep(1)}
                          style={{ borderRadius: "12px", borderColor: "#e5e7eb" }}
                        >
                          <div style={{ fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                            2. Routines & Activities
                          </div>
                          <div style={{ color: "#059669", fontSize: "15px", fontWeight: 600 }}>
                            {s1Answered} / 13 Answered
                          </div>
                          <Button type="link" style={{ padding: 0, marginTop: "8px" }}>
                            Review / Edit →
                          </Button>
                        </Card>
                      </Col>

                      <Col xs={24} md={8}>
                        <Card
                          hoverable
                          onClick={() => setCurrStep(2)}
                          style={{ borderRadius: "12px", borderColor: "#e5e7eb" }}
                        >
                          <div style={{ fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                            3. Records & Registers
                          </div>
                          <div style={{ color: "#059669", fontSize: "15px", fontWeight: 600 }}>
                            {s2Answered} / {activeQuestions.slice(25).length} Answered
                          </div>
                          <Button type="link" style={{ padding: 0, marginTop: "8px" }}>
                            Review / Edit →
                          </Button>
                        </Card>
                      </Col>
                    </Row>

                    <div style={{
                      marginTop: "24px",
                      padding: "20px 24px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "12px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "24px",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                      <div>
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                          {getUserId().access === UserRole[1] ? "Observer Score" : "Self Assessment Score"}
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 800, color: "#111827" }}>
                          {selfAssessmentScore} <span style={{ fontSize: "16px", color: "#9ca3af", fontWeight: 500 }}>/ {totalCountMein}</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>Total Completed Questions</div>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: "#059669" }}>
                          {totalAnswered} / {activeQuestions.length}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Row gutter={[24, 0]}>
                  <Col xs={24} lg={12}>
                    <div className="form-section">
                      {currStep === 0 && betaLoading && (
                        <div className="info-card" style={{ marginBottom: "24px" }}>
                          <h3 className="section-title">Class Information</h3>
                          <Row gutter={[16, 16]}>
                            <Col span={24}>
                              <Form.Item
                                label="Class"
                                name="className"
                                rules={[{ required: true, message: "Please select a class" }]}
                              >
                                <Select
                                  showSearch
                                  placeholder="Select a class"
                                  size="large"
                                  onChange={(value) => SectionSubject(value)}
                                  options={
                                    newData &&
                                    newData?.length > 0 &&
                                    newData?.map((item) => ({
                                      key: item?._id,
                                      id: item?._id,
                                      value: item?._id,
                                      label: item?.className,
                                    }))
                                  }
                                  filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                  }
                                />
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item
                                label="Section"
                                name="section"
                                rules={[{ required: true, message: "Please select a section" }]}
                              >
                                <Select
                                  showSearch
                                  placeholder="Select a section"
                                  size="large"
                                  options={sectionState?.sections?.map((item) => ({
                                    key: item._id,
                                    id: item._id,
                                    value: item.name,
                                    label: item.name,
                                  }))}
                                  filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                  }
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item
                                label="Date"
                                name="date"
                                rules={[{ required: true, message: "Please select a date" }]}
                              >
                                <DatePicker
                                  className="w-100"
                                  size="large"
                                  format="YYYY-MM-DD"
                                  disabledDate={disableFutureDates}
                                />
                              </Form.Item>
                            </Col>

                            {CurrectUserRole === UserRole[2] && (
                              <Col xs={24} sm={12}>
                                <Form.Item label="Coordinator" name="coordinatorID">
                                  <Select
                                    defaultValue={formDetails?.userId?.name}
                                    disabled={betaLoading}
                                    showSearch
                                    size="large"
                                    placeholder="Select a coordinator"
                                    options={ObserverList?.map((item) => ({
                                      value: item._id,
                                      label: item.name,
                                    }))}
                                    filterOption={(input, option) =>
                                      option.label.toLowerCase().includes(input.toLowerCase())
                                    }
                                  />
                                </Form.Item>
                                <Form.Item hidden label="Coordinator" name="isCoordinator">
                                  <Select
                                    onChange={(value) => {
                                      setIsCoordinator(true);
                                      form.resetFields(["teacherID"]);
                                    }}
                                  >
                                    <Option value={false}>No</Option>
                                    <Option value={true}>Yes</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                            )}
                          </Row>
                        </div>
                      )}

                      <div className="questions-section">
                        <h3 className="section-title">
                          {steps[currStep]?.title} ({stepQuestions.length} Questions)
                        </h3>
                        {stepQuestions.map((field) => (
                          <div className="question-card" key={field?.key}>
                            <Form.Item
                              className="question-item"
                              name={field?.key}
                              label={
                                <span className="question-label">
                                  {field?.name
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </span>
                              }
                              rules={[{ required: true, message: `Please select an option` }]}
                            >
                              <div className="modern-radio-group">
                                {yesNoNAOptions.map((option) => (
                                  <label key={option} className="radio-label">
                                    <input
                                      type="radio"
                                      name={field?.key}
                                      value={option}
                                      className="radio-input"
                                    />
                                    <span className="radio-text">{option}</span>
                                  </label>
                                ))}
                              </div>
                            </Form.Item>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} lg={12}>
                    <div className="sticky-sidebar">
                      {(GetUserAccess === UserRole[2] && !formDetails?.isCoordinatorComplete) ||
                      (GetUserAccess === UserRole[1] && !formDetails?.isTeacherComplete) ? (
                        <div className="empty-state">
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Waiting for teacher response"
                          />
                        </div>
                      ) : null}

                      {GetUserAccess === UserRole[1] && formDetails?.isTeacherComplete && (
                        <div className="response-section">
                          <h3 className="section-title">Teacher Responses ({steps[currStep]?.title})</h3>
                          {stepQuestions.map((item, index) => {
                            const answer = formDetails?.teacherForm?.[item.key];
                            return (
                              <div className="response-card" key={index + 1}>
                                <div className="response-question">
                                  {item?.name
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </div>
                                <div className={`response-badge badge-${answer?.toLowerCase()}`}>
                                  {answer || "—"}
                                </div>
                              </div>
                            );
                          })}

                          <div className="score-card">
                            <div className="score-label">Teacher Self Assessment</div>
                            <div className="score-value">
                              <span className="score-number">
                                {getSelfAssemnetScrore("teacherForm") || "N/A"}
                              </span>
                              <span className="score-divider">/</span>
                              <span className="score-total">
                                {getTotalScore("teacherForm")}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              );
            })()}

            <Form.Item name="selfEvaluationScore" hidden>
              <InputNumber value={selfAssessmentScore} disabled />
            </Form.Item>

            {/* Stepper Navigation Footer */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid #e5e7eb"
            }}>
              {currStep > 0 ? (
                <Button
                  size="large"
                  onClick={handleStepBack}
                  style={{ borderRadius: "8px", minWidth: "120px" }}
                >
                  ← Back
                </Button>
              ) : (
                <div />
              )}

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Button
                  size="large"
                  onClick={async () => {
                    const values = form.getFieldsValue();
                    await saveDraft(values, currStep);
                    message.success("Draft saved successfully!");
                  }}
                  style={{ borderRadius: "8px" }}
                >
                  Save Draft
                </Button>

                {currStep < steps.length - 1 ? (
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
                    Next →
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    style={{
                      borderRadius: "8px",
                      minWidth: "160px",
                      background: "#4A6741",
                      borderColor: "#4A6741",
                      fontWeight: 600,
                    }}
                  >
                    Submit Evaluation
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </>
      )}
    </div>
  );
};

export default Details;
