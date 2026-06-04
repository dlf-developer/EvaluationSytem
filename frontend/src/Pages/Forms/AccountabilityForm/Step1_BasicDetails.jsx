import React, { useEffect, useState } from "react";
import { Form, Input, DatePicker, Select, Button, message, Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { GetTeacherList, calculateTeacherScores } from "../../../redux/userSlice";
import { SyncOutlined } from "@ant-design/icons";
import { Box, Text } from "@chakra-ui/react";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

function Step1_BasicDetails({ form, formValues, setFormValues, id }) {
  const dispatch = useDispatch();
  const { GetTeachersLists } = useSelector((s) => s?.user);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    dispatch(GetTeacherList());
  }, [dispatch]);

  const teachersArray = Array.isArray(GetTeachersLists) 
    ? GetTeachersLists 
    : GetTeachersLists?.data || [];

  const teacherOptions = teachersArray.map((t) => ({
    label: t.name,
    value: t._id,
  }));

  const handleCalculate = async () => {
    const fromDate = form.getFieldValue("fromDate");
    const toDate = form.getFieldValue("toDate");
    const teachers = form.getFieldValue("teachers");

    if (!fromDate || !toDate || !teachers || teachers.length === 0) {
      message.warning("Please select Date Range and at least one Teacher to sync data.");
      return;
    }

    setCalculating(true);
    try {
      const res = await dispatch(
        calculateTeacherScores({
          teacherIds: teachers,
          fromDate: fromDate,
          toDate: toDate,
        })
      ).unwrap();

      if (res?.success) {
        // Merge the newly fetched scores with any existing manually entered scores
        const existingScores = formValues.teacherScores || [];
        const newScores = res.data.map((calculated) => {
          // Find if we already have manual data for this teacher
          const existing = existingScores.find((s) => s.teacherId === calculated.teacherId) || {};
          return {
            ...existing,
            ...calculated, // Overwrite auto-calculated fields
            teacherName: teacherOptions.find(t => t.value === calculated.teacherId)?.label || "Unknown",
          };
        });

        const newFormValues = { ...formValues, teacherScores: newScores };
        setFormValues(newFormValues);
        form.setFieldsValue({ teacherScores: newScores });
        message.success("Successfully synced data from existing forms.");
      }
    } catch (error) {
      message.error("Failed to calculate teacher scores.");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Box>
      <Alert
        message="Basic Details"
        description="Select the date range and teachers to evaluate. Once selected, click 'Sync Teacher Data' to automatically fetch their Classroom Walkthrough and Notebook Checking scores."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form.Item
        name="formName"
        label="Report Name"
        rules={[{ required: true, message: "Please enter a report name" }]}
      >
        <Input placeholder="e.g. October 2023 Accountability Report" size="large" />
      </Form.Item>

      <Box display="flex" gap={4} mb={6}>
        <Form.Item
          name="fromDate"
          label="From Date"
          rules={[{ required: true, message: "Please select start date" }]}
          style={{ flex: 1 }}
          getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
        >
          <DatePicker size="large" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="toDate"
          label="To Date"
          rules={[{ required: true, message: "Please select end date" }]}
          style={{ flex: 1 }}
          getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
        >
          <DatePicker size="large" style={{ width: "100%" }} />
        </Form.Item>
      </Box>

      <Form.Item
        name="teachers"
        label="Select Teachers"
        rules={[{ required: true, message: "Please select at least one teacher" }]}
      >
        <Select
          mode="multiple"
          showSearch
          placeholder="Search and select teachers..."
          options={teacherOptions}
          size="large"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Button
        type="dashed"
        icon={<SyncOutlined spin={calculating} />}
        onClick={handleCalculate}
        loading={calculating}
        block
        size="large"
      >
        Sync Teacher Data (Walkthrough & Notebook)
      </Button>
    </Box>
  );
}

export default Step1_BasicDetails;
