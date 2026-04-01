import React, { useEffect, useState, useMemo } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import {
  DeleteFilled,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  CReateClassSection,
  deleteCreateClassSection,
  getCreateClassSection,
} from "../../redux/userSlice";
import { useDispatch } from "react-redux";
import { Box, Flex, Heading, Text, Stack } from "@chakra-ui/react";
import SmartTable from "../../Components/SmartTable";
import { getClassSectionColumns } from "../../Components/SmartTable/tableColumns";

function ClassSectionPage() {
  const [newData, setNewData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
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

  useEffect(() => { fetchClassData(); }, []);

  const handleSubmit = async (values) => {
    const data = {
      className: values.className,
      sections: values.sections.map((name) => ({ name })),
      subjects: values.subjects.map((name) => ({ name })),
    };
    try {
      const response = await dispatch(CReateClassSection(data));
      if (response.payload.success) {
        message.success(response.payload.message);
        fetchClassData();
        form.resetFields();
      } else {
        message.error(response.payload.message);
      }
    } catch {
      message.error("An error occurred.");
    }
  };

  const deleteClass = async (record) => {
    const res = await dispatch(deleteCreateClassSection(record?._id));
    if (res?.payload?.success) {
      fetchClassData();
      message.success(res?.payload?.message);
    } else {
      message.error("Server Error!");
    }
  };

  const columns = useMemo(
    () => getClassSectionColumns({ onDelete: deleteClass }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      {isLoading && (
        <Flex justify="center" align="center" position="fixed" top={0} left={0} right={0} bottom={0} bg="rgba(255,255,255,0.7)" zIndex={9999}>
          <Spin size="large" />
        </Flex>
      )}

      <Box mb={6}>
        <Heading size="lg" color="gray.800" mb={1}>Class & Sections Management</Heading>
        <Text color="gray.500">Create and manage classes, sections, and subjects.</Text>
      </Box>

      <Stack direction={{ base: "column", xl: "row" }} spacing={8} align="flex-start">
        {/* Creation Form */}
        <Box flex="1" bg="white" borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100" p={6} w="100%">
          <Heading size="md" mb={6} color="gray.700">Create Class</Heading>
          <Form form={form} name="class_section_form" onFinish={handleSubmit} autoComplete="off" layout="vertical">
            <Form.Item label={<Text fontWeight="500">Class Name</Text>} name="className" rules={[{ required: true, message: "Please enter the class name" }]}>
              <Input placeholder="Enter class name" size="large" />
            </Form.Item>

            <Flex gap={4} direction={{ base: "column", md: "row" }}>
              <Box flex="1">
                <Text fontWeight="500" mb={2}>Sections</Text>
                <Form.List name="sections" rules={[{ validator: async (_, s) => !s || s.length < 1 ? Promise.reject(new Error("At least one section is required")) : undefined }]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, fieldKey, ...rest }) => (
                        <Flex key={key} mb={2} align="center" gap={2}>
                          <Form.Item {...rest} name={[name]} fieldKey={[fieldKey]} noStyle rules={[{ required: true, message: "Required" }]}>
                            <Input placeholder="Section" />
                          </Form.Item>
                          <MinusCircleOutlined style={{ color: "red", cursor: "pointer" }} onClick={() => remove(name)} />
                        </Flex>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Section</Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Box>

              <Box flex="1">
                <Text fontWeight="500" mb={2}>Subjects</Text>
                <Form.List name="subjects" rules={[{ validator: async (_, s) => !s || s.length < 1 ? Promise.reject(new Error("At least one subject is required")) : undefined }]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, fieldKey, ...rest }) => (
                        <Flex key={key} mb={2} align="center" gap={2}>
                          <Form.Item {...rest} name={[name]} fieldKey={[fieldKey]} noStyle rules={[{ required: true, message: "Required" }]}>
                            <Input placeholder="Subject" />
                          </Form.Item>
                          <MinusCircleOutlined style={{ color: "red", cursor: "pointer" }} onClick={() => remove(name)} />
                        </Flex>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Subject</Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Box>
            </Flex>

            <Form.Item mb={0} mt={4}>
              <Button bg="brand.primary" color="white" _hover={{ bg: "brand.text" }} onClick={() => form.submit()} w="100%" size="lg" borderRadius="xl">
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
    </Box>
  );
}

export default ClassSectionPage;
