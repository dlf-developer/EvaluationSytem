import React, { useEffect, useState } from "react";
import ReactPDF, { PDFViewer } from "@react-pdf/renderer";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getSingleAccountability } from "../../redux/userSlice";
import { Spin } from "antd";
import { DownloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import {
  Box, Flex, Heading, Text, Image, HStack,
  SimpleGrid, Button, Divider, Table as ChakraTable, Thead, Tbody, Tr, Th, Td
} from "@chakra-ui/react";
import Logo from "./Imgs/Logo.png";
import LogoBanner from "./Imgs/image.png";
import AccountabilityDoc from "./Documents/AccountabilityDoc";
import { getAllTimes } from "../../Utils/auth";

// ── inline components ─────────────────────────────────────────────────────────
const MetaCard = ({ label, value }) => (
  <Box>
    <Text fontSize="11px" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb="2px">{label}</Text>
    <Text fontSize="sm" fontWeight="600" color="brand.text">{value || "—"}</Text>
  </Box>
);

const SectionHeading = ({ children }) => (
  <Flex align="center" justify="space-between" mb={3} mt={6}>
    <Heading size="sm" color="brand.text">{children}</Heading>
  </Flex>
);

// ── Main Report Page ──────────────────────────────────────────────────────────
function AccountabilityReport() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await dispatch(getSingleAccountability(id));
      if (res?.payload?.success) setData(res.payload.data);
      setLoading(false);
    };
    load();
  }, [dispatch, id]);

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = await ReactPDF.pdf(<AccountabilityDoc data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Accountability-Report-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const fmt = (d) => getAllTimes(d)?.formattedDate2 ?? "—";
  const dateRange = data?.fromDate && data?.toDate ? `${fmt(data.fromDate)} – ${fmt(data.toDate)}` : "—";

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)" bg="brand.background">
      <Box maxW="1200px" mx="auto">

        {/* Header */}
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <HStack spacing={3}>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeftOutlined />}
              color="gray.500"
              _hover={{ color: "brand.text", bg: "white" }}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Box>
              <Heading size="lg" color="brand.text">Accountability Mechanism</Heading>
              <Text color="gray.500" fontSize="sm">{data?.formName || "Report"} · {dateRange}</Text>
            </Box>
          </HStack>
          <Button
            leftIcon={<DownloadOutlined />}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.secondary" }}
            onClick={downloadPDF}
            isLoading={downloading}
            loadingText="Generating PDF…"
            size="md"
            isDisabled={loading || !data}
          >
            Download PDF
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" h="400px">
            <Spin size="large" />
          </Flex>
        ) : !data ? (
          <Box textAlign="center" py={20}><Text color="gray.400">Report not found.</Text></Box>
        ) : (
          <>
            {/* Logo banner */}
            <Flex justify="center" align="center" gap={6} bg="white" p={5} borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100" mb={6}>
              <Image src={Logo} h="70px" w="auto" alt="Logo" />
              <Image src={LogoBanner} h="50px" w="auto" alt="Banner" />
            </Flex>

            {/* Meta info */}
            <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" borderWidth="1px" borderColor="gray.100" mb={6}>
              <Text fontWeight="700" color="brand.text" mb={3}>Report Details</Text>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <MetaCard label="Report Name" value={data.formName} />
                <MetaCard label="Date Range" value={dateRange} />
                <MetaCard label="Observer" value={data.userId?.name} />
                <MetaCard label="Status" value={data.isComplete ? "Completed" : "Draft"} />
              </SimpleGrid>
            </Box>

            {/* Quick Summary View (Non-PDF) */}
            <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" borderWidth="1px" borderColor="gray.100" mb={6} overflowX="auto">
              <SectionHeading>Teacher Scores Summary</SectionHeading>
              <ChakraTable variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Teacher</Th>
                    <Th isNumeric>CW</Th>
                    <Th isNumeric>NB</Th>
                    <Th isNumeric>LP</Th>
                    <Th isNumeric>QP</Th>
                    <Th isNumeric>DA</Th>
                    <Th isNumeric>MS</Th>
                    <Th isNumeric>Annual</Th>
                    <Th isNumeric>Micro</Th>
                    <Th isNumeric>Total</Th>
                    <Th isNumeric>Percent</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.teacherScores?.map((ts, idx) => (
                    <Tr key={idx}>
                      <Td fontWeight="500">{ts.teacherName}</Td>
                      <Td isNumeric>{ts.classroomWalkthroughAvg || 0}</Td>
                      <Td isNumeric>{ts.notebookCheckingAvg || 0}</Td>
                      <Td isNumeric>{ts.lessonPlanScore || 0}</Td>
                      <Td isNumeric>{ts.qualityOfQPScore || 0}</Td>
                      <Td isNumeric>{ts.daAverage || 0}</Td>
                      <Td isNumeric>{ts.mindspark || 0}</Td>
                      <Td isNumeric>{ts.annualReducedTo10 || 0}</Td>
                      <Td isNumeric>{ts.microTeaching || 0}</Td>
                      <Td isNumeric fontWeight="bold" color={ts.totalScore < 50 ? "red.500" : "green.500"}>{ts.totalScore || 0}</Td>
                      <Td isNumeric fontWeight="bold">{ts.percentage || 0}%</Td>
                    </Tr>
                  ))}
                  {(!data.teacherScores || data.teacherScores.length === 0) && (
                    <Tr><Td colSpan={11} textAlign="center" color="gray.500">No teacher scores</Td></Tr>
                  )}
                </Tbody>
              </ChakraTable>
            </Box>

            {/* PDF Preview */}
            <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" borderWidth="1px" borderColor="gray.100">
              <Flex align="center" justify="space-between" mb={4}>
                <Heading size="md" color="brand.text">Live PDF Preview</Heading>
                <Text fontSize="xs" color="gray.400">Scroll to see all pages</Text>
              </Flex>
              <Box borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor="gray.200">
                {data && (
                  <PDFViewer key={id} style={{ width: "100%", height: "800px", border: "none" }}>
                    <AccountabilityDoc data={data} />
                  </PDFViewer>
                )}
              </Box>
            </Box>

          </>
        )}
      </Box>
    </Box>
  );
}

export default AccountabilityReport;
