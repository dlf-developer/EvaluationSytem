import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Text, Button, VStack, Icon } from "@chakra-ui/react";
import { LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const Unauthorized = () => {
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
        {/* Icon circle */}
        <Flex
          w="96px"
          h="96px"
          borderRadius="full"
          bg="red.50"
          align="center"
          justify="center"
          borderWidth="2px"
          borderColor="red.200"
        >
          <LockOutlined style={{ fontSize: 40, color: "#E53E3E" }} />
        </Flex>

        <Box>
          <Text
            fontSize="6xl"
            fontWeight="900"
            color="red.400"
            lineHeight="1"
            mb={2}
          >
            403
          </Text>
          <Heading size="lg" color="brand.text" mb={2}>
            Access Denied
          </Heading>
          <Text color="gray.500" fontSize="sm">
            You don't have permission to view this page. This area is restricted
            to a different role. Please log in with the correct account.
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
            onClick={() => navigate("/dashboard")}
          >
            My Dashboard
          </Button>
        </Flex>
      </VStack>
    </Flex>
  );
};

export default Unauthorized;
