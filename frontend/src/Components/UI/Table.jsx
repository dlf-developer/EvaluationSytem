import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react";

export const Table = ({
  columns = [],
  dataSource = [],
  loading = false,
  pagination = {},
  rowKey = "key",
  scroll,
  className = "",
  style,
  onRow,
  emptyText = "No data available",
}) => {
  const isPaginationEnabled = pagination !== false;
  const defaultPageSize =
    typeof pagination === "object" && pagination.pageSize ? pagination.pageSize : 10;

  const [currentPage, setCurrentPage] = useState(
    typeof pagination === "object" && pagination.current ? pagination.current : 1
  );
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const getRecordKey = (record, index) => {
    if (typeof rowKey === "function") return rowKey(record);
    if (typeof rowKey === "string" && record && record[rowKey] !== undefined)
      return record[rowKey];
    if (record?._id) return record._id;
    if (record?.id) return record.id;
    if (record?.key) return record.key;
    return index;
  };

  const getNestedValue = (obj, path) => {
    if (!path) return undefined;
    if (Array.isArray(path)) {
      return path.reduce((acc, part) => (acc ? acc[part] : undefined), obj);
    }
    return obj?.[path];
  };

  const total =
    typeof pagination === "object" && pagination.total !== undefined
      ? pagination.total
      : dataSource.length;

  const paginatedData = useMemo(() => {
    if (!isPaginationEnabled) return dataSource;
    // If external total is controlled and different from dataSource length, assume server-side
    if (
      typeof pagination === "object" &&
      pagination.total !== undefined &&
      pagination.total !== dataSource.length
    ) {
      return dataSource;
    }
    const start = (currentPage - 1) * pageSize;
    return dataSource.slice(start, start + pageSize);
  }, [dataSource, isPaginationEnabled, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (typeof pagination === "object" && pagination.onChange) {
      pagination.onChange(newPage, pageSize);
    }
  };

  return (
    <div
      className={`w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative ${className}`}
      style={style}
    >
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-medium text-gray-500">Loading...</span>
          </div>
        </div>
      )}

      <div
        className="w-full overflow-x-auto"
        style={scroll?.x ? { minWidth: scroll.x } : {}}
      >
        <table className="w-full border-collapse text-left text-sm text-gray-700">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {columns.map((col, idx) => {
                const widthStyle = col.width
                  ? {
                      width: col.width,
                      minWidth: col.width,
                      maxWidth: col.width,
                    }
                  : {};
                return (
                  <th
                    key={col.key || col.dataIndex || idx}
                    className={`px-4 py-3.5 ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"} ${col.className || ""}`}
                    style={{ ...widthStyle, ...col.style }}
                  >
                    {col.title}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedData.length > 0 ? (
              paginatedData.map((record, rIdx) => {
                const key = getRecordKey(record, rIdx);
                const rowProps = onRow ? onRow(record, rIdx) : {};
                return (
                  <tr
                    key={key}
                    {...rowProps}
                    className={`hover:bg-gray-50/75 transition-colors ${rowProps.className || ""}`}
                  >
                    {columns.map((col, cIdx) => {
                      const val = getNestedValue(record, col.dataIndex);
                      const rendered = col.render
                        ? col.render(val, record, rIdx)
                        : val ?? "-";
                      const widthStyle = col.width
                        ? {
                            width: col.width,
                            minWidth: col.width,
                            maxWidth: col.width,
                          }
                        : {};

                      return (
                        <td
                          key={col.key || col.dataIndex || cIdx}
                          className={`px-4 py-3.5 text-sm ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"} ${col.className || ""}`}
                          style={{ ...widthStyle, ...col.style }}
                        >
                          {rendered}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-10 h-10 text-gray-300 stroke-[1.5]" />
                    <span className="text-sm font-medium">{emptyText}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isPaginationEnabled && total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {Math.min((currentPage - 1) * pageSize + 1, total)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-700">
              {Math.min(currentPage * pageSize, total)}
            </span>{" "}
            of <span className="font-semibold text-gray-700">{total}</span> entries
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;

