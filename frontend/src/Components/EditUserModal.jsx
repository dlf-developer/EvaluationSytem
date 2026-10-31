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
        canAddNotebookComment: Boolean(
          user?.canAddNotebookComment === true ||
          user?.canAddNotebookComment === "true"
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

  const currentRole = selectedAccess || user?.access;
  const isObserverRole = currentRole === "Observer" || currentRole === "OT";

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);
      const isObserver = values.access === "Observer" || values.access === "OT";
      const isDualRole = isObserver && Boolean(values.isDualRole || values.access === "OT");
      const canAddNotebookComment = isObserver && Boolean(values.canAddNotebookComment);
      await dispatch(
        UpdateUser({
          id: user?._id,
          ...values,
          isDualRole,
          canAddNotebookComment,
          roles: isDualRole ? ["Observer", "Teacher"] : [values.access],
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

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      width={700}
      destroyOnClose
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a4d2e]/10 text-[#1a4d2e] flex items-center justify-center shrink-0">
            <EditOutlined className="text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900 leading-tight">
                Edit User
              </span>
              {user && <UserRoleBadge user={user} />}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 leading-none">
              {user?.name} · ID: {user?.employeeId || "—"}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button onClick={onCancel} disabled={isLoading} size="middle">
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={isLoading}
            size="middle"
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-1">
        {/* Section 1: Basic Profile */}
        <div className="mb-4">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
            Personal Information
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
          </Row>
        </div>

        {/* Section 2: Role & Designation */}
        <div className="mb-4 pt-1 border-t border-gray-100">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 mt-3">
            Role & Assignment
          </h4>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="designation"
                label="Designation"
                rules={[{ required: true, message: "Designation is required" }]}
              >
                <Input placeholder="e.g. Senior PGT Mathematics" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="access"
                label="Primary Access Level"
                rules={[{ required: true, message: "Please select an access level" }]}
              >
                <Select>
                  <Option value="Teacher">Teacher</Option>
                  <Option value="Observer">Observer</Option>
                  <Option value="OT">OT (Dual Role)</Option>
                  <Option value="Superadmin">Superadmin</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="sclass" label="Class">
                <Input placeholder="e.g. 10th" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="section" label="Section">
                <Input placeholder="e.g. A" />
              </Form.Item>
            </Col>

            {currentRole === "Observer" && (
              <>
                <Col xs={24} sm={12}>
                  <Form.Item name="coordinator" label="Coordinator Detail">
                    <Input placeholder="e.g. Middle Wing" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="hod" label="Head of Department (HOD)">
                    <Input placeholder="e.g. Science" />
                  </Form.Item>
                </Col>
              </>
            )}

            {currentRole === "Teacher" && (
              <>
                <Col xs={24} sm={12}>
                  <Form.Item name="motherTeacher" label="Mother Teacher">
                    <Input placeholder="Mother teacher info" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="subjectTeacher" label="Subject Teacher">
                    <Input placeholder="e.g. Mathematics" />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>
        </div>

        {/* Section 3: Status & Capabilities */}
        <div className="pt-1 border-t border-gray-100">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 mt-3">
            Account Status & Privileges
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
                    Active users can log in and participate in evaluations
                  </p>
                </div>
                <Form.Item name="isActive" valuePropName="checked" className="mb-0 shrink-0">
                  <Switch />
                </Form.Item>
              </div>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
}

export default EditUserModal;
