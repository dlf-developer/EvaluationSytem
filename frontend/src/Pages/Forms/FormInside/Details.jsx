import React, { useEffect, useState } from "react";
import {
  Form,
  InputNumber,
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
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Grid,
  GridItem,
} from "@chakra-ui/react";
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
import { calculateScorenew } from "../../../Utils/calculateScore";
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
        setFormDetails(response?.payload);
        setIsLoading(false);
        const {
          className,
          date,
          section,
          isObserverInitiation,
          isTeacherComplete,
          isCoordinatorComplete,
        } = response.payload;

        const needsTeacherToFillClassInfo =
          isObserverInitiation &&
          !isTeacherComplete &&
          GetUserAccess === UserRole[2];

        if (!className || !date || !section || needsTeacherToFillClassInfo) {
          dispatch(GetObserverList());
          setBetaLoading(true);
          if (needsTeacherToFillClassInfo) {
            form.setFieldsValue({
              className: className || undefined,
              section: section || undefined,
            });
          } else {
            message.success("Fill All the data!");
          }
        } else if (isCoordinatorComplete && isTeacherComplete) {
          message.success("Form is already submitted!");
          navigate(`/fortnightly-monitor/report/${Id}`);
        } else if (GetUserAccess === UserRole[1] && isCoordinatorComplete) {
          message.success("Form is already submitted!");
          navigate(`/fortnightly-monitor/report/${Id}`);
        } else if (GetUserAccess === UserRole[2] && isTeacherComplete) {
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
          className: values?.className || formDetails?.className,
          date: values?.date,
          Section: values?.section || formDetails?.section,
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
    const result = calculateScorenew(values, currentQuestions);

    setSelfAssessmentScore(result.score);
    setTotalCountMein(result.total);
  };

  const getTotalScore = (type) => {
    if (!formDetails) return 0;
    const result = calculateScorenew(formDetails[type], currentQuestions);
    return result.total;
  };

  const getSelfAssemnetScrore = (type) => {
    if (!formDetails) return 0;
    const result = calculateScorenew(formDetails[type], currentQuestions);
    return result.score;
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
    <Box p={{ base: 4, md: 8 }} minH="80vh" bg="gray.50">
      {isLoading ? (
        <Flex justify="center" align="center" minH="50vh">
          <Spin size="large" />
        </Flex>
      ) : (
        <Box maxW="1200px" mx="auto">
          <Box mb={8}>
            <Heading size="lg" color="gray.800" mb={2}>
              Observation Form
            </Heading>
            <Text color="gray.500">Complete your evaluation</Text>
          </Box>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={calculateScore}
          >
            <Flex direction={{ base: "column", lg: "row" }} gap={8}>
              <Box flex="1">
                <Box>
                  {betaLoading && (
                    <Box
                      bg="white"
                      p={6}
                      borderRadius="2xl"
                      boxShadow="sm"
                      borderWidth="1px"
                      borderColor="gray.100"
                      mb={8}
                    >
                      <Heading
                        size="md"
                        color="gray.800"
                        mb={6}
                        pb={4}
                        borderBottom="1px solid"
                        borderColor="gray.100"
                      >
                        Class Information
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Box>
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
                              disabled={
                                !!formDetails?.className &&
                                formDetails?.isObserverInitiation &&
                                GetUserAccess === UserRole[2]
                              }
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
                                option.label
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                            />
                          </Form.Item>
                        </Box>

                        <Box>
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
                              disabled={
                                !!formDetails?.section &&
                                formDetails?.isObserverInitiation &&
                                GetUserAccess === UserRole[2]
                              }
                              options={
                                sectionState?.sections?.map((item) => ({
                                  key: item._id,
                                  id: item._id,
                                  value: item.name,
                                  label: item.name,
                                })) || []
                              }
                              filterOption={(input, option) =>
                                option.label
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                            />
                          </Form.Item>
                        </Box>

                        <Box>
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
                        </Box>

                        {CurrectUserRole === UserRole[2] && (
                          <Box>
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
                          </Box>
                        )}
                      </SimpleGrid>
                    </Box>
                  )}

                  <Box
                    bg="white"
                    p={6}
                    borderRadius="2xl"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                    mb={8}
                  >
                    <Heading
                      size="md"
                      color="gray.800"
                      mb={6}
                      pb={4}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                    >
                      Evaluation Questions
                    </Heading>

                    {currentQuestions?.map((field, index) => {
                      return (
                        <Box
                          key={field?.key}
                          bg="gray.50"
                          p={5}
                          borderRadius="xl"
                          mb={4}
                          borderWidth="1px"
                          borderColor="gray.100"
                        >
                          <Form.Item
                            className="question-item mb-0"
                            name={field?.key}
                            label={
                              <Text fontWeight="500" color="gray.800" mb={2}>
                                {field?.name
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </Text>
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
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              <Box w={{ base: "100%", lg: "350px" }}>
                <Box position="sticky" top="24px">
                  {(GetUserAccess === UserRole[2] &&
                    !formDetails?.isCoordinatorComplete) ||
                  (GetUserAccess === UserRole[1] &&
                    !formDetails?.isTeacherComplete) ? (
                    <Box
                      bg="white"
                      p={6}
                      borderRadius="2xl"
                      boxShadow="sm"
                      borderWidth="1px"
                      borderColor="gray.100"
                    >
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Waiting for teacher response"
                      />
                    </Box>
                  ) : (
                    ""
                  )}

                  {GetUserAccess === UserRole[1] &&
                    formDetails?.isTeacherComplete && (
                      <Box
                        bg="white"
                        p={6}
                        borderRadius="2xl"
                        boxShadow="sm"
                        borderWidth="1px"
                        borderColor="gray.100"
                      >
                        <Heading
                          size="md"
                          color="gray.800"
                          mb={6}
                          pb={4}
                          borderBottom="1px solid"
                          borderColor="gray.100"
                        >
                          Teacher Response
                        </Heading>
                        {currentQuestions?.map((item, index) => {
                          const answer = formDetails?.teacherForm[item.key];
                          return (
                            <Box
                              key={index + 1}
                              p={4}
                              bg="gray.50"
                              borderRadius="lg"
                              mb={3}
                            >
                              <Text color="gray.600" fontSize="sm" mb={2}>
                                {item?.name
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </Text>
                              <Text fontWeight="bold" color="brand.primary">
                                {answer}
                              </Text>
                            </Box>
                          );
                        })}

                        <Box
                          mt={6}
                          pt={4}
                          borderTop="1px solid"
                          borderColor="gray.100"
                        >
                          <Text color="gray.500" mb={1}>
                            Self Assessment
                          </Text>
                          <Flex align="baseline" gap={1}>
                            <Text
                              color="brand.primary"
                              fontSize="2xl"
                              fontWeight="bold"
                            >
                              {getSelfAssemnetScrore("teacherForm") || "N/A"}
                            </Text>
                            <Text color="gray.400" fontSize="lg">
                              /
                            </Text>
                            <Text
                              color="gray.600"
                              fontSize="lg"
                              fontWeight="500"
                            >
                              {getTotalScore("teacherForm")}
                            </Text>
                          </Flex>
                        </Box>
                      </Box>
                    )}
                </Box>
              </Box>
            </Flex>

            <Flex
              justify="space-between"
              align="center"
              mt={8}
              bg="white"
              p={6}
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Box>
                <Text color="gray.500" fontWeight="500" mb={1} fontSize="sm">
                  {getUserId().access === UserRole[1]
                    ? "Observer Score"
                    : "Self Assessment Score"}
                </Text>
                <Flex align="baseline" gap={1}>
                  <Text color="brand.primary" fontSize="2xl" fontWeight="bold">
                    {selfAssessmentScore}
                  </Text>
                  <Text color="gray.400" fontSize="lg">
                    /
                  </Text>
                  <Text color="gray.600" fontSize="lg" fontWeight="500">
                    {totalCountMein}
                  </Text>
                </Flex>
              </Box>

              <Form.Item name="selfEvaluationScore" hidden>
                <InputNumber value={selfAssessmentScore} disabled />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  borderRadius: "8px",
                  minWidth: "150px",
                  background: "#1a4d2e",
                }}
              >
                Submit Evaluation
              </Button>
            </Flex>
          </Form>
        </Box>
      )}
    </Box>
  );
};

export default Details;
