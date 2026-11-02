import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Box, Flex, Heading, Text, Stack, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useToast } from "@chakra-ui/react";
import { PlusCircleOutlined, CommentOutlined } from "../../Components/UI/Icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GetcreatedByUser,
  GetobserverForms,
} from "../../redux/Form/noteBookSlice";
import { getUserId } from "../../Utils/auth";
import { UserRole } from "../../config/config";
import SmartTable from "../../Components/SmartTable";
import { getNotebookColumns } from "../../Components/SmartTable/tableColumns";
import { axiosInstanceToken } from "../../redux/instence";

function Notebook() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const Role = getUserId()?.access;
  const currentUserRole = Role;

  const CombinedData = useSelector((state) => state?.notebook?.GetForms2 || []);
  const { pagination, filterOptions, isLoading } = useSelector((state) => state?.notebook) || {};

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});

  const [canComment, setCanComment] = useState(() => {
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
            setCanComment(
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

      const paramKey = JSON.stringify({ ...params, role: Role });
      if (lastFetchedParamsRef.current === paramKey) return;
      lastFetchedParamsRef.current = paramKey;

      if (Role === UserRole[1]) {
        dispatch(GetobserverForms(params));
      } else {
        dispatch(GetcreatedByUser(params));
      }
    },
    [dispatch, Role, page, pageSize, serverFilters]
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

    const endpoint =
      Role === UserRole[1]
        ? "notebook-checking-proforma/observer/get"
        : "notebook-checking-proforma/get";
    const response = await axiosInstanceToken.get(endpoint, { params });
    const result = response.data;
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  }, [Role, serverFilters]);

  const sortedData = useMemo(() => {
    if (!Array.isArray(CombinedData)) return [];
    return [...CombinedData].sort((a, b) =>
      a.isObserverComplete === b.isObserverComplete
        ? 0
        : a.isObserverComplete
        ? 1
        : -1
    );
  }, [CombinedData]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  // ── Comment Modal State ──
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);

  const handleCommentClick = (record) => {
    setSelectedRecord(record);
    setCommentText(record?.observerComment || record?.observerFeedback || "");
    setCommentModalOpen(true);
  };

  const handleSaveComment = async () => {
    if (!selectedRecord?._id) return;
    setIsSavingComment(true);
    try {
      const response = await axiosInstanceToken.post(
        `/notebook-checking-proforma/comment/${selectedRecord._id}`,
        { comment: commentText }
      );
      if (response?.data?.success) {
        toast({
          title: "Comment Saved",
          description: "Observer comment updated. It will appear on the report and PDF.",
          status: "success",
          duration: 3500,
          isClosable: true,
        });
        setCommentModalOpen(false);
        setSelectedRecord(null);
        fetchNotebookData(page, pageSize, serverFilters);
      } else {
        toast({
          title: "Error",
          description: response?.data?.message || "Failed to save comment.",
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save comment.",
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
    const baseCols = getNotebookColumns({
      data: CombinedData,
      currentUserRole,
      onDelete: handleDeleteClick,
      onComment: handleCommentClick,
      canComment,
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
  }, [CombinedData, currentUserRole, canComment, filterOptions]);

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Notebook Checking Proforma
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage and view notebook evaluation forms.
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
              onClick={() => navigate("/notebook-checking-proforma/create")}
              px={6}
            >
              Fill New Form
            </Button>
          )}
          {Role === UserRole[1] && (
            <Button
              leftIcon={<PlusCircleOutlined />}
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              onClick={() => navigate("/notebook-checking-proforma/form-initiation")}
              px={6}
            >
              Form Initiation
            </Button>
          )}
        </Stack>
      </Flex>

      <SmartTable
        title="All Notebook Forms"
        columns={columns}
        data={CombinedData || []}
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
        downloadable={true}
        downloadFileName="notebook_checking_proforma"
      />

      {/* ── Observer Comment Modal ── */}
      <Modal
        isOpen={commentModalOpen}
        onClose={() => !isSavingComment && setCommentModalOpen(false)}
        isCentered
        size="lg"
      >
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="xl" shadow="xl">
          <ModalHeader pb={2}>
            <Flex align="center" gap={2}>
              <Box p={2} bg="purple.50" color="purple.600" borderRadius="lg">
                <CommentOutlined />
              </Box>
              <Box>
                <Heading size="sm" color="gray.800">
                  Observer Comment
                </Heading>
                <Text fontSize="xs" color="gray.500" fontWeight="normal">
                  Notebook Checking Proforma
                </Text>
              </Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton disabled={isSavingComment} />

          <ModalBody py={3}>
            {selectedRecord && (
              <Box
                mb={3}
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
                    <span className="text-gray-500">Class & Sec: </span>
                    <strong className="text-gray-800">
                      {selectedRecord?.grenralDetails?.Class ||
                        selectedRecord?.className ||
                        "—"}{" "}
                      -{" "}
                      {selectedRecord?.grenralDetails?.Section ||
                        selectedRecord?.Section ||
                        "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Subject: </span>
                    <strong className="text-gray-800">
                      {selectedRecord?.grenralDetails?.Subject ||
                        selectedRecord?.Subject ||
                        "—"}
                    </strong>
                  </div>
                </Flex>
              </Box>
            )}

            <Box>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Feedback & Observations
              </label>
              <textarea
                rows={5}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter official observer remarks, notebook maintenance feedback, or areas of improvement..."
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all placeholder:text-gray-400"
                disabled={isSavingComment}
              />
              <p className="mt-1.5 text-[11px] text-gray-500 flex items-center gap-1">
                <span>ℹ️</span> This comment is saved in the record, shown on the online report, and included in the exported PDF.
              </p>
            </Box>
          </ModalBody>

          <ModalFooter pt={2}>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setCommentModalOpen(false)}
              disabled={isSavingComment}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleSaveComment}
              isLoading={isSavingComment}
              loadingText="Saving..."
              size="sm"
              px={5}
            >
              Save Comment
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

export default Notebook;
