import React, { useEffect, useMemo } from "react";
import { Box, Flex, Heading, Text, Stack, Button } from "@chakra-ui/react";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { GetAllClassRoomForms } from "../../redux/Form/classroomWalkthroughSlice";
import { getUserId } from "../../Utils/auth";
import { UserRole } from "../../config/config";
import SmartTable from "../../Components/SmartTable";
import { getClassroomColumns } from "../../Components/SmartTable/tableColumns";

function ClassRoom() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const currentPath = location.pathname;
  const Role = getUserId().access;
  const currentUserRole = Role;

  const { isLoading, GetForms } = useSelector((state) => state?.walkThroughForm);

  useEffect(() => {
    dispatch(GetAllClassRoomForms());
  }, [dispatch, Role]);

  const sortedData = useMemo(() => {
    if (!Array.isArray(GetForms)) return [];
    return [...GetForms].sort((a, b) =>
      a.isTeacherCompletes === b.isTeacherCompletes ? 0 : a.isTeacherCompletes ? 1 : -1
    );
  }, [GetForms]);

  const columns = useMemo(
    () => getClassroomColumns({ data: GetForms || [], currentUserRole }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [GetForms, currentUserRole]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Classroom Walkthrough
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage, filter, and review all classroom walkthrough evaluations.
          </Text>
        </Box>

        {Role === UserRole[1] && currentPath !== "/reports" && (
          <Button
            leftIcon={<PlusCircleOutlined />}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
            transition="all 0.2s"
            onClick={() => navigate("/classroom-walkthrough/create")}
            px={6}
          >
            Fill New Form
          </Button>
        )}
      </Flex>

      <SmartTable
        title="All Walkthrough Forms"
        columns={columns}
        data={sortedData}
        loading={isLoading}
        rowKey="_id"
        pageSize={10}
      />
    </Box>
  );
}

export default ClassRoom;
