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
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { AntDesignOutlined, UserOutlined } from "@ant-design/icons";
import { axiosInstance } from "../redux/instence";
// Assuming baseURL is set globally or imported, or we can use a dynamic approach
// Normally we'd use process.env.REACT_APP_API_URL or a proxy, this matches standard practice here.

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // If we passed an email from Login via query param, populate it
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("email")) {
      setEmail(searchParams.get("email"));
    }
  }, [location.search]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendLink = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Using axiosInstance for correct base URL routing
      const res = await axiosInstance.post("/auth/request-password-reset", { email });
      if (res.status === 200) {
        message.success("Password reset email sent. Please check your inbox.");
      } else {
        message.error(res.data?.message || "Failed to send reset email.");
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "An error occurred. Please try again.");
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
            Enter your email to receive a secure link to reset your account password.
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
                Reset Password
              </Heading>
              <Text color="brand.textMuted" fontSize="md">
                We'll send a password rest link to your email.
              </Text>
            </Box>

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
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendLink(); }}
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
              onClick={handleSendLink}
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
              Send Reset Link
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

export default ForgetPassword;
