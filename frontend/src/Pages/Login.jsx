import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { UserLogin } from "../redux/userSlice";
import { message } from "antd";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Heading,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
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
    <Box
      display="flex"
      w="100%"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      bg="brand.background"
    >
      <Box
        borderWidth="1px"
        py={10}
        px={8}
        borderRadius="2xl"
        w="100%"
        maxW="458px"
        bg="white"
        boxShadow="2xl"
        borderColor="brand.primary" // Vibrant Purple border
        borderTopWidth="6px"
        borderTopColor="brand.primary" // DLF Green accent top border
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" mb={4}>
            <Image
              src="/images/mainLogo.jpeg"
              alt="Main Logo"
              mx="auto"
              mb={4}
              maxH="80px"
              objectFit="contain"
            />
            <Heading as="h1" size="xl" color="brand.secondary" mb={2}>
              Teacher Proformas Portal
            </Heading>
            <Heading
              as="h2"
              size="md"
              color="brand.text"
              mb={3}
              fontWeight="medium"
            >
              User Login
            </Heading>
            <Text color="brand.textMuted" fontSize="sm">
              Enter your registered email and password
            </Text>
          </Box>

          <FormControl isInvalid={!!errors.email}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <UserOutlined
                  style={{ color: "var(--chakra-colors-brand-secondary)" }}
                />
              </InputLeftElement>
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                focusBorderColor="brand.primary"
                borderColor="gray.300"
                _hover={{ borderColor: "brand.secondary" }}
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
              />
            </InputGroup>
            {errors.password && (
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            )}
          </FormControl>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={4}
          >
            <Button
              colorScheme="brand"
              size="lg"
              leftIcon={<AntDesignOutlined />}
              onClick={handleLogin}
              px={8}
              shadow="md"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "lg",
                bg: "brand.secondary",
              }}
              transition="all 0.2s"
            >
              Login
            </Button>
            <Box
              as={Link}
              to="/forget-password"
              color="brand.primary"
              fontWeight="medium"
              _hover={{ color: "brand.secondary", textDecoration: "underline" }}
              transition="color 0.2s"
            >
              Forget Password
            </Box>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

export default Login;
