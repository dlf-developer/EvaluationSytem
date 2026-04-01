import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
  PopoverFooter,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Checkbox,
  CheckboxGroup,
  VStack,
  Text,
  HStack,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { DatePicker } from "antd";
import { Search } from "lucide-react";
import dayjs from "dayjs";

// ── helpers ──────────────────────────────────────────────────
const getDefaultValue = (type) => {
  if (type === "select") return [];
  return null;
};

const isFilterActive = (value) => {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// ── component ─────────────────────────────────────────────────
const FilterPopover = ({
  column,
  data,
  activeFilter,
  onApply,
  onClear,
  children,
}) => {
  const { filterConfig, dataIndex, title, key } = column;
  const { type, options, trueLabel = "Yes", falseLabel = "No", matchFn } =
    filterConfig;

  const [localValue, setLocalValue] = useState(
    activeFilter ?? getDefaultValue(type)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const initialRef = useRef(null);

  // Sync local state when external filter changes (e.g. "Clear All")
  useEffect(() => {
    setLocalValue(activeFilter ?? getDefaultValue(type));
  }, [activeFilter, type]);

  // Derive unique option values from data when no static options provided
  const derivedOptions = useMemo(() => {
    if (options) return options.map(String);
    if (type !== "select") return [];
    const vals = data
      .map((r) => r[dataIndex])
      .filter((v) => v != null && v !== "");
    return [...new Set(vals)].sort().map(String);
  }, [data, dataIndex, options, type]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return derivedOptions;
    return derivedOptions.filter((o) =>
      o.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [derivedOptions, searchQuery]);

  const handleApply = (onClose) => {
    onApply(key, localValue);
    onClose();
  };

  const handleClear = (onClose) => {
    const def = getDefaultValue(type);
    setLocalValue(def);
    setSearchQuery("");
    onClear(key);
    onClose();
  };

  return (
    <Popover
      placement="bottom-start"
      isLazy
      lazyBehavior="unmount"
      initialFocusRef={initialRef}
    >
      {({ onClose }) => (
        <>
          <PopoverTrigger>{children}</PopoverTrigger>

          <PopoverContent
            w="260px"
            boxShadow="0 8px 30px rgba(0,0,0,0.12)"
            border="1.5px solid"
            borderColor="brand.primary"
            borderRadius="xl"
            _focus={{ outline: "none" }}
          >
            <PopoverArrow bg="brand.primary" />

            {/* ── Header ─── */}
            <PopoverHeader
              bg="brand.primary"
              color="white"
              borderTopRadius="xl"
              px={4}
              py={2.5}
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.04em"
              textTransform="uppercase"
              border="none"
            >
              Filter · {title}
            </PopoverHeader>

            {/* ── Body ─── */}
            <PopoverBody p={3}>
              {/* SELECT */}
              {type === "select" && (
                <VStack align="stretch" spacing={2}>
                  <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <Search size={13} />
                    </InputLeftElement>
                    <Input
                      ref={initialRef}
                      placeholder="Search options…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      borderRadius="lg"
                      borderColor="gray.200"
                      fontSize="xs"
                      _focus={{ borderColor: "brand.primary", boxShadow: "none" }}
                    />
                  </InputGroup>

                  <Box maxH="180px" overflowY="auto" pr={1}>
                    <CheckboxGroup
                      value={localValue || []}
                      onChange={(vals) => setLocalValue(vals)}
                    >
                      <VStack align="start" spacing={1.5}>
                        {filteredOptions.length === 0 && (
                          <Text
                            fontSize="xs"
                            color="gray.400"
                            py={3}
                            textAlign="center"
                            w="full"
                          >
                            No options found
                          </Text>
                        )}
                        {filteredOptions.map((opt) => (
                          <Checkbox
                            key={opt}
                            value={opt}
                            size="sm"
                            colorScheme="green"
                            sx={{
                              "& .chakra-checkbox__control[data-checked]": {
                                bg: "brand.primary",
                                borderColor: "brand.primary",
                              },
                            }}
                          >
                            <Text fontSize="sm" color="gray.700">
                              {opt}
                            </Text>
                          </Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  </Box>

                  {(localValue || []).length > 0 && (
                    <Text fontSize="10px" color="brand.primary" fontWeight="600">
                      {(localValue || []).length} selected
                    </Text>
                  )}
                </VStack>
              )}

              {/* TEXT */}
              {type === "text" && (
                <Input
                  ref={initialRef}
                  placeholder={`Search ${title}…`}
                  value={localValue || ""}
                  onChange={(e) => setLocalValue(e.target.value)}
                  size="sm"
                  borderRadius="lg"
                  borderColor="gray.200"
                  fontSize="sm"
                  _focus={{ borderColor: "brand.primary", boxShadow: "none" }}
                />
              )}

              {/* DATE */}
              {type === "date" && (
                <DatePicker
                  style={{ width: "100%", borderRadius: 8 }}
                  value={localValue ? dayjs(localValue) : null}
                  onChange={(date) =>
                    setLocalValue(date ? date.toISOString() : null)
                  }
                  format="DD MMM YYYY"
                  size="small"
                />
              )}

              {/* BOOLEAN */}
              {type === "boolean" && (
                <RadioGroup
                  value={
                    localValue === true
                      ? "true"
                      : localValue === false
                      ? "false"
                      : ""
                  }
                  onChange={(val) =>
                    setLocalValue(
                      val === "true" ? true : val === "false" ? false : null
                    )
                  }
                >
                  <Stack direction="column" spacing={2}>
                    <Radio
                      value="true"
                      size="sm"
                      colorScheme="green"
                      sx={{
                        "& .chakra-radio__control[data-checked]": {
                          bg: "brand.primary",
                          borderColor: "brand.primary",
                        },
                      }}
                    >
                      <Text fontSize="sm">{trueLabel}</Text>
                    </Radio>
                    <Radio
                      value="false"
                      size="sm"
                      colorScheme="green"
                      sx={{
                        "& .chakra-radio__control[data-checked]": {
                          bg: "brand.primary",
                          borderColor: "brand.primary",
                        },
                      }}
                    >
                      <Text fontSize="sm">{falseLabel}</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>
              )}
            </PopoverBody>

            {/* ── Footer ─── */}
            <PopoverFooter
              borderTop="1px solid"
              borderColor="gray.100"
              px={3}
              py={2}
            >
              <HStack justify="space-between">
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.500"
                  fontWeight="600"
                  onClick={() => handleClear(onClose)}
                  _hover={{ color: "red.500", bg: "red.50" }}
                  borderRadius="md"
                >
                  Clear
                </Button>
                <Button
                  size="xs"
                  bg="brand.primary"
                  color="white"
                  fontWeight="600"
                  _hover={{ bg: "brand.secondary" }}
                  onClick={() => handleApply(onClose)}
                  borderRadius="md"
                  px={4}
                >
                  Apply
                </Button>
              </HStack>
            </PopoverFooter>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
};

export default FilterPopover;
