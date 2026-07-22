import { Font } from "@react-pdf/renderer";

/**
 * Registers fonts used across all PDF documents.
 * NotoSansDevanagari supports Hindi (Devanagari script) + Latin characters.
 * Call this once at app startup or import this module in every PDF document file.
 *
 * Font files are served from /public/fonts/
 */
Font.register({
  family: "NotoSansDevanagari",
  fonts: [
    {
      src: "/fonts/NotoSansDevanagari-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/fonts/NotoSansDevanagari-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

// Also register Open Sans for backward-compat (English-only)
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
  ],
});

/**
 * Use this font family for ALL text in PDF documents.
 * NotoSansDevanagari covers both Hindi (Devanagari) and Latin scripts.
 */
export const PDF_FONT = "NotoSansDevanagari";
