import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useToast } from "@chakra-ui/react";
import { axiosInstanceToken } from "../../../redux/instence";
import { getUserId } from "../../../Utils/auth";
import { GetAllClassRoomForms } from "../../../redux/Form/classroomWalkthroughSlice";
import { getCreateClassSection } from "../../../redux/userSlice";
import SmartTable from "../../../Components/SmartTable";
import { getReportForm2Columns } from "../../../Components/SmartTable/tableColumns";

function FormTwoReport() {
  const dispatch = useDispatch();
  const currentUserRole = getUserId()?.access;
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    dispatch(GetAllClassRoomForms());
    dispatch(getCreateClassSection()).then((res) => {
      if (res?.payload?.success && Array.isArray(res?.payload?.classDetails)) {
        setClasses(res.payload.classDetails);
      }
    });
  }, [dispatch]);

  const rawData = useSelector((state) => state?.walkThroughForm?.GetForms || []);

  const classMap = useMemo(() => {
    const map = {};
    classes.forEach((c) => {
      if (c?._id && c?.className) {
        map[c._id] = c.className;
      }
    });
    return map;
  }, [classes]);

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
      dispatch(GetAllClassRoomForms());
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
    () => getReportForm2Columns({ data, currentUserRole, onDelete: handleDeleteClick }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, currentUserRole]
  );

  return (
    <Box>
      <SmartTable
        title="Classroom Walkthrough — All Records"
        columns={columns}
        data={data}
        rowKey="_id"
        pageSize={10}
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

export default FormTwoReport;
