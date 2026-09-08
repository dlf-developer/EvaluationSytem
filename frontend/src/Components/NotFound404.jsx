import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getToken } from "../Utils/auth";

const NotFound404 = () => {
  const navigate = useNavigate();

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="brand.background"
      px={4}
    >
      <VStack spacing={6} textAlign="center" maxW="420px">
        {/* Big 404 */}
        <Text
          fontSize="9xl"
          fontWeight="900"
          color="brand.primary"
          lineHeight="1"
          opacity={0.15}
          userSelect="none"
        >
          404
        </Text>

        <Box mt="-60px">
          <Heading size="lg" color="brand.text" mb={2}>
            Page Not Found
          </Heading>
          <Text color="gray.500" fontSize="sm">
            The page you're looking for doesn't exist or may have been moved.
          </Text>
        </Box>

        <Flex gap={3} flexWrap="wrap" justify="center">
          <Button
            leftIcon={<ArrowLeftOutlined />}
            variant="ghost"
            color="gray.500"
            _hover={{ bg: "gray.100" }}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.secondary" }}
            onClick={() => {
              const token = getToken();
              navigate(token ? "/dashboard" : "/login");
            }}
          >
            {getToken() ? "Dashboard" : "Log In"}
          </Button>
        </Flex>
      </VStack>
    </Flex>
  );
};

export default NotFound404;