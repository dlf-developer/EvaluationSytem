import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllWeeklyFromAll } from "../../../redux/userSlice";
import SmartTable from "../../../Components/SmartTable";
import { getReportForm4Columns } from "../../../Components/SmartTable/tableColumns";

function FormFourReport() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllWeeklyFromAll());
  }, [dispatch]);

  const data = useSelector((state) => state?.user?.getAllWeeklyFroms || []);

  const columns = useMemo(
    () => getReportForm4Columns({ data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  return (
    <SmartTable
      title="Weekly 4 Form — All Records"
      columns={columns}
      data={data}
      rowKey={(r) => r._id || Math.random()}
      pageSize={10}
      downloadable
      downloadFileName="weekly4_forms"
    />
  );
}

export default FormFourReport;
