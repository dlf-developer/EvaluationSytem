import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getAllWeeklyFromById } from "../../redux/userSlice";
import { message, Table, Tag } from "antd";
import { Box, Flex, Heading, Text, VStack, SimpleGrid } from "@chakra-ui/react";

function Weekly4FormReport() {
  const [formData, setFormData] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formId = useParams()?.id;

  useEffect(() => {
    if (!formId) {
      navigate("/weekly4form");
      return;
    }

    let isMounted = true; // Prevent updates if the component unmounts
    const fetchData = async () => {
      try {
        const response = await dispatch(getAllWeeklyFromById(formId));
        if (isMounted) {
          if (response?.payload?.success) {
            setFormData(response.payload.form);
          } else {
            message.error(response?.payload?.message);
            navigate("/weekly4form");
          }
        }
      } catch (error) {
        message.error("Error fetching form data:", error);
        if (isMounted) navigate("/weekly4form");
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup flag on component unmount
    };
  }, [dispatch, formId, navigate]);

  if (!formData) {
    return <div>Loading Weekly4FormReport...</div>;
  }

  const observerDetails = formData?.isInitiated?.Observer || {};
  const tableColumns = [
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
    },
    {
      title: "Answer",
      dataIndex: "answer",
      key: "answer",
      render: (answer, record) =>
        record?.sections ? (
          <>
            {record?.sections?.map((item) => (
              <Tag color={item?.answer === "Yes" ? "green" : "red"}>
                {item?.answer}
              </Tag>
            ))}
          </>
        ) : (
          <Tag color={answer === "Yes" ? "green" : "red"}>{answer}</Tag>
        ),
    },
    {
      title: "Class Name",
      dataIndex: "section",
      key: "section",
      render: (classId, record) =>
        record?.sections ? (
          <>
            {record?.sections?.map((item) => (
              <p className="text-nowrap">
                {item?.className} / {item?.section}
              </p>
            ))}
          </>
        ) : (
          <Text>{classId}</Text>
        ),
    },
    {
      title: "Additional Info",
      dataIndex: "textArea",
      key: "textArea",
      render: (text) => <span>{text || <Tag color="yellow">N/A</Tag>}</span>,
    },
  ];

  return (
    <Box p={{ base: 4, md: 8 }} bg="gray.50" minH="100vh">
      <Box maxW="1200px" mx="auto">
        <VStack spacing={6} align="stretch">
          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Heading size="lg" color="gray.800">
              Weekly Form Report
            </Heading>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Heading size="md" color="gray.800" mb={4}>
                Observer Details
              </Heading>
              <VStack align="start" spacing={2}>
                <Text>
                  <Text as="span" fontWeight="600" color="gray.700">
                    Name:{" "}
                  </Text>
                  {observerDetails.name}
                </Text>
                <Text>
                  <Text as="span" fontWeight="600" color="gray.700">
                    Email:{" "}
                  </Text>
                  {observerDetails.email}
                </Text>
                <Text>
                  <Text as="span" fontWeight="600" color="gray.700">
                    Mobile:{" "}
                  </Text>
                  {observerDetails.mobile}
                </Text>
                <Text>
                  <Text as="span" fontWeight="600" color="gray.700">
                    Designation:{" "}
                  </Text>
                  {observerDetails.designation}
                </Text>
                <Text>
                  <Text as="span" fontWeight="600" color="gray.700">
                    Coordinator:{" "}
                  </Text>
                  {observerDetails.coordinator}
                </Text>
              </VStack>
            </Box>

            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Heading size="md" color="gray.800" mb={4}>
                Form Details
              </Heading>
              <VStack align="start" spacing={2}>
                <Text>
                  <Text as="span" fontWeight="600" color="gray.700">
                    Date:{" "}
                  </Text>
                  {new Date(formData.date).toLocaleDateString()}
                </Text>
                <Text>
                  <Text as="span" fontWeight="600" color="gray.700">
                    Submission Date:{" "}
                  </Text>
                  {new Date(formData.dateOfSubmission).toLocaleDateString()}
                </Text>
                <Text>
                  <Text as="span" fontWeight="600" color="gray.700">
                    Completed:{" "}
                  </Text>
                  <Tag color={formData.isCompleted ? "green" : "orange"}>
                    {formData.isCompleted ? "Yes" : "No"}
                  </Tag>
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>

          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Heading size="md" color="gray.800" mb={6}>
              Responses
            </Heading>
            <Box
              overflowX="auto"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Table
                dataSource={formData.FormData}
                columns={tableColumns}
                rowKey={(record) => record.question}
                pagination={false}
              />
            </Box>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

export default Weekly4FormReport;
