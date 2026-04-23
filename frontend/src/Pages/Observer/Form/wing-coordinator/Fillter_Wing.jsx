import { Button, Col, DatePicker, Form, message, Row, Select } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getCreateClassSection, getFilteredData, GetObserverList } from '../../../../redux/userSlice';
import dayjs from 'dayjs';  // Import Day.js
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
    // Guard: only auto-fetch once when saved form data first loads
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

    const [selectedItems, setSelectedItems] = useState({
        range: [],
        className: '',
        formTypes: ['form1', 'form2', 'form3', 'form4'],
    });

    useEffect(() => {
        if (data && !didAutoFetch.current) {
            // Populate form fields with saved values
            form.setFieldsValue({
                range: data?.range ? [dayjs(data.range[0]), dayjs(data.range[1])] : [],
                className: data?.className || '',
                formTypes: data?.formTypes || ['form1', 'form2', 'form3', 'form4'],
            });

            setSelectedItems({
                range: data?.range ? [dayjs(data.range[0]), dayjs(data.range[1])] : [],
                className: data?.className || '',
                formTypes: data?.formTypes || ['form1', 'form2', 'form3', 'form4'],
            });

            // Auto-trigger search only once if saved data has className + range
            if (data?.className) {
                const payload = {
                    range: data?.range,
                    className: data?.className,
                    formTypes: data?.formTypes || ['form1', 'form2', 'form3', 'form4'],
                };
                didAutoFetch.current = true;
                onFinish(payload);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const onFinish = async (values) => {
        saveData(values);
        await dispatch(getFilteredData(values));
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
                range: data?.range || [],
                className: data?.className || '',
                formTypes: data?.formTypes || ['form1', 'form2', 'form3', 'form4'],
            }}
        >
            <div className="container">
                <Row gutter={24} justify={"start"} align={"middle"}>
                    {/* Date Range */}
                    <Col xl={6} lg={6} md={12} sm={24} xs={24}>
                        <Form.Item
                            className="w-full"
                            label="Date Range"
                            name="range"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a date range",
                                },
                            ]}
                        >
                            <RangePicker className="w-full" />
                        </Form.Item>
                    </Col>

                    {/* Form Type */}
                    <Col xl={6} lg={6} md={12} sm={24} xs={24}>
                        <Form.Item
                            label="Form Type"
                            name="formTypes"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select at least one form type",
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select form types"
                                options={FORM_TYPE_OPTIONS}
                                maxTagCount={2}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Col>

                    {/* Class */}
                    <Col xl={6} lg={6} md={12} sm={24} xs={24}>
                        <Form.Item
                            label="Class"
                            name="className"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a class",
                                },
                            ]}
                        >
                            <Select
                                mode='multiple'
                                placeholder="Choose Class"
                                options={newData && newData?.length > 0 && newData?.map((item) => ({
                                    key: item?._id || "",
                                    id: item?._id || "",
                                    value: item?.className || "",
                                    label: item?.className || "",
                                }))}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Col>

                    {/* Search Button */}
                    <Col xl={6} lg={6} md={12} sm={24} xs={24}>
                        <Form.Item className="m-0" label=" ">
                            <Button
                                type="primary"
                                htmlType="button"
                                onClick={() => form.submit()}
                                className="px-6 py-2 w-full"
                            >
                                Search
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        </Form>
    );
}

export default Fillter_Wing;
