import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Stack,
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
import { PlusCircleOutlined } from "../../Components/UI/Icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GetcreatedByCoScholastic,
  TeacherCoScholasticForms,
  DeleteCoScholasticForm,
} from "../../redux/Form/coScholasticSlice";
import { axiosInstanceToken } from "../../redux/instence";
import { UserRole } from "../../config/config";
import { getUserId } from "../../Utils/auth";
import SmartTable from "../../Components/SmartTable";
import { getCoScholasticColumns } from "../../Components/SmartTable/tableColumns";

function CoScholasticPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const Role = getUserId()?.access;
  const currentUserRole = Role;

  const { isLoading, GetForms, pagination, filterOptions } = useSelector(
    (state) => state?.coScholastic
  );

  // ── Server-Side Pagination & Filtering State ──────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});
  const [serverSort, setServerSort] = useState({ key: null, direction: null });
  const lastFetchedParamsRef = useRef("");

  const fetchCoScholasticData = useCallback(
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
      if (activeFilters.subject) {
        params.subject = Array.isArray(activeFilters.subject)
          ? activeFilters.subject.join(",")
          : activeFilters.subject;
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
        dispatch(TeacherCoScholasticForms(params));
      } else if (Role === UserRole[1]) {
        dispatch(GetcreatedByCoScholastic(params));
      }
    },
    [dispatch, Role, page, pageSize, serverFilters, serverSort]
  );

  useEffect(() => {
    fetchCoScholasticData(page, pageSize, serverFilters, serverSort);
  }, [fetchCoScholasticData, page, pageSize, serverFilters, serverSort]);

  const handlePageChange = useCallback(
    (newPage, newSize) => {
      const nextLimit = newSize || pageSize;
      setPage(newPage);
      if (newSize && newSize !== pageSize) {
        setPageSize(newSize);
      }
      fetchCoScholasticData(newPage, nextLimit, serverFilters, serverSort);
    },
    [fetchCoScholasticData, pageSize, serverFilters, serverSort]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setServerFilters(newFilters);
      setPage(1);
      fetchCoScholasticData(1, pageSize, newFilters, serverSort);
    },
    [fetchCoScholasticData, pageSize, serverSort]
  );

  const handleSortChange = useCallback(
    (newSort) => {
      setServerSort(newSort);
      setPage(1);
      fetchCoScholasticData(1, pageSize, serverFilters, newSort);
    },
    [fetchCoScholasticData, pageSize, serverFilters]
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
      Role === UserRole[2] ? `/co-scholastic/teacherform` : `/co-scholastic/myform`;
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
      await dispatch(DeleteCoScholasticForm(deleteId)).unwrap();
      toast({
        title: "Form Deleted",
        description: "The form has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      lastFetchedParamsRef.current = "";
      fetchCoScholasticData(page, pageSize, serverFilters);
    } catch (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete the form.",
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
    () =>
      getCoScholasticColumns({
        data: GetForms || [],
        filterOptions,
        currentUserRole,
        onDelete: handleDeleteClick,
      }),
    [GetForms, filterOptions, currentUserRole]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Co-Scholastic Classroom Observation
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage and view Co-Scholastic Classroom Observation evaluation forms.
          </Text>
        </Box>

        <Stack direction="row" spacing={3}>
          {Role === UserRole[1] && (
            <Button
              leftIcon={<PlusCircleOutlined />}
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              onClick={() => navigate("/co-scholastic/create")}
              px={6}
            >
              Fill New Form
            </Button>
          )}
        </Stack>
      </Flex>

      <SmartTable
        title="All Co-Scholastic Forms"
        columns={columns}
        data={GetForms || []}
        loading={isLoading}
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
        downloadable={true}
        downloadFileName="coscholastic_forms"
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

export default CoScholasticPage;
