import React, { useEffect, useMemo } from "react";
import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getNootbookForms } from "../../redux/Form/noteBookSlice";
import { getUserId } from "../../Utils/auth";
import { UserRole } from "../../config/config";
import SmartTable from "../../Components/SmartTable";
import { getNotebookColumns } from "../../Components/SmartTable/tableColumns";

function NoteBook() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const Role = getUserId().access;
  const currentUserRole = Role;

  const { GetForms2, isLoading } = useSelector((state) => state?.notebook) || {};

  useEffect(() => {
    dispatch(getNootbookForms());
  }, [dispatch]);

  const sortedData = useMemo(() => {
    if (!Array.isArray(GetForms2)) return [];
    return [...GetForms2].sort((a, b) =>
      a.isObserverComplete === b.isObserverComplete
        ? 0
        : a.isObserverComplete
        ? 1
        : -1
    );
  }, [GetForms2]);

  const columns = useMemo(
    () => getNotebookColumns({ data: GetForms2 || [], currentUserRole }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [GetForms2, currentUserRole]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Notebook Checking Proforma
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage, filter, and review all notebook checking evaluations.
          </Text>
        </Box>

        {Role === UserRole[2] && (
          <Button
            leftIcon={<PlusCircleOutlined />}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
            transition="all 0.2s"
            onClick={() => navigate("/NoteBook-checking-proforma/create")}
            px={6}
          >
            Fill New Form
          </Button>
        )}
      </Flex>

      <SmartTable
        title="All Notebook Forms"
        columns={columns}
        data={sortedData}
        loading={isLoading}
        rowKey="_id"
        pageSize={10}
      />
    </Box>
  );
}

export default NoteBook;
