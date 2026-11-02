import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Box, Flex, Heading, Text, Stack, Button } from "@chakra-ui/react";
import { PlusCircleOutlined } from "../../Components/UI/Icons";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllWeeklyFromAll } from "../../redux/userSlice";
import { UserRole } from "../../config/config";
import { getUserId } from "../../Utils/auth";
import SmartTable from "../../Components/SmartTable";
import { getWeeklyColumns } from "../../Components/SmartTable/tableColumns";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, useToast } from "@chakra-ui/react";
import { axiosInstanceToken } from "../../redux/instence";

function Weekly() {
  const dispatch = useDispatch();
  const { getAllWeeklyFroms, weeklyPagination, loading } = useSelector((state) => state.user);
  const location = useLocation();
  const currentPath = location.pathname;
  const currentUserRole = getUserId()?.access;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});

  const lastFetchedParamsRef = useRef("");

  const fetchWeeklyData = useCallback(
    (currentPage = page, currentLimit = pageSize, activeFilters = serverFilters) => {
      const params = {
        page: currentPage,
        limit: currentLimit,
        skip: (currentPage - 1) * currentLimit,
      };
      if (activeFilters.personName) {
        params.searchName = Array.isArray(activeFilters.personName)
          ? activeFilters.personName.join(",")
          : activeFilters.personName;
      }
      if (activeFilters.dateOfSubmission) {
        params.dateOfSubmission = activeFilters.dateOfSubmission;
      }
      if (activeFilters.date) {
        params.date = activeFilters.date;
      }
      if (
        activeFilters.isCompleted !== undefined &&
        activeFilters.isCompleted !== null &&
        activeFilters.isCompleted !== ""
      ) {
        params.isCompleted = activeFilters.isCompleted;
      }

      const paramKey = JSON.stringify(params);
      if (lastFetchedParamsRef.current === paramKey) return;
      lastFetchedParamsRef.current = paramKey;

      dispatch(getAllWeeklyFromAll(params));
    },
    [dispatch, page, pageSize, serverFilters]
  );

  useEffect(() => {
    fetchWeeklyData(page, pageSize, serverFilters);
  }, [fetchWeeklyData, page, pageSize, serverFilters]);

  const handlePageChange = useCallback(
    (newPage, newSize) => {
      const nextLimit = newSize || pageSize;
      setPage(newPage);
      if (newSize && newSize !== pageSize) {
        setPageSize(newSize);
      }
      fetchWeeklyData(newPage, nextLimit, serverFilters);
    },
    [fetchWeeklyData, pageSize, serverFilters]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setServerFilters(newFilters);
      setPage(1);
      fetchWeeklyData(1, pageSize, newFilters);
    },
    [fetchWeeklyData, pageSize]
  );

  const handleFetchAllForExport = useCallback(async () => {
    const params = { limit: "all" };
    if (serverFilters.personName) {
      params.searchName = Array.isArray(serverFilters.personName)
        ? serverFilters.personName.join(",")
        : serverFilters.personName;
    }
    if (serverFilters.dateOfSubmission) {
      params.dateOfSubmission = serverFilters.dateOfSubmission;
    }
    if (serverFilters.date) {
      params.date = serverFilters.date;
    }
    if (
      serverFilters.isCompleted !== undefined &&
      serverFilters.isCompleted !== null &&
      serverFilters.isCompleted !== ""
    ) {
      params.isCompleted = serverFilters.isCompleted;
    }

    const response = await axiosInstanceToken.get(`/weekly4Form/get/all`, { params });
    const result = response.data;
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  }, [serverFilters]);

  const tableData = useMemo(() => {
    if (!Array.isArray(getAllWeeklyFroms)) return [];
    return getAllWeeklyFroms.map((item) => ({ ...item, key: item._id }));
  }, [getAllWeeklyFroms]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await axiosInstanceToken.delete(`/weekly4Form/${deleteId}`);
      toast({
        title: "Form Deleted",
        description: "The form has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchWeeklyData(page, pageSize, serverFilters);
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete the form.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
      onClose();
    }
  };

  const columns = useMemo(
    () => getWeeklyColumns({ data: tableData, currentUserRole, onDelete: handleDeleteClick }),
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
        pageSize={pageSize}
        serverSide={true}
        pagination={weeklyPagination}
        totalRecords={weeklyPagination?.total || 0}
        page={page}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onFetchAllForExport={handleFetchAllForExport}
        downloadable={true}
        downloadFileName="weekly_monitoring"
      />
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this form? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isDeleting}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Weekly;
