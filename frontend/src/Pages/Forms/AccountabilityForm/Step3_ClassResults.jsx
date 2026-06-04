import React from "react";
import { Form, InputNumber, Collapse, Row, Col, Divider, Empty, Typography } from "antd";
import { Box } from "@chakra-ui/react";

const { Panel } = Collapse;
const { Text } = Typography;

function Step3_ClassResults({ form, formValues }) {
  const teacherScores = formValues?.teacherScores || [];

  if (teacherScores.length === 0) {
    return (
      <Empty
        description="No teachers available. Please go back to Step 1 and sync data."
        style={{ margin: "40px 0" }}
      />
    );
  }

  // Handle auto-calculations when a user types in DA or Annual Result fields
  const handleValuesChange = (changedValues, allValues) => {
    // We only care about changes in teacherScores array
    if (changedValues.teacherScores) {
      const updatedScores = [...allValues.teacherScores];
      
      changedValues.teacherScores.forEach((changedScore, index) => {
        if (!changedScore) return; // Skip if no changes for this index

        const current = updatedScores[index] || {};

        // 1. DA Average calculation
        if (
          changedScore.daT1 !== undefined ||
          changedScore.daT2 !== undefined ||
          changedScore.daT1Low !== undefined ||
          changedScore.daT1High !== undefined
        ) {
          const sum =
            (current.daT1 || 0) +
            (current.daT2 || 0) +
            (current.daT1Low || 0) +
            (current.daT1High || 0);
          current.daAverage = parseFloat((sum / 4).toFixed(2));
        }

        // 2. Annual Reduced To 10 calculation
        if (
          changedScore.sec1 !== undefined ||
          changedScore.sec2 !== undefined ||
          changedScore.sec3 !== undefined ||
          changedScore.sec4 !== undefined ||
          changedScore.annualTotal !== undefined
        ) {
          const totalFields =
            (current.sec1 || 0) +
            (current.sec2 || 0) +
            (current.sec3 || 0) +
            (current.sec4 || 0);

          if (current.annualTotal > 0) {
            current.annualReducedTo10 = parseFloat(
              ((totalFields / current.annualTotal) * 10).toFixed(2)
            );
          } else {
            current.annualReducedTo10 = 0;
          }
        }
      });

      // Update the form with the new calculated fields
      form.setFieldsValue({ teacherScores: updatedScores });
    }
  };

  return (
    <Box>
      {/* We use an invisible Form.Provider or just rely on onValuesChange at the step level.
          Since the main form is wrapping this component, we can use Form.Item dependencies or
          just intercept changes here using a nested Form for local state, but the easiest
          is to listen to the parent form's changes. Since we don't have direct access to parent's 
          onValuesChange easily without prop drilling, we'll use Form.useWatch or just let the 
          user type and auto-calculate on the final step. Wait, it's better to show real-time.
          To do real-time without refactoring parent, we use Form.Item dependencies or shouldUpdate. */}
      
      <Collapse defaultActiveKey={['0']} accordion>
        {teacherScores.map((score, index) => (
          <Panel header={`Teacher: ${score.teacherName || 'Unknown'}`} key={index.toString()}>
            
            {/* DA Section */}
            <Divider orientation="left">1. DA Average</Divider>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name={["teacherScores", index, "daT1"]} label="T1 DA (Out of 10)">
                  <InputNumber min={0} max={10} step={0.5} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={["teacherScores", index, "daT2"]} label="T2 DA (Out of 10)">
                  <InputNumber min={0} max={10} step={0.5} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={["teacherScores", index, "daT1Low"]} label="T1 DA Low (Out of 10)">
                  <InputNumber min={0} max={10} step={0.5} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={["teacherScores", index, "daT1High"]} label="T1 DA High (Out of 10)">
                  <InputNumber min={0} max={10} step={0.5} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              shouldUpdate={(prevValues, currentValues) => {
                const prev = prevValues.teacherScores?.[index];
                const curr = currentValues.teacherScores?.[index];
                return (
                  prev?.daT1 !== curr?.daT1 ||
                  prev?.daT2 !== curr?.daT2 ||
                  prev?.daT1Low !== curr?.daT1Low ||
                  prev?.daT1High !== curr?.daT1High
                );
              }}
            >
              {({ getFieldValue }) => {
                const s = getFieldValue(["teacherScores", index]) || {};
                const daAvg = (((s.daT1 || 0) + (s.daT2 || 0) + (s.daT1Low || 0) + (s.daT1High || 0)) / 4).toFixed(2);
                // Also update the form value quietly so it saves correctly
                setTimeout(() => form.setFieldValue(["teacherScores", index, "daAverage"], parseFloat(daAvg)), 0);
                
                return (
                  <Box p={3} bg="blue.50" borderRadius="md" mb={4}>
                    <Text strong>Calculated DA Average: </Text>
                    <Text type="success" strong fontSize="16px">{daAvg}</Text>
                  </Box>
                );
              }}
            </Form.Item>

            {/* Mindspark Section */}
            <Divider orientation="left">2. Mindspark Average</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name={["teacherScores", index, "mindspark"]} 
                  label="Sparkies, Highest No. of Participants (Out of 10)"
                >
                  <InputNumber min={0} max={10} step={0.5} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            {/* Annual Result Section */}
            <Divider orientation="left">3. Annual/Half Yearly Result Mean</Divider>
            <Row gutter={16}>
              <Col span={4}>
                <Form.Item name={["teacherScores", index, "sec1"]} label="Sec 1">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name={["teacherScores", index, "sec2"]} label="Sec 2">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name={["teacherScores", index, "sec3"]} label="Sec 3">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name={["teacherScores", index, "sec4"]} label="Sec 4">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={["teacherScores", index, "annualTotal"]} label="Total (Max Marks)" rules={[{ required: true, message: "Required for calculation" }]}>
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              shouldUpdate={(prevValues, currentValues) => {
                const prev = prevValues.teacherScores?.[index];
                const curr = currentValues.teacherScores?.[index];
                return (
                  prev?.sec1 !== curr?.sec1 ||
                  prev?.sec2 !== curr?.sec2 ||
                  prev?.sec3 !== curr?.sec3 ||
                  prev?.sec4 !== curr?.sec4 ||
                  prev?.annualTotal !== curr?.annualTotal
                );
              }}
            >
              {({ getFieldValue }) => {
                const s = getFieldValue(["teacherScores", index]) || {};
                const sum = (s.sec1 || 0) + (s.sec2 || 0) + (s.sec3 || 0) + (s.sec4 || 0);
                const total = s.annualTotal || 1; // prevent divide by zero
                const reduced = s.annualTotal ? ((sum / total) * 10).toFixed(2) : "0.00";
                
                setTimeout(() => form.setFieldValue(["teacherScores", index, "annualReducedTo10"], parseFloat(reduced)), 0);

                return (
                  <Box p={3} bg="green.50" borderRadius="md" mb={4}>
                    <Text strong>Calculated Result (Reduced to 10): </Text>
                    <Text type="success" strong fontSize="16px">{reduced}</Text>
                  </Box>
                );
              }}
            </Form.Item>

            {/* Micro Teaching */}
            <Divider orientation="left">4. Micro Teaching</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name={["teacherScores", index, "microTeaching"]} 
                  label="Micro Teaching Score (Out of 20)"
                >
                  <InputNumber min={0} max={20} step={0.5} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            {/* Hidden calculated fields for Form submission */}
            <Form.Item name={["teacherScores", index, "daAverage"]} hidden><InputNumber /></Form.Item>
            <Form.Item name={["teacherScores", index, "annualReducedTo10"]} hidden><InputNumber /></Form.Item>

          </Panel>
        ))}
      </Collapse>
    </Box>
  );
}

export default Step3_ClassResults;
