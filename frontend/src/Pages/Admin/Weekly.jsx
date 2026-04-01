import React, { useEffect, useMemo } from "react";
import { Box, Flex, Heading, Text, Stack, Button } from "@chakra-ui/react";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllWeeklyFromAll } from "../../redux/userSlice";
import { UserRole } from "../../config/config";
import { getUserId } from "../../Utils/auth";
import SmartTable from "../../Components/SmartTable";
import { getWeeklyColumns } from "../../Components/SmartTable/tableColumns";

function Weekly() {
  const dispatch = useDispatch();
  const { getAllWeeklyFroms, loading } = useSelector((state) => state.user);
  const location = useLocation();
  const currentPath = location.pathname;
  const currentUserRole = getUserId()?.access;

  useEffect(() => {
    dispatch(getAllWeeklyFromAll());
  }, [dispatch]);

  const tableData = useMemo(() => {
    if (!Array.isArray(getAllWeeklyFroms)) return [];
    return [...getAllWeeklyFroms].reverse().map((item) => ({ ...item, key: item._id }));
  }, [getAllWeeklyFroms]);

  const columns = useMemo(
    () => getWeeklyColumns({ data: tableData, currentUserRole }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tableData, currentUserRole]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Weekly Monitoring Forms
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Track and manage weekly evaluations.
          </Text>
        </Box>

        <Stack direction="row" spacing={3}>
          {UserRole[1] === currentUserRole && currentPath !== "/reports" && (
            <Link to="/weekly4form/create?Initiate=true">
              <Button
                leftIcon={<PlusCircleOutlined />}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
                transition="all 0.2s"
                px={6}
              >
                Form Initiation
              </Button>
            </Link>
          )}
          {UserRole[2] === currentUserRole && (
            <Link to="/weekly4form/create">
              <Button
                leftIcon={<PlusCircleOutlined />}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
                transition="all 0.2s"
                px={6}
              >
                New Form
              </Button>
            </Link>
          )}
        </Stack>
      </Flex>

      <SmartTable
        title="All Weekly Forms"
        columns={columns}
        data={tableData}
        loading={loading}
        rowKey="_id"
        pageSize={10}
      />
    </Box>
  );
}

export default Weekly;
