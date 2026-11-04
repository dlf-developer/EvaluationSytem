import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
} from "@chakra-ui/react";
import { axiosInstanceToken } from "../../../redux/instence";
import { getUserId } from "../../../Utils/auth";
import { GetAllFormsForAdmin } from "../../../redux/Form/fortnightlySlice";
import { getCreateClassSection } from "../../../redux/userSlice";
import { calculateScore } from "../../../Utils/calculateScore";
import SmartTable from "../../../Components/SmartTable";
import { getReportForm1Columns } from "../../../Components/SmartTable/tableColumns";

function FormOneReport() {
  const dispatch = useDispatch();
  const currentUserRole = getUserId()?.access;
  const [classes, setClasses] = useState([]);

  const { getAllAdminForms, getAllForms, loading, pagination, filterOptions } =
    useSelector((state) => state?.Forms) || {};
  const rawData = getAllAdminForms?.length ? getAllAdminForms : (getAllForms || []);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});
  const [serverSort, setServerSort] = useState({ key: null, direction: null });

  useEffect(() => {
    dispatch(getCreateClassSection()).then((res) => {
      if (res?.payload?.success && Array.isArray(res?.payload?.classDetails)) {
        setClasses(res.payload.classDetails);
      }
    });
  }, [dispatch]);

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

      const paramKey = JSON.stringify(params);
      if (lastFetchedParamsRef.current === paramKey) return;
      lastFetchedParamsRef.current = paramKey;

      dispatch(GetAllFormsForAdmin(params));
    },
    [dispatch, page, pageSize, serverFilters, serverSort]
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

    const response = await axiosInstanceToken.get(
      "/form/fortnightly-monitor/get/all",
      { params }
    );
    const result = response.data;
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  }, [serverFilters]);

  const classMap = useMemo(() => {
    const map = {};
    classes.forEach((c) => {
      if (c?._id && c?.className) {
        map[c._id] = c.className;
      }
    });
    return map;
  }, [classes]);

  const data = useMemo(() => {
    const scored = calculateScore(rawData);
    if (!Array.isArray(scored)) return [];
    return scored.map((item) => {
      let currentClass = item?.className;
      if (typeof currentClass === "object" && currentClass !== null) {
        currentClass = currentClass?.className || currentClass?.name || "";
      }
      if (currentClass && classMap[currentClass]) {
        currentClass = classMap[currentClass];
      }
      return {
        ...item,
        className: currentClass || "—",
      };
    });
  }, [rawData, classMap]);

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
    const baseCols = getReportForm1Columns({
      data,
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
  }, [data, currentUserRole, filterOptions]);

  return (
    <Box>
      <SmartTable
        title="Fortnightly Monitor — All Records"
        columns={columns}
        data={data}
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

export default FormOneReport;
