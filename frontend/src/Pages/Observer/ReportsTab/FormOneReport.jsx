import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetAllFormsForAdmin } from "../../../redux/Form/fortnightlySlice";
import { calculateScore } from "../../../Utils/calculateScore";
import SmartTable from "../../../Components/SmartTable";
import { getReportForm1Columns } from "../../../Components/SmartTable/tableColumns";

function FormOneReport() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GetAllFormsForAdmin());
  }, [dispatch]);

  const rawData = useSelector((state) => state?.Forms?.getAllAdminForms || []);
  const data = useMemo(() => calculateScore(rawData), [rawData]);

  const columns = useMemo(
    () => getReportForm1Columns({ data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  return (
    <SmartTable
      title="Fortnightly Monitor — All Records"
      columns={columns}
      data={data}
      rowKey="_id"
      pageSize={10}
      downloadable
      downloadFileName="fortnightly_monitor"
    />
  );
}

export default FormOneReport;
