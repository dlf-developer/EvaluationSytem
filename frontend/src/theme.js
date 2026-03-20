import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      primary: "#4A6741", // DLF Green (confident primary, nav, hero, buttons)
      secondary: "#2D3E27", // Forest Deep (darkest touch, emphasis, borders)
      mid: "#6A865D", // Mid Green
      background: "#F5F0E8", // Parchment (warm off-white)
      text: "#2D2A26", // Warm Ink (text and headings)
      textMuted: "#5C5852", // Warm Ink Muted (subheadings)
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  },
  styles: {
    global: {
      body: {
        bg: "brand.background",
        color: "brand.text",
      },
      a: {
        color: "brand.primary",
        _hover: {
          color: "brand.secondary",
        },
      },
    },
  },
  components: {
    Button: {
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === "brand" ? "brand.primary" : undefined,
          color: "white",
          _hover: {
            bg: props.colorScheme === "brand" ? "brand.secondary" : undefined,
          },
        }),
      },
    },
  },
});

export default theme;
