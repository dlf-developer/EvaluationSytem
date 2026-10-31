import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  Switch,
  message,
} from "./UI";
import { useDispatch } from "react-redux";
import { UpdateUser } from "../redux/userSlice";
import { UserRoleBadge } from "./SmartTable/tableColumns";
import { Box, Flex, Text, Tag, Divider } from "@chakra-ui/react";
import { EditOutlined, SaveOutlined } from "./UI/Icons";

const { Option } = Select;

function EditUserModal({ open, user, onCancel, onSuccess }) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const selectedAccess = Form.useWatch("access", form);

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        employeeId: user?.employeeId || "",
        name: user?.name || "",
        email: user?.email || "",
        mobile: user?.mobile || "",
        access: user?.access || "Observer",
        isDualRole: Boolean(
          user?.isDualRole === true ||
            user?.isDualRole === "true" ||
            (Array.isArray(user?.roles) &&
              user.roles.includes("Observer") &&
              user.roles.includes("Teacher"))
        ),
        isActive: user?.isActive !== false,
        designation: user?.designation || "",
        sclass: user?.sclass || "",
        section: user?.section || "",
        coordinator: user?.coordinator || "",
        hod: user?.hod || "",
        motherTeacher: user?.motherTeacher || "",
        subjectTeacher: user?.subjectTeacher || "",
      });
    } else {
      form.resetFields();
    }
  }, [user, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);
      await dispatch(
        UpdateUser({
          id: user?._id,
          ...values,
          isDualRole: Boolean(values.isDualRole),
          isActive: Boolean(values.isActive),
        })
      ).unwrap();

      message.success(`User "${values.name}" updated successfully.`);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (error?.message) {
        message.error(error.message);
      } else if (typeof error === "string") {
        message.error(error);
      } else {
        message.error("Failed to update user. Please verify all fields.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentRole = selectedAccess || user?.access;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      centered
      destroyOnClose
      title={
        <Flex align="center" gap={3} py={1}>
          <Box
            p={2}
            borderRadius="lg"
            bg="blue.50"
            color="blue.600"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
          >
            <EditOutlined style={{ fontSize: "18px" }} />
          </Box>
          <Box>
            <Flex align="center" gap={2}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800" m={0}>
                Edit User
              </Text>
              {user && <UserRoleBadge user={user} />}
            </Flex>
            <Text fontSize="xs" color="gray.500" m={0}>
              {user?.name} · ID: {user?.employeeId || "—"}
            </Text>
          </Box>
        </Flex>
      }
    >
      <Divider style={{ margin: "12px 0 20px" }} />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="employeeId"
              label="Employee ID"
              rules={[{ required: true, message: "Employee ID is required" }]}
            >
              <Input placeholder="e.g. EMP001" style={{ borderRadius: "8px" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: "Full Name is required" },
                { min: 3, message: "Full Name must be at least 3 characters" },
              ]}
            >
              <Input placeholder="Enter full name" style={{ borderRadius: "8px" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input placeholder="user@dlps.co.in" style={{ borderRadius: "8px" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="mobile"
              label="Mobile Number"
              rules={[
                { required: true, message: "Mobile Number is required" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              ]}
            >
              <Input placeholder="10-digit mobile number" style={{ borderRadius: "8px" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="designation"
              label="Designation"
              rules={[{ required: true, message: "Designation is required" }]}
            >
              <Input placeholder="e.g. Senior PGT Mathematics" style={{ borderRadius: "8px" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="access"
              label="Primary Access Level"
              rules={[{ required: true, message: "Please select an access level" }]}
            >
              <Select style={{ borderRadius: "8px" }}>
                <Option value="Teacher">Teacher</Option>
                <Option value="Observer">Observer</Option>
                <Option value="Superadmin">Superadmin</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="isDualRole"
              label="Allow Dual Role (OT)"
              valuePropName="checked"
              tooltip="Allows this user to act as both an Observer (to evaluate others) and a Teacher (to be evaluated) with one-click mode switching"
            >
              <Switch
                checkedChildren="OT Enabled"
                unCheckedChildren="Disabled"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="isActive"
              label="Account Status"
              valuePropName="checked"
              tooltip="Active users can log in and participate in evaluations. Inactive users are blocked from logging in and hidden from all tables."
            >
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="sclass" label="Class">
              <Input placeholder="e.g. 10th" style={{ borderRadius: "8px" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="section" label="Section">
              <Input placeholder="e.g. A" style={{ borderRadius: "8px" }} />
            </Form.Item>
          </Col>

          {currentRole === "Observer" && (
            <>
              <Col xs={24} sm={12}>
                <Form.Item name="coordinator" label="Coordinator Detail">
                  <Input placeholder="e.g. Middle Wing" style={{ borderRadius: "8px" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="hod" label="Head of Department (HOD)">
                  <Input placeholder="e.g. Science" style={{ borderRadius: "8px" }} />
                </Form.Item>
              </Col>
            </>
          )}

          {currentRole === "Teacher" && (
            <>
              <Col xs={24} sm={12}>
                <Form.Item name="motherTeacher" label="Mother Teacher">
                  <Input placeholder="Mother teacher info" style={{ borderRadius: "8px" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="subjectTeacher" label="Subject Teacher">
                  <Input placeholder="e.g. Mathematics" style={{ borderRadius: "8px" }} />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>

        <Divider style={{ margin: "16px 0 20px" }} />

        <Row justify="end" gutter={12}>
          <Col>
            <Button onClick={onCancel} disabled={isLoading} style={{ borderRadius: "8px" }}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={isLoading}
              style={{
                borderRadius: "8px",
                backgroundColor: "#1a4d2e",
                borderColor: "#1a4d2e",
              }}
            >
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default EditUserModal;
