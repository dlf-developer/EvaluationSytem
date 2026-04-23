import React, { useEffect, useState } from "react";
import ReactPDF, { PDFViewer } from "@react-pdf/renderer";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { GetSingleWingFrom } from "../../redux/userSlice";
import { Spin, Tag, Table } from "antd";
import { DownloadOutlined, ArrowLeftOutlined, CalendarOutlined, FileTextOutlined } from "@ant-design/icons";
import {
  Box, Flex, Heading, Text, Image, VStack, HStack,
  Badge, Divider, SimpleGrid, Button, Tabs, TabList,
  Tab, TabPanels, TabPanel, Stat, StatLabel, StatNumber,
} from "@chakra-ui/react";
import Logo from "./Imgs/Logo.png";
import LogoBanner from "./Imgs/image.png";
import WingCoordinatorDoc from "./Documents/WingCoordinatorDoc";
import { getAllTimes } from "../../Utils/auth";

// ── score helpers ─────────────────────────────────────────────────────────────
const form1Score = (form) => {
  if (!form) return { score: 0, total: 0 };
  const keys = Object.keys(form).filter(k => !["totalScore","OutOf","ObservationDates"].includes(k));
  const vals = keys.map(k => form[k]);
  const score = vals.reduce((s, v) => s + (v === "Yes" ? 1 : v === "Sometimes" ? 0.5 : 0), 0);
  const total = vals.filter(v => ["Yes","No","Sometimes","N/A"].includes(v)).length;
  return { score, total };
};

const f2SectionScore = (items = []) => {
  let score = 0, total = 0;
  items.forEach(i => {
    if (["1","2","3","4"].includes(i.answer)) { score += parseInt(i.answer); total += 4; }
    else if (i.answer !== "N/A") total += 4;
  });
  return { score, total };
};

// ── badge util ────────────────────────────────────────────────────────────────
const answerColor = (v) =>
  v === "Yes" ? "green" : v === "No" ? "red" : v === "Sometimes" ? "orange" : v === "N/A" ? "gray" : "default";

// ── inline components ─────────────────────────────────────────────────────────
const MetaCard = ({ label, value }) => (
  <Box>
    <Text fontSize="11px" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb="2px">{label}</Text>
    <Text fontSize="sm" fontWeight="600" color="brand.text">{value || "—"}</Text>
  </Box>
);

const SectionHeading = ({ children, count, colorScheme = "green" }) => (
  <Flex align="center" justify="space-between" mb={3} mt={6}>
    <Heading size="sm" color="brand.text">{children}</Heading>
    {count !== undefined && (
      <Badge colorScheme={colorScheme} borderRadius="full" px={3} fontSize="xs">{count} records</Badge>
    )}
  </Flex>
);

// ── Form 1 card ──────────────────────────────────────────────────────────────
const Form1Card = ({ item, index }) => {
  const tScore = form1Score(item.teacherForm);
  const oScore = form1Score(item.observerForm);
  const keys = item.teacherForm
    ? Object.keys(item.teacherForm).filter(k => !["totalScore","OutOf","ObservationDates"].includes(k))
    : [];

  const columns = [
    {
      title: "Question",
      dataIndex: "key",
      key: "q",
      width: "55%",
      render: (k) => <Text fontSize="sm">{k.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())}</Text>,
    },
    {
      title: "Teacher",
      key: "teacher",
      width: "22.5%",
      render: (_, r) => <Tag color={answerColor(item.teacherForm?.[r.key])}>{item.teacherForm?.[r.key] ?? "—"}</Tag>,
    },
    {
      title: "Observer",
      key: "observer",
      width: "22.5%",
      render: (_, r) => <Tag color={answerColor(item.observerForm?.[r.key])}>{item.observerForm?.[r.key] ?? "—"}</Tag>,
    },
  ];

  return (
    <Box bg="white" borderRadius="xl" borderWidth="1px" borderColor="gray.100" boxShadow="sm" overflow="hidden" mb={4}>
      <Box bg="brand.background" px={5} py={3} borderBottomWidth="1px" borderBottomColor="gray.100">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <Box>
            <Text fontWeight="700" color="brand.text" fontSize="sm">Record {index + 1}</Text>
            <Text fontSize="xs" color="gray.500">
              {item.className} / {item.section} · {getAllTimes(item.date)?.formattedDate2}
            </Text>
          </Box>
          <HStack spacing={4}>
            <Box textAlign="center">
              <Text fontSize="xs" color="gray.500">Teacher</Text>
              <Text fontWeight="700" color="brand.primary" fontSize="sm">{tScore.score} / {tScore.total}</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="xs" color="gray.500">Observer</Text>
              <Text fontWeight="700" color="brand.primary" fontSize="sm">{oScore.score} / {oScore.total}</Text>
            </Box>
          </HStack>
        </Flex>
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mt={3}>
          <MetaCard label="Teacher" value={item.teacherID?.name} />
          <MetaCard label="Observer" value={item.userId?.name} />
          <MetaCard label="Submitted" value={getAllTimes(item.ObserverSubmissionDate)?.formattedDate2} />
        </SimpleGrid>
      </Box>
      <Box overflowX="auto">
        <Table
          size="small"
          pagination={false}
          dataSource={keys.map(k => ({ key: k }))}
          columns={columns}
          rowKey="key"
        />
      </Box>
    </Box>
  );
};

// ── Form 2 card ──────────────────────────────────────────────────────────────
const F2_SECTIONS = [
  { key: "essentialAggrements",   label: "Essential Agreements" },
  { key: "planingAndPreparation", label: "Planning & Preparation" },
  { key: "classRoomEnvironment",  label: "Classroom Environment" },
  { key: "instruction",           label: "Instruction" },
];

const Form2Card = ({ item, index }) => (
  <Box bg="white" borderRadius="xl" borderWidth="1px" borderColor="gray.100" boxShadow="sm" overflow="hidden" mb={4}>
    <Box bg="brand.background" px={5} py={3} borderBottomWidth="1px" borderBottomColor="gray.100">
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
        <Box>
          <Text fontWeight="700" color="brand.text" fontSize="sm">Record {index + 1}</Text>
          <Text fontSize="xs" color="gray.500">
            {item.grenralDetails?.className} / {item.grenralDetails?.Section} · {getAllTimes(item.grenralDetails?.DateOfObservation)?.formattedDate2}
          </Text>
        </Box>
        <HStack spacing={3}>
          <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">Grade {item.Grade}</Badge>
          <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">{item.percentageScore}%</Badge>
          <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">{item.totalScores}/{item.scoreOutof}</Badge>
        </HStack>
      </Flex>
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mt={3}>
        <MetaCard label="Teacher" value={item.grenralDetails?.NameoftheVisitingTeacher?.name} />
        <MetaCard label="Observer" value={item.createdBy?.name} />
        <MetaCard label="Subject" value={item.grenralDetails?.Subject} />
        <MetaCard label="Topic" value={item.grenralDetails?.Topic} />
      </SimpleGrid>
    </Box>

    <Box p={5}>
      {F2_SECTIONS.map(({ key, label }) => {
        const items = item[key] || [];
        const { score, total } = f2SectionScore(items);
        return (
          <Box key={key} mb={5}>
            <Flex align="center" justify="space-between" mb={2}>
              <Text fontWeight="600" fontSize="sm" color="brand.primary">{label}</Text>
              <Badge colorScheme="green" borderRadius="full" px={2}>{score}/{total}</Badge>
            </Flex>
            <Table
              size="small"
              pagination={false}
              dataSource={items}
              rowKey={(r, i) => i}
              columns={[
                { title: "Question", dataIndex: "question", key: "q", render: t => <Text fontSize="xs">{t}</Text> },
                { title: "Score", dataIndex: "answer", key: "a", width: 80, render: v => <Tag color={v === "N/A" ? "default" : "blue"}>{v}</Tag> },
              ]}
            />
          </Box>
        );
      })}

      {/* Feedback */}
      {item.ObserverFeedback?.length > 0 && (
        <Box mt={4}>
          <Text fontWeight="600" fontSize="sm" color="brand.text" mb={2}>Observer Feedback</Text>
          <VStack spacing={2} align="stretch">
            {item.ObserverFeedback.map((f, i) => (
              <Box key={i} bg="gray.50" p={3} borderRadius="lg">
                <Text fontSize="xs" color="gray.500" mb={1}>{f.question}</Text>
                <Text fontSize="sm">{f.answer}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
      {item.TeacherFeedback?.length > 0 && (
        <Box mt={4}>
          <Text fontWeight="600" fontSize="sm" color="brand.text" mb={2}>Teacher Feedback</Text>
          <VStack spacing={2} align="stretch">
            {item.TeacherFeedback.map((f, i) => (
              <Box key={i} bg="blue.50" p={3} borderRadius="lg">
                <Text fontSize="xs" color="gray.500" mb={1}>{f.question}</Text>
                <Text fontSize="sm">{f.answer}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  </Box>
);

// ── Main Report Page ──────────────────────────────────────────────────────────
function WingCoordinatorReport() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await dispatch(GetSingleWingFrom(id));
      if (res?.payload?.success) setData(res.payload.data);
      setLoading(false);
    };
    load();
  }, [dispatch, id]);

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = await ReactPDF.pdf(<WingCoordinatorDoc data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Wing-Coordinator-Report-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const fmt = (d) => getAllTimes(d)?.formattedDate2 ?? "—";
  const dateRange = data?.range?.length === 2 ? `${fmt(data.range[0])} – ${fmt(data.range[1])}` : "—";
  const classes = Array.isArray(data?.className) ? data.className.join(", ") : data?.className ?? "—";

  const FORM_TABS = [
    { key: "form1", label: "Fortnightly Monitor",       color: "green"  },
    { key: "form2", label: "Classroom Walkthrough",     color: "blue"   },
    { key: "form3", label: "Notebook Checking",         color: "purple" },
    { key: "form4", label: "Learning Progress",         color: "orange" },
  ];

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
              onClick={() => navigate("/wing-coordinator")}
            >
              Back
            </Button>
            <Box>
              <Heading size="lg" color="brand.text">Wing Coordinator Report</Heading>
              <Text color="gray.500" fontSize="sm">{dateRange} · {classes}</Text>
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

            {/* Summary stats */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
              {FORM_TABS.map(({ key, label, color }) => (
                <Box key={key} bg="white" borderRadius="xl" p={4} boxShadow="sm" borderWidth="1px" borderColor="gray.100" textAlign="center">
                  <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
                  <Text fontSize="2xl" fontWeight="800" color={`${color}.500`}>{data[key]?.length ?? 0}</Text>
                  <Text fontSize="xs" color="gray.400">records</Text>
                </Box>
              ))}
            </SimpleGrid>

            {/* Meta info */}
            <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" borderWidth="1px" borderColor="gray.100" mb={6}>
              <Text fontWeight="700" color="brand.text" mb={3}>Report Details</Text>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <MetaCard label="Date Range" value={dateRange} />
                <MetaCard label="Classes" value={classes} />
                <MetaCard label="Created" value={fmt(data.createdAt)} />
                <MetaCard label="Status" value={data.isComplete ? "Completed" : "Draft"} />
              </SimpleGrid>
            </Box>

            {/* Monthly Report */}
            {data.monthlyReport?.length > 0 && (
              <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" borderWidth="1px" borderColor="gray.100" mb={6}>
                <SectionHeading>Monthly Report</SectionHeading>
                <VStack spacing={3} align="stretch">
                  {data.monthlyReport.map((item, i) => (
                    <Box key={i} bg="brand.background" p={4} borderRadius="lg" borderWidth="1px" borderColor="gray.100">
                      <Text fontSize="xs" color="gray.500" mb={1}>{item.question}</Text>
                      <Text fontSize="sm" color="brand.text" mb={item.remarks ? 2 : 0}>{item.answer || <Text as="span" color="gray.400" fontStyle="italic">No answer provided</Text>}</Text>
                      {item.remarks && (
                        <Text fontSize="xs" color="gray.600" bg="white" p={3} borderRadius="md" borderWidth="1px" borderColor="gray.200">
                          <Text as="span" fontWeight="700" color="brand.primary" mr={2}>Remarks:</Text>{item.remarks}
                        </Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Form tabs */}
            <Box bg="white" borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden" mb={6}>
              <Tabs variant="line" colorScheme="green">
                <TabList px={4} pt={3} borderBottomWidth="1px" borderBottomColor="gray.100">
                  {FORM_TABS.map(({ key, label, color }) => (
                    <Tab key={key} fontSize="sm" fontWeight="500" _selected={{ color: "brand.primary", borderBottomColor: "brand.primary" }}>
                      {label}
                      <Badge ml={2} colorScheme={color} borderRadius="full" fontSize="10px">{data[key]?.length ?? 0}</Badge>
                    </Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {/* Form 1 */}
                  <TabPanel p={4}>
                    {data.form1?.length === 0 ? (
                      <Box textAlign="center" py={10}><Text color="gray.400" fontSize="sm">No Fortnightly Monitor forms linked.</Text></Box>
                    ) : (
                      data.form1.map((item, i) => <Form1Card key={item._id} item={item} index={i} />)
                    )}
                  </TabPanel>

                  {/* Form 2 */}
                  <TabPanel p={4}>
                    {data.form2?.length === 0 ? (
                      <Box textAlign="center" py={10}><Text color="gray.400" fontSize="sm">No Classroom Walkthrough forms linked.</Text></Box>
                    ) : (
                      data.form2.map((item, i) => <Form2Card key={item._id} item={item} index={i} />)
                    )}
                  </TabPanel>

                  {/* Form 3 */}
                  <TabPanel p={4}>
                    {data.form3?.length === 0 ? (
                      <Box textAlign="center" py={10}><Text color="gray.400" fontSize="sm">No Notebook Checking Proforma forms linked.</Text></Box>
                    ) : (
                      <Table
                        dataSource={data.form3}
                        rowKey="_id"
                        size="small"
                        pagination={false}
                        columns={[
                          { title: "Teacher", dataIndex: ["teacherID","name"], key: "t", render: v => v || "—" },
                          { title: "Class", dataIndex: ["grenralDetails","className"], key: "c" },
                          { title: "Section", dataIndex: ["grenralDetails","Section"], key: "s" },
                          { title: "Date", dataIndex: "createdAt", key: "d", render: d => fmt(d) },
                        ]}
                      />
                    )}
                  </TabPanel>

                  {/* Form 4 */}
                  <TabPanel p={4}>
                    {data.form4?.length === 0 ? (
                      <Box textAlign="center" py={10}><Text color="gray.400" fontSize="sm">No Learning Progress Checklist forms linked.</Text></Box>
                    ) : (
                      <Table
                        dataSource={data.form4}
                        rowKey="_id"
                        size="small"
                        pagination={false}
                        columns={[
                          { title: "Teacher", dataIndex: ["teacherId","name"], key: "t", render: (v, r) => v || r.userId?.name || "—" },
                          { title: "Date", dataIndex: "createdAt", key: "d", render: d => fmt(d) },
                        ]}
                      />
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>

            {/* PDF Preview */}
            <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" borderWidth="1px" borderColor="gray.100">
              <Flex align="center" justify="space-between" mb={4}>
                <Heading size="md" color="brand.text">PDF Preview</Heading>
                <Text fontSize="xs" color="gray.400">Scroll to see all pages</Text>
              </Flex>
              <Box borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor="gray.200">
                <PDFViewer style={{ width: "100%", height: "800px", border: "none" }}>
                  <WingCoordinatorDoc data={data} />
                </PDFViewer>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default WingCoordinatorReport;
