import React from "react";
import { Box, Flex, Text, Tooltip } from "@chakra-ui/react";
import { Check } from "lucide-react";

export const CHOICE_PRESETS = {
  yes: {
    dotColor: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    activeBg: "#DCFCE7",
    activeBorder: "#16A34A",
    activeText: "#15803D",
    activeShadow: "0 2px 8px rgba(22, 163, 74, 0.25)",
  },
  no: {
    dotColor: "#EF4444",
    bg: "#FEF2F2",
    border: "#FCA5A5",
    activeBg: "#FEE2E2",
    activeBorder: "#EF4444",
    activeText: "#B91C1C",
    activeShadow: "0 2px 8px rgba(239, 68, 68, 0.25)",
  },
  "n/a": {
    dotColor: "#64748B",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    activeBg: "#E2E8F0",
    activeBorder: "#64748B",
    activeText: "#1E293B",
    activeShadow: "0 2px 6px rgba(100, 116, 139, 0.2)",
  },
  na: {
    dotColor: "#64748B",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    activeBg: "#E2E8F0",
    activeBorder: "#64748B",
    activeText: "#1E293B",
    activeShadow: "0 2px 6px rgba(100, 116, 139, 0.2)",
  },
  sometimes: {
    dotColor: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
    activeBg: "#FEF3C7",
    activeBorder: "#F59E0B",
    activeText: "#92400E",
    activeShadow: "0 2px 8px rgba(245, 158, 11, 0.25)",
  },
  "1": {
    sublabel: "Unsatisfactory",
    dotColor: "#EF4444",
    bg: "#FEF2F2",
    border: "#FCA5A5",
    activeBg: "#FEE2E2",
    activeBorder: "#EF4444",
    activeText: "#991B1B",
    activeShadow: "0 2px 8px rgba(239, 68, 68, 0.25)",
  },
  "2": {
    sublabel: "Basic",
    dotColor: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
    activeBg: "#FEF3C7",
    activeBorder: "#F59E0B",
    activeText: "#92400E",
    activeShadow: "0 2px 8px rgba(245, 158, 11, 0.25)",
  },
  "3": {
    sublabel: "Proficient",
    dotColor: "#3B82F6",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    activeBg: "#DBEAFE",
    activeBorder: "#3B82F6",
    activeText: "#1E40AF",
    activeShadow: "0 2px 8px rgba(59, 130, 246, 0.25)",
  },
  "4": {
    sublabel: "Distinguished",
    dotColor: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    activeBg: "#DCFCE7",
    activeBorder: "#16A34A",
    activeText: "#166534",
    activeShadow: "0 2px 8px rgba(22, 163, 74, 0.25)",
  },
};

const DEFAULT_THEME = {
  dotColor: "#1a4d2e",
  bg: "#F4F8F4",
  border: "#C8DCC9",
  activeBg: "#E3ECE4",
  activeBorder: "#1a4d2e",
  activeText: "#1a4d2e",
  activeShadow: "0 2px 8px rgba(26, 77, 46, 0.25)",
};

const DEFAULT_YES_NO_NA = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "N/A", label: "N/A" },
];

/**
 * Modern tactile Choice / Checkbox / Radio Scale Selector component
 * Inspired by Classroom Walkthrough Rubric selector
 */
export const ChoiceScaleSelector = ({
  value,
  onChange,
  options = DEFAULT_YES_NO_NA,
  size = "middle",
  disabled = false,
  wrap = "wrap",
  className = "",
}) => {
  const normalizedOptions = (options || []).map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.label,
        label: opt.label !== undefined ? opt.label : String(opt.value),
        sublabel: opt.sublabel,
        desc: opt.desc,
      };
    }
    const str = String(opt);
    return { value: opt, label: str };
  });

  const sizeProps = {
    small: {
      minW: { base: "52px", sm: "60px" },
      px: { base: 2, sm: 2.5 },
      py: { base: 1, sm: 1.5 },
      fontSize: "xs",
      subfontSize: "9px",
      borderRadius: "lg",
      checkSize: 11,
      gap: 1.5,
    },
    middle: {
      minW: { base: "64px", sm: "76px" },
      px: { base: 2.5, md: 3.5 },
      py: { base: 1.5, md: 2 },
      fontSize: "sm",
      subfontSize: "10px",
      borderRadius: "xl",
      checkSize: 13,
      gap: 2,
    },
    large: {
      minW: { base: "80px", sm: "96px" },
      px: { base: 3.5, md: 4.5 },
      py: { base: 2.5, md: 3 },
      fontSize: { base: "sm", md: "15px" },
      subfontSize: "11px",
      borderRadius: "xl",
      checkSize: 14,
      gap: 2.5,
    },
  }[size] || {
    minW: { base: "64px", sm: "76px" },
    px: { base: 2.5, md: 3.5 },
    py: { base: 1.5, md: 2 },
    fontSize: "sm",
    subfontSize: "10px",
    borderRadius: "xl",
    checkSize: 13,
    gap: 2,
  };

  return (
    <Flex
      gap={sizeProps.gap}
      wrap={wrap}
      role="radiogroup"
      align="center"
      className={className}
      userSelect="none"
    >
      {normalizedOptions.map((opt) => {
        const isSelected = String(value) === String(opt.value);
        const presetKey = String(opt.value).toLowerCase();
        const theme = CHOICE_PRESETS[presetKey] || DEFAULT_THEME;
        const sublabel = opt.sublabel || theme.sublabel;

        const buttonElement = (
          <Box
            key={String(opt.value)}
            as="button"
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => {
              if (!disabled && onChange) {
                onChange(opt.value);
              }
            }}
            minW={sizeProps.minW}
            px={sizeProps.px}
            py={sizeProps.py}
            borderRadius={sizeProps.borderRadius}
            borderWidth="1.5px"
            borderColor={isSelected ? theme.activeBorder : "#E5E7EB"}
            bg={isSelected ? theme.activeBg : "#FFFFFF"}
            color={isSelected ? theme.activeText : "#374151"}
            boxShadow={isSelected ? theme.activeShadow : "0 1px 2px rgba(0,0,0,0.02)"}
            transform={isSelected ? "translateY(-1px)" : "none"}
            transition="all 0.16s cubic-bezier(0.4, 0, 0.2, 1)"
            cursor={disabled ? "not-allowed" : "pointer"}
            _hover={
              disabled
                ? {}
                : {
                    borderColor: isSelected ? theme.activeBorder : theme.border,
                    bg: isSelected ? theme.activeBg : theme.bg,
                    transform: "translateY(-1px)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  }
            }
            _active={{ transform: "scale(0.97)" }}
            display="inline-flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
          >
            <Flex align="center" justify="center" gap={1.5}>
              <Text
                fontSize={sizeProps.fontSize}
                fontWeight={isSelected ? "800" : "600"}
                lineHeight="1.2"
                color={isSelected ? theme.activeText : "#1F2937"}
              >
                {opt.label}
              </Text>
              {isSelected && (
                <Box
                  as={Check}
                  size={sizeProps.checkSize}
                  strokeWidth={3}
                  color={theme.activeText}
                  flexShrink={0}
                />
              )}
            </Flex>
            {sublabel && (
              <Text
                fontSize={sizeProps.subfontSize}
                fontWeight={isSelected ? "700" : "500"}
                color={isSelected ? theme.activeText : "#6B7280"}
                lineHeight="1.1"
                mt="2px"
                noOfLines={1}
              >
                {sublabel}
              </Text>
            )}
          </Box>
        );

        if (opt.desc) {
          return (
            <Tooltip
              key={String(opt.value)}
              label={opt.desc}
              placement="top"
              hasArrow
              bg="gray.800"
              color="white"
              fontSize="xs"
              borderRadius="md"
              px={2.5}
              py={1.5}
              openDelay={350}
            >
              {buttonElement}
            </Tooltip>
          );
        }

        return buttonElement;
      })}
    </Flex>
  );
};

export default ChoiceScaleSelector;

