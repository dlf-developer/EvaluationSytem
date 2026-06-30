import React, { useState } from "react";
import { Form, InputNumber, Collapse, Row, Col, Empty, Badge, Switch, Select } from "antd";
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

function Step3_ClassResults({ form, formValues, id }) {
  const teacherScores = formValues?.teacherScores || [];
  const [naState, setNaState] = useState(() => {
    const initialNa = {};
    const scores = form.getFieldValue("teacherScores") || [];
    scores.forEach((score, index) => {
      initialNa[index] = {
        daSec1: !!score.daSec1_na,
        daSec2: !!score.daSec2_na,
        msSec1: !!score.msSec1_na,
        msSec2: !!score.msSec2_na,
        sec1: !!score.sec1_na,
        sec2: !!score.sec2_na,
        sec3: !!score.sec3_na,
        sec4: !!score.sec4_na,
        annualTotal: !!score.annualTotal_na,
        microTeaching: !!score.microTeaching_na,
      };
    });
    return initialNa;
  });

  const toggleNA = (teacherIndex, fieldKey) => {
    setNaState((prev) => {
      const prevTeacher = prev[teacherIndex] || {};
      const newVal = !prevTeacher[fieldKey];
      const updated = {
        ...prev,
        [teacherIndex]: { ...prevTeacher, [fieldKey]: newVal },
      };
      form.setFieldValue(["teacherScores", teacherIndex, `${fieldKey}_na`], newVal);
      
      // Update overarching N/A flags for calculations
      const isDaSec1NA = fieldKey === "daSec1" ? newVal : !!prevTeacher.daSec1;
      const isDaSec2NA = fieldKey === "daSec2" ? newVal : !!prevTeacher.daSec2;
      const isDaNA = isDaSec1NA && isDaSec2NA;
      form.setFieldValue(["teacherScores", teacherIndex, "daAverage_na"], isDaNA);

      const isMsSec1NA = fieldKey === "msSec1" ? newVal : !!prevTeacher.msSec1;
      const isMsSec2NA = fieldKey === "msSec2" ? newVal : !!prevTeacher.msSec2;
      const isMsNA = isMsSec1NA && isMsSec2NA;
      form.setFieldValue(["teacherScores", teacherIndex, "mindspark_na"], isMsNA);

      if (newVal) {
        if (fieldKey === "daSec1") {
          form.setFieldValue(["teacherScores", teacherIndex, "daSec1"], undefined);
          form.setFieldValue(["teacherScores", teacherIndex, "daSec1High"], undefined);
          form.setFieldValue(["teacherScores", teacherIndex, "daSec1Low"], undefined);
        } else if (fieldKey === "daSec2") {
          form.setFieldValue(["teacherScores", teacherIndex, "daSec2"], undefined);
          form.setFieldValue(["teacherScores", teacherIndex, "daSec2High"], undefined);
          form.setFieldValue(["teacherScores", teacherIndex, "daSec2Low"], undefined);
        } else if (fieldKey === "msSec1") {
          form.setFieldValue(["teacherScores", teacherIndex, "msSec1Active"], undefined);
          form.setFieldValue(["teacherScores", teacherIndex, "msSec1Total"], undefined);
          form.setFieldValue(["teacherScores", teacherIndex, "msSec1Accuracy"], undefined);
        } else if (fieldKey === "msSec2") {
          form.setFieldValue(["teacherScores", teacherIndex, "msSec2Active"], undefined);
          form.setFieldValue(["teacherScores", teacherIndex, "msSec2Total"], undefined);
          form.setFieldValue(["teacherScores", teacherIndex, "msSec2Accuracy"], undefined);
        } else {
          form.setFieldValue(["teacherScores", teacherIndex, fieldKey], undefined);
        }
      }

      // Save current form values to local storage
      if (id) {
        const currentFormValues = form.getFieldsValue(true);
        localStorage.setItem(`accountability_form_${id}`, JSON.stringify(currentFormValues));
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
                      return p.daSec1 !== c.daSec1 || p.daSec2 !== c.daSec2
                          || p.daSec1_na !== c.daSec1_na || p.daSec2_na !== c.daSec2_na;
                    }}
                    noStyle
                  >
                    {({ getFieldValue }) => {
                      const s = getFieldValue(["teacherScores", index]) || {};
                      let sum = 0;
                      let count = 0;
                      if (!s.daSec1_na && s.daSec1 !== undefined) { sum += s.daSec1; count++; }
                      if (!s.daSec2_na && s.daSec2 !== undefined) { sum += s.daSec2; count++; }
                      
                      const daAvg = count > 0 ? ((sum / count) * 2).toFixed(2) : "0.00";
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
                <Row gutter={[32, 16]}>
                  {/* Section 1 */}
                  <Col xs={24} md={12} style={{ borderRight: "1px solid #e8e8e8" }}>
                    <Box position="relative" pr={{ md: 4 }}>
                      <Flex justify="space-between" align="center" mb={4}>
                        <Text fontWeight="700" fontSize="14px" color="#1a202c">Section 1</Text>
                        <NAPill active={isNA(index, "daSec1")} onClick={() => toggleNA(index, "daSec1")} />
                      </Flex>
                      <Box opacity={isNA(index, "daSec1") ? 0.45 : 1} pointerEvents={isNA(index, "daSec1") ? "none" : "auto"}>
                        <Form.Item
                          label={<Text fontWeight="600" fontSize="13px">DA</Text>}
                          name={["teacherScores", index, "daSec1"]}
                          rules={isNA(index, "daSec1") ? [] : [{ required: true, message: "Required" }]}
                        >
                          <Select placeholder="Select DA" style={{ width: "100%" }}>
                            {[1, 2, 3, 4, 5].map(v => (
                              <Select.Option key={v} value={v}>{v}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label={<Text fontWeight="600" fontSize="13px">High (across all sections)</Text>}
                          name={["teacherScores", index, "daSec1High"]}
                          rules={isNA(index, "daSec1") ? [] : [{ required: true, message: "Required" }]}
                        >
                          <InputNumber min={0} max={10} step={0.1} placeholder="High score" style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                          label={<Text fontWeight="600" fontSize="13px">Low (across all sections)</Text>}
                          name={["teacherScores", index, "daSec1Low"]}
                          rules={isNA(index, "daSec1") ? [] : [{ required: true, message: "Required" }]}
                        >
                          <InputNumber min={0} max={10} step={0.1} placeholder="Low score" style={{ width: "100%" }} />
                        </Form.Item>
                      </Box>
                    </Box>
                  </Col>

                  {/* Section 2 */}
                  <Col xs={24} md={12}>
                    <Box position="relative" pl={{ md: 4 }}>
                      <Flex justify="space-between" align="center" mb={4}>
                        <Text fontWeight="700" fontSize="14px" color="#1a202c">Section 2</Text>
                        <NAPill active={isNA(index, "daSec2")} onClick={() => toggleNA(index, "daSec2")} />
                      </Flex>
                      <Box opacity={isNA(index, "daSec2") ? 0.45 : 1} pointerEvents={isNA(index, "daSec2") ? "none" : "auto"}>
                        <Form.Item
                          label={<Text fontWeight="600" fontSize="13px">DA</Text>}
                          name={["teacherScores", index, "daSec2"]}
                          rules={isNA(index, "daSec2") ? [] : [{ required: true, message: "Required" }]}
                        >
                          <Select placeholder="Select DA" style={{ width: "100%" }}>
                            {[1, 2, 3, 4, 5].map(v => (
                              <Select.Option key={v} value={v}>{v}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label={<Text fontWeight="600" fontSize="13px">High (across all sections)</Text>}
                          name={["teacherScores", index, "daSec2High"]}
                          rules={isNA(index, "daSec2") ? [] : [{ required: true, message: "Required" }]}
                        >
                          <InputNumber min={0} max={10} step={0.1} placeholder="High score" style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                          label={<Text fontWeight="600" fontSize="13px">Low (across all sections)</Text>}
                          name={["teacherScores", index, "daSec2Low"]}
                          rules={isNA(index, "daSec2") ? [] : [{ required: true, message: "Required" }]}
                        >
                          <InputNumber min={0} max={10} step={0.1} placeholder="Low score" style={{ width: "100%" }} />
                        </Form.Item>
                      </Box>
                    </Box>
                  </Col>
                </Row>
              </SectionCard>

              <SectionCard 
                title="2. Mindspark / Digital Tools"
                calculationBox={
                  <Form.Item
                    shouldUpdate={(prev, curr) => {
                      const p = prev.teacherScores?.[index] || {};
                      const c = curr.teacherScores?.[index] || {};
                      return p.msSec1Active !== c.msSec1Active || p.msSec1Total !== c.msSec1Total || p.msSec1Accuracy !== c.msSec1Accuracy
                          || p.msSec2Active !== c.msSec2Active || p.msSec2Total !== c.msSec2Total || p.msSec2Accuracy !== c.msSec2Accuracy
                          || p.msSec1_na !== c.msSec1_na || p.msSec2_na !== c.msSec2_na;
                    }}
                    noStyle
                  >
                    {({ getFieldValue }) => {
                      const s = getFieldValue(["teacherScores", index]) || {};
                      let sumScores = 0;
                      let activeCount = 0;
                      
                      if (!s.msSec1_na) {
                        const total1 = s.msSec1Total || 0;
                        const active1 = s.msSec1Active || 0;
                        const part1 = total1 > 0 ? (active1 / total1) * 100 : 0;
                        const acc1 = s.msSec1Accuracy || 0;
                        const score1 = (part1 + acc1) / 20; // out of 10
                        sumScores += score1;
                        activeCount++;
                      }
                      
                      if (!s.msSec2_na) {
                        const total2 = s.msSec2Total || 0;
                        const active2 = s.msSec2Active || 0;
                        const part2 = total2 > 0 ? (active2 / total2) * 100 : 0;
                        const acc2 = s.msSec2Accuracy || 0;
                        const score2 = (part2 + acc2) / 20; // out of 10
                        sumScores += score2;
                        activeCount++;
                      }
                      
                      const msAvg = activeCount > 0 ? (sumScores / activeCount).toFixed(2) : "0.00";
                      setTimeout(() => form.setFieldValue(["teacherScores", index, "mindspark"], parseFloat(msAvg)), 0);
                      return (
                        <Box p={3} bg="orange.50" borderRadius="md" borderLeft="4px solid" borderColor="orange.400">
                          <Text fontWeight="600" color="orange.900" fontSize="sm">Calculated Mindspark Average</Text>
                          <Text fontWeight="800" color="orange.700" fontSize="lg">{msAvg} <Text as="span" fontSize="xs" color="orange.500">/ 10</Text></Text>
                        </Box>
                      );
                    }}
                  </Form.Item>
                }
              >
                <Row gutter={[32, 16]}>
                  {/* Section 1 */}
                  <Col xs={24} md={12} style={{ borderRight: "1px solid #e8e8e8" }}>
                    <Box position="relative" pr={{ md: 4 }}>
                      <Flex justify="space-between" align="center" mb={4}>
                        <Text fontWeight="700" fontSize="14px" color="#1a202c">Section 1</Text>
                        <NAPill active={isNA(index, "msSec1")} onClick={() => toggleNA(index, "msSec1")} />
                      </Flex>
                      <Box opacity={isNA(index, "msSec1") ? 0.45 : 1} pointerEvents={isNA(index, "msSec1") ? "none" : "auto"}>
                        <Flex align="center" gap={2} mb={4}>
                          <Box flex={1}>
                            <Form.Item
                              label={<Text fontWeight="600" fontSize="13px">No. of Active Students</Text>}
                              name={["teacherScores", index, "msSec1Active"]}
                              rules={isNA(index, "msSec1") ? [] : [{ required: true, message: "Required" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber min={0} placeholder="Active" style={{ width: "100%" }} />
                            </Form.Item>
                          </Box>
                          <Text mt={5} fontWeight="bold" color="gray.400" fontSize="16px">/</Text>
                          <Box flex={1}>
                            <Form.Item
                              label={<Text fontWeight="600" fontSize="13px">Total No. of Students</Text>}
                              name={["teacherScores", index, "msSec1Total"]}
                              rules={isNA(index, "msSec1") ? [] : [{ required: true, message: "Required" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber min={1} placeholder="Total" style={{ width: "100%" }} />
                            </Form.Item>
                          </Box>
                          <Text mt={5} fontWeight="bold" color="gray.400" fontSize="16px">=</Text>
                          <Box w="80px" mt={5}>
                            <Form.Item
                              shouldUpdate={(prev, curr) => {
                                const p = prev.teacherScores?.[index] || {};
                                const c = curr.teacherScores?.[index] || {};
                                return p.msSec1Active !== c.msSec1Active || p.msSec1Total !== c.msSec1Total;
                              }}
                              noStyle
                            >
                              {({ getFieldValue }) => {
                                const active = getFieldValue(["teacherScores", index, "msSec1Active"]) || 0;
                                const total = getFieldValue(["teacherScores", index, "msSec1Total"]) || 0;
                                const percent = total > 0 ? ((active / total) * 100).toFixed(0) : "0";
                                return (
                                  <Box px={2} py={2} bg="gray.50" border="1px solid #d9d9d9" borderRadius="6px" textAlign="center" fontWeight="600" fontSize="13px">
                                    {percent}%
                                  </Box>
                                );
                              }}
                            </Form.Item>
                          </Box>
                        </Flex>
                        <Form.Item
                          label={<Text fontWeight="600" fontSize="13px">Accuracy %</Text>}
                          name={["teacherScores", index, "msSec1Accuracy"]}
                          rules={isNA(index, "msSec1") ? [] : [{ required: true, message: "Required" }]}
                        >
                          <InputNumber min={0} max={100} placeholder="Accuracy %" style={{ width: "100%" }} />
                        </Form.Item>
                      </Box>
                    </Box>
                  </Col>

                  {/* Section 2 */}
                  <Col xs={24} md={12}>
                    <Box position="relative" pl={{ md: 4 }}>
                      <Flex justify="space-between" align="center" mb={4}>
                        <Text fontWeight="700" fontSize="14px" color="#1a202c">Section 2</Text>
                        <NAPill active={isNA(index, "msSec2")} onClick={() => toggleNA(index, "msSec2")} />
                      </Flex>
                      <Box opacity={isNA(index, "msSec2") ? 0.45 : 1} pointerEvents={isNA(index, "msSec2") ? "none" : "auto"}>
                        <Flex align="center" gap={2} mb={4}>
                          <Box flex={1}>
                            <Form.Item
                              label={<Text fontWeight="600" fontSize="13px">No. of Active Students</Text>}
                              name={["teacherScores", index, "msSec2Active"]}
                              rules={isNA(index, "msSec2") ? [] : [{ required: true, message: "Required" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber min={0} placeholder="Active" style={{ width: "100%" }} />
                            </Form.Item>
                          </Box>
                          <Text mt={5} fontWeight="bold" color="gray.400" fontSize="16px">/</Text>
                          <Box flex={1}>
                            <Form.Item
                              label={<Text fontWeight="600" fontSize="13px">Total No. of Students</Text>}
                              name={["teacherScores", index, "msSec2Total"]}
                              rules={isNA(index, "msSec2") ? [] : [{ required: true, message: "Required" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber min={1} placeholder="Total" style={{ width: "100%" }} />
                            </Form.Item>
                          </Box>
                          <Text mt={5} fontWeight="bold" color="gray.400" fontSize="16px">=</Text>
                          <Box w="80px" mt={5}>
                            <Form.Item
                              shouldUpdate={(prev, curr) => {
                                const p = prev.teacherScores?.[index] || {};
                                const c = curr.teacherScores?.[index] || {};
                                return p.msSec2Active !== c.msSec2Active || p.msSec2Total !== c.msSec2Total;
                              }}
                              noStyle
                            >
                              {({ getFieldValue }) => {
                                const active = getFieldValue(["teacherScores", index, "msSec2Active"]) || 0;
                                const total = getFieldValue(["teacherScores", index, "msSec2Total"]) || 0;
                                const percent = total > 0 ? ((active / total) * 100).toFixed(0) : "0";
                                return (
                                  <Box px={2} py={2} bg="gray.50" border="1px solid #d9d9d9" borderRadius="6px" textAlign="center" fontWeight="600" fontSize="13px">
                                    {percent}%
                                  </Box>
                                );
                              }}
                            </Form.Item>
                          </Box>
                        </Flex>
                        <Form.Item
                          label={<Text fontWeight="600" fontSize="13px">Accuracy %</Text>}
                          name={["teacherScores", index, "msSec2Accuracy"]}
                          rules={isNA(index, "msSec2") ? [] : [{ required: true, message: "Required" }]}
                        >
                          <InputNumber min={0} max={100} placeholder="Accuracy %" style={{ width: "100%" }} />
                        </Form.Item>
                      </Box>
                    </Box>
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
