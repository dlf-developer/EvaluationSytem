import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  GetWalkThroughForm,
  TeacherWalkThroughComplete,
} from "../../redux/Form/classroomWalkthroughSlice";
import { getAllTimes, getUserId } from "../../Utils/auth";
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  message,
  Radio,
  Spin,
} from "antd";
import { Col, Container, Row } from "react-bootstrap";
import TextArea from "antd/es/input/TextArea";

function TeacherWalkthroughshow() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const FormId = useParams()?.id;

  const { isLoading, formDataList } = useSelector(
    (state) => state?.walkThroughForm
  );
  const [form] = Form.useForm();
  const Fectch = async () => {
    const data = await dispatch(GetWalkThroughForm(FormId));
    const { isTeacherCompletes } = data?.payload;
    if (isTeacherCompletes) {
      navigate(`/classroom-walkthrough/report/${FormId}`);
    } else {
      message.success("Add your feedback");
    }
  };
  useEffect(() => {
    if (FormId) {
      Fectch();
    }
  }, [dispatch, FormId]);

  const renderRadioFormItem = ({ name, label, question, isTextArea }) => (
    <>
      <Form.Item
        name={[...name, "answer"]}
        label={<h6 className="text-gray">{label}</h6>}
        rules={[{ required: true, message: "Please select an answer!" }]}
      >
        <>
          <TextArea rows={4} placeholder="Enter Your Feedback" />
        </>
      </Form.Item>
      <Form.Item
        className="hidden"
        hidden
        name={[...name, "question"]}
        initialValue={question}
      >
        <Input />
      </Form.Item>
    </>
  );
  const renderSections = (title, questions, namePrefix) => (
    <>
      <Col md={12}>
        <h2
          className="mb-3 px-3 py-3 rounded-3 text-primary"
          style={{ background: "#f7f7f7" }}
        >
          {title}
        </h2>
      </Col>
      {questions.map((question, index) => (
        <Col md={12} key={`${namePrefix}${index}`}>
          <Card className="mb-3 shadow-sm">
            {renderRadioFormItem({
              name: [namePrefix, index],
              label: question,
              question,
              isTextArea: true,
            })}
          </Card>
        </Col>
      ))}
    </>
  );

  const handleNext = () => {
    form
      .validateFields()
      .then((values) => {
        setFormData((prev) => ({ ...prev, ...values }));
        handleSubmit({ ...formData, ...values });
      })
      .catch(() => message.error("Please complete all required fields."));
  };

  const handleSubmit = async (data) => {
    const payload = {
      data: {
        isTeacherCompletes: true,
        TeacherFeedback: data?.TeacherFeedback,
      },
      id: FormId,
    };

    const response = await dispatch(TeacherWalkThroughComplete(payload));
    if (response?.payload?.message) {
      message.success(response?.payload?.message);
      navigate(`/classroom-walkthrough/report/${FormId}`);
    } else {
      message.error(response?.payload?.message);
    }
  };

  const MapColor = (Arrmap) => {
    return Arrmap?.answer === "1"
      ? "bg-red-200 border-red-400 shadow-red-300"
      : Arrmap?.answer === "2"
        ? "bg-yellow-100 border-yellow-300 shadow-yellow-200" // Light Yellow
        : Arrmap?.answer === "3"
          ? "bg-yellow-300 border-yellow-300 shadow-yellow-300" // Dark Yellow
          : Arrmap?.answer === "4"
            ? "bg-green-200 border-green-400 shadow-green-300"
            : "bg-gray-200 border-gray-400 shadow-gray-300";
  };

  return (
    <Container className="mt-3 mb-4">
      {isLoading && (
        <div className="LoaderWrapper bg-opacity-100">
          <Spin size="large" className="position-absolute" />
        </div>
      )}
      <Row>
        <Col md={12}>
          <Card title="Observer Response">
            <Card className="mt-4">
              <div
                className="d-grid"
                style={{ gridTemplateColumns: "1fr 1fr" }}
              >
                <p className="mb-0 fs-5">
                  <b>Name:</b>{" "}
                  {formDataList?.grenralDetails?.NameoftheVisitingTeacher?.name}
                </p>
                <p className="mb-0 fs-5">
                  <b>Date Of Observation:</b>{" "}
                  {
                    getAllTimes(formDataList?.grenralDetails?.DateOfObservation)
                      .formattedDate2
                  }
                </p>
                <p className="mb-0 fs-5">
                  <b>Class:</b> {formDataList?.grenralDetails?.className}
                </p>
                <p className="mb-0 fs-5">
                  <b>Section:</b> {formDataList?.grenralDetails?.Section}
                </p>
                <p className="mb-0 fs-5">
                  <b>Subject:</b> {formDataList?.grenralDetails?.Subject}
                </p>
                <p className="mb-0 fs-5">
                  <b>Topic:</b> {formDataList?.grenralDetails?.Topic}
                </p>
              </div>
            </Card>
            <Card className="mt-4" title={"Essential Aggrements"}>
              {formDataList?.essentialAggrements?.map((item, index) => (
                <div
                  key={index}
                  className="d-flex py-2  justify-content-between"
                >
                  <p className="mb-0">{item?.question}</p>
                  {/* <p className="mb-0"> {item?.answer}</p> */}
                  <p
                    className={`mb-0 p-2 text-sm rounded-md text-gray-900 font-medium shadow-md border transform transition-all duration-200 hover:scale-105
  ${MapColor(item)}`}
                  >
                    {item?.answer}
                  </p>
                </div>
              ))}
            </Card>

            <Card className="mt-4" title="Planing And Preparation">
              {formDataList?.planingAndPreparation?.map((item, index) => (
                <div
                  key={index}
                  className="d-flex py-2  justify-content-between"
                >
                  <p className="mb-0">{item?.question}</p>
                  {/* <p className="mb-0"> {item?.answer}</p> */}

                  <p
                    className={`mb-0 p-2 text-sm rounded-md text-gray-900 font-medium shadow-md border transform transition-all duration-200 hover:scale-105
                    ${MapColor(item)}`}
                  >
                    {item?.answer}
                  </p>
                </div>
              ))}
            </Card>

            <Card className="mt-4" title="Class Room Environment">
              {formDataList?.classRoomEnvironment?.map((item, index) => (
                <div
                  key={index}
                  className="d-flex py-2  justify-content-between"
                >
                  <p className="mb-0">{item?.question}</p>
                  {/* <p className="mb-0"> {item?.answer}</p> */}
                  <p
                    className={`mb-0 p-2 text-sm rounded-md text-gray-900 font-medium shadow-md border transform transition-all duration-200 hover:scale-105
                    ${MapColor(item)}`}
                  >
                    {item?.answer}
                  </p>
                </div>
              ))}
            </Card>

            <Card className="mt-4" title="Instruction">
              {formDataList?.instruction?.map((item, index) => (
                <div
                  key={index}
                  className="d-flex py-2  justify-content-between"
                >
                  <p className="mb-0">{item?.question}</p>
                  {/* <p className="mb-0"> {item?.answer}</p> */}
                  <p
                    className={`mb-0 p-2 text-sm rounded-md text-gray-900 font-medium shadow-md border transform transition-all duration-200 hover:scale-105
                    ${MapColor(item)}`}
                  >
                    {item?.answer}
                  </p>
                </div>
              ))}
            </Card>

            <Card className="mt-4" title="Observer Feedback">
              {formDataList?.ObserverFeedback?.map((item, index) => (
                <div
                  key={index}
                  className="d-flex flex-column py-2  justify-content-between"
                >
                  <p className="mb-0">{item?.question}</p>
                  {/* <p style={{background:"#f7f7f7"}} className="mb-0 p-2 rounded border mt-2"> {item?.answer}</p> */}
                  <p
                    className={`mb-0 p-2 text-sm rounded-md text-gray-900 font-medium shadow-md border transform transition-all duration-200 hover:scale-105
                      ${MapColor(item)}`}
                  >
                    {item?.answer}
                  </p>
                </div>
              ))}
            </Card>
            <Card className="mt-4" title="Teacher Feedback">
              {formDataList?.TeacherFeedback?.map((item, index) => (
                <div
                  key={index}
                  className="d-flex flex-column py-2  justify-content-between"
                >
                  <p className="mb-0">{item?.question}</p>
                  {/* <p style={{background:"#f7f7f7"}} className="mb-0 p-2 rounded border mt-2"> {item?.answer}</p> */}
                  <p
                    className={`mb-0 p-2 text-sm rounded-md text-gray-900 font-medium shadow-md border transform transition-all duration-200 hover:scale-105
                      ${MapColor(item)}`}
                  >
                    {item?.answer}
                  </p>
                </div>
              ))}
            </Card>
          </Card>
        </Col>
        <Col md={5}></Col>
      </Row>
    </Container>
  );
}

export default TeacherWalkthroughshow;
