import React, { useEffect, useMemo } from "react";
import { Box, Flex, Heading, Text, Stack, Button } from "@chakra-ui/react";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllWeeklyFrom } from "../../redux/userSlice";
import { UserRole } from "../../config/config";
import { getUserId } from "../../Utils/auth";
import SmartTable from "../../Components/SmartTable";
import { getWeeklyColumns } from "../../Components/SmartTable/tableColumns";

function Weely4Page() {
  const dispatch = useDispatch();
  const currentUserRole = getUserId()?.access;

  const CombinedData = useSelector((state) => state?.user?.getAllWeeklyFroms || []);
  const loading = useSelector((state) => state?.user?.loading || false);

  useEffect(() => {
    dispatch(getAllWeeklyFrom());
  }, [dispatch]);

  const columns = useMemo(
    () => getWeeklyColumns({ data: CombinedData, currentUserRole }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CombinedData, currentUserRole]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Weekly 4 Form
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage and view weekly assessment forms.
          </Text>
        </Box>

        <Stack direction="row" spacing={3}>
          {currentUserRole === UserRole[2] && (
            <Link to="/weekly4form/create">
              <Button
                leftIcon={<PlusCircleOutlined />}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
                transition="all 0.2s"
                px={6}
              >
                Fill New Form
              </Button>
            </Link>
          )}
          {currentUserRole === UserRole[1] && (
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
        </Stack>
      </Flex>

      <SmartTable
        title="All Weekly Forms"
        columns={columns}
        data={CombinedData}
        loading={loading}
        rowKey="_id"
        pageSize={10}
      />
    </Box>
  );
}

export default Weely4Page;
