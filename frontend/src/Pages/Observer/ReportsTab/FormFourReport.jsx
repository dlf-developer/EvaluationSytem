import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllWeeklyFromAll } from "../../../redux/userSlice";
import SmartTable from "../../../Components/SmartTable";
import { getReportForm4Columns } from "../../../Components/SmartTable/tableColumns";
import { Box, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useToast } from "@chakra-ui/react";
import { axiosInstanceToken } from "../../../redux/instence";
import { getUserId } from "../../../Utils/auth";

function FormFourReport() {
  const dispatch = useDispatch();
  const { getAllWeeklyFroms, weeklyPagination, loading } = useSelector((state) => state.user);
  const data = useSelector((state) => state?.user?.getAllWeeklyFroms || []);
  const currentUserRole = getUserId()?.access;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});
  const [serverSort, setServerSort] = useState({ key: null, direction: null });

  const lastFetchedParamsRef = useRef("");

  const fetchWeeklyData = useCallback(
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
    [dispatch, page, pageSize, serverFilters, serverSort]
  );

  useEffect(() => {
    fetchWeeklyData(page, pageSize, serverFilters, serverSort);
  }, [fetchWeeklyData, page, pageSize, serverFilters, serverSort]);

  const handlePageChange = useCallback(
    (newPage, newSize) => {
      const nextLimit = newSize || pageSize;
      setPage(newPage);
      if (newSize && newSize !== pageSize) {
        setPageSize(newSize);
      }
      fetchWeeklyData(newPage, nextLimit, serverFilters, serverSort);
    },
    [fetchWeeklyData, pageSize, serverFilters, serverSort]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setServerFilters(newFilters);
      setPage(1);
      fetchWeeklyData(1, pageSize, newFilters, serverSort);
    },
    [fetchWeeklyData, pageSize, serverSort]
  );

  const handleSortChange = useCallback(
    (newSort) => {
      setServerSort(newSort);
      setPage(1);
      fetchWeeklyData(1, pageSize, serverFilters, newSort);
    },
    [fetchWeeklyData, pageSize, serverFilters]
  );

  const handleFetchAllForExport = useCallback(async () => {
    const params = { limit: "all" };
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
    () => getReportForm4Columns({ data, currentUserRole, onDelete: handleDeleteClick }),
    [data, currentUserRole]
  );

  return (
    <Box>
      <SmartTable
        title="Weekly 4 Form — All Records"
        columns={columns}
        data={data}
        loading={loading}
        rowKey={(r) => r._id || Math.random()}
        pageSize={pageSize}
        serverSide={true}
        pagination={weeklyPagination}
        totalRecords={weeklyPagination?.total || 0}
        page={page}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onFetchAllForExport={handleFetchAllForExport}
        downloadable
        downloadFileName="weekly4_forms"
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

export default FormFourReport;
