import React, { useEffect, useMemo } from "react";
import { Box, Flex, Heading, Text, Stack, Button } from "@chakra-ui/react";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GetcreatedByUser,
  GetobserverForms,
} from "../../redux/Form/noteBookSlice";
import { getUserId } from "../../Utils/auth";
import { UserRole } from "../../config/config";
import SmartTable from "../../Components/SmartTable";
import { getNotebookColumns } from "../../Components/SmartTable/tableColumns";

function Notebook() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const Role = getUserId().access;
  const currentUserRole = Role;

  const CombinedData = useSelector((state) => state?.notebook?.GetForms2 || []);
  const { isLoading } = useSelector((state) => state?.notebook);

  useEffect(() => {
    if (Role === UserRole[1]) dispatch(GetobserverForms());
    else dispatch(GetcreatedByUser());
  }, [dispatch, Role]);

  const sortedData = useMemo(() => {
    if (!Array.isArray(CombinedData)) return [];
    return [...CombinedData].sort((a, b) =>
      a.isObserverComplete === b.isObserverComplete
        ? 0
        : a.isObserverComplete
        ? 1
        : -1
    );
  }, [CombinedData]);

  const columns = useMemo(
    () => getNotebookColumns({ data: CombinedData, currentUserRole }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CombinedData, currentUserRole]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Notebook Checking Proforma
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage and view notebook evaluation forms.
          </Text>
        </Box>

        <Stack direction="row" spacing={3}>
          {Role === UserRole[2] && (
            <Button
              leftIcon={<PlusCircleOutlined />}
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              onClick={() => navigate("/notebook-checking-proforma/create")}
              px={6}
            >
              Fill New Form
            </Button>
          )}
          {Role === UserRole[1] && (
            <Button
              leftIcon={<PlusCircleOutlined />}
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              onClick={() => navigate("/notebook-checking-proforma/form-initiation")}
              px={6}
            >
              Form Initiation
            </Button>
          )}
        </Stack>
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

export default Notebook;
