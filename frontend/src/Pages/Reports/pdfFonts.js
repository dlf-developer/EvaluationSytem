import { Font } from "@react-pdf/renderer";
import { NOTO_REGULAR_BASE64, NOTO_BOLD_BASE64 } from "./fontAssets";

/**
 * Registers fonts used across all PDF documents.
 * NotoSansDevanagari supports Hindi (Devanagari script) + Latin characters.
 * Uses embedded base64 font data URIs to guarantee offline & production compatibility
 * without external network requests or 404 HTML format errors.
 */
try {
  Font.register({
    family: "NotoSansDevanagari",
    fonts: [
      {
        src: NOTO_REGULAR_BASE64,
        fontWeight: "normal",
      },
      {
        src: NOTO_BOLD_BASE64,
        fontWeight: "bold",
      },
    ],
  });
} catch (e) {
  console.warn("NotoSansDevanagari font registration notice:", e);
}

export const PDF_FONT = "NotoSansDevanagari";
