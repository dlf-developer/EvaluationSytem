import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetAllClassRoomForms } from "../../../redux/Form/classroomWalkthroughSlice";
import SmartTable from "../../../Components/SmartTable";
import { getReportForm2Columns } from "../../../Components/SmartTable/tableColumns";

function FormTwoReport() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GetAllClassRoomForms());
  }, [dispatch]);

  const data = useSelector((state) => state?.walkThroughForm?.GetForms || []);

  const columns = useMemo(
    () => getReportForm2Columns({ data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  return (
    <SmartTable
      title="Classroom Walkthrough — All Records"
      columns={columns}
      data={data}
      rowKey="_id"
      pageSize={10}
      downloadable
      downloadFileName="classroom_walkthrough"
    />
  );
}

export default FormTwoReport;
