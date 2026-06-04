import React from "react";
import { Form, Input, InputNumber, Row, Col, Table, Divider, Typography } from "antd";
import { Box } from "@chakra-ui/react";

const { TextArea } = Input;
const { Title, Text } = Typography;

function Step4_Summary({ form, formValues }) {
  // We use shouldUpdate to re-render the table when scores change
  return (
    <Box>
      <Title level={4} style={{ marginBottom: 24 }}>Summary & Text Details</Title>

      <Form.Item
        shouldUpdate={(prevValues, currentValues) => prevValues.teacherScores !== currentValues.teacherScores}
      >
        {({ getFieldValue, setFieldsValue }) => {
          const scores = getFieldValue("teacherScores") || [];

          // Compute totals dynamically for display
          const dataSource = scores.map((s, index) => {
            const total = 
              (s.classroomWalkthroughAvg || 0) +
              (s.notebookCheckingAvg || 0) +
              (s.lessonPlanScore || 0) +
              (s.qualityOfQPScore || 0) +
              (s.daAverage || 0) +
              (s.mindspark || 0) +
              (s.annualReducedTo10 || 0) +
              (s.microTeaching || 0);
            
            const pct = ((total / 100) * 100).toFixed(2);

            // Update hidden fields in form for saving
            setTimeout(() => {
              setFieldsValue({
                [`teacherScores[${index}].totalScore`]: parseFloat(total.toFixed(2)),
                [`teacherScores[${index}].percentage`]: parseFloat(pct),
                [`teacherScores[${index}].maxMarks`]: 100,
              });
            }, 0);

            return {
              key: index,
              name: s.teacherName,
              walk: s.classroomWalkthroughAvg || 0,
              note: s.notebookCheckingAvg || 0,
              lesson: s.lessonPlanScore || 0,
              qp: s.qualityOfQPScore || 0,
              da: s.daAverage || 0,
              spark: s.mindspark || 0,
              annual: s.annualReducedTo10 || 0,
              micro: s.microTeaching || 0,
              total: total.toFixed(2),
              pct: pct + "%",
            };
          });

          const columns = [
            { title: "Teacher", dataIndex: "name", key: "name", fixed: "left", width: 150 },
            { title: "Walkthrough (/10)", dataIndex: "walk", key: "walk" },
            { title: "Notebook (/10)", dataIndex: "note", key: "note" },
            { title: "Lesson Plan (/10)", dataIndex: "lesson", key: "lesson" },
            { title: "QP (/10)", dataIndex: "qp", key: "qp" },
            { title: "DA (/10)", dataIndex: "da", key: "da" },
            { title: "Mindspark (/10)", dataIndex: "spark", key: "spark" },
            { title: "Annual (/10)", dataIndex: "annual", key: "annual" },
            { title: "Micro (/20)", dataIndex: "micro", key: "micro" },
            { 
              title: "Total (/100)", 
              dataIndex: "total", 
              key: "total",
              fixed: "right",
              render: (t) => <Text strong color={t < 50 ? "red" : "green"}>{t}</Text> 
            },
            { 
              title: "Percentage", 
              dataIndex: "pct", 
              key: "pct",
              fixed: "right",
              render: (p) => <Text strong>{p}</Text>
            },
          ];

          return (
            <Box mb={8} overflowX="auto">
              <Table 
                dataSource={dataSource} 
                columns={columns} 
                pagination={false} 
                bordered 
                size="small"
                scroll={{ x: 1200 }}
              />
            </Box>
          );
        }}
      </Form.Item>

      <Divider orientation="left">Additional Activities & Remarks</Divider>

      <Row gutter={24}>
        <Col span={8}>
          <Form.Item name="cpdHours" label="CPD (No. of Hours)">
            <InputNumber min={0} style={{ width: "100%" }} size="large" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="fieldTrips" label="No. of Field Trips">
            <InputNumber min={0} style={{ width: "100%" }} size="large" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="excursions" label="Excursions (Number)">
            <InputNumber min={0} style={{ width: "100%" }} size="large" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="outdoorAct" label="Outdoor Act (Number)">
            <InputNumber min={0} style={{ width: "100%" }} size="large" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="smilies" label="Smilies (Number)">
            <InputNumber min={0} style={{ width: "100%" }} size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Form.Item name="contributionAchievement" label="Contribution / Achievement">
            <TextArea rows={4} placeholder="Enter any specific contributions or achievements..." />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="overallRemarks" label="Overall Remarks">
            <TextArea rows={4} placeholder="Enter final remarks for this period..." />
          </Form.Item>
        </Col>
      </Row>

    </Box>
  );
}

export default Step4_Summary;
