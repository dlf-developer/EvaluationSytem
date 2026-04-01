import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNootbookForms } from "../../../redux/Form/noteBookSlice";
import SmartTable from "../../../Components/SmartTable";
import { getReportForm3Columns } from "../../../Components/SmartTable/tableColumns";

function FormThreeReport() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNootbookForms());
  }, [dispatch]);

  const data = useSelector((state) => state?.notebook?.GetForms2 || []);

  const columns = useMemo(
    () => getReportForm3Columns({ data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  return (
    <SmartTable
      title="Notebook Checking Proforma — All Records"
      columns={columns}
      data={data}
      rowKey="_id"
      pageSize={10}
      downloadable
      downloadFileName="notebook_checking"
    />
  );
}

export default FormThreeReport;
