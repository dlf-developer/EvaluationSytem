import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { message } from "antd";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  PinInput,
  PinInputField,
  HStack,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { AntDesignOutlined, UserOutlined, LockOutlined, KeyOutlined } from "@ant-design/icons";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { axiosInstance } from "../redux/instence";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("email")) {
      setEmail(searchParams.get("email"));
    }
  }, [location.search]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/request-password-reset", { email });
      if (res.status === 200) {
        if (res.data?.otp) {
          setDevOtp(res.data.otp);
        }
        message.success("OTP sent. Please check your inbox.");
        setStep(2);
      } else {
        message.error(res.data?.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/reset-password", { email, otp, newPassword });
      if (res.status === 200) {
        message.success("Password reset successfully! You can now log in.");
        setTimeout(() => {
          window.location.replace("/login");
        }, 1500);
      } else {
        message.error(res.data?.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Invalid OTP or error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      direction={{ base: "column", md: "row" }}
      bg="brand.background"
    >
      {/* Left Side: Branding / Visual */}
      <Flex
        flex={1}
        bgGradient="linear(to-br, brand.primary, brand.secondary)"
        color="white"
        p={10}
        direction="column"
        justify="center"
        align="center"
        position="relative"
        overflow="hidden"
        display={{ base: "none", md: "flex" }}
      >
        <Box
          position="absolute"
          top="-10%"
          left="-10%"
          w="400px"
          h="400px"
          bg="whiteAlpha.200"
          borderRadius="full"
          filter="blur(50px)"
        />
        <Box
          position="absolute"
          bottom="-10%"
          right="-10%"
          w="300px"
          h="300px"
          bg="whiteAlpha.200"
          borderRadius="full"
          filter="blur(40px)"
        />

        <VStack spacing={8} zIndex={1} textAlign="center" maxW="lg">
          <Image
            src="/images/mainLogo.jpeg"
            alt="Main Logo"
            maxH="120px"
            objectFit="contain"
            bg="white"
            p={2}
            borderRadius="xl"
            boxShadow="2xl"
          />
          <Heading as="h1" size="2xl" fontWeight="bold" lineHeight="tall">
            Forgot Password
          </Heading>
          <Text fontSize="lg" opacity={0.9}>
            {step === 1 ? "Enter your email to receive a secure OTP to reset your account password." : "Enter the OTP sent to your email and your new password."}
          </Text>
        </VStack>
      </Flex>

      {/* Right Side: Form */}
      <Flex flex={1} justify="center" align="center" p={{ base: 6, md: 10 }}>
        <Box
          w="full"
          maxW="md"
          bg="white"
          p={10}
          borderRadius="2xl"
          boxShadow={{ base: "none", md: "2xl" }}
          border={{ base: "none", md: "1px solid" }}
          borderColor="gray.100"
        >
          <VStack spacing={6} align="stretch" w="full">
            <Box
              textAlign="center"
              display={{ base: "block", md: "none" }}
              mb={4}
            >
              <Image
                src="/images/mainLogo.jpeg"
                alt="Main Logo"
                mx="auto"
                mb={4}
                maxH="80px"
                objectFit="contain"
              />
              <Heading as="h1" size="xl" color="brand.secondary" mb={2}>
                Teacher Portal
              </Heading>
            </Box>

            <Box mb={2}>
              <Heading
                as="h2"
                size="xl"
                mb={2}
                color="brand.text"
                fontWeight="bold"
              >
                {step === 1 ? "Reset Password" : "Enter Details"}
              </Heading>
              <Text color="brand.textMuted" fontSize="md">
                {step === 1 ? "We'll send a password reset OTP to your email." : `Enter the 6-digit OTP sent to ${email}`}
              </Text>
            </Box>

            {step === 1 && (
              <>
                <Stack spacing={5}>
                  <FormControl isInvalid={!!error}>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <UserOutlined
                          style={{ color: "var(--chakra-colors-brand-secondary)" }}
                        />
                      </InputLeftElement>
                      <Input
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        focusBorderColor="brand.primary"
                        borderColor="gray.300"
                        _hover={{ borderColor: "brand.secondary" }}
                        borderRadius="lg"
                        bg="gray.50"
                        onKeyDown={(e) => { if (e.key === "Enter") handleSendOTP(); }}
                      />
                    </InputGroup>
                    {error && <FormErrorMessage>{error}</FormErrorMessage>}
                  </FormControl>
                </Stack>

                <Button
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  leftIcon={<AntDesignOutlined />}
                  onClick={handleSendOTP}
                  isLoading={loading}
                  loadingText="Sending..."
                  py={7}
                  mt={2}
                  fontSize="md"
                  fontWeight="bold"
                  borderRadius="xl"
                  boxShadow="lg"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                    bg: "brand.secondary",
                  }}
                  _active={{
                    transform: "translateY(0)",
                    boxShadow: "md",
                  }}
                  transition="all 0.3s"
                >
                  Send OTP
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                {devOtp && (
                  <Box
                    bg="yellow.50"
                    border="1px solid"
                    borderColor="yellow.300"
                    borderRadius="lg"
                    p={3}
                    textAlign="center"
                    mb={4}
                  >
                    <Text fontSize="xs" color="yellow.700" fontWeight="bold">
                      🔧 DEV MODE — Your OTP:
                    </Text>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color="yellow.800"
                      letterSpacing="0.5em"
                      fontFamily="monospace"
                    >
                      {devOtp}
                    </Text>
                  </Box>
                )}
                
                <Stack spacing={5}>
                  <FormControl isInvalid={!!error}>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <LockOutlined
                          style={{ color: "var(--chakra-colors-brand-secondary)" }}
                        />
                      </InputLeftElement>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        focusBorderColor="brand.primary"
                        borderColor="gray.300"
                        _hover={{ borderColor: "brand.secondary" }}
                        borderRadius="lg"
                        bg="gray.50"
                      />
                      <InputRightElement h="full" pr={2}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <HiOutlineEye size={18} />
                          ) : (
                            <HiOutlineEyeOff size={18} />
                          )}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl isInvalid={!!error}>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <LockOutlined
                          style={{ color: "var(--chakra-colors-brand-secondary)" }}
                        />
                      </InputLeftElement>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        focusBorderColor="brand.primary"
                        borderColor="gray.300"
                        _hover={{ borderColor: "brand.secondary" }}
                        borderRadius="lg"
                        bg="gray.50"
                      />
                      <InputRightElement h="full" pr={2}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <HiOutlineEye size={18} />
                          ) : (
                            <HiOutlineEyeOff size={18} />
                          )}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    {error && <FormErrorMessage>{error}</FormErrorMessage>}
                  </FormControl>
                  
                  <Box>
                    <Text fontSize="sm" color="brand.textMuted" mb={2} textAlign="center">
                      Enter the 6-digit OTP sent to your email
                    </Text>
                    <Flex justify="center">
                      <HStack spacing={3}>
                        <PinInput
                          size="lg"
                          otp
                          value={otp}
                          onChange={(value) => setOtp(value)}
                          onComplete={(value) => {
                            setOtp(value);
                          }}
                          focusBorderColor="brand.primary"
                        >
                          <PinInputField
                            borderColor="gray.300"
                            _hover={{ borderColor: "brand.secondary" }}
                            _focus={{ borderColor: "brand.primary", boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)" }}
                            bg="gray.50"
                            borderRadius="lg"
                            w="52px" h="52px"
                            fontSize="xl" fontWeight="bold" textAlign="center"
                          />
                          <PinInputField
                            borderColor="gray.300"
                            _hover={{ borderColor: "brand.secondary" }}
                            _focus={{ borderColor: "brand.primary", boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)" }}
                            bg="gray.50"
                            borderRadius="lg"
                            w="52px" h="52px"
                            fontSize="xl" fontWeight="bold" textAlign="center"
                          />
                          <PinInputField
                            borderColor="gray.300"
                            _hover={{ borderColor: "brand.secondary" }}
                            _focus={{ borderColor: "brand.primary", boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)" }}
                            bg="gray.50"
                            borderRadius="lg"
                            w="52px" h="52px"
                            fontSize="xl" fontWeight="bold" textAlign="center"
                          />
                          <PinInputField
                            borderColor="gray.300"
                            _hover={{ borderColor: "brand.secondary" }}
                            _focus={{ borderColor: "brand.primary", boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)" }}
                            bg="gray.50"
                            borderRadius="lg"
                            w="52px" h="52px"
                            fontSize="xl" fontWeight="bold" textAlign="center"
                          />
                          <PinInputField
                            borderColor="gray.300"
                            _hover={{ borderColor: "brand.secondary" }}
                            _focus={{ borderColor: "brand.primary", boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)" }}
                            bg="gray.50"
                            borderRadius="lg"
                            w="52px" h="52px"
                            fontSize="xl" fontWeight="bold" textAlign="center"
                          />
                          <PinInputField
                            borderColor="gray.300"
                            _hover={{ borderColor: "brand.secondary" }}
                            _focus={{ borderColor: "brand.primary", boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)" }}
                            bg="gray.50"
                            borderRadius="lg"
                            w="52px" h="52px"
                            fontSize="xl" fontWeight="bold" textAlign="center"
                          />
                        </PinInput>
                      </HStack>
                    </Flex>
                  </Box>
                </Stack>

                <Button
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  leftIcon={<AntDesignOutlined />}
                  onClick={handleResetPassword}
                  isLoading={loading}
                  loadingText="Resetting..."
                  py={7}
                  mt={2}
                  fontSize="md"
                  fontWeight="bold"
                  borderRadius="xl"
                  boxShadow="lg"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                    bg: "brand.secondary",
                  }}
                  _active={{
                    transform: "translateY(0)",
                    boxShadow: "md",
                  }}
                  transition="all 0.3s"
                >
                  Reset Password
                </Button>
              </>
            )}
            
            <Flex justify="center" align="center" mt={4}>
              <Box
                as={Link}
                to="/login"
                color="brand.primary"
                fontWeight="semibold"
                fontSize="sm"
                _hover={{
                  color: "brand.secondary",
                  textDecoration: "underline",
                }}
                transition="color 0.2s"
              >
                Back to Login
              </Box>
            </Flex>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}

export default ForgetPassword;
