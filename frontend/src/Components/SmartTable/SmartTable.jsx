import React, { useCallback } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Flex,
  HStack,
  Button,
  Select,
  Skeleton,
  Badge,
  Icon,
  Heading,
  TableContainer,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, FilterX, Download } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import ColumnHeader from "./ColumnHeader";
import useTableState from "./useTableState";

const MotionTr = motion(Tr);

// ─── Flatten a nested object to a single-level object ──────────────────────
// e.g. { a: { b: 1 }, c: 2 } → { "a.b": 1, c: 2 }
const flattenObject = (obj, prefix = "") => {
  if (obj === null || obj === undefined) return {};
  return Object.keys(obj).reduce((acc, k) => {
    const key = prefix ? `${prefix}.${k}` : k;
    const val = obj[k];
    if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
      Object.assign(acc, flattenObject(val, key));
    } else if (Array.isArray(val)) {
      acc[key] = val.map((v) => (typeof v === "object" ? JSON.stringify(v) : v)).join(", ");
    } else {
      acc[key] = val;
    }
    return acc;
  }, {});
};

// ─── Build rows using column definitions (human-readable headers) ───────────
const buildExcelRows = (columns, allFilteredData) => {
  // header row
  const headers = columns
    .filter((c) => c.key !== "action") // skip action column
    .map((c) => c.title);

  // data rows — try column.dataIndex first, fall back to flatten
  const rows = allFilteredData.map((record) => {
    const flat = flattenObject(record);
    return columns
      .filter((c) => c.key !== "action")
      .map((col) => {
        const raw = record[col.dataIndex];
        // If raw is a primitive — use it directly
        if (raw !== null && raw !== undefined && typeof raw !== "object") return raw;
        // If raw is an object, look in flattened map
        const flatKey = Object.keys(flat).find((k) =>
          k === col.dataIndex || k.startsWith(`${col.dataIndex}.`)
        );
        if (flatKey) {
          // collect all sub-keys
          const subVals = Object.entries(flat)
            .filter(([k]) => k === col.dataIndex || k.startsWith(`${col.dataIndex}.`))
            .map(([k, v]) => `${k.replace(`${col.dataIndex}.`, "")}: ${v}`)
            .join(" | ");
          return subVals || "";
        }
        return "";
      });
  });

  return [headers, ...rows];
};

const SmartTable = ({
  columns = [],
  data = [],
  loading = false,
  rowKey = "_id",
  title,
  extra,
  onRowClick,
  pageSize: initialPageSize = 10,
  emptyText = "No records found",
  // ── Download props ──────────────────────────────────────────────
  downloadable = false,
  downloadFileName = "report",
}) => {
  const {
    displayData,
    totalFiltered,
    allFilteredData,     // all filtered records, not just current page
    activeFilters,
    sortState,
    currentPage,
    pageSize,
    handleFilterChange,
    handleFilterClear,
    handleSort,
    handlePageChange,
    clearAllFilters,
    hasActiveFilters,
  } = useTableState({ data, columns, pageSize: initialPageSize });

  const totalPages = Math.ceil(totalFiltered / pageSize);

  // ── Download handler ──────────────────────────────────────────
  const handleDownload = useCallback(() => {
    const source = allFilteredData ?? data;
    const sheetData = buildExcelRows(columns, source);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Auto-size columns (rough estimate)
    const colWidths = sheetData[0].map((header, i) => {
      const maxLen = Math.max(
        String(header).length,
        ...sheetData.slice(1).map((row) => String(row[i] ?? "").length)
      );
      return { wch: Math.min(maxLen + 4, 40) };
    });
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${downloadFileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [allFilteredData, data, columns, downloadFileName]);

  // ── Smart page-number list ──────────────────────────────────
  const pageNumbers = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2)
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  })();

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      boxShadow="0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.100"
      w="full"
    >
      {/* ── Top Bar ─────────────────────────────────────────── */}
      {(title || extra || hasActiveFilters || downloadable) && (
        <Flex
          px={5}
          py={3.5}
          align="center"
          justify="space-between"
          borderBottom="1px solid"
          borderColor="gray.100"
          bg="white"
        >
          <HStack spacing={3} align="center">
            {title && (
              <Heading size="sm" color="brand.text" fontWeight="700" letterSpacing="-0.01em">
                {title}
              </Heading>
            )}
            {hasActiveFilters && (
              <Badge
                bg="brand.primary"
                color="white"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="10px"
                fontWeight="700"
                letterSpacing="0.04em"
              >
                FILTERED
              </Badge>
            )}
            {/* <Text fontSize="xs" color="gray.400" fontWeight="500">
              {totalFiltered} record{totalFiltered !== 1 ? "s" : ""}
            </Text> */}
          </HStack>

          <HStack spacing={2}>
            {hasActiveFilters && (
              <Tooltip label="Clear all filters" placement="top" hasArrow>
                <IconButton
                  icon={<Icon as={FilterX} boxSize="15px" />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={clearAllFilters}
                  aria-label="Clear all filters"
                  borderRadius="lg"
                />
              </Tooltip>
            )}

            {/* ── Download Button ─────────────────────────────── */}
            {downloadable && (
              <Tooltip
                label={`Download ${hasActiveFilters ? "filtered" : "all"} data as Excel`}
                placement="top"
                hasArrow
              >
                <Button
                  size="sm"
                  leftIcon={<Icon as={Download} boxSize="14px" />}
                  variant="outline"
                  borderColor="green.200"
                  color="green.700"
                  bg="green.50"
                  _hover={{
                    bg: "green.100",
                    borderColor: "green.400",
                    transform: "translateY(-1px)",
                    boxShadow: "sm",
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.15s ease"
                  borderRadius="lg"
                  fontWeight="600"
                  fontSize="xs"
                  onClick={handleDownload}
                  isDisabled={totalFiltered === 0}
                >
                  Export .xlsx
                </Button>
              </Tooltip>
            )}

            {extra}
          </HStack>
        </Flex>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      <TableContainer overflowX="auto">
        <Table
          variant="unstyled"
          size="sm"
          w="full"
          style={{ tableLayout: "auto", borderCollapse: "separate", borderSpacing: 0 }}
        >
          <Thead>
            <Tr bg="#EAF0E8">
              {columns.map((col) => (
                <Th
                  key={col.key}
                  w={col.width || "auto"}
                  minW={col.minWidth || "90px"}
                  maxW={col.maxWidth || "none"}
                  px={4}
                  py={3}
                  borderBottom="2px solid"
                  borderColor="rgba(74,103,65,0.2)"
                  textTransform="none"
                  letterSpacing="normal"
                  fontWeight="normal"
                  verticalAlign="middle"
                >
                  <ColumnHeader
                    column={col}
                    data={data}
                    sortState={sortState}
                    onSort={handleSort}
                    activeFilter={activeFilters[col.key]}
                    onFilterApply={handleFilterChange}
                    onFilterClear={handleFilterClear}
                  />
                </Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Tr key={`skel-${i}`} borderBottom="1px solid" borderColor="gray.50">
                  {columns.map((col) => (
                    <Td key={col.key} px={4} py={3} verticalAlign="middle">
                      <Skeleton
                        height="14px"
                        borderRadius="md"
                        startColor="gray.100"
                        endColor="gray.200"
                        w={i % 2 === 0 ? "80%" : "60%"}
                      />
                    </Td>
                  ))}
                </Tr>
              ))
            ) : displayData.length === 0 ? (
              <Tr>
                <Td colSpan={columns.length} textAlign="center" py={16}>
                  <Flex direction="column" align="center" gap={2}>
                    <Box fontSize="2xl">📭</Box>
                    <Text color="gray.400" fontSize="sm" fontWeight="500">
                      {emptyText}
                    </Text>
                    {hasActiveFilters && (
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="green"
                        color="brand.primary"
                        onClick={clearAllFilters}
                        mt={1}
                      >
                        Clear filters to see all records
                      </Button>
                    )}
                  </Flex>
                </Td>
              </Tr>
            ) : (
              displayData.map((record, rowIndex) => (
                <MotionTr
                  key={record[rowKey] ?? rowIndex}
                  borderBottom="1px solid"
                  borderColor="gray.50"
                  cursor={onRowClick ? "pointer" : "default"}
                  onClick={() => onRowClick?.(record)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: rowIndex * 0.02 }}
                  _hover={{ bg: "#F7F5F0" }}
                  style={{ transition: "background 0.15s ease" }}
                >
                  {columns.map((col) => (
                    <Td
                      key={col.key}
                      px={4}
                      py={3}
                      fontSize="sm"
                      color="brand.text"
                      verticalAlign="middle"
                      maxW={col.maxWidth || col.width || "none"}
                      whiteSpace={col.noWrap !== false ? "nowrap" : "normal"}
                    >
                      {col.render ? (
                        col.render(record[col.dataIndex], record, rowIndex)
                      ) : record[col.dataIndex] != null ? (
                        String(record[col.dataIndex])
                      ) : (
                        <Text color="gray.300" fontSize="sm">—</Text>
                      )}
                    </Td>
                  ))}
                </MotionTr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* ── Pagination ─────────────────────────────────────── */}
      {!loading && totalFiltered > 0 && (
        <Flex
          align="center"
          justify="space-between"
          px={5}
          py={3}
          borderTop="1px solid"
          borderColor="gray.100"
          bg="#FAFAF8"
          flexWrap="wrap"
          gap={2}
        >
          <Text fontSize="xs" color="gray.500" fontWeight="500">
            Showing{" "}
            <Text as="span" fontWeight="700" color="brand.text">
              {Math.min((currentPage - 1) * pageSize + 1, totalFiltered)}
              –{Math.min(currentPage * pageSize, totalFiltered)}
            </Text>{" "}
            of{" "}
            <Text as="span" fontWeight="700" color="brand.text">
              {totalFiltered}
            </Text>
          </Text>

          <HStack spacing={2}>
            <Select
              size="xs"
              value={pageSize}
              onChange={(e) => handlePageChange(1, Number(e.target.value))}
              w="90px"
              borderRadius="lg"
              borderColor="gray.200"
              fontSize="xs"
              fontWeight="600"
              color="gray.600"
              _focus={{ borderColor: "brand.primary", boxShadow: "none" }}
            >
              {[5, 10, 20, 50].map((s) => (
                <option key={s} value={s}>{s} / page</option>
              ))}
            </Select>

            <HStack spacing={0.5}>
              <IconButton
                icon={<Icon as={ChevronLeft} boxSize="14px" />}
                size="xs"
                variant="ghost"
                onClick={() => handlePageChange(currentPage - 1, pageSize)}
                isDisabled={currentPage === 1}
                aria-label="Previous page"
                borderRadius="md"
                color="gray.500"
                _hover={{ bg: "brand.primary", color: "white" }}
                _disabled={{ opacity: 0.35, cursor: "not-allowed" }}
              />
              {pageNumbers.map((page) => (
                <Button
                  key={page}
                  size="xs"
                  minW="28px"
                  h="28px"
                  px={0}
                  variant="ghost"
                  bg={currentPage === page ? "brand.primary" : "transparent"}
                  color={currentPage === page ? "white" : "gray.600"}
                  fontWeight={currentPage === page ? "700" : "500"}
                  fontSize="xs"
                  borderRadius="md"
                  onClick={() => handlePageChange(page, pageSize)}
                  _hover={currentPage !== page ? { bg: "gray.100", color: "brand.primary" } : {}}
                >
                  {page}
                </Button>
              ))}
              <IconButton
                icon={<Icon as={ChevronRight} boxSize="14px" />}
                size="xs"
                variant="ghost"
                onClick={() => handlePageChange(currentPage + 1, pageSize)}
                isDisabled={currentPage >= totalPages}
                aria-label="Next page"
                borderRadius="md"
                color="gray.500"
                _hover={{ bg: "brand.primary", color: "white" }}
                _disabled={{ opacity: 0.35, cursor: "not-allowed" }}
              />
            </HStack>
          </HStack>
        </Flex>
      )}
    </Box>
  );
};

export default SmartTable;
