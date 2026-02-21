import React, { useState, useEffect } from "react";
import { FileText, UserCircle, BookOpen, ClipboardCheck } from "lucide-react";
import FormOneReport from "./ReportsTab/FormOneReport";
import FormTwoReport from "./ReportsTab/FormTwoReport";
import FormThreeReport from "./ReportsTab/FormThreeReport";
import FormFourReport from "./ReportsTab/FormFourReport";




const ObserverReports = () => {
  const [currStep, setCurrStep] = useState(0);


  const reportTypes = [
    {
      title: "Fortnightly Monitor",
      icon: <FileText className="w-5 h-5" />,
      bgColor: `bg-green-${currStep === 0 ? "400" : "50"}`,
    },
    {
      title: "Classroom Walkthrough",
      icon: <UserCircle className="w-5 h-5" />,
      bgColor: `bg-orange-${currStep === 1 ? "400" : "50"}`,
    },
    {
      title: "Notebook Checking",
      icon: <BookOpen className="w-5 h-5" />,
      bgColor: `bg-blue-${currStep === 2 ? "400" : "50"}`,
    },
    {
      title: "Weekly Learning Checklist",
      icon: <ClipboardCheck className="w-5 h-5" />,
      bgColor: `bg-purple-${currStep === 3 ? "400" : "50"}`,
    },
  ];


  const handleChange = (step) => {
    setCurrStep(step)
  }
  return (
    <>
      <div className="p-4">
        {/* Report Type Cards */}
        <div className="grid grid-cols-4 grid-cols-4-mobile gap-4 mb-6">
          {reportTypes?.map((report, index) => (
            <div
              onClick={() => handleChange(index)}
              key={index}
              className={`flex items-center p-4 rounded-lg mobile-paddig ${currStep === index && "shadow-md"} ${report.bgColor}`}
            >
              <div className="mr-3 text-gray-700 mobile-margin-r">{report.icon}</div>
              <span className="text-gray-900 font-medium text-monile">{report.title}</span>
            </div>
          ))}
        </div>

        {currStep === 0 && (
          <FormOneReport />
        )}

        {currStep === 1 && (
          <FormTwoReport />
        )}
        {currStep === 2 && (
          <FormThreeReport />
        )}
        {currStep === 3 && (
          <FormFourReport />
        )}

      </div>
    </>
  );
};

export default ObserverReports;
