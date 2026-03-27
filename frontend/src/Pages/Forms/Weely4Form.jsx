import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCreateClassSection,
  GetObserverList,
  GetTeacherList,
  initiateFromObserver,
  UpdateFromObserver,
} from "../../redux/userSlice";
import { useParams, useSearchParams } from "react-router-dom";
import { Form, Select, Button, Input, Radio, message, Space } from "antd";
import { Box, Flex, Heading, Text, SimpleGrid } from "@chakra-ui/react";
import { getUserId } from "../../Utils/auth";
import "./Weekly4Form.css"; // Import custom CSS for animation
import { UserRole } from "../../config/config";
import TextArea from "antd/es/input/TextArea";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { CreateActivityApi } from "../../redux/Activity/activitySlice";

function Weekly4Form() {
  const [isInitiate, setIsInitiate] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const dispatch = useDispatch();
  const { GetTeachersLists, GetObserverLists } = useSelector(
    (state) => state.user,
  );
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [classList, setClassList] = useState();
  const [ObsereverId, setObsereverId] = useState();
  const FormId = useParams().id;

  const GetImportantDetails = async () => {
    const cls = await dispatch(getCreateClassSection());
    if (cls?.payload?.success) {
      setClassList(cls?.payload?.classDetails);
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

  const yesNoNAOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
    { value: "N/A", label: "N/A" },
  ];

  const [sectionArry, SetSectionArry] = useState();
  const onChnageSection = (value) => {
    if (value) {
      const data = classList.filter((item) => item._id === value);
      SetSectionArry(data[0]?.sections);
    }
  };

  const RenderRadioFormItem = ({
    name,
    label,
    question,
    selectBox,
    inputBox,
    classSelection,
  }) => {
    return (
      <>
        <h5 className="text-gray">{label}</h5>
        {selectBox && (
          <>
            <Form.List
              name={[...name, "sections"]}
              rules={[
                {
                  validator: async (_, sections) => {
                    if (!sections || sections.length < 1) {
                      return Promise.reject(
                        new Error("At least one section is required"),
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
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
                              message: "Please enter a class ID",
                            },
                          ]}
                        >
                          <Select
                            allowClear
                            showSearch
                            placeholder="Select a Class"
                            options={classList?.map((item) => ({
                              value: item?._id,
                              label: `${item?.className}`,
                            }))}
                            onChange={(v) => onChnageSection(v)}
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
                              message: "Please enter a section",
                            },
                          ]}
                        >
                          <Select
                            allowClear
                            showSearch
                            placeholder="Select a Section"
                            options={sectionArry?.map((item) => ({
                              value: item?.name,
                              label: `${item?.name}`,
                            }))}
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
                              message: "Please select an answer",
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
                                marginLeft: "5px",
                                cursor: "pointer",
                                color: "red",
                              }}
                              onClick={() => remove(name)}
                            />
                          </div>
                        </Form.Item>
                      </Box>
                    </SimpleGrid>
                  ))}

                  {fields.length < 5 && (
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Section
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </>
        )}
        {inputBox ? (
          <>
            <Form.Item
              name={[...name, "answer"]}
              // label={}
              rules={[{ required: true, message: "Please select an answer!" }]}
            >
              <Radio.Group
                size="large"
                options={yesNoNAOptions}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>

            <Form.Item
              className="mb-0"
              name={[...name, "textArea"]}
              // label={}
              rules={[{ required: true, message: "Please select an answer!" }]}
            >
              <TextArea placeholder="" />
            </Form.Item>
          </>
        ) : (
          classSelection && (
            <Form.Item
              className="mb-0"
              name={[...name, "answer"]}
              // label={}
              rules={[{ required: true, message: "Please select an answer!" }]}
            >
              <Radio.Group
                size="large"
                options={yesNoNAOptions}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
          )
        )}

        <Form.Item
          className="hidden"
          hidden
          name={[...name, "question"]}
          initialValue={question}
        >
          <Input />
        </Form.Item>
      </>
    );
  };

  const renderSections = (title, questions, namePrefix) => (
    <Box w="100%" mb={8}>
      <Heading
        size="md"
        color="brand.primary"
        bg="gray.50"
        p={4}
        borderRadius="lg"
        mb={6}
      >
        {title}
      </Heading>
      <Box display="flex" flexDirection="column" gap={4}>
        {questions.map((question, index) => (
          <Box
            key={`${namePrefix}${index}`}
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <RenderRadioFormItem
              classSelection={index < 2 ? true : false}
              inputBox={index >= 3 ? true : false}
              selectBox={index === 2 ? true : false}
              name={[namePrefix, index]}
              label={question}
              question={question}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );

  const handleSubmit = async (values) => {
    const basePayload = {
      ...values,
      date: new Date(),
    };

    try {
      if (isInitiate) {
        // Case: Initiate
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
          setTimeout(() => (window.location.href = "/weekly4form"), 3000);
        } else {
          message.error("Something went wrong!");
        }
      } else if (FormId === undefined) {
        // Case: Create new entry when FormId is undefined
        const payload = {
          ...basePayload,
          dateOfSubmission: new Date(),
          isCompleted: true,
          isInitiated: {
            status: false,
            Observer: ObsereverId,
          },
        };

        const res = await dispatch(initiateFromObserver(payload));
        if (res.payload.success) {
          const userInfo = res?.payload?.data?.isInitiated?.Observer;
          const activity = {
            observerMessage: `You have complete the Learning Progress Checklist.`,
            teacherMessage: `${getUserId()?.name} has been complete the Learning Progress Checklist.`,
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
          setTimeout(() => (window.location.href = "/weekly4form"), 1000);
        } else {
          message.error("Something went wrong!");
        }
      } else {
        // Case: Update existing entry
        const payload = {
          id: FormId,
          data: {
            ...basePayload,
            dateOfSubmission: new Date(),
            isCompleted: true,
          },
        };

        const res = await dispatch(UpdateFromObserver(payload));
        if (res?.payload?.isCompleted) {
          const userInfo = res?.payload?.isInitiated?.Observer?._id;
          const activity = {
            observerMessage: `${getUserId()?.name} has been completed your initiated Learning Progress Checklist Form.`,
            teacherMessage: `You have complete the Learning Progress Checklist initiated by ${res?.payload?.isInitiated?.Observer?.name}.`,
            route: `/weekly4form/report/${res?.payload?._id}`,
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

          window.location.href = "/weekly4form";
        } else {
          message.error("Something went wrong!");
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      message.error("An unexpected error occurred!");
    }
  };
  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)" bg="gray.50">
      <Box maxW="1200px" mx="auto">
        <Box mb={6}>
          <Heading size="lg" color="gray.800" mb={1}>
            Weekly 4 Form
          </Heading>
          <Text color="gray.500">
            Please provide your responses for the weekly assessment.
          </Text>
        </Box>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          {isInitiate ? (
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
                <Flex justify="center" align="center" minH="50vh">
                  <Box w={{ base: "100%", md: "50%" }}>
                    <Form.Item
                      className="w-100"
                      label={<Text fontWeight="500">Teacher ID</Text>}
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
                        placeholder="Select a Teacher"
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
                      w="100%"
                      style={{ borderRadius: "8px" }}
                      bg="#1a4d2e"
                    >
                      Submit
                    </Button>
                  </Box>
                </Flex>
              )}
            </Box>
          ) : (
            <Box
              bg="white"
              p={{ base: 4, md: 8 }}
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              {FormId === undefined && (
                <Box
                  mb={8}
                  bg="gray.50"
                  p={6}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="gray.100"
                >
                  <Heading size="sm" mb={4} color="gray.700">
                    Select Observer
                  </Heading>
                  <Select
                    size="large"
                    className="w-100 mb-4"
                    mode="multiple"
                    allowClear
                    showSearch
                    placeholder="Select a Observer"
                    onChange={(value) => setObsereverId(value)}
                    options={GetObserverLists?.map((item) => ({
                      value: item._id,
                      label: item.name,
                    }))}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Box>
              )}

              {renderSections(
                "Learning Progress Checklist",
                [
                  "I have completed last week's plan.",
                  "I have uploaded experiential/active Lesson Plan for the next week that includes triggers/visual or auditory stimulus.",
                  "My last corrected work is not beyond a fortnight.",
                  "Name of L.O.W. Students with Class & Section.",
                  "Name of I Care Forms filled along with reason",
                ],
                "FormData",
              )}

              <Flex justify="flex-end" mt={8}>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  style={{ borderRadius: "8px", minWidth: "150px" }}
                >
                  Submit Evaluation
                </Button>
              </Flex>
            </Box>
          )}
        </Form>
      </Box>
    </Box>
  );
}

export default Weekly4Form;
