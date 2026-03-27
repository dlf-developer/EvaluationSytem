import {
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Spin,
} from "antd";
import { Box, Flex, SimpleGrid, Heading, Text, Badge } from "@chakra-ui/react";
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
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)" bg="gray.50">
      <Box maxW="1200px" mx="auto">
        {isLoading ? (
          <Flex justify="center" align="center" h="400px">
            <Spin size="large" />
          </Flex>
        ) : (
          <Box>
            <Box mb={6} textAlign="center">
              <Heading size="lg" color="gray.800" mb={1}>
                Fortnightly Monitor Evaluation
              </Heading>
              <Text color="gray.500">
                Review teacher responses and provide your observations.
              </Text>
            </Box>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={calculateScore} // Trigger score calculation
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Box
                  bg="white"
                  p={6}
                  borderRadius="2xl"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                >
                  <Heading size="md" mb={6} color="brand.primary">
                    Edit Your Observation
                  </Heading>
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
                          {
                            required: true,
                            message: "Please enter a section!",
                          },
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
                            {
                              required: true,
                              message: "Please select a date!",
                            },
                          ]}
                        >
                          <DatePicker className="w-100" format="YYYY-MM-DD" />
                        </Form.Item>
                      </div>
                    </>
                  )}
                  {currentQuestions?.map((field, index) => {
                    return (
                      <Box
                        key={field?.key}
                        mb={4}
                        p={5}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor="gray.100"
                        bg="gray.50"
                      >
                        <Form.Item
                          className="mb-2"
                          name={field?.key}
                          label={
                            <Text
                              fontWeight="600"
                              color="gray.700"
                              fontSize="md"
                            >
                              {field?.name
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </Text>
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
                      </Box>
                    );
                  })}
                </Box>

                <Box
                  bg="white"
                  p={6}
                  borderRadius="2xl"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                >
                  <Box position="sticky" top="20px">
                    <Heading size="md" mb={6} color="gray.700">
                      Current Response
                    </Heading>
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
                            const val = formDetails?.teacherForm[item.key];
                            const badgeColor =
                              val === "Yes"
                                ? "green"
                                : val === "No"
                                  ? "red"
                                  : val === "Sometimes"
                                    ? "orange"
                                    : "blue";
                            return (
                              <Box
                                key={index + 1}
                                mb={4}
                                p={5}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor="gray.100"
                                bg="gray.50"
                              >
                                <Text
                                  fontWeight="600"
                                  color="gray.700"
                                  fontSize="sm"
                                  mb={3}
                                >
                                  {item?.name
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </Text>
                                <Badge
                                  colorScheme={badgeColor}
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                  fontSize="sm"
                                >
                                  {val || "No Answer"}
                                </Badge>
                              </Box>
                            );
                          })}

                          <Box
                            p={5}
                            borderRadius="xl"
                            borderWidth="1px"
                            borderColor="brand.primary"
                            bg="blue.50"
                          >
                            <Text
                              fontWeight="600"
                              color="brand.primary"
                              fontSize="sm"
                              mb={2}
                            >
                              Teacher Self Assessment Score
                            </Text>
                            <Text
                              fontSize="2xl"
                              fontWeight="bold"
                              color="gray.800"
                            >
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
                            </Text>
                          </Box>
                        </>
                      )}
                  </Box>
                </Box>
              </SimpleGrid>

              {/* Evaluation Score & Submit */}
              <Flex direction="column" align="center" mt={10} mb={6}>
                <Box
                  bg="white"
                  px={8}
                  py={4}
                  borderRadius="full"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                  mb={6}
                >
                  <Text fontSize="lg" fontWeight="600" color="gray.700">
                    Your Assessment Score:{" "}
                    <Text as="span" color="brand.primary" fontSize="xl">
                      {selfAssessmentScore} / {totalCount}
                    </Text>
                  </Text>
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
                    minWidth: "200px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  Submit Evaluation
                </Button>
              </Flex>
            </Form>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default OB_FortnightlyMonitorEdit;
