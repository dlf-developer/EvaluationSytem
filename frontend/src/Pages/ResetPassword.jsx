import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LockOutlined, CheckCircleOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { axiosInstance } from "../redux/instence";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    // 8 characters, 1 capital letter, 1 number
    const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const handleResetPassword = async () => {
    let passwordError = "";
    let confirmError = "";

    if (!validatePassword(newPassword)) {
      passwordError = "Password must be at least 8 characters, include 1 uppercase letter and 1 number.";
    }

    if (newPassword !== confirmPassword) {
      confirmError = "Passwords do not match.";
    }

    setErrors({ password: passwordError, confirm: confirmError });

    if (!passwordError && !confirmError) {
      setLoading(true);
      try {
        const res = await axiosInstance.post("/auth/reset-password", { token, newPassword });
        if (res.status === 200) {
          message.success("Password has been reset successfully.");
          navigate("/login");
        } else {
          message.error(res.data?.message || "Failed to reset password. The link might be expired.");
        }
      } catch (error) {
        console.error(error);
        message.error(error.response?.data?.message || "An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
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
            Secure Reset
          </Heading>
          <Text fontSize="lg" opacity={0.9}>
            Set your new strong password to regain access to your account.
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
                Create New Password
              </Heading>
              <Text color="brand.textMuted" fontSize="md">
                Your new password must be different from previous used passwords.
              </Text>
            </Box>

            <Stack spacing={5}>
              <FormControl isInvalid={!!errors.password}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <LockOutlined
                      style={{ color: "var(--chakra-colors-brand-secondary)" }}
                    />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleResetPassword(); }}
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
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.confirm}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <CheckCircleOutlined
                      style={{ color: "var(--chakra-colors-brand-secondary)" }}
                    />
                  </InputLeftElement>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleResetPassword(); }}
                    focusBorderColor="brand.primary"
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.secondary" }}
                    borderRadius="lg"
                    bg="gray.50"
                  />
                  {confirmPassword && confirmPassword === newPassword ? (
                    <InputRightElement>
                      <CheckCircleOutlined style={{ color: "var(--chakra-colors-green-500)", fontSize: "20px" }} />
                    </InputRightElement>
                  ) : (
                    <InputRightElement h="full" pr={2}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </Button>
                    </InputRightElement>
                  )}
                </InputGroup>
                {errors.confirm && <FormErrorMessage>{errors.confirm}</FormErrorMessage>}
              </FormControl>
            </Stack>

            <Button
              colorScheme="brand"
              size="lg"
              w="full"
              leftIcon={<CheckCircleOutlined />}
              onClick={handleResetPassword}
              isLoading={loading}
              loadingText="Saving..."
              py={7}
              mt={4}
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

export default ResetPassword;
