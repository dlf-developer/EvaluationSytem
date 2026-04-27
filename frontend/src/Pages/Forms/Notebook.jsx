import React, { useEffect, useMemo, useState } from "react";
import { Box, Flex, Heading, Text, Stack, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useToast } from "@chakra-ui/react";
import { PlusCircleOutlined } from "@ant-design/icons";
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
  const Role = getUserId().access;
  const currentUserRole = Role;

  const CombinedData = useSelector((state) => state?.notebook?.GetForms2 || []);
  const { isLoading } = useSelector((state) => state?.notebook);

  useEffect(() => {
    if (Role === UserRole[1]) dispatch(GetobserverForms());
    else dispatch(GetcreatedByUser());
  }, [dispatch, Role]);

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
      if (Role === UserRole[1]) dispatch(GetobserverForms());
      else dispatch(GetcreatedByUser());
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
    () => getNotebookColumns({ data: CombinedData, currentUserRole, onDelete: handleDeleteClick }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CombinedData, currentUserRole]
  );

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

export default Notebook;
