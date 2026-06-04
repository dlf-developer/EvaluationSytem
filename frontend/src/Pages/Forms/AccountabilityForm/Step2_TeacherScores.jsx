import React from "react";
import { Form, InputNumber, Collapse, Row, Col, Card, Statistic, Empty, Alert } from "antd";
import { Box } from "@chakra-ui/react";
import { BookOutlined, SignatureOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

function Step2_TeacherScores({ form, formValues }) {
  const teacherScores = formValues?.teacherScores || [];

  if (teacherScores.length === 0) {
    return (
      <Empty
        description="No teachers selected or data synced. Please go back to Step 1 and click 'Sync Teacher Data'."
        style={{ margin: "40px 0" }}
      />
    );
  }

  return (
    <Box>
      <Alert
        message="Teacher Scores"
        description="Review the auto-calculated scores from existing forms and input the manual scores for Lesson Plan and Question Paper quality."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Collapse defaultActiveKey={['0']} accordion>
        {teacherScores.map((score, index) => (
          <Panel header={`Teacher: ${score.teacherName || 'Unknown'}`} key={index.toString()}>
            
            {/* Auto-Calculated Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card size="small" bg="gray.50">
                  <Statistic
                    title="Classroom Walkthrough (Avg / 10)"
                    value={score.classroomWalkthroughAvg || 0}
                    precision={2}
                    prefix={<SignatureOutlined />}
                    suffix={`/ 10 (Forms: ${score.classroomWalkthroughCount || 0})`}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Notebook Checking (Avg / 10)"
                    value={score.notebookCheckingAvg || 0}
                    precision={2}
                    prefix={<BookOutlined />}
                    suffix={`/ 10 (Forms: ${score.notebookCheckingCount || 0})`}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Manual Inputs */}
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name={["teacherScores", index, "lessonPlanScore"]}
                  label="Lesson Plan Record (Timely sub. & Quality of TLM) [Out of 10]"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <InputNumber min={0} max={10} step={0.5} style={{ width: "100%" }} size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["teacherScores", index, "qualityOfQPScore"]}
                  label="Quality of QP and WS (Frequency, Number) [Out of 10]"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <InputNumber min={0} max={10} step={0.5} style={{ width: "100%" }} size="large" />
                </Form.Item>
              </Col>
            </Row>

            {/* Hidden fields to preserve the auto-calculated data in the form state */}
            <Form.Item name={["teacherScores", index, "teacherId"]} hidden><InputNumber /></Form.Item>
            <Form.Item name={["teacherScores", index, "teacherName"]} hidden><InputNumber /></Form.Item>
            <Form.Item name={["teacherScores", index, "classroomWalkthroughAvg"]} hidden><InputNumber /></Form.Item>
            <Form.Item name={["teacherScores", index, "classroomWalkthroughCount"]} hidden><InputNumber /></Form.Item>
            <Form.Item name={["teacherScores", index, "notebookCheckingAvg"]} hidden><InputNumber /></Form.Item>
            <Form.Item name={["teacherScores", index, "notebookCheckingCount"]} hidden><InputNumber /></Form.Item>

          </Panel>
        ))}
      </Collapse>
    </Box>
  );
}

export default Step2_TeacherScores;
