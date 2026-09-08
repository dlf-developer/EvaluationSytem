import React, { useEffect, useState, useMemo } from "react";
import { Form, Input, Button, message, Spin, Modal } from "antd";
import {
  DeleteFilled,
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  CReateClassSection,
  deleteCreateClassSection,
  getCreateClassSection,
  updateCreateClassSection,
} from "../../redux/userSlice";
import { useDispatch } from "react-redux";
import { Box, Flex, Heading, Text, Stack, Tag } from "@chakra-ui/react";
import SmartTable from "../../Components/SmartTable";
import { getClassSectionColumns } from "../../Components/SmartTable/tableColumns";

function ClassSectionPage() {
  const [newData, setNewData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const dispatch = useDispatch();

  const fetchClassData = async () => {
    setIsLoading(true);
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
    } catch {
      message.error("An error occurred while fetching class data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, []);

  const handleSubmit = async (values) => {
    const data = {
      className: values.className,
      sections: values.sections.map((name) => ({ name })),
      subjects: values.subjects.map((name) => ({ name })),
    };
    try {
      const response = await dispatch(CReateClassSection(data));
      if (response?.payload?.success) {
        message.success(response.payload.message || "Class created successfully!");
        fetchClassData();
        form.resetFields();
      } else {
        message.error(response?.payload?.message || "Failed to create class.");
      }
    } catch {
      message.error("An error occurred.");
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      className: record.className || "",
      sections: (record.sections || []).map((s) => s.name || s),
      subjects: (record.subjects || []).map((s) => s.name || s),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (values) => {
    if (!editingRecord?._id) return;
    setIsUpdating(true);
    const data = {
      className: values.className,
      sections: (values.sections || []).map((name) => ({
        name: typeof name === "string" ? name.trim() : name?.name || "",
      })),
      subjects: (values.subjects || []).map((name) => ({
        name: typeof name === "string" ? name.trim() : name?.name || "",
      })),
    };
    try {
      const res = await dispatch(
        updateCreateClassSection({ id: editingRecord._id, data })
      ).unwrap();
      if (res?.success) {
        message.success(res.message || "Class updated successfully!");
        setIsEditModalOpen(false);
        editForm.resetFields();
        fetchClassData();
      } else {
        message.error(res?.message || "Failed to update class.");
      }
    } catch (err) {
      message.error(err?.message || "An error occurred while updating class.");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteClass = (record) => {
    Modal.confirm({
      title: `Are you sure you want to delete "${record?.className}"?`,
      content: "This will remove the class along with all its sections and subjects. This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const res = await dispatch(deleteCreateClassSection(record?._id));
        if (res?.payload?.success) {
          fetchClassData();
          message.success(res?.payload?.message || "Class deleted successfully");
        } else {
          message.error(res?.payload?.message || "Server Error!");
        }
      },
    });
  };

  const columns = useMemo(
    () => getClassSectionColumns({ onEdit: handleEdit, onDelete: deleteClass }),
    [newData]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      {isLoading && (
        <Flex
          justify="center"
          align="center"
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255,255,255,0.7)"
          zIndex={9999}
        >
          <Spin size="large" />
        </Flex>
      )}

      <Box mb={6}>
        <Heading size="lg" color="gray.800" mb={1}>
          Class & Sections Management
        </Heading>
        <Text color="gray.500">
          Create and manage classes, add new sections, and edit subjects.
        </Text>
      </Box>

      <Stack direction={{ base: "column", xl: "row" }} spacing={8} align="flex-start">
        {/* Creation Form */}
        <Box
          flex="1"
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          p={6}
          w="100%"
        >
          <Heading size="md" mb={6} color="gray.700">
            Create Class
          </Heading>
          <Form
            form={form}
            name="class_section_form"
            onFinish={handleSubmit}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label={<Text fontWeight="500">Class Name</Text>}
              name="className"
              rules={[{ required: true, message: "Please enter the class name" }]}
            >
              <Input placeholder="Enter class name (e.g. Class 10)" size="large" />
            </Form.Item>

            <Flex gap={4} direction={{ base: "column", md: "row" }}>
              <Box flex="1">
                <Text fontWeight="500" mb={2}>
                  Sections
                </Text>
                <Form.List
                  name="sections"
                  rules={[
                    {
                      validator: async (_, s) =>
                        !s || s.length < 1
                          ? Promise.reject(new Error("At least one section is required"))
                          : undefined,
                    },
                  ]}
                >
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, fieldKey, ...rest }) => (
                        <Flex key={key} mb={2} align="center" gap={2}>
                          <Form.Item
                            {...rest}
                            name={[name]}
                            fieldKey={[fieldKey]}
                            noStyle
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input placeholder="Section" />
                          </Form.Item>
                          <MinusCircleOutlined
                            style={{ color: "red", cursor: "pointer" }}
                            onClick={() => remove(name)}
                          />
                        </Flex>
                      ))}
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
                    </>
                  )}
                </Form.List>
              </Box>

              <Box flex="1">
                <Text fontWeight="500" mb={2}>
                  Subjects
                </Text>
                <Form.List
                  name="subjects"
                  rules={[
                    {
                      validator: async (_, s) =>
                        !s || s.length < 1
                          ? Promise.reject(new Error("At least one subject is required"))
                          : undefined,
                    },
                  ]}
                >
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, fieldKey, ...rest }) => (
                        <Flex key={key} mb={2} align="center" gap={2}>
                          <Form.Item
                            {...rest}
                            name={[name]}
                            fieldKey={[fieldKey]}
                            noStyle
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input placeholder="Subject" />
                          </Form.Item>
                          <MinusCircleOutlined
                            style={{ color: "red", cursor: "pointer" }}
                            onClick={() => remove(name)}
                          />
                        </Flex>
                      ))}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                        >
                          Add Subject
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Box>
            </Flex>

            <Form.Item mb={0} mt={4}>
              <Button
                type="primary"
                onClick={() => form.submit()}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#2b6cb0",
                  borderColor: "#2b6cb0",
                  fontWeight: "600",
                }}
              >
                Create Class
              </Button>
            </Form.Item>
          </Form>
        </Box>

        {/* Table */}
        <Box flex="2" w="100%">
          <SmartTable
            title="Existing Classes"
            columns={columns}
            data={newData}
            loading={isLoading}
            rowKey={(r) => r._id || r.id}
            pageSize={10}
          />
        </Box>
      </Stack>

      {/* Edit Class Modal */}
      <Modal
        title={
          <Box pb={2} borderBottom="1px solid" borderColor="gray.100">
            <Heading size="md" color="gray.800">
              Edit Class: {editingRecord?.className}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Modify class name, add or edit sections and subjects below.
            </Text>
          </Box>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
        }}
        footer={null}
        width={720}
        destroyOnClose
      >
        <Form
          form={editForm}
          name="edit_class_section_form"
          onFinish={handleUpdateSubmit}
          autoComplete="off"
          layout="vertical"
          style={{ marginTop: "16px" }}
        >
          <Form.Item
            label={<Text fontWeight="600" color="gray.700">Class Name</Text>}
            name="className"
            rules={[{ required: true, message: "Please enter the class name" }]}
          >
            <Input placeholder="Enter class name" size="large" />
          </Form.Item>

          <Flex gap={4} direction={{ base: "column", md: "row" }} mt={4}>
            {/* Edit Sections */}
            <Box flex="1" p={4} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontWeight="600" color="blue.800" fontSize="sm">
                  Sections
                </Text>
                <Tag size="sm" colorScheme="blue" variant="subtle" borderRadius="full">
                  Add / Edit Sections
                </Tag>
              </Flex>
              <Form.List
                name="sections"
                rules={[
                  {
                    validator: async (_, s) =>
                      !s || s.length < 1
                        ? Promise.reject(new Error("At least one section is required"))
                        : undefined,
                  },
                ]}
              >
                {(fields, { add, remove }) => (
                  <>
                    <Box maxH="280px" overflowY="auto" pr={1}>
                      {fields.map(({ key, name, fieldKey, ...rest }) => (
                        <Flex key={key} mb={2} align="center" gap={2}>
                          <Form.Item
                            {...rest}
                            name={[name]}
                            fieldKey={[fieldKey]}
                            noStyle
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input placeholder="Section name (e.g. A, B)" />
                          </Form.Item>
                          <MinusCircleOutlined
                            style={{ color: "#e53e3e", cursor: "pointer", fontSize: "16px" }}
                            onClick={() => remove(name)}
                          />
                        </Flex>
                      ))}
                    </Box>
                    <Form.Item mb={0} mt={2}>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        style={{ borderColor: "#3182ce", color: "#3182ce" }}
                      >
                        Add Section
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Box>

            {/* Edit Subjects */}
            <Box flex="1" p={4} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.100">
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontWeight="600" color="green.800" fontSize="sm">
                  Subjects
                </Text>
                <Tag size="sm" colorScheme="green" variant="subtle" borderRadius="full">
                  Add / Edit Subjects
                </Tag>
              </Flex>
              <Form.List
                name="subjects"
                rules={[
                  {
                    validator: async (_, s) =>
                      !s || s.length < 1
                        ? Promise.reject(new Error("At least one subject is required"))
                        : undefined,
                  },
                ]}
              >
                {(fields, { add, remove }) => (
                  <>
                    <Box maxH="280px" overflowY="auto" pr={1}>
                      {fields.map(({ key, name, fieldKey, ...rest }) => (
                        <Flex key={key} mb={2} align="center" gap={2}>
                          <Form.Item
                            {...rest}
                            name={[name]}
                            fieldKey={[fieldKey]}
                            noStyle
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input placeholder="Subject name (e.g. English, Math)" />
                          </Form.Item>
                          <MinusCircleOutlined
                            style={{ color: "#e53e3e", cursor: "pointer", fontSize: "16px" }}
                            onClick={() => remove(name)}
                          />
                        </Flex>
                      ))}
                    </Box>
                    <Form.Item mb={0} mt={2}>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        style={{ borderColor: "#38a169", color: "#38a169" }}
                      >
                        Add Subject
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Box>
          </Flex>

          <Flex justify="flex-end" gap={3} mt={6} pt={4} borderTop="1px solid" borderColor="gray.100">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                editForm.resetFields();
              }}
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => editForm.submit()}
              loading={isUpdating}
              size="large"
              style={{ background: "#2b6cb0", borderColor: "#2b6cb0" }}
            >
              Save Changes
            </Button>
          </Flex>
        </Form>
      </Modal>
    </Box>
  );
}

export default ClassSectionPage;
