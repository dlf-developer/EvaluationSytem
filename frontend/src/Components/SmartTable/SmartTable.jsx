import React, { useState, useEffect, useCallback } from "react";
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
  Skeleton,
  Badge,
  Icon,
  Heading,
  TableContainer,
  IconButton,
  Tooltip,
  Spinner,
} from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  FilterX,
  Download,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import * as XLSX from "xlsx";
import ColumnHeader from "./ColumnHeader";
import useTableState from "./useTableState";
import { isCuteMalkinThemeActive } from "../../Utils/cuteMalkinTheme";
import CustomExcelExportModal from "./CustomExcelExportModal";
import Select, { Option } from "../UI/Select";
import { recordFileDownloadAudit } from "../../Utils/auditLogger";

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

// buildExcelRows logic has been removed as we directly export flattened data

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
  // ── Server-side props ───────────────────────────────────────────
  serverSide = false,
  totalRecords = 0,
  page: externalPage,
  pagination = null,
  onPageChange,
  onFilterChange,
  onSortChange,
  onFetchAllForExport,
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
  } = useTableState({
    data,
    columns,
    pageSize: initialPageSize,
    serverSide,
    totalRecords,
    page: externalPage,
    pagination,
    onPageChange,
    onFilterChange,
    onSortChange,
  });

  const effectiveCurrentPage =
    serverSide && pagination?.page ? pagination.page : currentPage;
  const effectivePageSize = pageSize || pagination?.limit || initialPageSize;
  const effectiveTotal =
    serverSide && pagination?.total !== undefined
      ? pagination.total
      : totalFiltered;
  const effectiveTotalPages =
    serverSide && pagination?.totalPages !== undefined
      ? pagination.totalPages
      : Math.ceil(effectiveTotal / (effectivePageSize || 1)) || 1;

  // ── Cute theme & Custom Excel Export state ────────────────────
  const [isCuteActive, setIsCuteActive] = useState(() => isCuteMalkinThemeActive());
  const [isCustomExportOpen, setIsCustomExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handleThemeChange = (e) => {
      setIsCuteActive(Boolean(e.detail?.active));
    };
    window.addEventListener("cute-theme-changed", handleThemeChange);
    return () => {
      window.removeEventListener("cute-theme-changed", handleThemeChange);
    };
  }, []);

  // ── Download handler ──────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    let source = allFilteredData ?? data;

    if (serverSide && typeof onFetchAllForExport === "function") {
      try {
        setIsExporting(true);
        const fullData = await onFetchAllForExport();
        if (Array.isArray(fullData) && fullData.length > 0) {
          source = fullData;
        }
      } catch (err) {
        console.error("Failed to fetch full data for export:", err);
      } finally {
        setIsExporting(false);
      }
    }
    
    // Flatten records to ensure all nested properties (like Observer/Teacher details) get their own column
    const flattenedData = source.map(record => {
      const flat = flattenObject(record);
      delete flat._id;
      delete flat.__v;
      return flat;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(flattenedData);

    // Auto-size columns based on headers and flattened row contents
    const headers = Object.keys(flattenedData[0] || {});
    const colWidths = headers.map((header) => {
      const maxLen = Math.max(
        String(header).length,
        ...flattenedData.map((row) => String(row[header] ?? "").length)
      );
      return { wch: Math.min(maxLen + 4, 40) };
    });
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const outFileName = `${downloadFileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, outFileName);

    recordFileDownloadAudit({
      fileName: outFileName,
      fileType: "Excel (.xlsx)",
      module: title || downloadFileName,
      rowCount: flattenedData.length,
      columnCount: headers.length,
      extraDetails: "Direct Excel Download",
    });
  }, [serverSide, onFetchAllForExport, allFilteredData, data, downloadFileName]);

  // ── Smart page-number list ──────────────────────────────────
  const pageNumbers = (() => {
    if (effectiveTotalPages <= 5)
      return Array.from({ length: effectiveTotalPages }, (_, i) => i + 1);
    if (effectiveCurrentPage <= 3) return [1, 2, 3, 4, 5];
    if (effectiveCurrentPage >= effectiveTotalPages - 2)
      return [
        effectiveTotalPages - 4,
        effectiveTotalPages - 3,
        effectiveTotalPages - 2,
        effectiveTotalPages - 1,
        effectiveTotalPages,
      ];
    return [
      effectiveCurrentPage - 2,
      effectiveCurrentPage - 1,
      effectiveCurrentPage,
      effectiveCurrentPage + 1,
      effectiveCurrentPage + 2,
    ];
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
                  isLoading={isExporting}
                  loadingText="Exporting..."
                  isDisabled={totalFiltered === 0}
                >
                  Export .xlsx
                </Button>
              </Tooltip>
            )}

            {/* ── Custom Excel / Nisha's Special Button ──────────── */}
            {downloadable && (
              <Tooltip
                label={
                  isCuteActive
                    ? "Malkin's Special: Choose custom fields & separate scores 💕"
                    : `Choose custom fields & separate scores for ${
                        title ? title.split("—")[0].trim() : downloadFileName
                      }`
                }
                placement="top"
                hasArrow
              >
                <Button
                  size="sm"
                  leftIcon={
                    <Icon
                      as={isCuteActive ? Sparkles : SlidersHorizontal}
                      boxSize="14px"
                    />
                  }
                  variant="outline"
                  borderColor={isCuteActive ? "pink.300" : "purple.200"}
                  color={isCuteActive ? "pink.700" : "purple.700"}
                  bg={isCuteActive ? "pink.50" : "purple.50"}
                  _hover={{
                    bg: isCuteActive ? "pink.100" : "purple.100",
                    borderColor: isCuteActive ? "pink.400" : "purple.300",
                    transform: "translateY(-1px)",
                    boxShadow: "sm",
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.15s ease"
                  borderRadius="lg"
                  fontWeight="600"
                  fontSize="xs"
                  onClick={() => setIsCustomExportOpen(true)}
                  isDisabled={totalFiltered === 0}
                >
                  {isCuteActive ? "Malkin's Special 🌸" : "Custom Export"}
                </Button>
              </Tooltip>
            )}

            {extra}
          </HStack>
        </Flex>
      )}

      {/* ── Table Container with Centered Loading Spinner Overlay ── */}
      <Box position="relative" minH={loading ? "280px" : "auto"}>
        {loading && (
          <Flex
            position="absolute"
            inset={0}
            zIndex={25}
            bg="rgba(255, 255, 255, 0.75)"
            backdropFilter="blur(2px)"
            align="center"
            justify="center"
            direction="column"
            gap={3}
            transition="all 0.2s ease"
            pointerEvents="auto"
          >
            <Flex
              p={4}
              bg="white"
              borderRadius="xl"
              boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)"
              border="1px solid"
              borderColor="gray.100"
              direction="column"
              align="center"
              gap={2.5}
            >
              <Spinner
                thickness="3.5px"
                speed="0.65s"
                emptyColor="gray.100"
                color="brand.primary"
                size="lg"
              />
              <Text fontSize="xs" fontWeight="600" color="gray.600" letterSpacing="0.02em">
                Loading records...
              </Text>
            </Flex>
          </Flex>
        )}

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
                    minW={col.minWidth || col.width || "90px"}
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
              {loading && displayData.length === 0 ? (
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
                  <Tr
                    key={record[rowKey] ?? rowIndex}
                    borderBottom="1px solid"
                    borderColor="gray.50"
                    cursor={onRowClick ? "pointer" : "default"}
                    onClick={() => onRowClick?.(record)}
                    _hover={{ bg: "#F7F5F0" }}
                    transition="background 0.15s ease"
                  >
                    {columns.map((col) => (
                      <Td
                        key={col.key}
                        px={4}
                        py={3}
                        fontSize="sm"
                        color="brand.text"
                        verticalAlign="middle"
                        w={col.width || "auto"}
                        minW={col.minWidth || col.width || "auto"}
                        maxW={col.maxWidth || "none"}
                        whiteSpace={col.noWrap !== false ? "nowrap" : "normal"}
                        overflow={col.overflow || (col.render ? "visible" : "hidden")}
                        textOverflow={col.textOverflow || "ellipsis"}
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
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* ── Pagination ─────────────────────────────────────── */}
      {effectiveTotal > 0 && (
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
          position="relative"
          overflow="visible"
          opacity={loading ? 0.6 : 1}
          pointerEvents={loading ? "none" : "auto"}
          transition="opacity 0.2s ease"
        >
        
          <Text fontSize="xs" color="gray.500" fontWeight="500">
            Showing{" "}
            <Text as="span" fontWeight="700" color="brand.text">
              {Math.min((effectiveCurrentPage - 1) * effectivePageSize + 1, effectiveTotal)}
              –{Math.min(effectiveCurrentPage * effectivePageSize, effectiveTotal)}
            </Text>{" "}
            of{" "}
            <Text as="span" fontWeight="700" color="brand.text">
              {effectiveTotal}
            </Text>
          </Text>

          <HStack spacing={2} align="center">
            <Box w="120px" minW="115px">
              <Select
                size="small"
                value={effectivePageSize}
                onChange={(newVal) => handlePageChange(1, Number(newVal))}
                showSearch={false}
                placement="top"
                dropdownClassName="min-w-[120px] shadow-lg rounded-lg border-gray-200"
              >
                <Option value={5}>5 / page</Option>
                <Option value={10}>10 / page</Option>
                <Option value={20}>20 / page</Option>
                <Option value={50}>50 / page</Option>
                <Option value={100}>100 / page</Option>
              </Select>
            </Box>

            <HStack spacing={0.5}>
              <IconButton
                icon={<Icon as={ChevronLeft} boxSize="14px" />}
                size="xs"
                variant="ghost"
                onClick={() => handlePageChange(effectiveCurrentPage - 1, effectivePageSize)}
                isDisabled={effectiveCurrentPage <= 1}
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
                  bg={effectiveCurrentPage === page ? "brand.primary" : "transparent"}
                  color={effectiveCurrentPage === page ? "white" : "gray.600"}
                  fontWeight={effectiveCurrentPage === page ? "700" : "500"}
                  fontSize="xs"
                  borderRadius="md"
                  onClick={() => handlePageChange(page, effectivePageSize)}
                  _hover={effectiveCurrentPage !== page ? { bg: "gray.100", color: "brand.primary" } : {}}
                >
                  {page}
                </Button>
              ))}
              <IconButton
                icon={<Icon as={ChevronRight} boxSize="14px" />}
                size="xs"
                variant="ghost"
                onClick={() => handlePageChange(effectiveCurrentPage + 1, effectivePageSize)}
                isDisabled={effectiveCurrentPage >= effectiveTotalPages}
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

      {/* ── Custom Excel Export Modal (Nisha's Special) ── */}
      <CustomExcelExportModal
        isOpen={isCustomExportOpen}
        onClose={() => setIsCustomExportOpen(false)}
        data={allFilteredData ?? data}
        columns={columns}
        downloadFileName={downloadFileName}
        tableTitle={title}
        isCuteActive={isCuteActive}
        serverSide={serverSide}
        fetchAllData={onFetchAllForExport}
      />
    </Box>
  );
};

export default SmartTable;
