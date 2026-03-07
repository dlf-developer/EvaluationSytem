import React, { useEffect, useState } from "react";
import ReactPDF, { PDFViewer } from "@react-pdf/renderer";
import MyDocument from "./Documents/MyDocument";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetSingleFormsOne } from "../../redux/Form/fortnightlySlice";
import { Button, Spin, Table, Tag } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import Logo from "./Imgs/Logo.png";
import LogoBanner from "./Imgs/image.png";
import {
  questions,
  questionsOld,
  cutoffDate,
} from "../../Components/normalData";

function Reader() {
  const Id = useParams().id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { GetSingleForms, loading } = useSelector((state) => state?.Forms);

  const downloadPDF = async () => {
    const blob = await ReactPDF.pdf(
      <MyDocument data={GetSingleForms} />,
    ).toBlob();
    const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `Report-Fortnightly-Monitor-${Id}.pdf`;
    link.click();

    // Clean up the object URL
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    dispatch(GetSingleFormsOne(Id));
  }, []);

  const getTotalScore = (type) => {
    if (!GetSingleForms) return 0;

    // Count "Yes", "Sometimes", and "No" as 1
    const validValues = ["Yes", "Sometimes", "No"];
    const scores = Object.values(GetSingleForms[type]).reduce((sum, value) => {
      return sum + (validValues.includes(value) ? 1 : 0); // Add 1 if value matches
    }, 0);

    return scores; // Return total score
  };

  const getSelfAssemnetScrore = (type) => {
    if (!GetSingleForms) return 0;
    const validValues = { Yes: 1, Sometimes: 0.5 };
    const scores = Object.values(GetSingleForms[type]).reduce((sum, value) => {
      return sum + (validValues[value] || 0); // Add score if value matches, otherwise add 0
    }, 0);
    return scores;
  };

  const currentQuestions =
    new Date(GetSingleForms?.createdAt) < new Date(cutoffDate)
      ? questionsOld
      : questions;

  let questionsAll = [...(currentQuestions || [])];
  const newItems = [
    { name: "Total Score", key: "Total Score" },
    { name: "Out of", key: "Out Of" },
  ];

  // Add only non-duplicate items
  newItems.forEach((item) => {
    if (!questionsAll.some((existingItem) => existingItem.key === item.key)) {
      questionsAll.push(item);
    }
  });

  return (
    <>
      <div className="ms-5 lh-sm py-4 position-relative">
        {loading && (
          <div className="LoaderWrapper">
            <Spin size="large" className="position-absolute" />
          </div>
        )}
        {/* <h2>Fortnightly Monitor Report</h2> */}
        <Button type="primary" onClick={downloadPDF}>
          <DownloadOutlined /> Download PDF
        </Button>
      </div>
      {/* <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <img src={Logo} className="img-fluid" />
        <img src={LogoBanner} className="img-fluid" />
      </div> */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <img
          src={Logo}
          style={{
            width: window.innerWidth <= 576 ? "150px" : "100px", // Smaller size on mobile
            height: "auto",
          }}
          alt="Logo"
        />
        <img
          src={LogoBanner}
          style={{
            width: window.innerWidth <= 576 ? "150px" : "300px", // Smaller size on mobile
            height: "auto",
          }}
          alt="Logo Banner"
        />
      </div>

      <div className="container border p-0 rounded-4 overflow-hidden">
        <Table
          pagination={false}
          dataSource={questionsAll}
          columns={[
            {
              title: "Questions",
              dataIndex: "name",
              key: "key",
              render: (text) => <p className="mb-0">{text}</p>,
            },
            {
              title: "Teacher Response",
              dataIndex: "key",
              key: "key",
              render: (text, record) => {
                // Custom logic for manual values
                if (record.key === "Total Score") {
                  return (
                    <p className="mb-0">
                      {getSelfAssemnetScrore("teacherForm")}
                    </p>
                  );
                }
                if (record.key === "Out Of") {
                  return <p className="mb-0">{getTotalScore("teacherForm")}</p>;
                }
                // Default behavior for other rows
                return (
                  <p className="mb-0">
                    <Tag
                      color={
                        GetSingleForms?.teacherForm[text] === "Yes"
                          ? "green"
                          : GetSingleForms?.teacherForm[text] === "No"
                            ? "red"
                            : GetSingleForms?.teacherForm[text] === "Sometimes"
                              ? "orange"
                              : ""
                      }
                      className="mb-0"
                    >
                      {GetSingleForms?.teacherForm[text]}
                    </Tag>
                  </p>
                );
              },
            },
            {
              title: "Observer Response",
              dataIndex: "key",
              key: "key",
              render: (text, record) => {
                // Custom logic for manual values
                if (record.key === "Total Score") {
                  return (
                    <p className="mb-0">
                      {getSelfAssemnetScrore("observerForm")}
                    </p>
                  );
                }
                if (record.key === "Out Of") {
                  return (
                    <p className="mb-0">{getTotalScore("observerForm")}</p>
                  );
                }

                // Default behavior for other rows
                return (
                  <p className="mb-0">
                    <Tag
                      color={
                        GetSingleForms?.observerForm[text] === "Yes"
                          ? "green"
                          : GetSingleForms?.observerForm[text] === "No"
                            ? "red"
                            : GetSingleForms?.observerForm[text] === "Sometimes"
                              ? "orange"
                              : ""
                      }
                      className="mb-0"
                    >
                      {GetSingleForms?.observerForm[text]}
                    </Tag>
                  </p>
                );
              },
            },
          ]}
        />
      </div>

      <PDFViewer
        className="w-100 m-auto d-block mt-3"
        style={{ height: "100vh" }}
      >
        <MyDocument data={GetSingleForms} />
      </PDFViewer>
    </>
  );
}

export default Reader;
