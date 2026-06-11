import React, { useState } from "react";
import { Form, InputNumber, Collapse, Row, Col, Card, Statistic, Empty, Alert, Badge } from "antd";
import { Box } from "@chakra-ui/react";
import { BookOutlined, SignatureOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const MANUAL_FIELDS = [
  { key: "lessonPlanScore",   label: "Lesson Plan Record",          sub: "Timely submission & Quality of TLM", max: 10 },
  { key: "qualityOfQPScore",  label: "Quality of QP and WS",        sub: "Frequency & Number",                 max: 10 },
];

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
      {/* Dot indicator */}
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

/* ── Single score field card ───────────────────────────────────────── */
function ScoreFieldCard({ field, teacherIndex, form, isNA, onToggleNA }) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: isNA ? "1.5px dashed #ffd591" : "1.5px solid #e8e8e8",
        background: isNA
          ? "linear-gradient(135deg, #fffbe6 0%, #fff7e0 100%)"
          : "#ffffff",
        padding: "14px 16px",
        transition: "all 0.25s ease",
        boxShadow: isNA ? "none" : "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Card header: label + N/A pill */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 10,
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: isNA ? "#bfbfbf" : "#262626",
              transition: "color 0.2s",
              lineHeight: 1.3,
              textDecoration: isNA ? "line-through" : "none",
            }}
          >
            {field.label}
            <span
              style={{
                marginLeft: 6,
                fontWeight: 400,
                fontSize: 11,
                color: isNA ? "#d9d9d9" : "#8c8c8c",
                background: isNA ? "transparent" : "#f5f5f5",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              /{field.max}
            </span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: isNA ? "#d9d9d9" : "#8c8c8c",
              marginTop: 2,
              transition: "color 0.2s",
            }}
          >
            {field.sub}
          </div>
        </div>
        <NAPill active={isNA} onClick={() => onToggleNA(teacherIndex, field.key)} />
      </div>

      {/* Input row */}
      <Form.Item
        name={["teacherScores", teacherIndex, field.key]}
        rules={isNA ? [] : [{ required: true, message: "Required" }]}
        style={{ marginBottom: 0 }}
      >
        <InputNumber
          min={0}
          max={field.max}
          step={0.5}
          size="large"
          disabled={isNA}
          placeholder={isNA ? "— not applicable —" : `0 – ${field.max}`}
          style={{
            width: "100%",
            borderRadius: 8,
            opacity: isNA ? 0.45 : 1,
            transition: "opacity 0.25s ease",
            background: isNA ? "#f5f5f5" : undefined,
          }}
        />
      </Form.Item>

      {/* Hidden NA flag */}
      <Form.Item
        name={["teacherScores", teacherIndex, `${field.key}_na`]}
        hidden
        noStyle
      >
        <InputNumber />
      </Form.Item>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
function Step2_TeacherScores({ form, formValues, id }) {
  const teacherScores = formValues?.teacherScores || [];
  const [naState, setNaState] = useState(() => {
    const initialNa = {};
    const scores = form.getFieldValue("teacherScores") || [];
    scores.forEach((score, index) => {
      initialNa[index] = {
        lessonPlanScore: !!score.lessonPlanScore_na,
        qualityOfQPScore: !!score.qualityOfQPScore_na,
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
      if (newVal) {
        form.setFieldValue(["teacherScores", teacherIndex, fieldKey], undefined);
      }
      
      // Save current form values to local storage
      if (id) {
        const currentFormValues = form.getFieldsValue(true);
        localStorage.setItem(`accountability_form_${id}`, JSON.stringify(currentFormValues));
      }

      return updated;
    });
  };

  const isNA = (teacherIndex, fieldKey) =>
    !!(naState[teacherIndex] || {})[fieldKey];

  const naCount = (teacherIndex) =>
    Object.values(naState[teacherIndex] || {}).filter(Boolean).length;

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
        message="Teacher Score Entry"
        description={
          <span>
            Auto-calculated scores are shown as statistics. Enter manual scores below.{" "}
            <strong>Toggle N/A</strong> on any field to exclude it from the total calculation — useful when a criterion doesn't apply to a particular teacher.
          </span>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24, borderRadius: 10 }}
      />

      <Collapse defaultActiveKey={["0"]} accordion>
        {teacherScores.map((score, index) => {
          const count = naCount(index);

          const panelHeader = (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600 }}>
                {score.teacherName || "Unknown"}
              </span>
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

          return (
            <Panel header={panelHeader} key={index.toString()}>

              {/* Auto-Calculated Statistics */}
              <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={12}>
                  <Card
                    size="small"
                    style={{ borderRadius: 10, border: "1px solid #e8e8e8" }}
                  >
                    <Statistic
                      title="Classroom Walkthrough (Avg)"
                      value={score.classroomWalkthroughAvg || 0}
                      precision={2}
                      prefix={<SignatureOutlined />}
                      suffix={`/ 10 · ${score.classroomWalkthroughCount || 0} forms`}
                      valueStyle={{ color: "#3f8600", fontSize: 20 }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    size="small"
                    style={{ borderRadius: 10, border: "1px solid #e8e8e8" }}
                  >
                    <Statistic
                      title="Notebook Checking (Avg)"
                      value={score.notebookCheckingAvg || 0}
                      precision={2}
                      prefix={<BookOutlined />}
                      suffix={`/ 10 · ${score.notebookCheckingCount || 0} forms`}
                      valueStyle={{ color: "#3f8600", fontSize: 20 }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Manual Score Field Cards */}
              <Row gutter={[16, 16]}>
                {MANUAL_FIELDS.map((field) => (
                  <Col span={12} key={field.key}>
                    <ScoreFieldCard
                      field={field}
                      teacherIndex={index}
                      form={form}
                      isNA={isNA(index, field.key)}
                      onToggleNA={toggleNA}
                    />
                  </Col>
                ))}
              </Row>

              {/* Hidden preservation fields */}
              <Form.Item name={["teacherScores", index, "teacherId"]}           hidden><InputNumber /></Form.Item>
              <Form.Item name={["teacherScores", index, "teacherName"]}         hidden><InputNumber /></Form.Item>
              <Form.Item name={["teacherScores", index, "classroomWalkthroughAvg"]}   hidden><InputNumber /></Form.Item>
              <Form.Item name={["teacherScores", index, "classroomWalkthroughCount"]} hidden><InputNumber /></Form.Item>
              <Form.Item name={["teacherScores", index, "notebookCheckingAvg"]}  hidden><InputNumber /></Form.Item>
              <Form.Item name={["teacherScores", index, "notebookCheckingCount"]} hidden><InputNumber /></Form.Item>

            </Panel>
          );
        })}
      </Collapse>
    </Box>
  );
}

export default Step2_TeacherScores;
