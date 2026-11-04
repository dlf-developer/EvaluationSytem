import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import FormOneReport from "../Observer/ReportsTab/FormOneReport";
import FormTwoReport from "../Observer/ReportsTab/FormTwoReport";
import FormThreeReport from "../Observer/ReportsTab/FormThreeReport";
import FormFourReport from "../Observer/ReportsTab/FormFourReport";
import FormFiveReport from "../Observer/ReportsTab/FormFiveReport";

const AdminReport = () => {
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

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Box mb={6}>
        <Heading size="lg" color="gray.800" mb={1}>
          Admin Reports & Overviews
        </Heading>
        <Text color="gray.500">
          Comprehensive school-wide evaluation reports, analytics, and verification across all forms.
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
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
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

      <Box w="100%">
        {currStep === 0 && <FormOneReport />}
        {currStep === 1 && <FormTwoReport />}
        {currStep === 2 && <FormThreeReport />}
        {currStep === 3 && <FormFiveReport />}
        {currStep === 4 && <FormFourReport />}
      </Box>
    </Box>
  );
};

export default AdminReport;
