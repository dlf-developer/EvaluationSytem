import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Spin, Row, Col } from "antd";
import { UserOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { GetSignleUser, UpdateUser } from "../redux/userSlice";
import { getUserId } from "../Utils/auth";
import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar as ChakraAvatar,
} from "@chakra-ui/react";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const userId = getUserId().id;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await dispatch(GetSignleUser(userId));
        setUserData(response.payload); // Assuming `payload` contains user data
      } catch (error) {
        message.error("Failed to fetch user data.");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [dispatch, userId]);

  // Enable edit mode
  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue(userData);
  };

  // Save updated profile
  const handleSave = async () => {
    try {
      const currentValues = await form.validateFields(); // Get the current form values
      const updatedData = Object.keys(currentValues).reduce((acc, key) => {
        if (currentValues[key] !== userData[key]) {
          acc[key] = currentValues[key]; // Include only updated fields
        }
        return acc;
      }, {});

      if (Object.keys(updatedData).length > 0) {
        // Ideally, call an API or dispatch an action to update the user profile
        const id = userId;
        await dispatch(UpdateUser({ id, ...updatedData }));
        setUserData((prevData) => ({ ...prevData, ...updatedData }));
        message.success("Profile updated successfully!");
      } else {
        message.info("No changes made to the profile.");
      }

      setIsEditing(false); // Exit edit mode
    } catch (error) {
      message.error("Please fix the errors in the form.");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  if (loading) {
    return (
      <Flex
        w="100%"
        h="100vh"
        align="center"
        justify="center"
        bg="brand.background"
      >
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <Box bg="brand.background" minH="100vh" pb={12}>
      {/* Premium Cover Header */}
      <Box
        h={{ base: "200px", md: "280px" }}
        w="100%"
        bgGradient="linear(to-r, brand.primary, brand.secondary)"
        position="relative"
        overflow="hidden"
      >
        {/* Subtle decorative shapes */}
        <Box
          position="absolute"
          top="-20%"
          left="-5%"
          w="300px"
          h="300px"
          bg="whiteAlpha.200"
          rounded="full"
          filter="blur(40px)"
        />
        <Box
          position="absolute"
          bottom="-20%"
          right="10%"
          w="250px"
          h="250px"
          bg="whiteAlpha.200"
          rounded="full"
          filter="blur(50px)"
        />
      </Box>

      {/* Profile Content Box */}
      <Box
        maxW="5xl"
        mx="auto"
        mt={{ base: "-80px", md: "-120px" }}
        px={{ base: 4, md: 8 }}
        position="relative"
        zIndex={1}
      >
        <Box
          bg="white"
          rounded="2xl"
          shadow={{ base: "lg", md: "2xl" }}
          overflow="hidden"
        >
          {/* Header Section */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            align={{ base: "center", sm: "flex-end" }}
            justify="space-between"
            p={{ base: 6, md: 10 }}
            borderBottomWidth="1px"
            borderColor="gray.100"
            bg="white"
          >
            <Flex
              align="center"
              direction={{ base: "column", sm: "row" }}
              textAlign={{ base: "center", sm: "left" }}
              gap={{ base: 4, sm: 6 }}
            >
              <ChakraAvatar
                size="2xl"
                name={userData?.name || "User"}
                icon={<UserOutlined fontSize="3xl" />}
                showBorder
                borderColor="white"
                borderWidth="4px"
                boxShadow="xl"
                mt={{ base: "-40px", sm: 0 }}
                bg="brand.secondary"
                color="white"
                w={{ base: "120px", md: "150px" }}
                h={{ base: "120px", md: "150px" }}
              />
              <Box pb={{ sm: 2 }}>
                <Heading size="xl" fontWeight="bold" color="gray.800" mb={1}>
                  {userData?.name || "User Name"}
                </Heading>
                <Text color="brand.primary" fontWeight="semibold" fontSize="lg">
                  {userData?.designation || "Staff Member"}
                </Text>
              </Box>
            </Flex>

            <Box mt={{ base: 6, sm: 0 }} pb={{ sm: 2 }}>
              {isEditing ? (
                <Flex gap={3}>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    size="large"
                    style={{
                      borderRadius: "8px",
                      boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    size="large"
                    style={{ borderRadius: "8px" }}
                  >
                    Cancel
                  </Button>
                </Flex>
              ) : (
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  size="large"
                  style={{
                    borderRadius: "8px",
                    borderColor: "var(--chakra-colors-brand-primary)",
                    color: "var(--chakra-colors-brand-primary)",
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Flex>

          {/* Form Section */}
          <Box p={{ base: 6, md: 10 }} bg="gray.50">
            <Heading size="md" mb={8} color="gray.700" fontWeight="bold">
              Personal Information
            </Heading>
            <Form
              layout="vertical"
              form={form}
              initialValues={userData}
              disabled={!isEditing}
              size="large"
            >
              <Row gutter={[32, 24]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span style={{ fontWeight: 500, color: "#4a5568" }}>
                        Full Name
                      </span>
                    }
                    name="name"
                    rules={[{ required: true, message: "Name is required!" }]}
                  >
                    <Input
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                      placeholder="Enter your full name"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span style={{ fontWeight: 500, color: "#4a5568" }}>
                        Email Address
                      </span>
                    }
                    name="email"
                    rules={[
                      { required: true, message: "Email is required!" },
                      {
                        type: "email",
                        message: "Enter a valid email address!",
                      },
                    ]}
                  >
                    <Input
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                      placeholder="Enter your email"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[32, 24]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span style={{ fontWeight: 500, color: "#4a5568" }}>
                        Phone Number
                      </span>
                    }
                    name="mobile"
                    rules={[
                      { required: true, message: "Phone number is required!" },
                      {
                        pattern: /^\d{10}$/,
                        message:
                          "Enter a valid 10 digit phone number (e.g., 0123456789).",
                      },
                    ]}
                  >
                    <Input
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                      placeholder="Enter your phone frequency"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span style={{ fontWeight: 500, color: "#4a5568" }}>
                        Designation
                      </span>
                    }
                    name="designation"
                    rules={[
                      { required: true, message: "Designation is required!" },
                    ]}
                  >
                    <Input
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                      placeholder="Enter your designation"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;
