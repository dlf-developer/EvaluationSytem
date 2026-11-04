import React from "react";
import { Box, Flex, Text, Tooltip } from "@chakra-ui/react";
import { Check } from "lucide-react";

export const RUBRIC_LEVELS = [
  {
    value: "1",
    score: 1,
    title: "1",
    label: "Unsatisfactory",
    shortLabel: "Unsatisfactory",
    desc: "Does not meet the expected teaching benchmark. Needs immediate intervention.",
    dotColor: "#EF4444",
    bg: "#FEF2F2",
    border: "#FCA5A5",
    activeBg: "#FEE2E2",
    activeBorder: "#EF4444",
    activeText: "#991B1B",
    activeShadow: "0 2px 8px rgba(239, 68, 68, 0.25)",
  },
  {
    value: "2",
    score: 2,
    title: "2",
    label: "Basic",
    shortLabel: "Basic",
    desc: "Partially meets benchmark with identifiable areas requiring development.",
    dotColor: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
    activeBg: "#FEF3C7",
    activeBorder: "#F59E0B",
    activeText: "#92400E",
    activeShadow: "0 2px 8px rgba(245, 158, 11, 0.25)",
  },
  {
    value: "3",
    score: 3,
    title: "3",
    label: "Proficient",
    shortLabel: "Proficient",
    desc: "Consistently demonstrates strong, competent execution of pedagogical standards.",
    dotColor: "#3B82F6",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    activeBg: "#DBEAFE",
    activeBorder: "#3B82F6",
    activeText: "#1E40AF",
    activeShadow: "0 2px 8px rgba(59, 130, 246, 0.25)",
  },
  {
    value: "4",
    score: 4,
    title: "4",
    label: "Distinguished",
    shortLabel: "Distinguished",
    desc: "Exemplary, student-centered, highly engaging practice of the highest order.",
    dotColor: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    activeBg: "#DCFCE7",
    activeBorder: "#16A34A",
    activeText: "#166534",
    activeShadow: "0 2px 8px rgba(22, 163, 74, 0.25)",
  },
  {
    value: "N/A",
    score: null,
    title: "N/A",
    label: "Not Applicable",
    shortLabel: "N/A",
    desc: "Parameter not observed or not applicable for this session.",
    dotColor: "#64748B",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    activeBg: "#E2E8F0",
    activeBorder: "#64748B",
    activeText: "#1E293B",
    activeShadow: "0 2px 6px rgba(100, 116, 139, 0.2)",
  },
];

/**
 * Modern, tactile Rubric rating scale button group for Ant Design Form.Item
 */
const RubricScaleSelector = ({ value, onChange, disabled = false }) => {
  return (
    <Flex
      gap={{ base: 2, sm: 2.5 }}
      w="full"
      wrap="wrap"
      role="radiogroup"
      aria-label="Rubric rating scale"
      pt={1}
    >
      {RUBRIC_LEVELS.map((level) => {
        const isSelected = String(value) === String(level.value);

        return (
          <Tooltip
            key={level.value}
            label={level.desc}
            placement="top"
            hasArrow
            bg="gray.800"
            color="white"
            fontSize="xs"
            borderRadius="md"
            px={2.5}
            py={1.5}
            openDelay={400}
          >
            <Box
              as="button"
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => {
                if (!disabled && onChange) {
                  onChange(level.value);
                }
              }}
              flex={{ base: "1 1 30%", sm: "1 1 0" }}
              minW={{ base: "68px", sm: "90px" }}
              px={{ base: 2, md: 3 }}
              py={{ base: 2, md: 2.5 }}
              borderRadius="xl"
              borderWidth="1.5px"
              borderColor={isSelected ? level.activeBorder : "#E5E7EB"}
              bg={isSelected ? level.activeBg : "#FFFFFF"}
              color={isSelected ? level.activeText : "#374151"}
              boxShadow={isSelected ? level.activeShadow : "0 1px 2px rgba(0,0,0,0.02)"}
              transform={isSelected ? "translateY(-1px)" : "none"}
              transition="all 0.18s cubic-bezier(0.4, 0, 0.2, 1)"
              cursor={disabled ? "not-allowed" : "pointer"}
              _hover={
                disabled
                  ? {}
                  : {
                      borderColor: isSelected ? level.activeBorder : level.border,
                      bg: isSelected ? level.activeBg : level.bg,
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    }
              }
              _active={{ transform: "scale(0.97)" }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap="2px"
              textAlign="center"
              userSelect="none"
            >
              <Flex align="center" gap={1}>
                <Text
                  fontSize={{ base: "sm", md: "15px" }}
                  fontWeight="800"
                  lineHeight="1.2"
                  color={isSelected ? level.activeText : "#111827"}
                >
                  {level.title}
                </Text>
                {isSelected && (
                  <Box
                    as={Check}
                    size={13}
                    strokeWidth={3}
                    color={level.activeText}
                  />
                )}
              </Flex>
              <Text
                fontSize={{ base: "10px", md: "11px" }}
                fontWeight={isSelected ? "700" : "500"}
                color={isSelected ? level.activeText : "#6B7280"}
                lineHeight="1.2"
                noOfLines={1}
              >
                {level.label}
              </Text>
            </Box>
          </Tooltip>
        );
      })}
    </Flex>
  );
};

export default RubricScaleSelector;

