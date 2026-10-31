import React, { useState } from "react";
import { Form, Input, Password, Select, Row, Col, Button, Switch, message } from "./UI";
import { useDispatch } from "react-redux";
import { CreateUserList, GetUserList } from "../redux/userSlice";

const { Option } = Select;

function CreateUserForm({ onOk, onCancel, Payload }) {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const selectedAccess = Form.useWatch("access", form);
  const isObserverRole = selectedAccess === "Observer" || selectedAccess === "OT";

  const handleFinish = async (values) => {
    setIsLoading(true);
    try {
      const isObserver = values.access === "Observer" || values.access === "OT";
      const isDualRole = isObserver && Boolean(values.isDualRole || values.access === "OT");
      const canAddNotebookComment = isObserver && Boolean(values.canAddNotebookComment);
      const payload = {
        ...values,
        isDualRole,
        canAddNotebookComment,
        roles: isDualRole ? ["Observer", "Teacher"] : [values.access],
      };
      await dispatch(CreateUserList(payload)).unwrap();
      dispatch(GetUserList());
      message.success("User created successfully");
      form.resetFields();
      onOk();
    } catch (error) {
      message.error(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      form.submit();
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
        isDualRole: false,
        canAddNotebookComment: false,
        isActive: true,
      }}
      className="pt-1"
    >
      <div className="mb-4">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          Account Information
        </h4>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="employeeId"
              label="Employee ID"
              rules={[{ required: true, message: "Employee ID is required" }]}
            >
              <Input placeholder="e.g. EMP001" />
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
              <Input placeholder="Enter full name" />
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
              <Input placeholder="user@dlps.co.in" />
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
              <Input placeholder="10-digit mobile number" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="password"
              label="Account Password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Password placeholder="Create secure password" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="designation"
              label="Designation"
              rules={[{ required: true, message: "Designation is required" }]}
            >
              <Input placeholder="e.g. Senior PGT Mathematics" />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <div className="mb-4 pt-1 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 mt-3">
          Role & Access
        </h4>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="access"
              label="Primary Access Level"
              rules={[{ required: true, message: "Please select an access level" }]}
            >
              <Select>
                <Option value="Observer">Observer</Option>
                <Option value="Teacher">Teacher</Option>
                <Option value="OT">OT (Dual Role)</Option>
                <Option value="Superadmin">Superadmin</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>

      <div className="pt-1 border-t border-gray-100 mb-5">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 mt-3">
          Status & Privileges
        </h4>
        <Row gutter={12}>
          {isObserverRole && (
            <>
              <Col xs={24} sm={12} className="mb-3">
                <div className="p-3 rounded-xl border border-gray-200/90 bg-white hover:border-[#1a4d2e]/40 shadow-xs transition-all flex items-center justify-between gap-3 h-full">
                  <div className="pr-2">
                    <div className="text-xs font-semibold text-gray-900">
                      Dual Role (OT)
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                      Allows switching between Observer and Teacher modes
                    </p>
                  </div>
                  <Form.Item name="isDualRole" valuePropName="checked" className="mb-0 shrink-0">
                    <Switch />
                  </Form.Item>
                </div>
              </Col>

              <Col xs={24} sm={12} className="mb-3">
                <div className="p-3 rounded-xl border border-gray-200/90 bg-white hover:border-[#1a4d2e]/40 shadow-xs transition-all flex items-center justify-between gap-3 h-full">
                  <div className="pr-2">
                    <div className="text-xs font-semibold text-gray-900">
                      Notebook Comment Access
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                      Allow observer to add comments in Notebook Checking evaluations
                    </p>
                  </div>
                  <Form.Item name="canAddNotebookComment" valuePropName="checked" className="mb-0 shrink-0">
                    <Switch />
                  </Form.Item>
                </div>
              </Col>
            </>
          )}

          <Col xs={24} sm={isObserverRole ? 12 : 24} className="mb-3">
            <div className="p-3 rounded-xl border border-gray-200/90 bg-white hover:border-[#1a4d2e]/40 shadow-xs transition-all flex items-center justify-between gap-3 h-full">
              <div className="pr-2">
                <div className="text-xs font-semibold text-gray-900">
                  Account Status
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                  Active users can log in immediately upon creation
                </p>
              </div>
              <Form.Item name="isActive" valuePropName="checked" className="mb-0 shrink-0">
                <Switch />
              </Form.Item>
            </div>
          </Col>
        </Row>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
        <Button onClick={onCancel} disabled={isLoading} size="middle">
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={isLoading}
          size="middle"
        >
          Create User
        </Button>
      </div>
    </Form>
  );
}

export default CreateUserForm;
