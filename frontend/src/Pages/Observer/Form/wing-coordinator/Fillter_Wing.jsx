import { Button, Col, DatePicker, Form, message, Row, Select, Space } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getCreateClassSection, getFilteredData, GetObserverList } from '../../../../redux/userSlice';
import dayjs from 'dayjs';  // Import Day.js
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
const { RangePicker } = DatePicker;

const FORM_TYPE_OPTIONS = [
    { value: 'form1', label: 'Fortnightly Monitor' },
    { value: 'form2', label: 'Classroom Walkthrough' },
    { value: 'form3', label: 'Notebook Checking Proforma' },
    { value: 'form4', label: 'Learning Progress Checklist' },
];

function Fillter_Wing({ saveData, data }) {
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
            form.setFieldsValue({
                range: data?.range ? [dayjs(data.range[0]), dayjs(data.range[1])] : [],
                className: data?.className || [],
                formTypes: data?.formTypes || ['form1', 'form2', 'form3', 'form4'],
                observers: data?.observers || [],
            });

            if (data?.className) {
                const payload = {
                    range: data?.range,
                    className: data?.className,
                    formTypes: data?.formTypes || ['form1', 'form2', 'form3', 'form4'],
                    observers: data?.observers || [],
                };
                didAutoFetch.current = true;
                onFinish(payload);
            }
        }
    }, [data, form]);

    const onFinish = async (values) => {
        saveData(values);
        await dispatch(getFilteredData(values));
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
        ...(GetObserverLists?.map((item) => ({
            value: item?._id || "",
            label: item?.name || "",
        })) || [])
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
                range: data?.range || [],
                className: data?.className || [],
                formTypes: data?.formTypes || ['form1', 'form2', 'form3', 'form4'],
                observers: data?.observers || [],
            }}
        >
            <div className="filter-container">
                <Row gutter={[16, 16]} align="bottom">
                    {/* Date Range */}
                    <Col xl={5} lg={6} md={12} sm={24} xs={24}>
                        <Form.Item
                            className="m-0"
                            label={<span style={{ fontWeight: 500, color: '#4A5568' }}>Date Range</span>}
                            name="range"
                            rules={[{ required: true, message: "Please select a date range" }]}
                        >
                            <RangePicker size="large" className="w-full" style={{ borderRadius: '8px' }} />
                        </Form.Item>
                    </Col>

                    {/* Form Type */}
                    <Col xl={5} lg={6} md={12} sm={24} xs={24}>
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
                    <Col xl={5} lg={6} md={12} sm={24} xs={24}>
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
                    <Col xl={5} lg={6} md={12} sm={24} xs={24}>
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

                    {/* Action Buttons */}
                    <Col xl={4} lg={24} md={24} sm={24} xs={24}>
                        <Space className="w-full" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <Button
                                size="large"
                                onClick={handleClear}
                                icon={<ClearOutlined />}
                                style={{ borderRadius: '8px' }}
                            >
                                Clear
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                htmlType="button"
                                onClick={() => form.submit()}
                                icon={<SearchOutlined />}
                                style={{ borderRadius: '8px', backgroundColor: '#4A6741', borderColor: '#4A6741' }}
                            >
                                Search
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </div>
        </Form>
    );
}

export default Fillter_Wing;
