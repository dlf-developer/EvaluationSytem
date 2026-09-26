import React, { useEffect, useMemo, useState } from "react";
import { Box, Flex, Heading, Text, Stack, Button } from "@chakra-ui/react";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { GetAllClassRoomForms } from "../../redux/Form/classroomWalkthroughSlice";
import { getCreateClassSection } from "../../redux/userSlice";
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
  const [classes, setClasses] = useState([]);

  const { isLoading, GetForms } = useSelector((state) => state?.walkThroughForm);

  useEffect(() => {
    dispatch(GetAllClassRoomForms());
    dispatch(getCreateClassSection()).then((res) => {
      if (res?.payload?.success && Array.isArray(res?.payload?.classDetails)) {
        setClasses(res.payload.classDetails);
      }
    });
  }, [dispatch, Role]);

  const classMap = useMemo(() => {
    const map = {};
    classes.forEach((c) => {
      if (c?._id && c?.className) {
        map[c._id] = c.className;
      }
    });
    return map;
  }, [classes]);

  const resolvedForms = useMemo(() => {
    if (!Array.isArray(GetForms)) return [];
    return GetForms.map((item) => {
      let currentClass = item?.grenralDetails?.className;
      if (typeof currentClass === "object" && currentClass !== null) {
        currentClass = currentClass?.className || currentClass?.name || "";
      }
      if (currentClass && classMap[currentClass]) {
        currentClass = classMap[currentClass];
      }
      return {
        ...item,
        grenralDetails: {
          ...item?.grenralDetails,
          className: currentClass || "—",
        },
      };
    });
  }, [GetForms, classMap]);

  const sortedData = useMemo(() => {
    return [...resolvedForms].sort((a, b) =>
      a.isTeacherCompletes === b.isTeacherCompletes ? 0 : a.isTeacherCompletes ? 1 : -1
    );
  }, [resolvedForms]);

  const columns = useMemo(
    () => getClassroomColumns({ data: resolvedForms, currentUserRole }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedForms, currentUserRole]
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
