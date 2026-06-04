import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getSingleAccountability } from "../../redux/userSlice";
import { message, Spin, Typography, Row, Col, Table, Divider, Card, Button } from "antd";
import { Box, Flex, HStack } from "@chakra-ui/react";
import { getAllTimes } from "../../Utils/auth";
import { PrinterOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function AccountabilityReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reportRef = useRef();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await dispatch(getSingleAccountability(id)).unwrap();
      if (res?.success) {
        setData(res.data);
      }
    } catch (err) {
      message.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spin size="large" />
      </Flex>
    );
  }

  const scores = data.teacherScores || [];

  const summaryColumns = [
    { title: "Teacher Name", dataIndex: "teacherName", key: "teacherName", fixed: "left" },
    { title: "Walkthrough (/10)", dataIndex: "classroomWalkthroughAvg", key: "cw" },
    { title: "Notebook (/10)", dataIndex: "notebookCheckingAvg", key: "nc" },
    { title: "Lesson Plan (/10)", dataIndex: "lessonPlanScore", key: "lp" },
    { title: "QP Quality (/10)", dataIndex: "qualityOfQPScore", key: "qp" },
    { title: "DA Avg (/10)", dataIndex: "daAverage", key: "da" },
    { title: "Mindspark (/10)", dataIndex: "mindspark", key: "ms" },
    { title: "Annual (/10)", dataIndex: "annualReducedTo10", key: "annual" },
    { title: "Micro Teaching (/20)", dataIndex: "microTeaching", key: "micro" },
    { 
      title: "Total (/100)", 
      dataIndex: "totalScore", 
      key: "totalScore",
      render: (t) => <Text strong color={t < 50 ? "red" : "green"}>{t}</Text>
    },
    { 
      title: "Percentage (%)", 
      dataIndex: "percentage", 
      key: "percentage",
      render: (p) => <Text strong>{p}%</Text>
    },
  ];

  return (
    <Box bg="gray.50" minH="100vh" p={8} className="report-container">
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .report-container { padding: 0 !important; background: white !important; }
            body { background: white !important; }
          }
        `}
      </style>

      <Box maxW="1200px" mx="auto" mb={4} className="no-print">
        <Flex justify="space-between" align="center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            Print / Download PDF
          </Button>
        </Flex>
      </Box>

      <Box maxW="1200px" mx="auto" bg="white" p={10} borderRadius="lg" boxShadow="sm" ref={reportRef}>
        
        {/* Header */}
        <Flex direction="column" align="center" mb={8}>
          <Title level={2} style={{ margin: 0 }}>Accountability Mechanism Report</Title>
          <Title level={4} style={{ color: "gray", marginTop: 8 }}>{data.formName}</Title>
          <Text strong style={{ marginTop: 8 }}>
            Period: {data.fromDate ? getAllTimes(data.fromDate).formattedDate2 : "N/A"} to {data.toDate ? getAllTimes(data.toDate).formattedDate2 : "N/A"}
          </Text>
        </Flex>

        <Divider />

        <Box mb={8}>
          <Title level={4}>Teacher Scores Summary</Title>
          <Table 
            columns={summaryColumns} 
            dataSource={scores} 
            rowKey="_id" 
            pagination={false} 
            bordered 
            size="small"
            style={{ marginTop: 16 }}
          />
        </Box>

        <Divider />

        <Box mb={8}>
          <Title level={4}>Additional Information & Remarks</Title>
          <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Card size="small" title="CPD (Hours)">
                <Text strong fontSize="lg">{data.cpdHours || 0}</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Field Trips">
                <Text strong fontSize="lg">{data.fieldTrips || 0}</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Excursions">
                <Text strong fontSize="lg">{data.excursions || 0}</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Outdoor Activities">
                <Text strong fontSize="lg">{data.outdoorAct || 0}</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Smilies">
                <Text strong fontSize="lg">{data.smilies || 0}</Text>
              </Card>
            </Col>
          </Row>

          <Box mt={6}>
            <Card title="Contribution / Achievement" style={{ marginBottom: 16 }}>
              <Text>{data.contributionAchievement || "N/A"}</Text>
            </Card>
            <Card title="Overall Remarks">
              <Text>{data.overallRemarks || "N/A"}</Text>
            </Card>
          </Box>
        </Box>

        <Divider />
        
        {/* Footer Signatures */}
        <Flex justify="space-between" mt={16}>
          <Box textAlign="center">
            <Divider style={{ width: 200, margin: '0 auto 8px', borderColor: 'gray' }} />
            <Text strong>{data.userId?.name || "Observer / Coordinator"}</Text>
          </Box>
          <Box textAlign="center">
            <Divider style={{ width: 200, margin: '0 auto 8px', borderColor: 'gray' }} />
            <Text strong>Principal / Head</Text>
          </Box>
        </Flex>

      </Box>
    </Box>
  );
}

export default AccountabilityReport;
