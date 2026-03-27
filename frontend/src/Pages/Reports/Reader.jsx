import React, { useEffect, useState } from "react";
import ReactPDF, { PDFViewer } from "@react-pdf/renderer";
import MyDocument from "./Documents/MyDocument";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetSingleFormsOne } from "../../redux/Form/fortnightlySlice";
import { Button, Spin, Table, Tag } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { Box, Flex, Heading, Image } from "@chakra-ui/react";
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
    <Box p={{ base: 4, md: 8 }} bg="gray.50" minH="100vh">
      <Box maxW="1200px" mx="auto" position="relative">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" color="gray.800">
            Fortnightly Monitor Report
          </Heading>
          <Button
            type="primary"
            size="large"
            onClick={downloadPDF}
            style={{ borderRadius: "8px", background: "#1a4d2e" }}
          >
            <DownloadOutlined /> Download PDF
          </Button>
        </Flex>

        {loading && (
          <Flex
            justify="center"
            align="center"
            position="absolute"
            inset={0}
            bg="whiteAlpha.800"
            zIndex={20}
            borderRadius="2xl"
          >
            <Spin size="large" />
          </Flex>
        )}

        <Flex
          justify="center"
          gap={8}
          mb={8}
          align="center"
          bg="white"
          p={6}
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Image
            src={Logo}
            w={{ base: "150px", sm: "100px" }}
            h="auto"
            alt="Logo"
          />
          <Image
            src={LogoBanner}
            w={{ base: "150px", sm: "300px" }}
            h="auto"
            alt="Logo Banner"
          />
        </Flex>

        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          overflow="hidden"
          mb={8}
        >
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
                    return (
                      <p className="mb-0">{getTotalScore("teacherForm")}</p>
                    );
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
                              : GetSingleForms?.teacherForm[text] ===
                                  "Sometimes"
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
                              : GetSingleForms?.observerForm[text] ===
                                  "Sometimes"
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
        </Box>

        <Box
          bg="white"
          p={6}
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Heading size="md" mb={6} color="gray.800">
            Print Preview
          </Heading>
          <Box
            borderRadius="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <PDFViewer
              style={{ width: "100%", height: "800px", border: "none" }}
            >
              <MyDocument data={GetSingleForms} />
            </PDFViewer>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Reader;
