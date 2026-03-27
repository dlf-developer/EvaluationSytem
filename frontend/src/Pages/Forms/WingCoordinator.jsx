import React, { useEffect } from "react";
import { getUserId } from "../../Utils/auth";
import { Button, Card, Table } from "antd";
import { UserRole } from "../../config/config";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createWingForm, GetWingFrom } from "../../redux/userSlice";
import { Box, Flex, Heading, Text, Tag, Stack } from "@chakra-ui/react";

function WingCoordinator() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const id = getUserId()?.id;
  const { getWingFormlist, loading } = useSelector((state) => state?.user);

  useEffect(() => {
    dispatch(GetWingFrom(id));
  }, []);

  const createFrom = async () => {
    const res = await dispatch(createWingForm()).unwrap();
    if (res?.success) navigate(`/wing-coordinator/${res?.data?._id}`);
  };
  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        flexWrap="wrap"
        gap={4}
      >
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Wing Coordinator Forms
          </Heading>
          <Text color="gray.500">Manage and view all coordinated forms.</Text>
        </Box>
        {getUserId().access === UserRole[1] && (
          <Button
            leftIcon={<PlusCircleOutlined />}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.text", transform: "translateY(-2px)" }}
            onClick={() => createFrom()}
            px={6}
          >
            Fill New Form
          </Button>
        )}
      </Flex>

      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        p={6}
        w="100%"
        overflowX="auto"
      >
        <Table
          columns={[
            {
              title: "Name Of Observer",
              dataIndex: "userId",
              key: "userId",
              width: "160px",
              sorter: (a, b) =>
                (a?.userId?.name || "").localeCompare(b?.userId?.name || ""),
              render: (user) => <span>{user?.name || "N/A"}</span>,
            },
            {
              title: "Class Name",
              dataIndex: "className",
              key: "className",
              width: "160px",
              sorter: (a, b) =>
                (a?.className || "").localeCompare(b?.className || ""),
              render: (user, b) => <span>{user || "N/A"}</span>,
            },
            {
              title: "Status",
              dataIndex: "isComplete",
              key: "isComplete",
              width: "160px",
              filters: [
                { text: "Completed", value: true },
                { text: "Not Completed", value: false },
              ],
              onFilter: (value, record) => record.isComplete === value,
              render: (isComplete) => (
                <Tag
                  colorScheme={isComplete ? "green" : "red"}
                  variant="subtle"
                  px={3}
                  py={1}
                >
                  {isComplete ? "COMPLETED" : "NOT COMPLETED"}
                </Tag>
              ),
            },
            {
              title: "Visibility Status",
              dataIndex: "isDraft",
              key: "isDraft",
              width: "160px",
              filters: [
                { text: "Draft", value: true },
                { text: "Published", value: false },
              ],
              onFilter: (value, record) => record.isDraft === value,
              render: (isDraft, record) => (
                <Tag
                  colorScheme={isDraft && !record?.isComplete ? "red" : "green"}
                  variant="subtle"
                  px={3}
                  py={1}
                >
                  {isDraft && !record?.isComplete ? "DRAFT" : "PUBLISHED"}
                </Tag>
              ),
            },
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              width: "200px",
              render: (_, record) => {
                const { isDraft, isComplete } = record;
                return (
                  <Stack direction="row" spacing={2}>
                    {isDraft && !isComplete && (
                      <Link to={`/wing-coordinator/${record._id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="brand"
                          color="brand.primary"
                          _hover={{ bg: "brand.background" }}
                        >
                          Continue Form
                        </Button>
                      </Link>
                    )}
                    {!isDraft && isComplete && (
                      <>
                        <Link to={`/wing-coordinator/report/${record._id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="brand"
                            color="brand.primary"
                            _hover={{ bg: "brand.background" }}
                          >
                            View Report
                          </Button>
                        </Link>
                        <Link to={`/fortnightly-monitor/edit/${record._id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            color="red.600"
                            _hover={{ bg: "red.50" }}
                          >
                            Edit
                          </Button>
                        </Link>
                      </>
                    )}
                  </Stack>
                );
              },
            },
          ]}
          dataSource={getWingFormlist?.data}
          scroll={{ y: "calc(100vh - 400px)", x: "max-content" }}
          pagination={false}
          rowKey={"_id"}
        />
      </Box>
    </Box>
  );
}

export default WingCoordinator;
