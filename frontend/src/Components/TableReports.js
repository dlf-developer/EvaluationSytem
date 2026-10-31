import React from "react";
import { Table } from "./UI";

const TableReports = ({ columns, dataSource, pagination, tableHeight, className = "" }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table
          className={`${className} w-full`}
          columns={columns}
          dataSource={dataSource || []}
          pagination={false}
          scroll={{ y: tableHeight }}
        />
      </div>
    </div>
  );
};

export default TableReports;
