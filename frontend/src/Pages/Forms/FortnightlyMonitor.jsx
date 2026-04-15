import React, { useEffect, useMemo } from "react";
import { Box, Flex, Heading, Text, Stack, Button } from "@chakra-ui/react";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  GetFormsOne,
  GetObserverFormsOne,
} from "../../redux/Form/fortnightlySlice";
import { UserRole } from "../../config/config";
import { getUserId } from "../../Utils/auth";
import SmartTable from "../../Components/SmartTable";
import { getFortnightlyColumns } from "../../Components/SmartTable/tableColumns";

function FortnightlyMonitor() {
  const Role = getUserId()?.access;
  const currentUserRole = Role;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (Role === UserRole[1]) dispatch(GetObserverFormsOne());
    else if (Role === UserRole[2]) dispatch(GetFormsOne());
  }, [dispatch, Role]);

  const CombinedData = useSelector(
    (state) => state?.Forms?.getAllForms?.Combined || []
  );
  const loading = useSelector((state) => state?.Forms?.loading || false);

  const columns = useMemo(
    () => getFortnightlyColumns({ data: CombinedData, currentUserRole }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CombinedData, currentUserRole]
  );

  const sortedData = useMemo(
    () =>
      [...CombinedData].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [CombinedData]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Fortnightly Monitor
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Monitor and evaluate teacher performance periodically.
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
              onClick={() => navigate("/fortnightly-monitor/create")}
              px={6}
            >
              Fill New Form
            </Button>
          )}
          {Role === UserRole[1] && (
            <Link to="/fortnightly-monitor/form-initiation">
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
        </Stack>
      </Flex>

      <SmartTable
        title="All Forms"
        columns={columns}
        data={sortedData}
        loading={loading}
        rowKey="_id"
        pageSize={10}
      />
    </Box>
  );
}

export default FortnightlyMonitor;
