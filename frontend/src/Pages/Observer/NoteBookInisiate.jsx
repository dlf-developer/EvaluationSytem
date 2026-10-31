import { Button, Form, message, Select, Spin, Input } from "../../Components/UI";
import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { getUserId, getUserRoleTag } from "../../Utils/auth";
import { useNavigate } from "react-router-dom";
import { GetTeacherList, getCreateClassSection } from "../../redux/userSlice";
import { UserRole } from "../../config/config";
import { createInitiate } from "../../redux/Form/noteBookSlice";
import { CreateActivityApi } from "../../redux/Activity/activitySlice";
import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";

const { Option } = Select;
function NoteBookInisiate() {
  const [loading, setLoading] = useState(false);
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const CurrectUserRole = getUserId().access;

  const TeachersList = useSelector((state) => state.user.GetTeachersLists);
  const ObserverList = useSelector((state) => state.user.GetObserverLists);
  const [newData, setNewData] = useState(() => {
    try {
      const stored = sessionStorage.getItem("cached_class_sections");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [sectionState, setSectionState] = useState(null);

  useEffect(() => {
    dispatch(GetTeacherList());
    dispatch(getCreateClassSection()).then((res) => {
      if (res?.payload?.success) {
        const sorted = res?.payload?.classDetails.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setNewData(sorted);
        try {
          sessionStorage.setItem("cached_class_sections", JSON.stringify(sorted));
        } catch (e) {}
      }
    });
    if (CurrectUserRole === UserRole[2]) {
      setIsTeacher(false);
      setIsCoordinator(true);
    }
    if (CurrectUserRole === UserRole[1]) {
      setIsTeacher(true);
      setIsCoordinator(false);
    }
  }, [dispatch]);

  const SectionSubject = (value) => {
    if (value) {
      const filteredData = newData?.filter((data) => data?._id === value);
      if (filteredData?.length > 0) {
        setSectionState(filteredData[0]);
      }
    } else {
      setSectionState(null);
    }
  };

  const handleSubmit = async (values) => {
    const payload = {
      isTeacher: values?.isTeacher || isTeacher,
      teacherIDs: values?.teacherIDs || "",
      className: values?.className,
      Section: values?.Section,
      Subject: values?.Subject,
    };

    setLoading(true);
    try {
      const response = await dispatch(createInitiate(payload)).unwrap();
      if (response?.status) {
        message.success(response?.message);

        const activity = {
          observerMessage: `You have Initiated Notebook Checking Proforma Form.`,
          teacherMessage: `${getUserId()?.name} has Initiated Notebook Checking Proforma Form.`,
          route: `/notebook-checking-proforma`,
          date: new Date(),
          reciverId: payload?.teacherIDs,
          senderId: getUserId()?.id,
          fromNo: 3,
          data: response,
        };

        const activitiRecord = await dispatch(CreateActivityApi(activity));
        if (!activitiRecord?.payload?.success) {
          message.error("Error on Activity Record");
        }
        form.resetFields(); // Reset the form fields after submission
        navigate(`/notebook-checking-proforma`);
      } else {
        message.error("Somthing went wrong");
      }
    } catch (error) {
      message.error("Error creating Notebook Checking");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box
      p={{ base: 3, md: 6 }}
      minH="calc(100vh - 72px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <Box
        w="full"
        maxW="480px"
        bg="white"
        borderRadius="xl"
        boxShadow="md"
        borderWidth="1px"
        borderColor="gray.200"
        p={{ base: 5, md: 6 }}
      >
        <VStack spacing={1} mb={5} align="center" textAlign="center">
          <Heading size="md" color="#1a4d2e">
            Initiate Monitoring
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Configure roles and targets for the Notebook Checking
          </Text>
        </VStack>
        <Spin spinning={loading}>
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            initialValues={{
              isCoordinator: false,
              isTeacher: false,
            }}
          >
            <Flex direction="column" gap={4}>
              {CurrectUserRole === UserRole[1] && (
                <>
                  <Form.Item
                    className="w-100 mb-0"
                    label={<Text fontWeight="500">Teacher ID</Text>}
                    name="teacherIDs"
                    rules={[
                      { required: true, message: "Please select a Teacher!" },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      allowClear
                      showSearch
                      placeholder="Select a Teacher"
                      options={TeachersList?.filter((t) => t._id !== getUserId()?.id && t?.isActive !== false)?.map((item) => ({
                        value: item._id,
                        label: `${item.name} [${getUserRoleTag(item)}]`,
                      }))}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    className="w-100"
                    label={<Text fontWeight="500">Class (Optional)</Text>}
                    name="className"
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select a class"
                      onChange={(value) => SectionSubject(value)}
                      options={
                        newData && newData?.length > 0
                          ? newData.map((item) => ({
                              value: item?._id,
                              label: item?.className,
                            }))
                          : []
                      }
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    className="w-100"
                    label={<Text fontWeight="500">Section (Optional)</Text>}
                    name="Section"
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select a section"
                      options={
                        sectionState?.sections?.map((item) => ({
                          value: item.name,
                          label: item.name,
                        })) || []
                      }
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    className="w-100"
                    label={<Text fontWeight="500">Subject (Optional)</Text>}
                    name="Subject"
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select a subject"
                      options={
                        sectionState?.subjects?.map((item) => ({
                          value: item.name,
                          label: item.name,
                        })) || []
                      }
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    hidden
                    className="w-100"
                    label="Teachers"
                    name="isTeacher"
                  >
                    <Select
                      onChange={(value) => {
                        setIsTeacher(true);
                        setIsCoordinator(false); // Disable Coordinator when Teacher is selected
                        form.resetFields(["coordinatorID"]); // Reset coordinator-related fields
                      }}
                      disabled={isCoordinator} // Disable if Coordinator is selected
                    >
                      <Option value={false}>No</Option>
                      <Option value={true}>Yes</Option>
                    </Select>
                  </Form.Item>
                </>
              )}
            </Flex>

            {CurrectUserRole === UserRole[0] && (
              <Flex direction="column" gap={4}>
                <Flex gap={4} width="100%">
                  <Form.Item
                    className="w-100 mb-0"
                    style={{ flex: 1 }}
                    label={<Text fontWeight="500">Coordinator</Text>}
                    name="isCoordinator"
                  >
                    <Select
                      onChange={(value) => {
                        setIsCoordinator(value);
                        setIsTeacher(false); // Disable Teacher when Coordinator is selected
                        form.resetFields(["teacherID"]); // Reset teacher-related fields
                      }}
                    >
                      <Option value={false}>No</Option>
                      <Option value={true}>Yes</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    className="w-100"
                    label="Teachers"
                    name="isTeacher"
                  >
                    <Select
                      onChange={(value) => {
                        setIsTeacher(value);
                        setIsCoordinator(false); // Disable Coordinator when Teacher is selected
                        form.resetFields(["coordinatorID"]); // Reset coordinator-related fields
                      }}
                      disabled={isCoordinator} // Disable if Coordinator is selected
                    >
                      <Option value={false}>No</Option>
                      <Option value={true}>Yes</Option>
                    </Select>
                  </Form.Item>
                </Flex>

                {isCoordinator && (
                  <Form.Item
                    label={<Text fontWeight="500">Coordinator ID</Text>}
                    name="coordinatorID"
                    rules={[
                      {
                        required: true,
                        message: "Please select a Coordinator!",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Select a Coordinator"
                      options={ObserverList?.map((item) => ({
                        value: item._id,
                        label: `${item.name} [${getUserRoleTag(item)}]`,
                      }))}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                )}

                {isTeacher && (
                  <Form.Item
                    label={<Text fontWeight="500">Teacher ID</Text>}
                    name="teacherID"
                    rules={[
                      { required: true, message: "Please select a Teacher!" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Select a Teacher"
                      options={TeachersList?.filter((t) => t._id !== getUserId()?.id)?.map((item) => ({
                        value: item._id,
                        label: `${item.name} [${getUserRoleTag(item)}]`,
                      }))}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                )}
              </Flex>
            )}

            <Button
              type="primary"
              htmlType="submit"
              disabled={loading}
              size="middle"
              block
              className="w-full mt-4 font-semibold shadow-sm"
              style={{
                backgroundColor: "#1a4d2e",
                borderColor: "#1a4d2e",
                color: "#ffffff",
                borderRadius: "8px",
                minHeight: "40px",
              }}
            >
              {loading ? "Initiating Form..." : "Initiate Form"}
            </Button>
          </Form>
        </Spin>
      </Box>
    </Box>
  );
}

export default NoteBookInisiate;
