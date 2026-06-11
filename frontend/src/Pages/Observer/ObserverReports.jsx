import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import FormOneReport from "./ReportsTab/FormOneReport";
import FormTwoReport from "./ReportsTab/FormTwoReport";
import FormThreeReport from "./ReportsTab/FormThreeReport";
import FormFourReport from "./ReportsTab/FormFourReport";
import FormFiveReport from "./ReportsTab/FormFiveReport";

const ObserverReports = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { name: "Fortnightly Monitor", path: "/reports/fortnightly-monitor" },
    { name: "Classroom Walkthrough", path: "/reports/classroom-walkthrough" },
    { name: "Notebook Checking", path: "/reports/notebook-checking-proforma" },
    { name: "Co-Scholastic", path: "/reports/co-scholastic" },
    { name: "Learning Progress", path: "/reports/weekly4form" },
    
  ];

  const getStep = () => {
    if (location.pathname.includes("fortnightly-monitor")) return 0;
    if (location.pathname.includes("classroom-walkthrough")) return 1;
    if (location.pathname.includes("notebook-checking-proforma")) return 2;
    if (location.pathname.includes("co-scholastic")) return 3;
    if (location.pathname.includes("weekly4form")) return 4;
    return 0;
  };

  const currStep = getStep();
  
  const getTitle = () => {
    if (currStep === 0) return "Fortnightly Monitor Reports";
    if (currStep === 1) return "Classroom Walkthrough Reports";
    if (currStep === 2) return "Notebook Checking Reports";
    if (currStep === 3) return "Co-Scholastic Reports";
    if (currStep === 4) return "Learning Progress Checklist Reports";
    return "Observer Reports";
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Box mb={6}>
        <Heading size="lg" color="gray.800" mb={1}>
          Observer Reports Overview
        </Heading>
        <Text color="gray.500">
          Select a report type below to view detailed analytics and logs.
        </Text>
      </Box>

      {/* Tabs navigation bar */}
      <Flex
        borderBottom="1px solid"
        borderColor="gray.200"
        mb={6}
        gap={2}
        overflowX="auto"
        pb="1px"
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          'msOverflowStyle': 'none',
          'scrollbarWidth': 'none',
        }}
      >
        {tabs.map((tab, idx) => {
          const isActive = currStep === idx;
          return (
            <Box
              key={tab.path}
              onClick={() => navigate(tab.path)}
              cursor="pointer"
              py={3}
              px={5}
              position="relative"
              fontWeight="600"
              fontSize="sm"
              color={isActive ? "brand.primary" : "gray.500"}
              _hover={{ color: "brand.primary" }}
              transition="all 0.2s ease"
              whiteSpace="nowrap"
            >
              {tab.name}
              {isActive && (
                <Box
                  position="absolute"
                  bottom="0px"
                  left={0}
                  right={0}
                  h="3px"
                  bg="brand.primary"
                  borderTopRadius="full"
                />
              )}
            </Box>
          );
        })}
      </Flex>

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
        {currStep === 3 && <FormFiveReport />}
        {currStep === 4 && <FormFourReport />}
      </Box>
    </Box>
  );
};

export default ObserverReports;
