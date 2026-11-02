import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Box, Flex, Heading, Text, Stack, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useToast } from "@chakra-ui/react";
import { PlusCircleOutlined } from "../../Components/UI/Icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GetcreatedBy,
  TeacherwalkthroughForms,
} from "../../redux/Form/classroomWalkthroughSlice";
import { UserRole } from "../../config/config";
import { getUserId } from "../../Utils/auth";
import SmartTable from "../../Components/SmartTable";
import { getClassroomColumns } from "../../Components/SmartTable/tableColumns";
import { axiosInstanceToken } from "../../redux/instence";

function ClassroomWalkthrough() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const Role = getUserId()?.access;
  const currentUserRole = Role;

  const { isLoading, GetForms, pagination, filterOptions } =
    useSelector((state) => state?.walkThroughForm) || {};

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});

  const lastFetchedParamsRef = useRef("");

  const fetchWalkthroughData = useCallback(
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
        activeFilters.isTeacherCompletes !== undefined &&
        activeFilters.isTeacherCompletes !== null &&
        activeFilters.isTeacherCompletes !== ""
      ) {
        params.isTeacherCompletes = activeFilters.isTeacherCompletes;
      }
      if (
        activeFilters.isObserverCompleted !== undefined &&
        activeFilters.isObserverCompleted !== null &&
        activeFilters.isObserverCompleted !== ""
      ) {
        params.isObserverCompleted = activeFilters.isObserverCompleted;
      }

      const paramKey = JSON.stringify({ ...params, role: Role });
      if (lastFetchedParamsRef.current === paramKey) return;
      lastFetchedParamsRef.current = paramKey;

      if (Role === UserRole[2]) {
        dispatch(TeacherwalkthroughForms(params));
      } else if (Role === UserRole[1]) {
        dispatch(GetcreatedBy(params));
      }
    },
    [dispatch, Role, page, pageSize, serverFilters]
  );

  useEffect(() => {
    fetchWalkthroughData(page, pageSize, serverFilters);
  }, [fetchWalkthroughData, page, pageSize, serverFilters]);

  const handlePageChange = useCallback(
    (newPage, newSize) => {
      const nextLimit = newSize || pageSize;
      setPage(newPage);
      if (newSize && newSize !== pageSize) {
        setPageSize(newSize);
      }
      fetchWalkthroughData(newPage, nextLimit, serverFilters);
    },
    [fetchWalkthroughData, pageSize, serverFilters]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setServerFilters(newFilters);
      setPage(1);
      fetchWalkthroughData(1, pageSize, newFilters);
    },
    [fetchWalkthroughData, pageSize]
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
      serverFilters.isTeacherCompletes !== undefined &&
      serverFilters.isTeacherCompletes !== null &&
      serverFilters.isTeacherCompletes !== ""
    ) {
      params.isTeacherCompletes = serverFilters.isTeacherCompletes;
    }
    if (
      serverFilters.isObserverCompleted !== undefined &&
      serverFilters.isObserverCompleted !== null &&
      serverFilters.isObserverCompleted !== ""
    ) {
      params.isObserverCompleted = serverFilters.isObserverCompleted;
    }

    const endpoint =
      Role === UserRole[2]
        ? "classroom-walkthrough/teachers/get"
        : "classroom-walkthrough/get";
    const response = await axiosInstanceToken.get(endpoint, { params });
    const result = response.data;
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  }, [Role, serverFilters]);

  const sortedData = useMemo(() => {
    if (!Array.isArray(GetForms)) return [];
    return [...GetForms].sort((a, b) =>
      a.isTeacherCompletes === b.isTeacherCompletes ? 0 : a.isTeacherCompletes ? 1 : -1
    );
  }, [GetForms]);

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
      await axiosInstanceToken.delete(`/classroom-walkthrough/delete/${deleteId}`);
      toast({
        title: "Form Deleted",
        description: "The form has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchWalkthroughData(page, pageSize, serverFilters);
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
    const baseCols = getClassroomColumns({
      data: GetForms || [],
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
  }, [GetForms, currentUserRole, filterOptions]);

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Classroom Walkthrough
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Review and manage ongoing evaluations.
          </Text>
        </Box>

        {Role === UserRole[1] && (
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
        title="Walkthrough Evaluations"
        columns={columns}
        data={sortedData}
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
        downloadFileName="classroom_walkthrough"
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

export default ClassroomWalkthrough;
