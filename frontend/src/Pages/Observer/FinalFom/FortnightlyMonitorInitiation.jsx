import React, { useEffect, useState } from "react";
import { Form, Input, Button, DatePicker, Select, message, Spin } from "../../../Components/UI";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserId, getUserRoleTag } from "../../../Utils/auth";
import { UserRole } from "../../../config/config";
import {
  getCreateClassSection,
  GetTeacherList,
  GetObserverList,
} from "../../../redux/userSlice";
import {
  FormInitiationAction,
  GetFormsOne,
} from "../../../redux/Form/fortnightlySlice";
import { CreateActivityApi } from "../../../redux/Activity/activitySlice";
import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";

const { Option } = Select;

function FortnightlyMonitorInitiation() {
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
    dispatch(GetObserverList());
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
    // Collect and sanitize teacher IDs
    let selectedTeachers = values?.teacherIDs;
    if (selectedTeachers === undefined || selectedTeachers === null || selectedTeachers === "") {
      selectedTeachers = values?.teacherID ? [values?.teacherID] : [];
    } else if (!Array.isArray(selectedTeachers)) {
      selectedTeachers = [selectedTeachers];
    }

    const cleanTeacherIds = selectedTeachers
      .map((item) => {
        if (!item) return null;
        if (typeof item === "object") {
          return item._id || item.value || item.id || null;
        }
        return typeof item === "string" ? item.trim() : String(item).trim();
      })
      .filter((id) => id && id.length === 24);

    const singleTeacherId = cleanTeacherIds[0];
    const finalTeacherIds = singleTeacherId ? [singleTeacherId] : [];

    const isCoordSelected = Boolean(values?.isCoordinator || isCoordinator);
    const cleanCoordinatorId =
      values?.coordinatorID && typeof values?.coordinatorID === "object"
        ? values?.coordinatorID._id || values?.coordinatorID.value || values?.coordinatorID.id
        : values?.coordinatorID;

    if (!isCoordSelected && finalTeacherIds.length === 0) {
      message.error("Please select a Teacher!");
      return;
    }

    if (isCoordSelected && !cleanCoordinatorId) {
      message.error("Please select a Coordinator!");
      return;
    }

    const payload = {
      isTeacher: isCoordSelected ? false : true,
      teacherIDs: finalTeacherIds,
      isCoordinator: isCoordSelected,
      coordinatorID: cleanCoordinatorId || undefined,
      className: values?.className,
      section: values?.section,
    };

    setLoading(true);
    try {
      const response = await dispatch(FormInitiationAction(payload)).unwrap();
      message.success(response?.message || "Fortnightly Monitor created successfully!");
      const activity = {
        observerMessage: "You have Initiated New Fortnightly Monitor Form.",
        teacherMessage: `${getUserId()?.name} has Initiated New Fortnightly Monitor Form.`,
        route: "/fortnightly-monitor",
        date: new Date(),
        reciverId: cleanTeacherIds.length > 0 ? cleanTeacherIds : (cleanCoordinatorId ? [cleanCoordinatorId] : []),
        senderId: getUserId()?.id,
        fromNo: 1,
        data: payload,
      };
      const activitiRecord = await dispatch(CreateActivityApi(activity));

      if (activitiRecord?.payload?.success) {
        // message.success(activitiRecord.payload.message);
      } else {
        message.error("Error On Activity Record");
      }
      form.resetFields(); // Reset the form fields after submission
      navigate(`/fortnightly-monitor`);
      dispatch(GetFormsOne());
    } catch (error) {
      message.error(error?.message || "Error creating Fortnightly Monitor");
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
    >
      <Box
        w="full"
        maxW="450px"
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.200"
        p={{ base: 4, md: 5 }}
      >
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold text-[#1a4d2e] tracking-tight leading-snug">
            Initiate Monitoring
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 leading-normal">
            Configure roles and targets for the Fortnightly Monitor
          </p>
        </div>
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
            <Flex direction="column" gap={0}>
              {(CurrectUserRole === UserRole[1] || CurrectUserRole === "OT") && (
                <>
                  <Form.Item
                    className="w-100"
                    label="Teacher"
                    name="teacherIDs"
                    rules={[
                      { required: true, message: "Please select a Teacher!" },
                    ]}
                  >
                    <Select
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
                  <Form.Item
                    className="w-100"
                    label="Class (Optional)"
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
                    label="Section (Optional)"
                    name="section"
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
                </>
              )}
            </Flex>

            {CurrectUserRole === UserRole[0] && (
              <Flex direction="column" gap={4}>
                <Flex gap={4} width="100%">
                  <Form.Item
                    className="w-100"
                    label="Coordinator"
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
                    label="Coordinator ID"
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
                      options={ObserverList?.filter((item) => item?.isActive !== false)?.map((item) => ({
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
                    label="Teacher ID"
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
              size="large"
              block
              className="w-full mt-2 font-semibold shadow-xs"
            >
              {loading ? "Initiating Form..." : "Initiate Form"}
            </Button>
          </Form>
        </Spin>
      </Box>
    </Box>
  );
}

export default FortnightlyMonitorInitiation;
