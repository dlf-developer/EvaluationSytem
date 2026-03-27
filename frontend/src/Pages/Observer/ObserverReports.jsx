import React, { useState } from "react";
import { FileText, UserCircle, BookOpen, ClipboardCheck } from "lucide-react";
import { Box, Flex, Heading, Text, SimpleGrid } from "@chakra-ui/react";
import FormOneReport from "./ReportsTab/FormOneReport";
import FormTwoReport from "./ReportsTab/FormTwoReport";
import FormThreeReport from "./ReportsTab/FormThreeReport";
import FormFourReport from "./ReportsTab/FormFourReport";

const ObserverReports = () => {
  const [currStep, setCurrStep] = useState(0);

  const reportTypes = [
    {
      title: "Fortnightly Monitor",
      icon: <FileText size={20} />,
      colorScheme: "green",
    },
    {
      title: "Classroom Walkthrough",
      icon: <UserCircle size={20} />,
      colorScheme: "orange",
    },
    {
      title: "Notebook Checking",
      icon: <BookOpen size={20} />,
      colorScheme: "blue",
    },
    {
      title: "Weekly Learning Checklist",
      icon: <ClipboardCheck size={20} />,
      colorScheme: "purple",
    },
  ];

  const handleChange = (step) => {
    setCurrStep(step);
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Box mb={6}>
        <Heading size="lg" color="gray.800" mb={1}>
          Observer Reports
        </Heading>
        <Text color="gray.500">
          Select a report type to view detailed analytics and logs.
        </Text>
      </Box>

      {/* Report Type Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={8}>
        {reportTypes.map((report, index) => {
          const isActive = currStep === index;
          return (
            <Flex
              key={index}
              onClick={() => handleChange(index)}
              align="center"
              p={4}
              borderRadius="xl"
              cursor="pointer"
              transition="all 0.2s"
              bg={isActive ? "brand.background" : "white"}
              borderWidth="2px"
              borderColor={isActive ? "brand.primary" : "gray.200"}
              boxShadow={isActive ? "md" : "sm"}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md",
                borderColor: isActive ? "brand.primary" : "brand.mid",
              }}
            >
              <Flex
                align="center"
                justify="center"
                w={10}
                h={10}
                borderRadius="lg"
                bg={isActive ? "brand.primary" : "gray.50"}
                color={isActive ? "white" : "gray.500"}
                mr={4}
              >
                {report.icon}
              </Flex>
              <Text
                fontWeight={isActive ? "600" : "500"}
                color={isActive ? "brand.text" : "gray.700"}
                fontSize="md"
              >
                {report.title}
              </Text>
            </Flex>
          );
        })}
      </SimpleGrid>

      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        p={6}
        w="100%"
        overflowX="auto"
      >
        {currStep === 0 && <FormOneReport />}
        {currStep === 1 && <FormTwoReport />}
        {currStep === 2 && <FormThreeReport />}
        {currStep === 3 && <FormFourReport />}
      </Box>
    </Box>
  );
};

export default ObserverReports;
