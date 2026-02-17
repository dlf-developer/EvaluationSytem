import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Checkbox, Button, Spin, Card, message, InputNumber, Input, Col } from 'antd';
import Fillter_Wing from './Fillter_Wing';
import { getAllTimes } from '../../../../Utils/auth';
import { GetSingleWingFrom, updateWingForm, WingPublished } from '../../../../redux/userSlice';
import { useNavigate, useParams } from "react-router-dom";

import {inputsWing} from "./wing"

function OB_Wing() {
  const { getFilteredDataList, loading } = useSelector((state) => state?.user);
  const [formData, setFormData] = useState();
  const [currForm, setCurrForm] = useState();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const id = useParams()?.id;

  const GetForm = async () => {
    const res = await dispatch(GetSingleWingFrom(id));
    if (res?.payload?.success) {
      if(res?.payload?.data?.isComplete && !res?.payload?.data?.isDraft){
        navigate("/wing-coordinator")
      }else{
        setCurrForm(res?.payload?.data);
      }
    } else {
      message.error("SERVER ERROR: Something went wrong!");
    }
  };

  useEffect(() => {
    GetForm();
  }, [dispatch]);

  // Set initial values when currForm has data
  useEffect(() => {
    if (currForm) {
      form.setFieldsValue(currForm);
      setSelectedItems({
        form1: currForm?.form1 || [],
        form2: currForm?.form2 || [],
        form3: currForm?.form3 || [],
        form4: currForm?.form4 || []
      });
    }
  }, [currForm]);

  const [selectedItems, setSelectedItems] = useState({
    form1: [],
    form2: [],
    form3: [],
    form4: []
  });

  // Handle checkbox selection
  const handleSelect = (checked, item, type) => {
    setSelectedItems((prev) => {
      const updatedTypeArray = checked
        ? [...prev[type], item] // Add item if checked
        : prev[type].filter((i) => i._id !== item._id); // Remove if unchecked

      return { ...prev, [type]: updatedTypeArray };
    });
  };

  const onFinish = async (values) => {
    const { className, range } = formData || {};
    const { form1, form2, form3, form4 } = selectedItems;

    const checkdata = {
      ...values,
      className,
      range,
      form1,
      form2,
      form3,
      form4
    };
    const res = await dispatch(updateWingForm({ id, checkdata })).unwrap();
    if (res?.success) {
      message.success(res?.message);
      // navigate('/wing-coordinator');
    } else {
      message.error("SERVER ERROR: Something went wrong!");
    }
  };

  const formTitle = [
    "Fortnightly Monitor",
    "Classroom Walkthrough",
    "Notebook Checking Proforma",
    "Learning Progress Checklist"
  ];
const publish = async() =>{
  const { className, range } = formData || {};
  const { form1, form2, form3, form4 } = selectedItems;
  const {monthlyReport} = form.getFieldValue();
  const checkdata = {
    className,
    range,
    form1,
    form2,
    form3,
    form4,
    isDraft:false,
    isComplete:true,
    monthlyReport
  };
  // return
  const res = await dispatch(WingPublished({id,checkdata})).unwrap();
  if(res?.success){
    message.success(res?.message);
    navigate('/wing-coordinator');
  }
}
const [currStep, setCurrStep] =useState(1);
const next = () => {
  setCurrStep((prevStep) => prevStep + 1);
};

const prev = () => {
  setCurrStep((prevStep) => (prevStep > 1 ? prevStep - 1 : prevStep));
};


const getTotalScore = (items,type,formType) => {
  if(formType==="form1"){
  if (!items) return 0;
  // Count "Yes", "Sometimes", and "No" as 1
  const validValues = ["Yes", "Sometimes", "No"];
  const scores = Object.values(items[type]).reduce((sum, value) => {
    return sum + (validValues.includes(value) ? 1 : 0); // Add 1 if value matches
  }, 0);

  return scores; // Return total score
}else if(formType==='form2'){
  const sections = ["essentialAggrements", "planingAndPreparation", "classRoomEnvironment", "instruction"];

  const validValues = ["1", "2", "3", "4"]; 
  let outOfScore = 0;
  
  sections.forEach((section) => {
    if (items[section]) {
      items[section].forEach((item) => {
        const answer = item?.answer;

        // Only consider valid answers for both totalScore and outOfScore
        if (validValues?.includes(answer)) {
          // totalScore += parseInt(answer, 10); // Accumulate score
          outOfScore += 4; // Increment max score (4 points per question)
        }

        // // Count "N/A" answers
        // if (["N/A", "NA", "N"].includes(answer)) {
        //   numOfParametersNA++; // Increment the count for "N/A"
        // }
      });
    }
  });
  return outOfScore
}else if(formType==='form3'){
  const data = items[type]
  const validValues = ["1", "2", "3"];
   // // Array of keys to iterate over
   const keyObject = [
    'maintenanceOfNotebooks',
    'qualityOfOppurtunities',
    'qualityOfTeacherFeedback',
    'qualityOfLearner',
  ];
  let outOfScore = 0;
 
  keyObject.forEach((section) => {
   
    if (data[section]) {
      data[section].forEach((item) => {
        const answer = item?.answer;

        // Only consider valid answers for both totalScore and outOfScore
        if (validValues?.includes(answer)) {
          // totalScore += parseInt(answer, 10); // Accumulate score
          outOfScore += 3; // Increment max score (4 points per question)
        }

        
      });
    }
  });
return outOfScore
}
};

const getSelfAssemnetScrore = (items,type,formType) => {
  if(formType==="form1"){
    if (!items) return 0;
    const validValues = { Yes: 1, Sometimes: 0.5 };
    const scores = Object.values(items[type]).reduce((sum, value) => {
      return sum + (validValues[value] || 0); // Add score if value matches, otherwise add 0
    }, 0);
    return scores 

  }else if(formType==='form2'){
    const sections = ["essentialAggrements", "planingAndPreparation", "classRoomEnvironment", "instruction"];

    const validValues = ["1", "2", "3", "4"]; 
    let totalScore = 0;
    
    sections.forEach((section) => {
      if (items[section]) {
        items[section].forEach((item) => {
          const answer = item?.answer;
  
          // Only consider valid answers for both totalScore and outOfScore
          if (validValues?.includes(answer)) {
            totalScore += parseInt(answer, 10); // Accumulate score
            // outOfScore += 4; // Increment max score (4 points per question)
          }
  
        });
      }
    });
   return totalScore
  }else if(formType==='form3'){
    const data = items[type]
    const validValues = ["1", "2", "3"];
     // // Array of keys to iterate over
     const keyObject = [
      'maintenanceOfNotebooks',
      'qualityOfOppurtunities',
      'qualityOfTeacherFeedback',
      'qualityOfLearner',
    ];
    let totalScore = 0;
   
    keyObject.forEach((section) => {
     
      if (data[section]) {
        data[section].forEach((item) => {
          const answer = item?.answer;

          // Only consider valid answers for both totalScore and outOfScore
          if (validValues?.includes(answer)) {
            totalScore += parseInt(answer, 10); // Accumulate score
            // outOfScore += 3; // Increment max score (4 points per question)
          }

          
        });
      }
    });
 return totalScore
  }

};

const renderRadioFormItem = ({ name, label, question }) => (
  <>
    <Form.Item
      className="mb-3"
      name={[...name, "answer"]}
      label={<h6 className="text-gray mb-0 text-capitalize">{label}</h6>}
      rules={[{ required: true, message: "Please select an answer!" }]}
    >
      <Input />
    </Form.Item>
    <Form.Item className="hidden" hidden name={[...name, "question"]} initialValue={question}>
      <Input />
    </Form.Item>
  </>
);

const renderSections = useMemo(
  () => (title, questions, namePrefix) => (
    <>
      <Col md={19} sm={24} lg={18} xl={15}>
        <h2 className="mb-3 px-3 py-3 rounded-3 text-primary" style={{ background: "#f7f7f7" }}>
          {title}
        </h2>
      </Col>
      {questions.map((question, index) => (
        <Col md={19} sm={24} lg={18} xl={15} key={`${namePrefix}-${index}`}>
          {/* <Card className="mb-3 shadow-sm p-0"> */}
            {renderRadioFormItem({
              name: [namePrefix, index],
              label: question,
              question,
            })}
          {/* </Card> */}
        </Col>
      ))}
    </>
  ),
  []
);
  return (
    <div>
      <Fillter_Wing saveData={setFormData} data={currForm} />
     
      {loading && 
       <div className="LoaderWrapper">
         <Spin size="large" className="position-absolute" />
       </div>}
      {getFilteredDataList && 
      <div className='container'>
        <Form form={form} layout="vertical" onFinish={onFinish}  >
        <Button className='mb-3 px-5 py-3 text-[20px]' type="dashed" htmlType="submit">
            Save 
          </Button>

          {currStep === 1 && ['form1', 'form2', 'form3', 'form4'].map((type, i) => (
            <div key={type}>
              <h3>{formTitle[i]}</h3>
              {getFilteredDataList?.[type]?.length > 0 ? (
                getFilteredDataList[type]?.map((item) => {
                  const isComplete =
                  (item?.isCoordinatorComplete && item?.isTeacherComplete) ||
                  (item?.isObserverCompleted && item?.isTeacherCompletes) ||
                  (item?.isTeacherComplete && item?.isObserverComplete) ||
                  item?.isCompleted;
               return isComplete ? (

                
                  <div key={item?._id || item?.id} className="d-flex">
                    <Card className='w-[100%] mb-3 flex' >
                      <div className='flex justify-between w-100'>
                      <div className='flex gap-2 justify-start items-start'>
                      <Checkbox
                        onChange={(e) => handleSelect(e.target.checked, item, type)}
                        checked={selectedItems[type]?.some((i) => i._id === item._id)}
                      />
                      <div>
                        <p className='mb-0'>
                          Class & Section: <b> {item?.className || item?.grenralDetails?.className}</b>
                        </p>
                        <p className='mb-0'>
                          Date: <b> {getAllTimes(item?.createdAt)?.formattedDate2}</b>
                        </p>
                        <p className='mb-0'>
                          Teacher: <b>
                            {type === 'form1' ? item?.teacherID?.name || item?.userId?.name : ""}
                            {type === 'form2' ? item?.grenralDetails?.NameoftheVisitingTeacher?.name || item?.createdBy?.name : ""}
                            {type === 'form3' ? item?.teacherID?.name || item?.createdBy?.name : ""}
                            {type === 'form4' ? item?.teacherId?.name || item?.userId?.name : ""}
                          </b>
                        </p>
                      </div>
                      </div>
                      <div>
                        {type==='form1' &&
                        <>
                         <p className="mb-0">
                         Teacher {`(%)`}: <b>
                           {getTotalScore(item, "teacherForm","form1") > 0
                             && ((getSelfAssemnetScrore(item, "teacherForm","form1") / getTotalScore(item, "teacherForm","form1")) * 100).toFixed(2)
                            || "NA"}%
                         </b>
                       </p>
                       <p className="mb-0">
                       Observer {`(%)`}: <b>
                           {getTotalScore(item, "teacherForm","form1") > 0
                             && ((getSelfAssemnetScrore(item, "observerForm","form1") / getTotalScore(item, "observerForm","form1")) * 100).toFixed(2)
                             || "NA"}%
                         </b>
                       </p>
                       </>
                        }
                         {type==='form2' &&
                         <>
                         <p className="mb-0">
                         Total Percentage {`(%)`}: <b>
                           {getTotalScore(item, "teacherForm","form2") > 0
                             && ((getSelfAssemnetScrore(item, "teacherForm","form2") / getTotalScore(item, "teacherForm","form2")) * 100).toFixed(2)
                             || "NA"}%
                         </b>
                       </p>
                       <p className="mb-0">
                          {item?.ObserverFeedback?.map((feedback)=>(
                           <>
                             <span className='d-block fw-normal'> Question: <b>{feedback?.question}</b></span>
                            <span className='d-block fw-normal'>Answer <b>{feedback?.answer}</b></span>
                           </>
                          ))}
                       </p>
                         </>
                         }
                          

                          {type==='form3' &&
                          <>
                          <p className="mb-0">
                         Teacher {`(%)`}: <b>
                           {getTotalScore(item, "TeacherForm","form3") > 0
                             && ((getSelfAssemnetScrore(item, "TeacherForm","form3") / getTotalScore(item, "TeacherForm","form3")) * 100).toFixed(2)
                            || "NA"}%
                         </b>
                       </p>
                       <p className="mb-0">
                         Observer {`(%)`}: <b>
                           {getTotalScore(item, "ObserverForm","form3") > 0
                             && ((getSelfAssemnetScrore(item, "ObserverForm","form3") / getTotalScore(item, "ObserverForm","form3")) * 100).toFixed(2)
                            || "NA"}%
                         </b>
                       </p>
                       <p className="mb-0">
                             <span className='d-block fw-normal'>Observer Feedback...: <b>{item?.observerFeedback}</b></span>
                            <span className='d-block fw-normal'>Teacher Reflection Feedback <b>{item?.teacherReflationFeedback}</b></span>
                       </p>
                          </>
                          }

                        
                      </div>
                      </div>
                    </Card>
                  </div>
                ):null})
              ) : (
                <p>No data available</p>
              )}
            </div>
          ))}
         {currStep === 2 &&

     
        renderSections("Monthly Report",inputsWing,"monthlyReport")


      


         }
          {currStep!== 2
          &&
          <Button onClick={()=>next()} className='px-5 py-3 text-[20px]' type="primary">
            Next
          </Button>
          }

           {currStep === 2 &&
          <Button onClick={()=>publish()} className='px-5 py-3 text-[20px]' type="primary">
            Published
          </Button>
}
        </Form>
      </div>
      }
    </div>
  );
}

export default OB_Wing;
