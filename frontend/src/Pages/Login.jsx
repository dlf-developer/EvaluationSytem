import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { UserLogin } from "../redux/userSlice";
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
import {
  AntDesignOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const dispatch = useDispatch();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (password) => password.length >= 6;

  // Form submission handler
  const handleLogin = () => {
    let emailError = "";
    let passwordError = "";

    if (!validateEmail(email)) {
      emailError = "Please enter a valid email.";
    }

    if (!validatePassword(password)) {
      passwordError = "Password must be at least 6 characters.";
    }

    setErrors({ email: emailError, password: passwordError });

    if (!emailError && !passwordError) {
      dispatch(UserLogin({ email, password })).then((res) => {
        if (res?.payload?.token) {
          localStorage.setItem("token", res?.payload?.token);
          message.success("Logging in...");
          window.location.replace("/");
        } else {
          message.error(res?.payload?.message);
        }
      });
    } else {
      message.error("Please fix the errors before submitting.");
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
        {/* Glassmorphism Abstract Shapes */}
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
            Welcome to Teacher Portal
          </Heading>
          <Text fontSize="lg" opacity={0.9}>
            A comprehensive evaluation system to streamline academic and
            administrative assessments with precision.
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
                Login
              </Heading>
              <Text color="brand.textMuted" fontSize="md">
                Enter your credentials to access your account.
              </Text>
            </Box>

            <Stack spacing={5}>
              <FormControl isInvalid={!!errors.email}>
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
                  />
                </InputGroup>
                {errors.email && (
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <LockOutlined
                      style={{ color: "var(--chakra-colors-brand-secondary)" }}
                    />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    focusBorderColor="brand.primary"
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.secondary" }}
                    borderRadius="lg"
                    bg="gray.50"
                  />
                </InputGroup>
                {errors.password && (
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                )}
              </FormControl>
            </Stack>

            <Flex justify="flex-end" align="center">
              <Box
                as={Link}
                to="/forget-password"
                color="brand.primary"
                fontWeight="semibold"
                fontSize="sm"
                _hover={{
                  color: "brand.secondary",
                  textDecoration: "underline",
                }}
                transition="color 0.2s"
              >
                Forgot Password?
              </Box>
            </Flex>

            <Button
              colorScheme="brand"
              size="lg"
              w="full"
              leftIcon={<AntDesignOutlined />}
              onClick={handleLogin}
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
              Sign In
            </Button>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}

export default Login;
