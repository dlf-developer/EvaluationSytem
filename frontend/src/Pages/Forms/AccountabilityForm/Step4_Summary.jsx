import React from "react";
import { Form, Input, Row, Col, Table, Divider, Typography, Tag, Alert } from "antd";
import { Box } from "@chakra-ui/react";

const { TextArea } = Input;
const { Title, Text } = Typography;

const MANUAL_FIELDS = [
  { key: "lessonPlanScore",   max: 10 },
  { key: "qualityOfQPScore",  max: 10 },
  { key: "daAverage",         max: 10 },
  { key: "mindspark",         max: 10 },
  { key: "annualReducedTo10", max: 10 },
  { key: "microTeaching",     max: 20 },
];

/** Compute a teacher's total skipping N/A fields. */
function computeTeacherTotal(s) {
  let total = (s.classroomWalkthroughAvg || 0) + (s.notebookCheckingAvg || 0);
  let maxMarks = 10 + 10; 

  if (!s.lessonPlanScore_na) { total += s.lessonPlanScore || 0; maxMarks += 10; }
  if (!s.qualityOfQPScore_na) { total += s.qualityOfQPScore || 0; maxMarks += 10; }
  
  const daNA = s.daT1_na && s.daT2_na && s.daT1Low_na && s.daT1High_na;
  if (!daNA) { total += s.daAverage || 0; maxMarks += 10; }

  if (!s.mindspark_na) { total += s.mindspark || 0; maxMarks += 10; }

  const annualNA = s.sec1_na && s.sec2_na && s.sec3_na && s.sec4_na;
  if (!annualNA) { total += s.annualReducedTo10 || 0; maxMarks += 10; }

  if (!s.microTeaching_na) { total += s.microTeaching || 0; maxMarks += 20; }

  const pct = maxMarks > 0 ? ((total / maxMarks) * 100).toFixed(2) : "0.00";
  return { total: parseFloat(total.toFixed(2)), maxMarks, pct, daNA, annualNA };
}

function Step4_Summary({ form, formValues }) {
  return (
    <Box>
      <Title level={4} style={{ marginBottom: 24 }}>Summary & Text Details</Title>

      <Form.Item
        shouldUpdate={(prev, cur) => prev.teacherScores !== cur.teacherScores}
      >
        {({ getFieldValue, setFieldsValue }) => {
          const scores = getFieldValue("teacherScores") || [];

          const hasAnyNA = scores.some((s) => {
            const daNA = s.daT1_na && s.daT2_na && s.daT1Low_na && s.daT1High_na;
            const annualNA = s.sec1_na && s.sec2_na && s.sec3_na && s.sec4_na;
            return s.lessonPlanScore_na || s.qualityOfQPScore_na || daNA || s.mindspark_na || annualNA || s.microTeaching_na;
          });

          const dataSource = scores.map((s, index) => {
            const { total, maxMarks, pct, daNA, annualNA } = computeTeacherTotal(s);

            // Persist computed values for saving
            setTimeout(() => {
              setFieldsValue({
                [`teacherScores[${index}].totalScore`]: total,
                [`teacherScores[${index}].percentage`]: parseFloat(pct),
                [`teacherScores[${index}].maxMarks`]: maxMarks,
              });
            }, 0);

            const naCell = (val, isNA) =>
              isNA ? (
                <Tag color="default" style={{ color: "#999" }}>N/A</Tag>
              ) : (
                val ?? 0
              );

            return {
              key: index,
              name: s.teacherName,
              walk: (s.classroomWalkthroughAvg || 0).toFixed(2),
              note: (s.notebookCheckingAvg || 0).toFixed(2),
              lesson: naCell(s.lessonPlanScore, s.lessonPlanScore_na),
              qp: naCell(s.qualityOfQPScore, s.qualityOfQPScore_na),
              da: naCell(s.daAverage, daNA),
              spark: naCell(s.mindspark, s.mindspark_na),
              annual: naCell(s.annualReducedTo10, annualNA),
              micro: naCell(s.microTeaching, s.microTeaching_na),
              total,
              maxMarks,
              pct: pct + "%",
            };
          });

          const columns = [
            { title: "Teacher", dataIndex: "name", key: "name", width: 120 },
            { title: <div style={{textAlign: "center", lineHeight: "1.2"}}>Walk-<br/>through<br/><span style={{fontSize: "10px", color: "gray"}}>(/10)</span></div>, dataIndex: "walk", key: "walk", align: "center" },
            { title: <div style={{textAlign: "center", lineHeight: "1.2"}}>Note-<br/>book<br/><span style={{fontSize: "10px", color: "gray"}}>(/10)</span></div>, dataIndex: "note", key: "note", align: "center" },
            { title: <div style={{textAlign: "center", lineHeight: "1.2"}}>Lesson<br/>Plan<br/><span style={{fontSize: "10px", color: "gray"}}>(/10)</span></div>, dataIndex: "lesson", key: "lesson", align: "center" },
            { title: <div style={{textAlign: "center", lineHeight: "1.2"}}>QP<br/><span style={{fontSize: "10px", color: "gray"}}>(/10)</span></div>, dataIndex: "qp", key: "qp", align: "center" },
            { title: <div style={{textAlign: "center", lineHeight: "1.2"}}>DA<br/><span style={{fontSize: "10px", color: "gray"}}>(/10)</span></div>, dataIndex: "da", key: "da", align: "center" },
            { title: <div style={{textAlign: "center", lineHeight: "1.2"}}>Mind-<br/>spark<br/><span style={{fontSize: "10px", color: "gray"}}>(/10)</span></div>, dataIndex: "spark", key: "spark", align: "center" },
            { title: <div style={{textAlign: "center", lineHeight: "1.2"}}>Annual<br/><span style={{fontSize: "10px", color: "gray"}}>(/10)</span></div>, dataIndex: "annual", key: "annual", align: "center" },
            { title: <div style={{textAlign: "center", lineHeight: "1.2"}}>Micro<br/><span style={{fontSize: "10px", color: "gray"}}>(/20)</span></div>, dataIndex: "micro", key: "micro", align: "center" },
            {
              title: "Total",
              key: "total",
              align: "center",
              render: (_, row) => (
                <Text strong style={{ color: row.total / row.maxMarks < 0.5 ? "red" : "green" }}>
                  {row.total} / {row.maxMarks}
                </Text>
              ),
            },
            {
              title: "Percentage",
              dataIndex: "pct",
              key: "pct",
              align: "center",
              render: (p) => <Text strong>{p}</Text>,
            },
          ];

          return (
            <Box mb={8}>
              {hasAnyNA && (
                <Alert
                  type="warning"
                  showIcon
                  message="Some fields are marked N/A and are excluded from the total and max marks calculation."
                  style={{ marginBottom: 16 }}
                />
              )}
              <Box overflowX="auto" className="hide-scrollbar">
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  pagination={false}
                  bordered
                  size="small"
                  scroll={{ x: 'max-content' }}
                />
              </Box>
            </Box>
          );
        }}
      </Form.Item>

      <Divider orientation="left">Additional Activities & Remarks</Divider>

      <Row gutter={24}>
        <Col span={8}>
          <Form.Item name="cpdHours" label="CPD (No. of Hours)">
            <Input size="large" placeholder="e.g. 12" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="fieldTrips" label="No. of Field Trips">
            <Input size="large" placeholder="e.g. 3" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="excursions" label="Excursions (Number)">
            <Input size="large" placeholder="e.g. 2" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="outdoorAct" label="Outdoor Act (Number)">
            <Input size="large" placeholder="e.g. 5" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="smilies" label="Smilies (Number)">
            <Input size="large" placeholder="e.g. 10" />
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
