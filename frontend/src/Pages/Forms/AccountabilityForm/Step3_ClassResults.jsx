import React, { useState } from "react";
import { Form, InputNumber, Collapse, Row, Col, Empty, Badge, Switch } from "antd";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";

const { Panel } = Collapse;

/* ── Elegant N/A pill toggle ───────────────────────────────────────── */
function NAPill({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px 3px 6px",
        borderRadius: 20,
        border: active ? "1.5px solid #fa8c16" : "1.5px solid #d9d9d9",
        background: active
          ? "linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)"
          : "#fafafa",
        color: active ? "#d46b08" : "#8c8c8c",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: active ? "0 0 0 3px rgba(250,140,22,0.12)" : "none",
        letterSpacing: "0.02em",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
      title={active ? "Click to re-enable this field" : "Mark as Not Applicable"}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: active ? "#fa8c16" : "#d9d9d9",
          display: "inline-block",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      />
      N/A
    </button>
  );
}

/* ── Miniature Card Wrapper for Each Field ────────────────────────── */
function FieldBox({ label, teacherIndex, fieldKey, isNA, onToggleNA, children }) {
  return (
    <div
      style={{
        borderRadius: "8px",
        border: isNA ? "1.5px dashed #ffd591" : "1px solid #e8e8e8",
        background: isNA ? "linear-gradient(135deg, #fffbe6 0%, #fff7e0 100%)" : "#ffffff",
        padding: "12px 14px",
        transition: "all 0.2s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: isNA ? "none" : "0 1px 3px rgba(0,0,0,0.02)",
      }}
    >
      <Flex justify="space-between" align="flex-start" mb={3} gap={2}>
        <Text
          fontSize="13px"
          fontWeight="600"
          color={isNA ? "#bfbfbf" : "#262626"}
          textDecoration={isNA ? "line-through" : "none"}
          lineHeight="1.3"
        >
          {label}
        </Text>
        <NAPill active={isNA} onClick={() => onToggleNA(teacherIndex, fieldKey)} />
      </Flex>
      <div style={{ opacity: isNA ? 0.45 : 1, transition: "opacity 0.2s" }}>
        {children}
      </div>
    </div>
  );
}

/* ── Section Card Wrapper ─────────────────────────────────────────── */
function SectionCard({ title, children, calculationBox }) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: "1.5px solid #e8e8e8",
        background: "#ffffff",
        padding: "16px 20px",
        marginBottom: 20,
        transition: "all 0.25s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
      }}
    >
      <Flex justify="space-between" align="flex-start" mb={4}>
        <Text
          fontWeight="700"
          fontSize="15px"
          color="#262626"
        >
          {title}
        </Text>
      </Flex>

      <div>
        {children}
      </div>

      {calculationBox && (
        <Box mt={4}>
          {calculationBox}
        </Box>
      )}
    </div>
  );
}

function Step3_ClassResults({ form, formValues }) {
  const teacherScores = formValues?.teacherScores || [];
  const [naState, setNaState] = useState({});

  const toggleNA = (teacherIndex, fieldKey) => {
    setNaState((prev) => {
      const prevTeacher = prev[teacherIndex] || {};
      const newVal = !prevTeacher[fieldKey];
      const updated = {
        ...prev,
        [teacherIndex]: { ...prevTeacher, [fieldKey]: newVal },
      };
      form.setFieldValue(["teacherScores", teacherIndex, `${fieldKey}_na`], newVal);
      
      if (newVal) {
        form.setFieldValue(["teacherScores", teacherIndex, fieldKey], undefined);
      }
      return updated;
    });
  };

  const isNA = (teacherIndex, fieldKey) => !!(naState[teacherIndex] || {})[fieldKey];
  const naCount = (teacherIndex) => Object.values(naState[teacherIndex] || {}).filter(Boolean).length;

  if (teacherScores.length === 0) {
    return (
      <Empty
        description="No teachers available. Please go back to Step 1 and sync data."
        style={{ margin: "40px 0" }}
      />
    );
  }

  return (
    <Box>
      <Collapse defaultActiveKey={['0']} accordion>
        {teacherScores.map((score, index) => {
          const count = naCount(index);
          const panelHeader = (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600 }}>{score.teacherName || "Unknown"}</span>
              {count > 0 && (
                <Badge
                  count={`${count} N/A`}
                  style={{
                    backgroundColor: "#fff7e6",
                    color: "#d46b08",
                    border: "1px solid #ffd591",
                    fontWeight: 600,
                    fontSize: 11,
                    boxShadow: "none",
                  }}
                />
              )}
            </span>
          );

          const daNA = isNA(index, "daAverage");
          const mindsparkNA = isNA(index, "mindspark");
          const annualNA = isNA(index, "annualReducedTo10");
          const microNA = isNA(index, "microTeaching");

          return (
            <Panel header={panelHeader} key={index.toString()}>
              
              {/* DA Section */}
              <SectionCard
                title="1. DA Average"
                calculationBox={
                  <Form.Item
                    shouldUpdate={(prev, curr) => {
                      const p = prev.teacherScores?.[index] || {};
                      const c = curr.teacherScores?.[index] || {};
                      return p.daT1 !== c.daT1 || p.daT2 !== c.daT2 || p.daT1Low !== c.daT1Low || p.daT1High !== c.daT1High 
                          || p.daT1_na !== c.daT1_na || p.daT2_na !== c.daT2_na || p.daT1Low_na !== c.daT1Low_na || p.daT1High_na !== c.daT1High_na;
                    }}
                    noStyle
                  >
                    {({ getFieldValue }) => {
                      const s = getFieldValue(["teacherScores", index]) || {};
                      let sum = 0;
                      let count = 0;
                      if (!s.daT1_na) { sum += (s.daT1 || 0); count++; }
                      if (!s.daT2_na) { sum += (s.daT2 || 0); count++; }
                      if (!s.daT1Low_na) { sum += (s.daT1Low || 0); count++; }
                      if (!s.daT1High_na) { sum += (s.daT1High || 0); count++; }
                      
                      const daAvg = count > 0 ? (sum / count).toFixed(2) : "0.00";
                      setTimeout(() => form.setFieldValue(["teacherScores", index, "daAverage"], parseFloat(daAvg)), 0);
                      return (
                        <Box p={3} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.400">
                          <Text fontWeight="600" color="blue.900" fontSize="sm">Calculated DA Average</Text>
                          <Text fontWeight="800" color="blue.700" fontSize="lg">{daAvg} <Text as="span" fontSize="xs" color="blue.500">/ 10</Text></Text>
                        </Box>
                      );
                    }}
                  </Form.Item>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <FieldBox label="T1 DA" teacherIndex={index} fieldKey="daT1" isNA={isNA(index, "daT1")} onToggleNA={toggleNA}>
                      <Form.Item name={["teacherScores", index, "daT1"]} rules={isNA(index, "daT1") ? [] : [{ required: true, message: "Required" }]} style={{ marginBottom: 0 }}>
                        <InputNumber min={0} max={10} step={0.5} style={{ width: "100%", background: isNA(index, "daT1") ? "#f5f5f5" : undefined }} disabled={isNA(index, "daT1")} placeholder={isNA(index, "daT1") ? "—" : "0 - 10"} />
                      </Form.Item>
                    </FieldBox>
                  </Col>
                  <Col span={6}>
                    <FieldBox label="T2 DA" teacherIndex={index} fieldKey="daT2" isNA={isNA(index, "daT2")} onToggleNA={toggleNA}>
                      <Form.Item name={["teacherScores", index, "daT2"]} rules={isNA(index, "daT2") ? [] : [{ required: true, message: "Required" }]} style={{ marginBottom: 0 }}>
                        <InputNumber min={0} max={10} step={0.5} style={{ width: "100%", background: isNA(index, "daT2") ? "#f5f5f5" : undefined }} disabled={isNA(index, "daT2")} placeholder={isNA(index, "daT2") ? "—" : "0 - 10"} />
                      </Form.Item>
                    </FieldBox>
                  </Col>
                  <Col span={6}>
                    <FieldBox label="T1 DA Low" teacherIndex={index} fieldKey="daT1Low" isNA={isNA(index, "daT1Low")} onToggleNA={toggleNA}>
                      <Form.Item name={["teacherScores", index, "daT1Low"]} rules={isNA(index, "daT1Low") ? [] : [{ required: true, message: "Required" }]} style={{ marginBottom: 0 }}>
                        <InputNumber min={0} max={10} step={0.5} style={{ width: "100%", background: isNA(index, "daT1Low") ? "#f5f5f5" : undefined }} disabled={isNA(index, "daT1Low")} placeholder={isNA(index, "daT1Low") ? "—" : "0 - 10"} />
                      </Form.Item>
                    </FieldBox>
                  </Col>
                  <Col span={6}>
                    <FieldBox label="T1 DA High" teacherIndex={index} fieldKey="daT1High" isNA={isNA(index, "daT1High")} onToggleNA={toggleNA}>
                      <Form.Item name={["teacherScores", index, "daT1High"]} rules={isNA(index, "daT1High") ? [] : [{ required: true, message: "Required" }]} style={{ marginBottom: 0 }}>
                        <InputNumber min={0} max={10} step={0.5} style={{ width: "100%", background: isNA(index, "daT1High") ? "#f5f5f5" : undefined }} disabled={isNA(index, "daT1High")} placeholder={isNA(index, "daT1High") ? "—" : "0 - 10"} />
                      </Form.Item>
                    </FieldBox>
                  </Col>
                </Row>
              </SectionCard>

              <SectionCard title="2. Mindspark / Digital Tools">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <FieldBox label="Sparkies, Highest No. of Participants (Out of 10)" teacherIndex={index} fieldKey="mindspark" isNA={isNA(index, "mindspark")} onToggleNA={toggleNA}>
                      <Form.Item name={["teacherScores", index, "mindspark"]} rules={isNA(index, "mindspark") ? [] : [{ required: true, message: "Required" }]} style={{ marginBottom: 0 }}>
                        <InputNumber min={0} max={10} step={0.5} size="large" style={{ width: "100%", background: isNA(index, "mindspark") ? "#f5f5f5" : undefined }} disabled={isNA(index, "mindspark")} placeholder={isNA(index, "mindspark") ? "—" : "0 - 10"} />
                      </Form.Item>
                    </FieldBox>
                  </Col>
                </Row>
              </SectionCard>

              {/* Annual Result Section */}
              <SectionCard
                title="3. Annual/Half Yearly Result Mean"
                calculationBox={
                  <Form.Item
                    shouldUpdate={(prev, curr) => {
                      const p = prev.teacherScores?.[index] || {};
                      const c = curr.teacherScores?.[index] || {};
                      return p.sec1 !== c.sec1 || p.sec2 !== c.sec2 || p.sec3 !== c.sec3 || p.sec4 !== c.sec4 || p.annualTotal !== c.annualTotal 
                          || p.sec1_na !== c.sec1_na || p.sec2_na !== c.sec2_na || p.sec3_na !== c.sec3_na || p.sec4_na !== c.sec4_na || p.annualTotal_na !== c.annualTotal_na;
                    }}
                    noStyle
                  >
                    {({ getFieldValue }) => {
                      const s = getFieldValue(["teacherScores", index]) || {};
                      let sum = 0;
                      if (!s.sec1_na) sum += (s.sec1 || 0);
                      if (!s.sec2_na) sum += (s.sec2 || 0);
                      if (!s.sec3_na) sum += (s.sec3 || 0);
                      if (!s.sec4_na) sum += (s.sec4 || 0);

                      const total = s.annualTotal || 1; 
                      const reduced = (!s.annualTotal_na && s.annualTotal) ? ((sum / total) * 10).toFixed(2) : "0.00";
                      setTimeout(() => form.setFieldValue(["teacherScores", index, "annualReducedTo10"], parseFloat(reduced)), 0);
                      return (
                        <Box p={3} bg="green.50" borderRadius="md" borderLeft="4px solid" borderColor="green.400">
                          <Text fontWeight="600" color="green.900" fontSize="sm">Calculated Result (Reduced to 10)</Text>
                          <Text fontWeight="800" color="green.700" fontSize="lg">{reduced} <Text as="span" fontSize="xs" color="green.500">/ 10</Text></Text>
                        </Box>
                      );
                    }}
                  </Form.Item>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col span={4}>
                    <FieldBox label="Sec 1" teacherIndex={index} fieldKey="sec1" isNA={isNA(index, "sec1")} onToggleNA={toggleNA}>
                      <Form.Item name={["teacherScores", index, "sec1"]} style={{ marginBottom: 0 }}>
                        <InputNumber min={0} style={{ width: "100%", background: isNA(index, "sec1") ? "#f5f5f5" : undefined }} disabled={isNA(index, "sec1")} placeholder={isNA(index, "sec1") ? "—" : "Score"} />
                      </Form.Item>
                    </FieldBox>
                  </Col>
                  <Col span={4}>
                    <FieldBox label="Sec 2" teacherIndex={index} fieldKey="sec2" isNA={isNA(index, "sec2")} onToggleNA={toggleNA}>
                      <Form.Item name={["teacherScores", index, "sec2"]} style={{ marginBottom: 0 }}>
                        <InputNumber min={0} style={{ width: "100%", background: isNA(index, "sec2") ? "#f5f5f5" : undefined }} disabled={isNA(index, "sec2")} placeholder={isNA(index, "sec2") ? "—" : "Score"} />
                      </Form.Item>
                    </FieldBox>
                  </Col>
                  <Col span={4}>
                    <FieldBox label="Sec 3" teacherIndex={index} fieldKey="sec3" isNA={isNA(index, "sec3")} onToggleNA={toggleNA}>
                      <Form.Item name={["teacherScores", index, "sec3"]} style={{ marginBottom: 0 }}>
                        <InputNumber min={0} style={{ width: "100%", background: isNA(index, "sec3") ? "#f5f5f5" : undefined }} disabled={isNA(index, "sec3")} placeholder={isNA(index, "sec3") ? "—" : "Score"} />
                      </Form.Item>
                    </FieldBox>
                  </Col>
                  <Col span={4}>
                    <FieldBox label="Sec 4" teacherIndex={index} fieldKey="sec4" isNA={isNA(index, "sec4")} onToggleNA={toggleNA}>
                      <Form.Item name={["teacherScores", index, "sec4"]} style={{ marginBottom: 0 }}>
                        <InputNumber min={0} style={{ width: "100%", background: isNA(index, "sec4") ? "#f5f5f5" : undefined }} disabled={isNA(index, "sec4")} placeholder={isNA(index, "sec4") ? "—" : "Score"} />
                      </Form.Item>
                    </FieldBox>
                  </Col>
                  <Col span={8}>
                    <FieldBox label="Total (Max Marks)" teacherIndex={index} fieldKey="annualTotal" isNA={isNA(index, "annualTotal")} onToggleNA={toggleNA}>
                      <Form.Item name={["teacherScores", index, "annualTotal"]} rules={isNA(index, "annualTotal") ? [] : [{ required: true, message: "Required" }]} style={{ marginBottom: 0 }}>
                        <InputNumber min={1} style={{ width: "100%", background: isNA(index, "annualTotal") ? "#f5f5f5" : undefined }} disabled={isNA(index, "annualTotal")} placeholder={isNA(index, "annualTotal") ? "—" : "Max Marks"} />
                      </Form.Item>
                    </FieldBox>
                  </Col>
                </Row>
              </SectionCard>

              {/* Micro Teaching */}
              <SectionCard title="4. Micro Teaching">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <FieldBox label="Micro Teaching Score (Out of 20)" teacherIndex={index} fieldKey="microTeaching" isNA={isNA(index, "microTeaching")} onToggleNA={toggleNA}>
                      <Form.Item name={["teacherScores", index, "microTeaching"]} rules={isNA(index, "microTeaching") ? [] : [{ required: true, message: "Required" }]} style={{ marginBottom: 0 }}>
                        <InputNumber min={0} max={20} step={0.5} size="large" style={{ width: "100%", background: isNA(index, "microTeaching") ? "#f5f5f5" : undefined }} disabled={isNA(index, "microTeaching")} placeholder={isNA(index, "microTeaching") ? "—" : "0 - 20"} />
                      </Form.Item>
                    </FieldBox>
                  </Col>
                </Row>
              </SectionCard>

              {/* Hidden flags and fields */}
              <Form.Item name={["teacherScores", index, "daAverage_na"]} hidden noStyle><InputNumber /></Form.Item>
              <Form.Item name={["teacherScores", index, "mindspark_na"]} hidden noStyle><InputNumber /></Form.Item>
              <Form.Item name={["teacherScores", index, "annualReducedTo10_na"]} hidden noStyle><InputNumber /></Form.Item>
              <Form.Item name={["teacherScores", index, "microTeaching_na"]} hidden noStyle><InputNumber /></Form.Item>
              <Form.Item name={["teacherScores", index, "daAverage"]} hidden noStyle><InputNumber /></Form.Item>
              <Form.Item name={["teacherScores", index, "annualReducedTo10"]} hidden noStyle><InputNumber /></Form.Item>

            </Panel>
          );
        })}
      </Collapse>
    </Box>
  );
}

export default Step3_ClassResults;
