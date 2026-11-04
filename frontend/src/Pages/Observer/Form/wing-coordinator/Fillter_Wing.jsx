import { Button, Col, DatePicker, RangePicker, Form, message, Row, Select, Space } from "../../../../Components/UI"
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getCreateClassSection, getFilteredData, GetObserverList } from '../../../../redux/userSlice';
import dayjs from 'dayjs';  // Import Day.js
import { SearchOutlined, ClearOutlined } from "../../../../Components/UI/Icons";
import { getUserRoleTag } from '../../../../Utils/auth';
const SafeRangePicker = RangePicker || DatePicker?.RangePicker;

const FORM_TYPE_OPTIONS = [
    { value: 'form1', label: 'Fortnightly Monitor' },
    { value: 'form2', label: 'Classroom Walkthrough' },
    { value: 'form3', label: 'Notebook Checking Proforma' },
    { value: 'form5', label: 'Co-Scholastic Classroom Observation' },
    { value: 'form4', label: 'Learning Progress Checklist' },
];

function Fillter_Wing({ saveData, data, loading }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [newData, setNewData] = useState([]);
    const { GetObserverLists } = useSelector((state) => state.user);
    const didAutoFetch = useRef(false);

    useEffect(() => {
        const fetchClassData = async () => {
            try {
                const res = await dispatch(getCreateClassSection());
                if (res?.payload?.success) {
                    setNewData(res?.payload?.classDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                } else {
                    message.error('Failed to fetch class data.');
                }
            } catch (error) {
                console.error('Error fetching class data:', error);
                message.error('An error occurred while fetching class data.');
            }
        };

        fetchClassData();
        dispatch(GetObserverList());
    }, [dispatch]);

    useEffect(() => {
        if (data && !didAutoFetch.current) {
            didAutoFetch.current = true;

            const hasValidRange = Array.isArray(data?.range) && data.range.length === 2 && data?.range[0] && data?.range[1];
            const parsedRange = hasValidRange
                ? [dayjs(data.range[0]), dayjs(data.range[1])]
                : [];
            const isRangeValid = parsedRange.length === 2 && parsedRange.every((d) => d.isValid());

            if (isRangeValid || (data?.className && data.className.length > 0)) {
                form.setFieldsValue({
                    range: isRangeValid ? parsedRange : [],
                    className: data?.className || [],
                    formTypes: data?.formTypes || ['form1', 'form2', 'form3', 'form4', 'form5'],
                    observers: data?.observers || [],
                });
            }

            if (data?.className?.length > 0 && isRangeValid) {
                const payload = {
                    range: data.range,
                    className: data.className,
                    formTypes: data?.formTypes || ['form1', 'form2', 'form3', 'form4', 'form5'],
                    observers: data?.observers || [],
                };
                onFinish(payload);
            }
        }
    }, [data, form]);

    const onFinish = async (values) => {
        if (!values?.range || !Array.isArray(values.range) || values.range.length !== 2 || !values.range[0] || !values.range[1]) {
            message.warning("Please select a valid Date Range before searching.");
            return;
        }
        const rawD1 = values.range[0];
        const rawD2 = values.range[1];
        const d1 = dayjs.isDayjs(rawD1) ? rawD1 : dayjs(rawD1);
        const d2 = dayjs.isDayjs(rawD2) ? rawD2 : dayjs(rawD2);
        if (!d1 || !d2 || typeof d1.isValid !== "function" || typeof d2.isValid !== "function" || !d1.isValid() || !d2.isValid()) {
            message.warning("Invalid Date Range selected.");
            return;
        }
        const formattedValues = {
            ...values,
            range: [
                d1.startOf('day').toISOString(),
                d2.endOf('day').toISOString()
            ]
        };
        saveData(formattedValues);
        await dispatch(getFilteredData(formattedValues));
    };

    const handleClear = () => {
        form.resetFields();
        saveData(null);
    };

    // Prepare options with "Select All"
    const formTypeOpts = [
        { value: 'ALL', label: 'Select All Forms' },
        ...FORM_TYPE_OPTIONS
    ];

    const classOpts = [
        { value: 'ALL', label: 'Select All Classes' },
        ...(newData?.map((item) => ({
            value: item?.className || "",
            label: item?.className || "",
        })) || [])
    ];

    const observerOpts = [
        { value: 'ALL', label: 'Select All Observers' },
        ...(GetObserverLists?.filter((item) => item?.isActive !== false)?.map((item) => {
            const roleTag = getUserRoleTag(item);
            const tagStr = roleTag ? ` [${roleTag}]` : '';
            return {
                value: item?._id || "",
                label: `${item?.name || ""}${tagStr}`,
            };
        }) || [])
    ];

    const handleSelectAll = (selectedValues, fieldName, allValuesOptions) => {
        if (selectedValues.includes('ALL')) {
            const allVals = allValuesOptions.filter(opt => opt.value !== 'ALL').map(opt => opt.value);
            form.setFieldsValue({ [fieldName]: allVals });
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
                range: (Array.isArray(data?.range) && data.range.length === 2 && data.range[0] && data.range[1])
                    ? [dayjs(data.range[0]), dayjs(data.range[1])]
                    : undefined,
                className: data?.className || [],
                formTypes: data?.formTypes || ['form1', 'form2', 'form3', 'form4', 'form5'],
                observers: data?.observers || [],
            }}
        >
            <div className="filter-container">
                <Row gutter={[16, 16]}>
                    {/* Date Range */}
                    <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                        <Form.Item
                            className="m-0"
                            label={<span style={{ fontWeight: 500, color: '#4A5568' }}>Date Range</span>}
                            name="range"
                            rules={[{ required: true, message: "Please select a date range" }]}
                        >
                            <SafeRangePicker size="large" className="w-full" style={{ borderRadius: '8px' }} />
                        </Form.Item>
                    </Col>

                    {/* Form Type */}
                    <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                        <Form.Item
                            className="m-0"
                            label={<span style={{ fontWeight: 500, color: '#4A5568' }}>Form Type</span>}
                            name="formTypes"
                            rules={[{ required: true, message: "Please select form types" }]}
                        >
                            <Select
                                size="large"
                                mode="multiple"
                                allowClear
                                placeholder="Select Form Types"
                                maxTagCount="responsive"
                                options={formTypeOpts}
                                onChange={(val) => handleSelectAll(val, 'formTypes', formTypeOpts)}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Item>
                    </Col>

                    {/* Class */}
                    <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                        <Form.Item
                            className="m-0"
                            label={<span style={{ fontWeight: 500, color: '#4A5568' }}>Class</span>}
                            name="className"
                            rules={[{ required: true, message: "Please select a class" }]}
                        >
                            <Select
                                size="large"
                                mode="multiple"
                                allowClear
                                placeholder="Choose Class"
                                maxTagCount="responsive"
                                options={classOpts}
                                onChange={(val) => handleSelectAll(val, 'className', classOpts)}
                                filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Item>
                    </Col>

                    {/* Observers */}
                    <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                        <Form.Item
                            className="m-0"
                            label={<span style={{ fontWeight: 500, color: '#4A5568' }}>Observer</span>}
                            name="observers"
                        >
                            <Select
                                size="large"
                                mode="multiple"
                                placeholder="All Observers (Optional)"
                                allowClear
                                maxTagCount="responsive"
                                options={observerOpts}
                                onChange={(val) => handleSelectAll(val, 'observers', observerOpts)}
                                filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Action Buttons */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #f0f0f0',
                    }}
                >
                    <Button
                        size="large"
                        onClick={handleClear}
                        disabled={loading}
                        icon={<ClearOutlined />}
                        style={{ borderRadius: '8px', paddingLeft: '20px', paddingRight: '20px' }}
                    >
                        Clear
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={loading}
                        disabled={loading}
                        icon={<SearchOutlined />}
                        style={{
                            borderRadius: '8px',
                            backgroundColor: '#1a4d2e',
                            borderColor: '#1a4d2e',
                            color: 'white',
                            paddingLeft: '24px',
                            paddingRight: '24px',
                            fontWeight: 600,
                        }}
                    >
                        {loading ? "Searching..." : "Search"}
                    </Button>
                </div>
            </div>
        </Form>
    );
}

export default Fillter_Wing;
