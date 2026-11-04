import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Spin, Row, Col } from "../Components/UI";
import { UserOutlined, EditOutlined, SaveOutlined } from "../Components/UI/Icons";
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
import {
  isMalkinAccount,
  SECRET_MALKIN_PIN,
  isCuteMalkinThemeActive,
  setCuteMalkinTheme,
} from "../Utils/cuteMalkinTheme";
import {
  ADMIN_SECRET_PIN,
  isAdminFeaturesUnlocked,
  setAdminFeaturesUnlocked,
} from "../Utils/adminUnlock";
import WelcomeMalkinModal from "../Components/WelcomeMalkinModal";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  // Cute Malkin Theme States
  const [pinInput, setPinInput] = useState("");
  const [isCuteActive, setIsCuteActive] = useState(() => isCuteMalkinThemeActive());
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Admin PIN States
  const [adminPinInput, setAdminPinInput] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => isAdminFeaturesUnlocked());

  const dispatch = useDispatch();
  const userId = getUserId()?.id;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (userId) {
          const response = await dispatch(GetSignleUser(userId));
          setUserData(response.payload);
        }
      } catch (error) {
        message.error("Failed to fetch user data.");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [dispatch, userId]);

  // Listen to global theme changes
  useEffect(() => {
    const handleThemeChange = (e) => {
      setIsCuteActive(Boolean(e.detail?.active));
    };
    window.addEventListener("cute-theme-changed", handleThemeChange);
    return () => {
      window.removeEventListener("cute-theme-changed", handleThemeChange);
    };
  }, []);

  // Determine if the current profile belongs to the specified account
  const currentEmail = (
    userData?.email ||
    getUserId()?.email ||
    (typeof window !== "undefined" ? localStorage.getItem("userEmail") : "") ||
    ""
  ).toLowerCase().trim();

  const isTargetUser = isMalkinAccount(currentEmail);
  const isAdmin = (userData?.access || getUserId()?.access) === "Superadmin";

  // Listen to admin unlock changes
  useEffect(() => {
    const handleAdminUnlock = (e) => {
      setIsAdminUnlocked(Boolean(e.detail?.unlocked));
    };
    window.addEventListener("admin-features-unlock-changed", handleAdminUnlock);
    return () => {
      window.removeEventListener("admin-features-unlock-changed", handleAdminUnlock);
    };
  }, []);

  const handleActivateAdminFeatures = (val) => {
    const clean = (val !== undefined ? val : adminPinInput).trim();
    if (clean === ADMIN_SECRET_PIN) {
      setAdminFeaturesUnlocked(true);
      setIsAdminUnlocked(true);
      setAdminPinInput("");
      message.success("Access granted! Audit Logs and Admin Analytics unlocked.");
    } else {
      message.error("Incorrect PIN. Access denied.");
    }
  };

  const handleDeactivateAdminFeatures = () => {
    setAdminFeaturesUnlocked(false);
    setIsAdminUnlocked(false);
    setAdminPinInput("");
    message.info("Admin features locked and hidden.");
  };

  // Handle PIN verification
  const handleActivateTheme = (inputVal) => {
    const clean = (inputVal !== undefined ? inputVal : pinInput).trim();
    if (clean === SECRET_MALKIN_PIN) {
      setCuteMalkinTheme(true);
      setIsCuteActive(true);
      setShowWelcomeModal(true);
      setPinInput("");
      message.success("Theme unlocked! Welcome Malkin 👑💖");
    } else {
      message.error("Incorrect PIN. Access restricted.");
    }
  };

  const handlePinChange = (val) => {
    setPinInput(val);
    if (val.trim() === SECRET_MALKIN_PIN) {
      handleActivateTheme(val);
    }
  };

  const handleDeactivateTheme = () => {
    setCuteMalkinTheme(false);
    setIsCuteActive(false);
    message.info("Standard theme restored.");
  };

  // Enable edit mode
  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue(userData);
  };

  // Save updated profile
  const handleSave = async () => {
    try {
      const currentValues = await form.validateFields();
      const updatedData = Object.keys(currentValues).reduce((acc, key) => {
        if (currentValues[key] !== userData[key]) {
          acc[key] = currentValues[key];
        }
        return acc;
      }, {});

      if (Object.keys(updatedData).length > 0) {
        const id = userId;
        await dispatch(UpdateUser({ id, ...updatedData }));
        setUserData((prevData) => ({ ...prevData, ...updatedData }));
        message.success("Profile updated successfully!");
      } else {
        message.info("No changes made to the profile.");
      }

      setIsEditing(false);
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
        bg={isCuteActive ? "#fff0f5" : "brand.background"}
      >
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <Box bg={isCuteActive ? "#fff0f5" : "brand.background"} minH="100vh" pb={12} transition="background 0.3s">
      {/* Premium Cover Header */}
      <Box
        h={{ base: "200px", md: "280px" }}
        w="100%"
        bgGradient={
          isCuteActive
            ? "linear(to-r, #f472b6, #db2777)"
            : "linear(to-r, brand.primary, brand.secondary)"
        }
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
          borderWidth={isCuteActive ? "1.5px" : "1px"}
          borderColor={isCuteActive ? "pink.200" : "gray.100"}
        >
          {/* Header Section */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            align={{ base: "center", sm: "flex-end" }}
            justify="space-between"
            p={{ base: 6, md: 10 }}
            borderBottomWidth="1px"
            borderColor={isCuteActive ? "pink.100" : "gray.100"}
            bg={isCuteActive ? "linear-gradient(180deg, #ffffff 0%, #fff9fa 100%)" : "white"}
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
                boxShadow={isCuteActive ? "0 10px 25px -5px rgba(244, 114, 182, 0.4)" : "xl"}
                mt={{ base: "-40px", sm: 0 }}
                bg={isCuteActive ? "pink.400" : "brand.secondary"}
                color="white"
                w={{ base: "120px", md: "150px" }}
                h={{ base: "120px", md: "150px" }}
              />
              <Box pb={{ sm: 2 }}>
                <Flex align="center" gap={2} justify={{ base: "center", sm: "flex-start" }}>
                  <Heading size="xl" fontWeight="bold" color="gray.800" mb={1}>
                    {userData?.name || "User Name"}
                  </Heading>
                  {isCuteActive && isTargetUser && (
                    <span className="text-xl select-none" title="Malkin 👑">👑💖</span>
                  )}
                </Flex>
                <Text
                  color={isCuteActive ? "pink.600" : "brand.primary"}
                  fontWeight="semibold"
                  fontSize="lg"
                >
                  {isCuteActive && isTargetUser
                    ? "Malkin • SoftGirl CEO ✨"
                    : userData?.designation || "Staff Member"}
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
                      borderRadius: "10px",
                      background: isCuteActive
                        ? "linear-gradient(135deg, #f472b6 0%, #db2777 100%)"
                        : undefined,
                      borderColor: isCuteActive ? "#db2777" : undefined,
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    size="large"
                    style={{ borderRadius: "10px" }}
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
                    borderRadius: "10px",
                    borderColor: isCuteActive ? "#f472b6" : "var(--chakra-colors-brand-primary)",
                    color: isCuteActive ? "#db2777" : "var(--chakra-colors-brand-primary)",
                    background: isCuteActive ? "#fff0f5" : undefined,
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Flex>

          {/* Form Section */}
          <Box p={{ base: 6, md: 10 }} bg={isCuteActive ? "#fff9fb" : "gray.50"}>
            <Heading size="md" mb={8} color={isCuteActive ? "pink.900" : "gray.700"} fontWeight="bold">
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
                      placeholder="Enter your phone number"
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

                {/* Normal-looking PIN input field (Exclusively for nishachauhan@dlps.co.in) */}
                {isTargetUser && (
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                          <span style={{ fontWeight: 500, color: "#4a5568" }}>
                            PIN
                          </span>
                          {isCuteActive && (
                            <button
                              type="button"
                              onClick={handleDeactivateTheme}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#9ca3af",
                                fontSize: "11px",
                                cursor: "pointer",
                                textDecoration: "underline",
                                padding: 0,
                              }}
                            >
                              Reset theme
                            </button>
                          )}
                        </div>
                      }
                    >
                      <Input
                        placeholder="Enter PIN"
                        value={pinInput}
                        maxLength={6}
                        disabled={false}
                        onChange={(e) => handlePinChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleActivateTheme(e.target.value);
                        }}
                        style={{ borderRadius: "8px", padding: "10px 14px" }}
                        autoComplete="off"
                      />
                    </Form.Item>
                  </Col>
                )}

                {/* Admin Security PIN field (Exclusively for Superadmin to unlock Audit Logs & Analytics) */}
                {isAdmin && (
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                          <span style={{ fontWeight: 500, color: "#4a5568" }}>
                            Admin Security PIN
                          </span>
                          {isAdminUnlocked && (
                            <button
                              type="button"
                              onClick={handleDeactivateAdminFeatures}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                fontSize: "11px",
                                cursor: "pointer",
                                textDecoration: "underline",
                                padding: 0,
                              }}
                            >
                              Lock features
                            </button>
                          )}
                        </div>
                      }
                    >
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <Input
                          placeholder={isAdminUnlocked ? "Features Unlocked (1111)" : "Enter PIN"}
                          value={adminPinInput}
                          maxLength={6}
                          type="password"
                          disabled={false}
                          onChange={(e) => {
                            setAdminPinInput(e.target.value);
                            if (e.target.value.trim() === ADMIN_SECRET_PIN) {
                              handleActivateAdminFeatures(e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleActivateAdminFeatures(adminPinInput);
                          }}
                          style={{ borderRadius: "8px", padding: "10px 14px", paddingRight: "65px" }}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => handleActivateAdminFeatures(adminPinInput)}
                          style={{
                            position: "absolute",
                            right: "6px",
                            height: "32px",
                            padding: "0 12px",
                            backgroundColor: "#2D4027",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          PIN
                        </button>
                      </div>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Form>
          </Box>
        </Box>
      </Box>

      {/* Pop-up Celebration Modal: "welcome malkin" */}
      <WelcomeMalkinModal
        open={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </Box>
  );
};

export default UserProfile;
