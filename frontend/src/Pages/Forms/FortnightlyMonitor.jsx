import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Box, Flex, Heading, Text, Stack, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useToast } from "@chakra-ui/react";
import { PlusCircleOutlined } from "../../Components/UI/Icons";
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
import { axiosInstanceToken } from "../../redux/instence";

function FortnightlyMonitor() {
  const Role = getUserId()?.access;
  const currentUserRole = Role;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { getAllForms, loading, pagination, filterOptions } =
    useSelector((state) => state?.Forms) || {};
  const CombinedData = getAllForms || [];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});
  const [serverSort, setServerSort] = useState({ key: null, direction: null });

  const lastFetchedParamsRef = useRef("");

  const fetchFortnightlyData = useCallback(
    (
      currentPage = page,
      currentLimit = pageSize,
      activeFilters = serverFilters,
      activeSort = serverSort
    ) => {
      const params = {
        page: currentPage,
        limit: currentLimit,
        skip: (currentPage - 1) * currentLimit,
      };
      if (activeSort?.key && activeSort?.direction) {
        params.sortBy = activeSort.key;
        params.sortOrder = activeSort.direction;
      }
      if (activeFilters.className) {
        params.className = Array.isArray(activeFilters.className)
          ? activeFilters.className.join(",")
          : activeFilters.className;
      }
      if (activeFilters.section) {
        params.section = Array.isArray(activeFilters.section)
          ? activeFilters.section.join(",")
          : activeFilters.section;
      }
      if (activeFilters.teacherName) {
        params.teacherName = Array.isArray(activeFilters.teacherName)
          ? activeFilters.teacherName.join(",")
          : activeFilters.teacherName;
      }
      if (activeFilters.observerName) {
        params.observerName = Array.isArray(activeFilters.observerName)
          ? activeFilters.observerName.join(",")
          : activeFilters.observerName;
      }
      if (activeFilters.personName) {
        params.searchName = Array.isArray(activeFilters.personName)
          ? activeFilters.personName.join(",")
          : activeFilters.personName;
      }
      if (activeFilters.observationDate) {
        params.date = activeFilters.observationDate;
      }
      if (
        activeFilters.isTeacherComplete !== undefined &&
        activeFilters.isTeacherComplete !== null &&
        activeFilters.isTeacherComplete !== ""
      ) {
        params.isTeacherComplete = activeFilters.isTeacherComplete;
      }
      if (
        activeFilters.isCoordinatorComplete !== undefined &&
        activeFilters.isCoordinatorComplete !== null &&
        activeFilters.isCoordinatorComplete !== ""
      ) {
        params.isCoordinatorComplete = activeFilters.isCoordinatorComplete;
      }

      const paramKey = JSON.stringify({ ...params, role: Role });
      if (lastFetchedParamsRef.current === paramKey) return;
      lastFetchedParamsRef.current = paramKey;

      if (Role === UserRole[1]) {
        dispatch(GetObserverFormsOne(params));
      } else if (Role === UserRole[2]) {
        dispatch(GetFormsOne(params));
      }
    },
    [dispatch, Role, page, pageSize, serverFilters, serverSort]
  );

  useEffect(() => {
    fetchFortnightlyData(page, pageSize, serverFilters, serverSort);
  }, [fetchFortnightlyData, page, pageSize, serverFilters, serverSort]);

  const handlePageChange = useCallback(
    (newPage, newSize) => {
      const nextLimit = newSize || pageSize;
      setPage(newPage);
      if (newSize && newSize !== pageSize) {
        setPageSize(newSize);
      }
      fetchFortnightlyData(newPage, nextLimit, serverFilters, serverSort);
    },
    [fetchFortnightlyData, pageSize, serverFilters, serverSort]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setServerFilters(newFilters);
      setPage(1);
      fetchFortnightlyData(1, pageSize, newFilters, serverSort);
    },
    [fetchFortnightlyData, pageSize, serverSort]
  );

  const handleSortChange = useCallback(
    (newSort) => {
      setServerSort(newSort);
      setPage(1);
      fetchFortnightlyData(1, pageSize, serverFilters, newSort);
    },
    [fetchFortnightlyData, pageSize, serverFilters]
  );

  const handleFetchAllForExport = useCallback(async () => {
    const params = { limit: "all" };
    if (serverFilters.className) {
      params.className = Array.isArray(serverFilters.className)
        ? serverFilters.className.join(",")
        : serverFilters.className;
    }
    if (serverFilters.section) {
      params.section = Array.isArray(serverFilters.section)
        ? serverFilters.section.join(",")
        : serverFilters.section;
    }
    if (serverFilters.teacherName) {
      params.teacherName = Array.isArray(serverFilters.teacherName)
        ? serverFilters.teacherName.join(",")
        : serverFilters.teacherName;
    }
    if (serverFilters.observerName) {
      params.observerName = Array.isArray(serverFilters.observerName)
        ? serverFilters.observerName.join(",")
        : serverFilters.observerName;
    }
    if (serverFilters.personName) {
      params.searchName = Array.isArray(serverFilters.personName)
        ? serverFilters.personName.join(",")
        : serverFilters.personName;
    }
    if (serverFilters.observationDate) {
      params.date = serverFilters.observationDate;
    }
    if (
      serverFilters.isTeacherComplete !== undefined &&
      serverFilters.isTeacherComplete !== null &&
      serverFilters.isTeacherComplete !== ""
    ) {
      params.isTeacherComplete = serverFilters.isTeacherComplete;
    }
    if (
      serverFilters.isCoordinatorComplete !== undefined &&
      serverFilters.isCoordinatorComplete !== null &&
      serverFilters.isCoordinatorComplete !== ""
    ) {
      params.isCoordinatorComplete = serverFilters.isCoordinatorComplete;
    }

    const endpoint =
      Role === UserRole[1]
        ? "/form/fortnightly-monitor/oberver/get"
        : "/form/fortnightly-monitor";
    const response = await axiosInstanceToken.get(endpoint, { params });
    const result = response.data;
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  }, [Role, serverFilters]);

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
      await axiosInstanceToken.delete(`/form/fortnightly-monitor/delete/${deleteId}`);
      toast({
        title: "Form Deleted",
        description: "The form has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchFortnightlyData(page, pageSize, serverFilters);
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

  const columns = useMemo(() => {
    const baseCols = getFortnightlyColumns({
      data: CombinedData,
      currentUserRole,
      onDelete: handleDeleteClick,
    });
    return baseCols.map((col) => {
      if (col.key === "className" && filterOptions?.classes?.length > 0) {
        return {
          ...col,
          filterConfig: {
            ...col.filterConfig,
            options: filterOptions.classes,
          },
        };
      }
      if (col.key === "section" && filterOptions?.sections?.length > 0) {
        return {
          ...col,
          filterConfig: {
            ...col.filterConfig,
            options: filterOptions.sections,
          },
        };
      }
      return col;
    });
  }, [CombinedData, currentUserRole, filterOptions]);

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
            Review and manage ongoing Fortnightly Monitor submissions.
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
              New Form
            </Button>
          )}
          {Role === UserRole[1] && (
            <Button
              leftIcon={<PlusCircleOutlined />}
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              onClick={() => navigate("/fortnightly-monitor/form-initiation")}
              px={6}
            >
              Form Initiation
            </Button>
          )}
        </Stack>
      </Flex>

      <SmartTable
        title="Fortnightly Monitor Evaluations"
        columns={columns}
        data={sortedData}
        loading={loading}
        rowKey="_id"
        pageSize={pageSize}
        serverSide={true}
        pagination={pagination}
        totalRecords={pagination?.total || 0}
        page={page}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onFetchAllForExport={handleFetchAllForExport}
        downloadable
        downloadFileName="fortnightly_monitor"
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

export default FortnightlyMonitor;
