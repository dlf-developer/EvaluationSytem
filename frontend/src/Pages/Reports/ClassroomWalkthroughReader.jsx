import ReactPDF, { PDFViewer } from "@react-pdf/renderer";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetWalkThroughForm } from "../../redux/Form/classroomWalkthroughSlice";
import MyDocument from "./Documents/MyDocument";
import WalkthroughDoc from "./Documents/WalkthroughDoc";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import { Box, Flex, Heading } from "@chakra-ui/react";
import TeacherWalkthroughshow from "./TeacherWalkthroughshow";

function ClassroomWalkthroughReader() {
  const Id = useParams().id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { formDataList, loading } = useSelector(
    (state) => state?.walkThroughForm,
  );

  const downloadPDF = async () => {
    const blob = await ReactPDF.pdf(
      <WalkthroughDoc data={formDataList} />,
    ).toBlob();
    const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `classroom-walkthrough-${Id}.pdf`;
    link.click();

    // Clean up the object URL
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    dispatch(GetWalkThroughForm(Id));
  }, []);

  return (
    <Box>
      <Box position="relative">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" color="gray.800">
            Classroom Walkthrough Report
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

        <TeacherWalkthroughshow />

        <Box
          bg="white"
          p={6}
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          mt={8}
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
              <WalkthroughDoc data={formDataList} />
            </PDFViewer>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ClassroomWalkthroughReader;
