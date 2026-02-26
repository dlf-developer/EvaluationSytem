import { Button, Col, DatePicker, Form, message, Row, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getCreateClassSection, getFilteredData, GetObserverList } from '../../../../redux/userSlice';
import dayjs from 'dayjs';  // Import Day.js
const { RangePicker } = DatePicker;

function Fillter_Wing({ saveData, data }) {

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [newData, setNewData] = useState([]);

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
    });

    useEffect(() => {
        if (data) {
            if (data?.className) {
                const payload = {
                    range: data?.range,
                    className: data?.className
                }
                onFinish(payload)
            }
            form.setFieldsValue({
                range: data?.range ? [dayjs(data.range[0]), dayjs(data.range[1])] : [],
                className: data?.className || '',
            });

            setSelectedItems({
                range: data?.range ? [dayjs(data.range[0]), dayjs(data.range[1])] : [],
                className: data?.className || '',
            });
        }
    }, [data, form]);

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
            }}
        >
            <div className="container">
                <Row gutter={24} justify={"start"} align={"middle"}>
                    <Col xl={8} lg={8} md={8} sm={24} xs={24}>
                        <Form.Item
                            className="w-full"
                            label="From To"
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
                    <Col xl={8} lg={8} md={8} sm={24} xs={24}>
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
                    <Form.Item className="m-0">
                        <Button type="primary" htmlType="submit" className="px-4 py-3">
                            Search
                        </Button>
                    </Form.Item>
                </Row>
            </div>
        </Form>
    );
}

export default Fillter_Wing;
