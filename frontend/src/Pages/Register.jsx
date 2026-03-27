import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  FormControl,
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
  MailOutlined,
} from "@ant-design/icons";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    // Placeholder registration logic for later functionality integration
    console.log("Registering with:", name, email, password);
  };

  return (
    <Flex
      minH="100vh"
      direction={{ base: "column", md: "row-reverse" }}
      bg="brand.background"
    >
      {/* Right Side: Branding / Visual (Reversed for distinction from login) */}
      <Flex
        flex={1}
        bgGradient="linear(to-bl, brand.secondary, brand.primary)"
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
          right="-10%"
          w="400px"
          h="400px"
          bg="whiteAlpha.200"
          borderRadius="full"
          filter="blur(50px)"
        />
        <Box
          position="absolute"
          bottom="-10%"
          left="-10%"
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
            Join the Teacher Portal
          </Heading>
          <Text fontSize="lg" opacity={0.9}>
            Create your account to start evaluating and managing academic
            progress effortlessly.
          </Text>
        </VStack>
      </Flex>

      {/* Left Side: Form */}
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
                Create Account
              </Heading>
              <Text color="brand.textMuted" fontSize="md">
                Enter your details to register as a new user.
              </Text>
            </Box>

            <Stack spacing={4}>
              <FormControl>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <UserOutlined
                      style={{ color: "var(--chakra-colors-brand-secondary)" }}
                    />
                  </InputLeftElement>
                  <Input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    focusBorderColor="brand.primary"
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.secondary" }}
                    borderRadius="lg"
                    bg="gray.50"
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <MailOutlined
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
              </FormControl>

              <FormControl>
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
              </FormControl>
            </Stack>

            <Button
              colorScheme="brand"
              size="lg"
              w="full"
              leftIcon={<AntDesignOutlined />}
              onClick={handleRegister}
              py={7}
              mt={4}
              fontSize="md"
              fontWeight="bold"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "xl",
                bg: "brand.primary",
              }}
              _active={{
                transform: "translateY(0)",
                boxShadow: "md",
              }}
              transition="all 0.3s"
            >
              Register
            </Button>

            <Flex justify="center" align="center" mt={2}>
              <Text color="brand.textMuted" mr={2}>
                Already have an account?
              </Text>
              <Box
                as={Link}
                to="/login"
                color="brand.secondary"
                fontWeight="bold"
                _hover={{ color: "brand.primary", textDecoration: "underline" }}
                transition="color 0.2s"
              >
                Log in
              </Box>
            </Flex>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}

export default Register;
