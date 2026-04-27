import React, { useEffect, useMemo, useState } from "react";
import { Box, Flex, Heading, Text, Stack, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useToast } from "@chakra-ui/react";
import { PlusCircleOutlined } from "@ant-design/icons";
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
  const Role = getUserId().access;
  const currentUserRole = Role;

  const { isLoading, GetForms } = useSelector((state) => state?.walkThroughForm);

  useEffect(() => {
    if (Role === UserRole[2]) dispatch(TeacherwalkthroughForms());
    else if (Role === UserRole[1]) dispatch(GetcreatedBy());
  }, [dispatch, Role]);

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
      if (Role === UserRole[2]) dispatch(TeacherwalkthroughForms());
      else if (Role === UserRole[1]) dispatch(GetcreatedBy());
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
    () => getClassroomColumns({ data: GetForms || [], currentUserRole, onDelete: handleDeleteClick }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [GetForms, currentUserRole]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Classroom Walkthrough
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage and view classroom walkthrough evaluation forms.
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
              onClick={() => navigate("/classroom-walkthrough/create")}
              px={6}
            >
              Fill New Form
            </Button>
          )}
        </Stack>
      </Flex>

      <SmartTable
        title="All Walkthrough Forms"
        columns={columns}
        data={sortedData}
        loading={isLoading}
        rowKey="_id"
        pageSize={10}
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
