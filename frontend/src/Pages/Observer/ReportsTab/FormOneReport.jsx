import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useToast } from "@chakra-ui/react";
import { axiosInstanceToken } from "../../../redux/instence";
import { getUserId } from "../../../Utils/auth";
import { GetAllFormsForAdmin } from "../../../redux/Form/fortnightlySlice";
import { calculateScore } from "../../../Utils/calculateScore";
import SmartTable from "../../../Components/SmartTable";
import { getReportForm1Columns } from "../../../Components/SmartTable/tableColumns";

function FormOneReport() {
  const dispatch = useDispatch();
  const currentUserRole = getUserId()?.access;

  useEffect(() => {
    dispatch(GetAllFormsForAdmin());
  }, [dispatch]);

  const rawData = useSelector((state) => state?.Forms?.getAllAdminForms || []);
  const data = useMemo(() => calculateScore(rawData), [rawData]);

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
      dispatch(GetAllFormsForAdmin());
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
    () => getReportForm1Columns({ data, currentUserRole, onDelete: handleDeleteClick }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, currentUserRole]
  );

  return (
    <Box>
      <SmartTable
        title="Fortnightly Monitor — All Records"
        columns={columns}
        data={data}
        rowKey="_id"
        pageSize={10}
        downloadable
        downloadFileName="fortnightly_monitor"
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

export default FormOneReport;
