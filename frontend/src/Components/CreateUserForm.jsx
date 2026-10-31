import React, { useState } from "react";
import { Form, Input, Password, Select, Row, Col, Button, Switch, message } from "./UI";
import { useDispatch } from "react-redux";
import { CreateUserList, GetUserList } from "../redux/userSlice";

const { Option } = Select;

function CreateUserForm({ onOk, onCancel, Payload }) {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const handleFinish = async (values) => {
    setIsLoading(true); // Show loading state
    try {
      // Dispatch API call and handle response
      const response = await dispatch(CreateUserList(values));
      dispatch(GetUserList());
      message.success("User created successfully");
      form.resetFields(); // Reset form after submission
      onOk(); // Notify parent about success
    } catch (error) {
      message.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  const handleSubmit = async () => {
    try {
      // Trigger form validation
      await form.validateFields();
      form.submit(); // If validation passes, submit the form
    } catch (errorInfo) {
      message.warning("Please fill all required fields correctly.");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        access: "Observer",
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="employeeId"
            label="Employee ID"
            rules={[{ required: true, message: "Employee ID is required" }]}
          >
            <Input placeholder="Enter Employee ID" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: "Full Name is required" },
              { min: 3, message: "Full Name must be at least 3 characters" },
            ]}
          >
            <Input placeholder="Enter Full Name" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Enter Valid Email" />
          </Form.Item>
        </Col>

        <Col span={12}>
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
            <Input placeholder="Enter Valid Mobile No." />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="password"
            label="Create Password"
            rules={[{ required: true, message: "password is required" }]}
          >
            <Password placeholder="Enter password" />
          </Form.Item>
        </Col>
      

        <Col span={12}>
          <Form.Item
            name="designation"
            label="Designation"
            rules={[{ required: true, message: "Designation is required" }]}
          >
            <Input placeholder="Enter Designation" />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" gutter={16}>
        <Col span={12}>
          <Form.Item
            name="access"
            label="Access Level"
            rules={[{ required: true, message: "Please select an access level" }]}
          >
            <Select>
              <Option value="Observer">Observer</Option>
              <Option value="Teacher">Teacher</Option>
              <Option value="Superadmin">Superadmin</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="isDualRole"
            label="Allow Dual Role (OT)"
            valuePropName="checked"
            initialValue={false}
            tooltip="Enable if this user is a senior teacher who can both Observe and be Evaluated as a Teacher"
          >
            <Switch
              checkedChildren="OT Enabled"
              unCheckedChildren="Disabled"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" gutter={16}>
        <Col span={12}>
          <Form.Item
            name="isActive"
            label="Account Status"
            valuePropName="checked"
            initialValue={true}
            tooltip="Active users can log in and participate in evaluations. Inactive users are blocked and hidden."
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="end" gutter={16}>
        <Col>
          <Button onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Create
          </Button>
        </Col>
      </Row>
    
    </Form>
  );
}

export default CreateUserForm;
