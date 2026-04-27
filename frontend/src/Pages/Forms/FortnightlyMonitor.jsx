import React, { useEffect, useMemo, useState } from "react";
import { Box, Flex, Heading, Text, Stack, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useToast } from "@chakra-ui/react";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  GetFormsOne,
  GetObserverFormsOne,
} from "../../redux/Form/fortnightlySlice";
import { UserRole } from "../../config/config";
import { getUserId } from "../../Utils/auth";
import SmartTable from "../../Components/SmartTable";
import { getFortnightlyColumns } from "../../Components/SmartTable/tableColumns";
import { axiosInstanceToken } from "../../redux/instence";

function FortnightlyMonitor() {
  const Role = getUserId()?.access;
  const currentUserRole = Role;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (Role === UserRole[1]) dispatch(GetObserverFormsOne());
    else if (Role === UserRole[2]) dispatch(GetFormsOne());
  }, [dispatch, Role]);

  const CombinedData = useSelector(
    (state) => state?.Forms?.getAllForms?.Combined || []
  );
  const loading = useSelector((state) => state?.Forms?.loading || false);

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
      if (Role === UserRole[1]) dispatch(GetObserverFormsOne());
      else if (Role === UserRole[2]) dispatch(GetFormsOne());
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
    () => getFortnightlyColumns({ data: CombinedData, currentUserRole, onDelete: handleDeleteClick }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CombinedData, currentUserRole]
  );

  const sortedData = useMemo(
    () =>
      [...CombinedData].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [CombinedData]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Fortnightly Monitor
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Monitor and evaluate teacher performance periodically.
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
              onClick={() => navigate("/fortnightly-monitor/create")}
              px={6}
            >
              Fill New Form
            </Button>
          )}
          {Role === UserRole[1] && (
            <Link to="/fortnightly-monitor/form-initiation">
              <Button
                leftIcon={<PlusCircleOutlined />}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
                transition="all 0.2s"
                px={6}
              >
                Form Initiation
              </Button>
            </Link>
          )}
        </Stack>
      </Flex>

      <SmartTable
        title="All Forms"
        columns={columns}
        data={sortedData}
        loading={loading}
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

export default FortnightlyMonitor;
