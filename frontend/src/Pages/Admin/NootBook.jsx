import React, { useEffect, useMemo, useState } from "react";
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

  const { GetForms2, isLoading } = useSelector((state) => state?.notebook) || {};

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

  useEffect(() => {
    dispatch(getNootbookForms());
  }, [dispatch]);

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
        dispatch(getNootbookForms());
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

  const sortedData = useMemo(() => {
    if (!Array.isArray(GetForms2)) return [];
    return [...GetForms2].sort((a, b) =>
      a.isObserverComplete === b.isObserverComplete
        ? 0
        : a.isObserverComplete
        ? 1
        : -1
    );
  }, [GetForms2]);

  const columns = useMemo(
    () =>
      getNotebookColumns({
        data: GetForms2 || [],
        currentUserRole,
        onComment: handleCommentClick,
        canComment,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [GetForms2, currentUserRole, canComment]
  );

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
        data={sortedData}
        loading={isLoading}
        rowKey="_id"
        pageSize={10}
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
