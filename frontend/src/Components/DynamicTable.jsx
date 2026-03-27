import React from "react";
import { Table, Spin } from "antd";

const DynamicTable = ({
  columns,
  data,
  total,
  currentPage,
  pageSize,
  loading,
  onChange,
  rowKey = "id",
  ...props
}) => {
  return (
    <Spin spinning={loading}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={rowKey}
        pagination={{
          current: currentPage || 1,
          pageSize: pageSize || 10,
          total: total || 0,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={onChange}
        scroll={{ y: "calc(100vh - 450px)", x: "max-content" }}
        className="custom-table"
        {...props}
      />
    </Spin>
  );
};

export default DynamicTable;
