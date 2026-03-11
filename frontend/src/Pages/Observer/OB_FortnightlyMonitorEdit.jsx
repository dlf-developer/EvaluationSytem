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
import {
  questions,
  questionsOld,
  cutoffDate,
} from "../../Components/normalData";
import { calculateScorenew } from "../../Utils/calculateScore";

function OB_FortnightlyMonitorEdit() {
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
  const [currentQuestions, setCurrentQuestions] = useState([]);

  useEffect(() => {
    if (formDetails?.createdAt) {
      if (new Date(formDetails.createdAt) < new Date(cutoffDate)) {
        setCurrentQuestions(questionsOld);
      } else {
        setCurrentQuestions(questions);
      }
    } else {
      setCurrentQuestions(questions);
    }
  }, [formDetails]);

  const yesNoNAOptions = ["Yes", "No", "Sometimes", "N/A"];

  // Fetch form details
  useEffect(() => {
    setIsLoading(true);

    dispatch(GetSingleFormsOne(Id))
      .then((response) => {
        const data = response?.payload;
        setFormDetails(data);
        if (data?.observerForm) {
          form.setFieldsValue(data.observerForm);
          const result = calculateScorenew(data.observerForm, currentQuestions);
          setSelfAssessmentScore(result.score);
          setTotalCount(result.total);
        }
        setIsLoading(false);
      })
      .catch(() => {
        message.error("Error fetching form details.");
        setIsLoading(false);
      });
  }, [Id, navigate, !ObserverID]);

  const type = "observerForm";
  useEffect(() => {
    if (!formDetails || !formDetails[type]) return;

    const result = calculateScorenew(formDetails[type], currentQuestions);
    setSelfAssessCount(result.score);
    setTotalCount(result.total);
  }, [formDetails, type, currentQuestions]);

  const onFinish = async (value) => {
    const payload = {
      id: Id,
      data: { observerForm: value },
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
    const result = calculateScorenew(values, currentQuestions);

    setSelfAssessmentScore(result.score);
    setTotalCount(result.total);
    form.setFieldsValue({ selfEvaluationScore: result.score }); // Update hidden field
  };
  return (
    <div className="container mt-3">
      {isLoading ? (
        <div className="LoaderWrapper">
          <Spin size="large" className="position-absolute" />
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-around">
            <h2 className="text-start mb-4 fs-5">Edit Your Observation</h2>
            <h2 className="text-start mb-4 fs-5">Current Response</h2>
          </div>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={calculateScore} // Trigger score calculation
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={12} lg={12}>
                {betaLoading && (
                  <>
                    <Form.Item
                      label="Class"
                      name="className"
                      rules={[
                        { required: true, message: "Please enter a class!" },
                      ]}
                    >
                      <Input placeholder="Enter Class (e.g., 10th)" />
                    </Form.Item>

                    <Form.Item
                      label="Section"
                      name="section"
                      rules={[
                        { required: true, message: "Please enter a section!" },
                      ]}
                    >
                      <Input placeholder="Enter Section (e.g., A, B)" />
                    </Form.Item>

                    <div className="d-flex gap-3 align-items-center justify-content-between">
                      <Form.Item
                        className="w-100"
                        label="Date"
                        name="date"
                        rules={[
                          { required: true, message: "Please select a date!" },
                        ]}
                      >
                        <DatePicker className="w-100" format="YYYY-MM-DD" />
                      </Form.Item>
                    </div>
                  </>
                )}
                {currentQuestions?.map((field, index) => {
                  return (
                    <div
                      className="mb-3 border p-3 rounded shadow-sm"
                      key={field?.key}
                    >
                      <Form.Item
                        className="w-75 mb-2"
                        name={field?.key}
                        label={
                          <p
                            className="mb-0 fs-6"
                            style={{ color: "rgb(52 52 52 / 64%)" }}
                          >
                            {field?.name
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </p>
                        }
                        rules={[
                          {
                            required: true,
                            message: `Please select an option for ${field?.name}.`,
                          },
                        ]}
                      >
                        <Radio.Group
                          block
                          options={yesNoNAOptions}
                          optionType="button"
                          buttonStyle="solid"
                        />
                      </Form.Item>
                    </div>
                  );
                })}
              </Col>
              <Col xs={24} sm={12} md={12} lg={12}>
                <div className="sticky-top">
                  {(GetUserAccess === UserRole[2] &&
                    !formDetails?.isCoordinatorComplete) ||
                  (GetUserAccess === UserRole[1] &&
                    !formDetails?.isTeacherComplete) ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    ""
                  )}

                  {GetUserAccess === UserRole[1] &&
                    formDetails?.isTeacherComplete && (
                      <>
                        {currentQuestions?.map((item, index) => {
                          return (
                            <React.Fragment key={index + 1}>
                              <div className="mb-3 border p-3 rounded ">
                                <h3
                                  className="mb-0 fs-6"
                                  style={{ color: "rgb(52 52 52 / 64%)" }}
                                >
                                  {item?.name
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </h3>
                                <div
                                  className={`alert ${formDetails?.teacherForm[item.key] === "Yes" ? "alert-success" : formDetails?.teacherForm[item.key] === "No" ? "alert-danger" : formDetails?.teacherForm[item.key] === "N/A" ? "alert-primary" : formDetails?.teacherForm[item.key] === "Sometimes" && "alert-warning"} py-0 mt-3 mb-3`}
                                  style={{ width: "fit-content" }}
                                >
                                  <span>
                                    {" "}
                                    {formDetails?.teacherForm[item?.key]}
                                  </span>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}

                        <div className="mb-3 border p-3 rounded shadow-sm">
                          <h3
                            className="mb-0 fs-6"
                            style={{ color: "rgb(52 52 52 / 64%)" }}
                          >
                            Self Assesment
                          </h3>
                          <div
                            className={` py-0 mt-3`}
                            style={{ width: "fit-content" }}
                          >
                            <span>
                              {" "}
                              {
                                calculateScorenew(
                                  formDetails?.teacherForm,
                                  currentQuestions,
                                ).score
                              }{" "}
                              Out of{" "}
                              {
                                calculateScorenew(
                                  formDetails?.teacherForm,
                                  currentQuestions,
                                ).total
                              }
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                </div>
              </Col>
            </Row>

            {/* Self-assessment score */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={12}>
                <h4 className="mb-3 mt-4">
                  Self Assessment Score: {selfAssessmentScore} / {totalCount}
                </h4>
                <Form.Item
                  name="selfEvaluationScore"
                  hidden
                  label="Self Assessment Score"
                >
                  <InputNumber
                    value={selfAssessmentScore}
                    disabled
                    className="w-100"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Submit button */}
            <Row>
              <Col span={9}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" className="w-100">
                    Submit
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </>
      )}
    </div>
  );
}

export default OB_FortnightlyMonitorEdit;
