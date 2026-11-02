import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Box, Flex, Heading, Text, Button, useToast } from "@chakra-ui/react";
import { PlusCircleOutlined } from "../../Components/UI/Icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getNootbookForms } from "../../redux/Form/noteBookSlice";
import { getUserId } from "../../Utils/auth";
import { UserRole } from "../../config/config";
import SmartTable from "../../Components/SmartTable";
import { getNotebookColumns } from "../../Components/SmartTable/tableColumns";
import { Modal, TextArea, Button as AntdButton, message } from "../../Components/UI";
import { axiosInstanceToken } from "../../redux/instence";
import { MessageSquare } from "lucide-react";

function NoteBook() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const user = getUserId();
  const Role = user?.access;
  const currentUserRole = Role;

  const { GetForms2, pagination, filterOptions, isLoading } = useSelector((state) => state?.notebook) || {};

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});

  const [canComment, setCanComment] = useState(() => {
    return Boolean(
      user?.canAddNotebookComment === true ||
      user?.canAddNotebookComment === "true" ||
      user?.access === "Superadmin"
    );
  });

  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentForm, setCommentForm] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);

  useEffect(() => {
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

  // Fetch data with server-side limit, skip, and filters
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

  const handleCommentClick = (record) => {
    setCommentForm(record);
    setCommentText(record?.observerComment || record?.observerFeedback || "");
    setCommentModalOpen(true);
  };

  const handleSaveComment = async () => {
    if (!commentForm?._id) return;
    setIsSavingComment(true);
    try {
      const response = await axiosInstanceToken.post(
        `/notebook-checking-proforma/comment/${commentForm._id}`,
        {
          comment: commentText,
        }
      );
      if (response.data?.success) {
        toast({
          title: "Comment Saved",
          description: "Observer comment has been updated and will appear in report & PDF.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setCommentModalOpen(false);
        setCommentForm(null);
        setCommentText("");
        fetchNotebookData(page, pageSize, serverFilters);
      } else {
        throw new Error(response.data?.message || "Failed to save comment");
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || err?.message || "Failed to save comment.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSavingComment(false);
    }
  };

  const columns = useMemo(() => {
    const baseCols = getNotebookColumns({
      data: GetForms2 || [],
      currentUserRole,
      onComment: handleCommentClick,
      canComment,
    });

    // Enhance dropdown filters with all database options if available from server
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
  }, [GetForms2, currentUserRole, canComment, filterOptions]);

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Notebook Checking Proforma
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage, filter, and review all notebook checking evaluations.
          </Text>
        </Box>

        {Role === UserRole[2] && (
          <Button
            leftIcon={<PlusCircleOutlined />}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
            transition="all 0.2s"
            onClick={() => navigate("/NoteBook-checking-proforma/create")}
            px={6}
          >
            Fill New Form
          </Button>
        )}
      </Flex>

      <SmartTable
        title="All Notebook Forms"
        columns={columns}
        data={GetForms2 || []}
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

      {/* Quick Observer Comment Modal */}
      <Modal
        open={commentModalOpen}
        onCancel={() => {
          if (!isSavingComment) {
            setCommentModalOpen(false);
            setCommentForm(null);
            setCommentText("");
          }
        }}
        width={560}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 leading-tight">
                Notebook Checking — Observer Comment
              </div>
              <div className="text-xs text-gray-500 font-normal">
                This comment will be reflected immediately in the final report and downloaded PDF.
              </div>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <AntdButton
              onClick={() => {
                setCommentModalOpen(false);
                setCommentForm(null);
                setCommentText("");
              }}
              disabled={isSavingComment}
            >
              Cancel
            </AntdButton>
            <AntdButton
              type="primary"
              onClick={handleSaveComment}
              loading={isSavingComment}
              style={{
                backgroundColor: "#7e22ce",
                borderColor: "#7e22ce",
              }}
            >
              Save Comment
            </AntdButton>
          </div>
        }
      >
        <div className="py-2">
          {commentForm && (
            <div className="mb-3.5 p-3 rounded-lg bg-gray-50 border border-gray-200/80 text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
              <div>
                <span className="font-semibold text-gray-800">Teacher:</span>{" "}
                {commentForm.teacherID?.name || commentForm.createdBy?.name || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Class:</span>{" "}
                {commentForm.grenralDetails?.className || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Section:</span>{" "}
                {commentForm.grenralDetails?.Section || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Subject:</span>{" "}
                {commentForm.grenralDetails?.Subject || "N/A"}
              </div>
            </div>
          )}

          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Observer Remarks & Evaluation Feedback
          </label>
          <TextArea
            rows={5}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your qualitative remarks, notebook maintenance feedback, or areas of improvement..."
            disabled={isSavingComment}
            autoFocus
          />
        </div>
      </Modal>
    </Box>
  );
}

export default NoteBook;
