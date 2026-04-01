import React from "react";
import { Flex, Text, Icon } from "@chakra-ui/react";
import { ArrowUp, ArrowDown, Filter } from "lucide-react";
import FilterPopover from "./FilterPopover";

const ColumnHeader = ({
  column,
  data,
  sortState,
  onSort,
  activeFilter,
  onFilterApply,
  onFilterClear,
}) => {
  const { title, key, sortable, filterConfig } = column;

  const isSortedAsc  = sortState.key === key && sortState.direction === "asc";
  const isSortedDesc = sortState.key === key && sortState.direction === "desc";
  const isSorted     = isSortedAsc || isSortedDesc;

  const filterIsActive = (() => {
    if (!activeFilter) return false;
    if (Array.isArray(activeFilter)) return activeFilter.length > 0;
    return activeFilter !== null && activeFilter !== undefined && activeFilter !== "";
  })();

  const Inner = (
    <Flex
      as="span"
      align="center"          /* single cross-axis baseline for ALL children */
      gap="6px"
      userSelect="none"
      w="full"
      cursor={sortable || filterConfig ? "pointer" : "default"}
      _hover={sortable || filterConfig ? { color: "brand.primary" } : {}}
      role={sortable || filterConfig ? "button" : undefined}
      onClick={sortable && !filterConfig ? () => onSort(key) : undefined}
      /* ensure the flex row itself never grows taller than its content */
      display="inline-flex"
    >
      {/* ── Sort arrows ──────────────────────────────────────── */}
      {sortable && (
        <Flex
          as="span"
          direction="column"
          align="center"
          gap="1px"
          flexShrink={0}
          /* fix size so it never shifts siblings */
          style={{ width: 10, lineHeight: 0 }}
        >
          <Icon
            as={ArrowUp}
            boxSize="9px"
            display="block"
            color={isSortedAsc ? "brand.primary" : "gray.300"}
            strokeWidth={isSortedAsc ? 3 : 2}
          />
          <Icon
            as={ArrowDown}
            boxSize="9px"
            display="block"
            color={isSortedDesc ? "brand.primary" : "gray.300"}
            strokeWidth={isSortedDesc ? 3 : 2}
          />
        </Flex>
      )}

      {/* ── Column title ─────────────────────────────────────── */}
      <Text
        as="span"
        fontSize="11px"
        fontWeight="700"
        color={isSorted ? "brand.primary" : "gray.600"}
        letterSpacing="0.06em"
        textTransform="uppercase"
        lineHeight="1"          /* keep text from adding extra height */
        flex="1"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {title}
      </Text>

      {/* ── Filter funnel icon ───────────────────────────────── */}
      {filterConfig && (
        <Icon
          as={Filter}
          /* match visual size of the text beside it */
          boxSize="11px"
          display="block"       /* removes inline ghost space */
          flexShrink={0}
          color={filterIsActive ? "brand.primary" : "gray.350"}
          strokeWidth={filterIsActive ? 3 : 2}
          fill={filterIsActive ? "currentColor" : "none"}
        />
      )}
    </Flex>
  );

  if (filterConfig) {
    return (
      <FilterPopover
        column={column}
        data={data}
        activeFilter={activeFilter}
        onApply={onFilterApply}
        onClear={onFilterClear}
      >
        <span style={{ display: "block", width: "100%" }}>{Inner}</span>
      </FilterPopover>
    );
  }

  return Inner;
};

export default ColumnHeader;
