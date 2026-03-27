import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { GetSignleUser, UpdateUser } from "../../redux/userSlice"; // Assuming an update action is available
import {
  Card,
  Spin,
  Descriptions,
  Row,
  Col,
  Button as AntdButton,
  Input,
  message,
} from "antd";
import { UserRole } from "../../config/config";
import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Stack,
  Divider,
  HStack,
} from "@chakra-ui/react";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const UserDetails = () => {
  const [userData, setUserData] = useState(null);
  const [editStatus, setEditStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modifiedData, setModifiedData] = useState({});
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await dispatch(GetSignleUser(id));
        setUserData(res.payload);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, dispatch]);

  const renderEditableField = (label, value, fieldKey, validationRules) => {
    return editStatus ? (
      <Input
        defaultValue={value || ""}
        placeholder={label}
        onBlur={(e) =>
          handleFieldChange(fieldKey, e.target.value, validationRules)
        }
        style={{ width: "100%" }}
      />
    ) : (
      value || "N/A"
    );
  };

  const handleFieldChange = (field, value, validationRules) => {
    // Field validation logic
    const error = validateField(value, validationRules);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));

    // Update modified data
    setModifiedData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const validateField = (value, rules) => {
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message;
    }
    if (rules.minLength && value.length < rules.minLength) {
      return rules.message;
    }
    return ""; // No error
  };

  const handleEditClick = () => setEditStatus(true);

  const handleUpdateClick = async () => {
    // Check for errors before updating
    const validationErrors = Object.keys(modifiedData).reduce((acc, field) => {
      const rules = getValidationRules(field);
      const error = validateField(modifiedData[field], rules);
      if (error) acc[field] = error;
      return acc;
    }, {});

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      message.error("Please fix validation errors.");
      return;
    }

    try {
      await dispatch(UpdateUser({ id, ...modifiedData }));
      message.success("User details updated successfully.");
      setLoading(true);
      const res = await dispatch(GetSignleUser(id));
      setUserData(res.payload);
      setLoading(false);
      setEditStatus(false);
      setModifiedData({});
      setErrors({});
    } catch (error) {
      message.error("Failed to update user details.");
      console.error(error);
    }
  };

  const getValidationRules = (field) => {
    switch (field) {
      case "mobile":
        return {
          pattern: /^[0-9]{10}$/,
          message: "Mobile number must be 10 digits.",
        };
      case "email":
        return {
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          message: "Please enter a valid email address.",
        };
      case "name":
        return {
          minLength: 3,
          message: "Name must be at least 3 characters long.",
        };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="calc(100vh - 72px)">
        <Spin size="large" />
      </Flex>
    );
  }

  if (!userData) {
    return (
      <Flex justify="center" align="center" minH="calc(100vh - 72px)">
        <Box p={6} bg="white" borderRadius="xl" shadow="sm">
          <Text color="gray.500">User not found or an error occurred.</Text>
        </Box>
      </Flex>
    );
  }

  const renderRoleSpecificFields = (role) => {
    switch (role) {
      case UserRole[1]: // Coordinator Role
        return (
          <>
            <Descriptions.Item label="Coordinator">
              {renderEditableField(
                "Coordinator",
                userData.coordinator,
                "coordinator",
                {},
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Hod">
              {renderEditableField("Hod", userData.hod, "hod", {})}
            </Descriptions.Item>
          </>
        );
      case UserRole[2]: // Teacher Role
        return (
          <>
            <Descriptions.Item label="Mother Teacher">
              {renderEditableField(
                "Mother Teacher",
                userData.motherTeacher,
                "motherTeacher",
                {},
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Subject Teacher">
              {renderEditableField(
                "Subject Teacher",
                userData.subjectTeacher,
                "subjectTeacher",
                {},
              )}
            </Descriptions.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      {/* Breadcrumb & Header */}
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        mb={6}
        gap={4}
      >
        <Box>
          <Breadcrumb mb={2} fontSize="sm" color="gray.500">
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/users">
                Users
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{userData.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading size="lg" color="gray.800">
            User Profile
          </Heading>
        </Box>
        <HStack>
          {editStatus ? (
            <>
              <AntdButton
                icon={<CloseOutlined />}
                onClick={() => {
                  setEditStatus(false);
                  setModifiedData({});
                  setErrors({});
                }}
                style={{ borderRadius: "8px" }}
              >
                Cancel
              </AntdButton>
              <AntdButton
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleUpdateClick}
                style={{
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(24,144,255,0.3)",
                }}
              >
                Save Changes
              </AntdButton>
            </>
          ) : (
            <AntdButton
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditClick}
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(24,144,255,0.3)",
              }}
            >
              Edit Profile
            </AntdButton>
          )}
        </HStack>
      </Flex>

      {/* Main Card */}
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        overflow="hidden"
      >
        {/* Cover & Avatar */}
        <Box
          h="120px"
          bgGradient="linear(to-r, brand.primary, brand.secondary)"
          position="relative"
        >
          <Box
            position="absolute"
            bottom="-40px"
            left={{ base: "24px", md: "40px" }}
          >
            <Avatar
              size="2xl"
              name={userData.name}
              bg="white"
              color="brand.primary"
              showBorder
              border="4px solid white"
            />
          </Box>
        </Box>

        <Box pt={{ base: 12, md: 12 }} px={{ base: 6, md: 10 }} pb={8}>
          <Flex justify="space-between" align="flex-start" mb={8}>
            <Box>
              <Heading size="lg" color="gray.800" mb={1}>
                {userData.name}
              </Heading>
              <Text color="gray.500" fontSize="md">
                {userData.email} | {userData.employeeId}
              </Text>
            </Box>
            <Badge
              colorScheme={
                userData.access === "Superadmin"
                  ? "purple"
                  : userData.access === "Teacher"
                    ? "green"
                    : "blue"
              }
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {userData.access}
            </Badge>
          </Flex>

          <Divider mb={8} />

          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            labelStyle={{
              fontWeight: 600,
              backgroundColor: "#fbfcfe",
              color: "#4a5568",
              width: "30%",
            }}
            contentStyle={{ backgroundColor: "#fff", color: "#2d3748" }}
          >
            <Descriptions.Item label="Employee ID">
              {renderEditableField(
                "Employee ID",
                userData.employeeId,
                "employeeId",
                {},
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Full Name">
              {renderEditableField("Full Name", userData.name, "name", {
                minLength: 3,
                message: "Name must be at least 3 characters long.",
              })}
              {errors.name && (
                <span
                  style={{ color: "red", display: "block", marginTop: "4px" }}
                >
                  {errors.name}
                </span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {renderEditableField("Email", userData.email, "email", {
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Please enter a valid email address.",
              })}
              {errors.email && (
                <span
                  style={{ color: "red", display: "block", marginTop: "4px" }}
                >
                  {errors.email}
                </span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Mobile">
              {renderEditableField("Mobile", userData.mobile, "mobile", {
                pattern: /^[0-9]{10}$/,
                message: "Mobile number must be 10 digits.",
              })}
              {errors.mobile && (
                <span
                  style={{ color: "red", display: "block", marginTop: "4px" }}
                >
                  {errors.mobile}
                </span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Access Level">
              {renderEditableField(
                "Access Level",
                userData.access,
                "access",
                {},
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Designation">
              {renderEditableField(
                "Designation",
                userData.designation,
                "designation",
                {},
              )}
            </Descriptions.Item>
            {renderRoleSpecificFields(userData.access)}
            <Descriptions.Item label="Class">
              {renderEditableField("Class", userData.sclass, "sclass", {})}
            </Descriptions.Item>
            <Descriptions.Item label="Section">
              {renderEditableField("Section", userData.section, "section", {})}
            </Descriptions.Item>
          </Descriptions>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDetails;
