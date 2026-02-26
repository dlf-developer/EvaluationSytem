import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Row,
  Spin,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUserId } from "../../Utils/auth";
import { UserRole } from "../../config/config";
import {
  EditUpdate,
  GetSingleFormsOne,
} from "../../redux/Form/fortnightlySlice";
import { questions } from "../../Components/normalData";

function FortnightlyMonitorEdit({ flag }) {
  const [form] = Form.useForm();
  const [formDetails, setFormDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [selfAssessmentScore, setSelfAssessmentScore] = useState(0);
  const [ObserverID, setObserverID] = useState("");
  const Id = useParams().id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const GetUserAccess = getUserId()?.access;
  const isLoading2 = useSelector((state) => state?.Forms?.loading);
  const [betaLoading, setBetaLoading] = useState(false);
  const CurrectUserRole = getUserId().access;
  const ObserverList = useSelector((state) => state.user.GetObserverLists);
  const [totalCount, setTotalCount] = useState(0);
  const [selfAssessCount, setSelfAssessCount] = useState();

  const yesNoNAOptions = ["Yes", "No", "Sometimes", "N/A"];
  const flagType = flag || "Teacher";

  // Fetch form details
  useEffect(() => {
    setIsLoading(true);

    dispatch(GetSingleFormsOne(Id))
      .then((response) => {
        setFormDetails(response?.payload);
        setIsLoading(false);
      })
      .catch(() => {
        message.error("Error fetching form details.");
        setIsLoading(false);
      });
  }, [Id, navigate, !ObserverID]);

  const type = "teacherForm";
  useEffect(() => {
    if (!formDetails || !formDetails[type]) return;

    const validValues2 = ["Yes", "Sometimes"];
    const Assesscount = Object.values(formDetails[type]).filter((value) =>
      validValues2.includes(value),
    ).length;
    setSelfAssessCount(Assesscount);
    const validValues = ["Yes", "No", "Sometimes"]; // Include these values
    const count = Object.values(formDetails[type]).filter((value) =>
      validValues.includes(value),
    ).length;
    setTotalCount(count);
  }, [formDetails, type]);

  const onFinish = async (value) => {
    const payload = {
      id: Id,
      data: {
        teacherForm: {
          ...value,
          OutOf: totalCount,
          totalScore: selfAssessmentScore,
        },
      },
    };
    const response = await dispatch(EditUpdate(payload));
    if (response.payload.success) {
      message.success(response.payload.message);
      navigate("/fortnightly-monitor");
    }
  };

  // Calculate self-assessment score
  const calculateScore = () => {
    const values = form.getFieldsValue();
    let score = 0;

    questions.forEach((key) => {
      const answer = values[key?.key];
      if (answer === "Yes")
        score += 1; // Add 1 for "Yes"
      else if (answer === "No")
        score += 0; // No points for "No"
      else if (answer === "Sometimes") score += 0.5; // Add 0.5 for "0.5"
      // Ignore "N/A" (or any undefined answer)
    });

    setSelfAssessmentScore(score);
    form.setFieldsValue({ selfEvaluationScore: score }); // Update hidden field
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
            <div className="header-section">
              <h2 className="form-title">Edit Your Observation</h2>
              <div className="form-subtitle">
                Update your evaluation responses
              </div>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={calculateScore}
            className="modern-form"
          >
            <Row gutter={[24, 0]}>
              <Col xs={24} lg={12}>
                <div className="form-section">
                  {betaLoading && (
                    <div className="info-card">
                      <h3 className="section-title">Class Information</h3>
                      <Row gutter={[16, 16]}>
                        <Col span={24}>
                          <Form.Item
                            label="Class"
                            name="className"
                            rules={[
                              {
                                required: true,
                                message: "Please enter a class",
                              },
                            ]}
                          >
                            <Input
                              placeholder="Enter Class (e.g., 10th)"
                              size="large"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            label="Section"
                            name="section"
                            rules={[
                              {
                                required: true,
                                message: "Please enter a section",
                              },
                            ]}
                          >
                            <Input
                              placeholder="Enter Section (e.g., A, B)"
                              size="large"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            label="Date"
                            name="date"
                            rules={[
                              {
                                required: true,
                                message: "Please select a date",
                              },
                            ]}
                          >
                            <DatePicker
                              className="w-100"
                              size="large"
                              format="YYYY-MM-DD"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  )}

                  <div className="questions-section">
                    <h3 className="section-title">Evaluation Questions</h3>
                    {questions?.map((field, index) => {
                      return (
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
                            rules={[
                              {
                                required: true,
                                message: `Please select an option`,
                              },
                            ]}
                          >
                            <div className="modern-radio-group">
                              {yesNoNAOptions.map((option) => (
                                <label key={option} className="radio-label">
                                  <input
                                    type="radio"
                                    name={field?.key}
                                    value={option}
                                    className="radio-input"
                                    onChange={(e) => {
                                      form.setFieldValue(field?.key, option);
                                      calculateScore();
                                    }}
                                    checked={
                                      form.getFieldValue(field?.key) === option
                                    }
                                  />
                                  <span className="radio-text">{option}</span>
                                </label>
                              ))}
                            </div>
                          </Form.Item>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Col>

              <Col xs={24} lg={12}>
                <div className="sticky-sidebar">
                  {(GetUserAccess === UserRole[1] &&
                    !formDetails?.isCoordinatorComplete) ||
                  (GetUserAccess === UserRole[2] &&
                    !formDetails?.isTeacherComplete) ? (
                    <div className="empty-state">
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No current response available"
                      />
                    </div>
                  ) : (
                    ""
                  )}

                  {GetUserAccess === UserRole[2] &&
                  GetUserAccess === UserRole[1] &&
                  flagType === "Teacher"
                    ? formDetails?.isTeacherComplete
                    : formDetails?.isCoordinatorComplete && (
                        <div className="response-section">
                          <h3 className="section-title">Current Response</h3>
                          {questions?.map((item, index) => {
                            const answer =
                              flagType === "Teacher"
                                ? formDetails?.teacherForm[item?.key]
                                : formDetails?.observerForm[item?.key];

                            return (
                              <div className="response-card" key={index + 1}>
                                <div className="response-question">
                                  {item?.name
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </div>
                                <div
                                  className={`response-badge badge-${answer?.toLowerCase()}`}
                                >
                                  {answer}
                                </div>
                              </div>
                            );
                          })}

                          <div className="score-card">
                            <div className="score-label">Self Assessment</div>
                            <div className="score-value">
                              <span className="score-number">
                                {flagType === "Teacher"
                                  ? formDetails?.teacherForm
                                      ?.selfEvaluationScore
                                  : formDetails?.observerForm
                                      ?.selfEvaluationScore || "N/A"}
                              </span>
                              <span className="score-divider">/</span>
                              <span className="score-total">{totalCount}</span>
                            </div>
                          </div>
                        </div>
                      )}
                </div>
              </Col>
            </Row>

            <div className="form-footer">
              <div className="score-summary">
                <span className="summary-label">Self Assessment Score</span>
                <span className="summary-value">
                  <span className="value-number">{selfAssessmentScore}</span>
                  <span className="value-divider">/</span>
                  <span className="value-total">{totalCount}</span>
                </span>
              </div>

              <Form.Item name="selfEvaluationScore" hidden>
                <InputNumber value={selfAssessmentScore} disabled />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="submit-button"
              >
                Update Evaluation
              </Button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
}

export default FortnightlyMonitorEdit;
