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
import { getNootbookForms } from "../../../redux/Form/noteBookSlice";
import { getCreateClassSection } from "../../../redux/userSlice";
import SmartTable from "../../../Components/SmartTable";
import { getReportForm3Columns } from "../../../Components/SmartTable/tableColumns";

function FormThreeReport() {
  const dispatch = useDispatch();
  const currentUserRole = getUserId()?.access;
  const [classes, setClasses] = useState([]);

  const { GetForms2, pagination, filterOptions, isLoading } =
    useSelector((state) => state?.notebook) || {};

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});

  useEffect(() => {
    dispatch(getCreateClassSection()).then((res) => {
      if (res?.payload?.success && Array.isArray(res?.payload?.classDetails)) {
        setClasses(res.payload.classDetails);
      }
    });
  }, [dispatch]);

  const lastFetchedParamsRef = useRef("");

  const fetchNotebookData = useCallback(
    (currentPage = page, currentLimit = pageSize, activeFilters = serverFilters) => {
      const params = {
        page: currentPage,
        limit: currentLimit,
        skip: (currentPage - 1) * currentLimit,
      };
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
      if (activeFilters.subject) {
        params.subject = Array.isArray(activeFilters.subject)
          ? activeFilters.subject.join(",")
          : activeFilters.subject;
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
        activeFilters.isObserverComplete !== undefined &&
        activeFilters.isObserverComplete !== null &&
        activeFilters.isObserverComplete !== ""
      ) {
        params.isObserverComplete = activeFilters.isObserverComplete;
      }
      if (
        activeFilters.isReflation !== undefined &&
        activeFilters.isReflation !== null &&
        activeFilters.isReflation !== ""
      ) {
        params.isReflation = activeFilters.isReflation;
      }

      const paramKey = JSON.stringify(params);
      if (lastFetchedParamsRef.current === paramKey) return;
      lastFetchedParamsRef.current = paramKey;

      dispatch(getNootbookForms(params));
    },
    [dispatch, page, pageSize, serverFilters]
  );

  useEffect(() => {
    fetchNotebookData(page, pageSize, serverFilters);
  }, [fetchNotebookData, page, pageSize, serverFilters]);

  const handlePageChange = useCallback(
    (newPage, newSize) => {
      const nextLimit = newSize || pageSize;
      setPage(newPage);
      if (newSize && newSize !== pageSize) {
        setPageSize(newSize);
      }
      fetchNotebookData(newPage, nextLimit, serverFilters);
    },
    [fetchNotebookData, pageSize, serverFilters]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setServerFilters(newFilters);
      setPage(1);
      fetchNotebookData(1, pageSize, newFilters);
    },
    [fetchNotebookData, pageSize]
  );

  // Fetch all filtered records from the server for standard or custom Excel export
  const handleFetchAllForExport = useCallback(async () => {
    const params = {
      limit: "all",
    };
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
    if (serverFilters.subject) {
      params.subject = Array.isArray(serverFilters.subject)
        ? serverFilters.subject.join(",")
        : serverFilters.subject;
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
      serverFilters.isObserverComplete !== undefined &&
      serverFilters.isObserverComplete !== null &&
      serverFilters.isObserverComplete !== ""
    ) {
      params.isObserverComplete = serverFilters.isObserverComplete;
    }
    if (
      serverFilters.isReflation !== undefined &&
      serverFilters.isReflation !== null &&
      serverFilters.isReflation !== ""
    ) {
      params.isReflation = serverFilters.isReflation;
    }

    const response = await axiosInstanceToken.get(
      "notebook-checking-proforma/get-all",
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

  const rawData = GetForms2 || [];
  const data = useMemo(() => {
    if (!Array.isArray(rawData)) return [];
    return rawData.map((item) => {
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
          className: currentClass || "N/A",
        },
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
      await axiosInstanceToken.delete(`/notebook-checking-proforma/delete/${deleteId}`);
      toast({
        title: "Form Deleted",
        description: "The form has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchNotebookData(page, pageSize, serverFilters);
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
    const baseCols = getReportForm3Columns({
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
        title="Notebook Checking Proforma — All Records"
        columns={columns}
        data={data}
        loading={isLoading}
        rowKey="_id"
        pageSize={pageSize}
        serverSide={true}
        pagination={pagination}
        totalRecords={pagination?.total || 0}
        page={page}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onFetchAllForExport={handleFetchAllForExport}
        downloadable
        downloadFileName="notebook_checking"
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

export default FormThreeReport;
