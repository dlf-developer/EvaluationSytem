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
  Heading,
  Text,
  Flex,
} from "@chakra-ui/react";
import { CommentOutlined } from "../../../Components/UI/Icons";
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
  const [serverSort, setServerSort] = useState({ key: null, direction: null });

  const [canAddOverviewComment, setCanAddOverviewComment] = useState(() => {
    const user = getUserId();
    return Boolean(
      user?.canAddNotebookComment === true ||
      user?.canAddNotebookComment === "true" ||
      user?.access === "Superadmin"
    );
  });

  useEffect(() => {
    const user = getUserId();
    const currentUserId = user?.id || user?._id || user?.userId;
    if (currentUserId) {
      axiosInstanceToken
        .get(`/user/single/${currentUserId}`)
        .then((res) => {
          const u = res?.data?.data || res?.data?.user || res?.data;
          if (u) {
            setCanAddOverviewComment(
              Boolean(
                u.canAddNotebookComment === true ||
                u.canAddNotebookComment === "true" ||
                u.access === "Superadmin"
              )
            );
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    dispatch(getCreateClassSection()).then((res) => {
      if (res?.payload?.success && Array.isArray(res?.payload?.classDetails)) {
        setClasses(res.payload.classDetails);
      }
    });
  }, [dispatch]);

  const lastFetchedParamsRef = useRef("");

  const fetchNotebookData = useCallback(
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
    [dispatch, page, pageSize, serverFilters, serverSort]
  );

  useEffect(() => {
    fetchNotebookData(page, pageSize, serverFilters, serverSort);
  }, [fetchNotebookData, page, pageSize, serverFilters, serverSort]);

  const handlePageChange = useCallback(
    (newPage, newSize) => {
      const nextLimit = newSize || pageSize;
      setPage(newPage);
      if (newSize && newSize !== pageSize) {
        setPageSize(newSize);
      }
      fetchNotebookData(newPage, nextLimit, serverFilters, serverSort);
    },
    [fetchNotebookData, pageSize, serverFilters, serverSort]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setServerFilters(newFilters);
      setPage(1);
      fetchNotebookData(1, pageSize, newFilters, serverSort);
    },
    [fetchNotebookData, pageSize, serverSort]
  );

  const handleSortChange = useCallback(
    (newSort) => {
      setServerSort(newSort);
      setPage(1);
      fetchNotebookData(1, pageSize, serverFilters, newSort);
    },
    [fetchNotebookData, pageSize, serverFilters]
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

  // ── Overview Comment Modal State ──
  const [overviewModalOpen, setOverviewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [overviewCommentText, setOverviewCommentText] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);

  const handleOverviewCommentClick = useCallback((record) => {
    setSelectedRecord(record);
    setOverviewCommentText(record?.observerComment || "");
    setOverviewModalOpen(true);
  }, []);

  const handleSaveOverviewComment = async () => {
    if (!selectedRecord?._id) return;
    setIsSavingComment(true);
    try {
      const response = await axiosInstanceToken.post(
        `/notebook-checking-proforma/comment/${selectedRecord._id}`,
        {
          comment: overviewCommentText,
          overviewComment: overviewCommentText,
        }
      );
      if (response?.data?.success) {
        toast({
          title: "Overview Comment Saved",
          description: "Overview comment updated successfully.",
          status: "success",
          duration: 3500,
          isClosable: true,
        });
        setOverviewModalOpen(false);
        setSelectedRecord(null);
        setOverviewCommentText("");
        lastFetchedParamsRef.current = "";
        fetchNotebookData(page, pageSize, serverFilters);
      } else {
        toast({
          title: "Error",
          description: response?.data?.message || "Failed to save overview comment.",
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save overview comment.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsSavingComment(false);
    }
  };

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
      onOverviewComment: handleOverviewCommentClick,
      canAddOverviewComment,
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
  }, [data, currentUserRole, filterOptions, handleOverviewCommentClick, canAddOverviewComment]);

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
        onSortChange={handleSortChange}
        onFetchAllForExport={handleFetchAllForExport}
        downloadable
        downloadFileName="notebook_checking"
      />

      {/* ── Overview Comment Modal ── */}
      <Modal
        isOpen={overviewModalOpen}
        onClose={() => !isSavingComment && setOverviewModalOpen(false)}
        isCentered
        size="lg"
      >
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="xl" shadow="xl">
          <ModalHeader pb={2}>
            <Flex align="center" gap={2.5}>
              <Box p={2} bg="purple.50" color="purple.600" borderRadius="lg">
                <CommentOutlined />
              </Box>
              <Box>
                <Heading size="sm" color="gray.800">
                  Overview Comment
                </Heading>
                <Text fontSize="xs" color="gray.500" fontWeight="normal">
                  Notebook Checking Proforma — Overview Section
                </Text>
              </Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton disabled={isSavingComment} />

          <ModalBody py={3}>
            {selectedRecord && (
              <Box
                mb={3.5}
                p={3}
                bg="gray.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
                fontSize="xs"
              >
                <Flex justify="space-between" flexWrap="wrap" gap={2}>
                  <div>
                    <span className="text-gray-500">Teacher: </span>
                    <strong className="text-gray-800">
                      {selectedRecord?.teacherID?.name ||
                        selectedRecord?.createdBy?.name ||
                        "N/A"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Observer: </span>
                    <strong className="text-gray-800">
                      {selectedRecord?.grenralDetails?.NameofObserver?.name ||
                        selectedRecord?.createdBy?.name ||
                        "N/A"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Class & Sec: </span>
                    <strong className="text-gray-800">
                      {selectedRecord?.grenralDetails?.className || "—"} -{" "}
                      {selectedRecord?.grenralDetails?.Section || "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Subject: </span>
                    <strong className="text-gray-800">
                      {selectedRecord?.grenralDetails?.Subject || "—"}
                    </strong>
                  </div>
                </Flex>
              </Box>
            )}

            {/* Teacher's Reflection context */}
            {selectedRecord?.teacherReflationFeedback && (
              <Box
                mb={3.5}
                p={3}
                bg="orange.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="orange.200"
              >
                <Text fontSize="xs" fontWeight="bold" color="orange.800" mb={1}>
                  Teacher's Reflection:
                </Text>
                <Text fontSize="xs" color="gray.700" whiteSpace="pre-wrap">
                  {selectedRecord.teacherReflationFeedback}
                </Text>
              </Box>
            )}

            {/* In-Form Observer Evaluation Remarks context */}
            {selectedRecord?.observerFeedback && (
              <Box
                mb={3.5}
                p={3}
                bg="blue.50"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="blue.200"
              >
                <Text fontSize="xs" fontWeight="bold" color="blue.800" mb={1}>
                  Observer Form Evaluation Remarks:
                </Text>
                <Text fontSize="xs" color="gray.700" whiteSpace="pre-wrap">
                  {selectedRecord.observerFeedback}
                </Text>
              </Box>
            )}

            <Box>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Overview Comment
              </label>
              <textarea
                rows={5}
                value={overviewCommentText}
                onChange={(e) => setOverviewCommentText(e.target.value)}
                placeholder="Enter official overview feedback, administrative remarks, or strategic recommendations..."
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all placeholder:text-gray-400"
                disabled={isSavingComment}
              />
              <p className="mt-1.5 text-[11px] text-gray-500 flex items-center gap-1">
                <span>ℹ️</span> This overview comment is saved for this completed cycle and visible in reports and PDF exports.
              </p>
            </Box>
          </ModalBody>

          <ModalFooter pt={2}>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setOverviewModalOpen(false)}
              disabled={isSavingComment}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleSaveOverviewComment}
              isLoading={isSavingComment}
              loadingText="Saving..."
              size="sm"
              px={5}
            >
              Save Overview Comment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Confirm Delete Modal ── */}
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
