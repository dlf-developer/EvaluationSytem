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
import { getCreateClassSection, GetObserverList } from "../../../redux/userSlice";
import { questions } from "../../../Components/normalData";
import { CreateActivityApi } from "../../../redux/Activity/activitySlice";
import "../../../App.css"; // Import the custom CSS

const { Option } = Select;

const Details = () => {
  const [form] = Form.useForm();
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
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
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
        setFormDetails(response?.payload);
        setIsLoading(false);
        const { className, date, section } = response.payload;
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

  const [totalCount, setTotalCount] = useState(0);
  const [totalCountMein, setTotalCountMein] = useState(0);
  const type = "teacherForm";

  useEffect(() => {
    if (!formDetails || !formDetails[type]) return;

    const validValues2 = ["Yes", "Sometimes"];
    const Assesscount = Object.values(formDetails[type]).filter((value) =>
      validValues2.includes(value)
    ).length;

    const validValues = ["Yes", "No", "Sometimes"]; // Include these values
    const count = Object.values(formDetails[type]).filter((value) =>
      validValues.includes(value)
    ).length;

    setTotalCount(count);
  }, [formDetails, type]);

  const onFinish = async (values) => {
    console.log(values,"sjjssjjsj")
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
    } else if (GetUserAccess === UserRole[2] && !formDetails?.isTeacherComplete) {
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
          ? `${res?.payload?.form?.teacherID?.name ||
          res?.payload?.form?.userId?.name
          } has completed the Fortnightly Monitor Form for ${res?.payload?.form?.className
          } | ${res?.payload?.form?.section}`
          : UserRole[1] === getUserId().access
            ? `You have completed the Fortnightly Monitor Form for ${formDetails?.className} | ${formDetails?.section}`
            : `${formDetails?.teacherID?.name || formDetails?.userId?.name
            } has completed the Fortnightly Monitor Form for ${formDetails?.className
            } | ${formDetails?.section}`;

        const teacherMessage = payload?.data?.className
          ? `You have completed the Fortnightly Monitor Form for ${res?.payload?.form?.className} | ${res?.payload?.form?.section}`
          : UserRole[1] === getUserId().access
            ? `${formDetails?.coordinatorID?.name || formDetails?.userId?.name
            } has completed the Fortnightly Monitor Form for ${formDetails?.className
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

    questions.forEach((key) => {
      const answer = values[key?.key];
      if (answer === "Yes") score += 1; // Add 1 for "Yes"
      else if (answer === "No") score += 0; // No points for "No"
      else if (answer === "Sometimes") score += 0.5; // Add 0.5 for "0.5"
      // Ignore "N/A" (or any undefined answer)
    });
    setSelfAssessmentScore(score);
    getTotalScorevalu(values);
  };

  const getTotalScorevalu = (formValue) => {
    const validValues = ["Yes", "No", "Sometimes"]; // Include these values
    const count = Object.values(formValue).filter((value) =>
      validValues.includes(value)
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
    (element) => element.offsetHeight
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
            <div className="header-section">
              <h2 className="form-title">Observation Form</h2>
              <div className="form-subtitle">Complete your evaluation</div>
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
                                message: "Please select a class",
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              placeholder="Select a class"
                              size="large"
                              onChange={(value) => SectionSubject(value)}
                              options={newData?.map((item) => ({
                                key: item._id,
                                id: item._id,
                                value: item._id,
                                label: item.className,
                              }))}
                              filterOption={(input, option) =>
                                option.label
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
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
                                message: "Please select a section",
                              },
                            ]}
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
                                option.label
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
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
                              disabledDate={disableFutureDates}
                            />
                          </Form.Item>
                        </Col>

                        {CurrectUserRole === UserRole[2] && (
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Coordinator"
                              name="coordinatorID"
                            >
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
                                  option.label
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              />
                            </Form.Item>
                            <Form.Item
                              hidden
                              label="Coordinator"
                              name="isCoordinator"
                            >
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
                  {(GetUserAccess === UserRole[2] &&
                    !formDetails?.isCoordinatorComplete) ||
                    (GetUserAccess === UserRole[1] &&
                      !formDetails?.isTeacherComplete) ? (
                    <div className="empty-state">
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Waiting for teacher response"
                      />
                    </div>
                  ) : (
                    ""
                  )}

                  {GetUserAccess === UserRole[1] &&
                    formDetails?.isTeacherComplete && (
                      <div className="response-section">
                        <h3 className="section-title">Teacher Response</h3>
                        {questions?.map((item, index) => {
                          const answer = formDetails?.teacherForm[item.key];
                          return (
                            <div className="response-card" key={index + 1}>
                              <div className="response-question">
                                {item?.name
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </div>
                              <div className={`response-badge badge-${answer?.toLowerCase()}`}>
                                {answer}
                              </div>
                            </div>
                          );
                        })}

                        <div className="score-card">
                          <div className="score-label">Self Assessment</div>
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

            <div className="form-footer">
              <div className="score-summary">
                <span className="summary-label">
                  {getUserId().access === UserRole[1]
                    ? "Observer Score"
                    : "Self Assessment Score"}
                </span>
                <span className="summary-value">
                  <span className="value-number">{selfAssessmentScore}</span>
                  <span className="value-divider">/</span>
                  <span className="value-total">{totalCountMein}</span>
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
                Submit Evaluation
              </Button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
};

export default Details;