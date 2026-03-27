import React from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

const AdminReport = () => {
  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Box mb={6}>
        <Heading size="lg" color="gray.800" mb={1}>
          Admin Reports
        </Heading>
        <Text color="gray.500">
          View and manage comprehensive system reports.
        </Text>
      </Box>

      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        p={10}
        textAlign="center"
      >
        <Text fontSize="lg" color="gray.500">
          Reports module is coming soon.
        </Text>
      </Box>
    </Box>
  );
};

export default AdminReport;
