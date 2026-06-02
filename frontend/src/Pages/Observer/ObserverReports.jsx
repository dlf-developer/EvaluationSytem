import React from "react";
import { useLocation } from "react-router-dom";
import { Box, Heading, Text } from "@chakra-ui/react";
import FormOneReport from "./ReportsTab/FormOneReport";
import FormTwoReport from "./ReportsTab/FormTwoReport";
import FormThreeReport from "./ReportsTab/FormThreeReport";
import FormFourReport from "./ReportsTab/FormFourReport";
import FormFiveReport from "./ReportsTab/FormFiveReport";

const ObserverReports = () => {
  const location = useLocation();

  const getStep = () => {
    if (location.pathname.includes("fortnightly-monitor")) return 0;
    if (location.pathname.includes("classroom-walkthrough")) return 1;
    if (location.pathname.includes("notebook-checking-proforma")) return 2;
    if (location.pathname.includes("weekly4form")) return 3;
    if (location.pathname.includes("co-scholastic")) return 4;
    return 0;
  };

  const currStep = getStep();
  
  const getTitle = () => {
    if (currStep === 0) return "Fortnightly Monitor Reports";
    if (currStep === 1) return "Classroom Walkthrough Reports";
    if (currStep === 2) return "Notebook Checking Reports";
    if (location.pathname.includes("weekly4form")) return "Learning Progress Checklist Reports";
    if (location.pathname.includes("co-scholastic")) return "Co-Scholastic Reports";
    return "Observer Reports";
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Box mb={6}>
        <Heading size="lg" color="gray.800" mb={1}>
          {getTitle()}
        </Heading>
        <Text color="gray.500">
          View detailed analytics and logs for this report type.
        </Text>
      </Box>

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
        {currStep === 4 && <FormFiveReport />}
      </Box>
    </Box>
  );
};

export default ObserverReports;
