import { PDFDocument } from "pdf-lib";

/**
 * Converts a base64 data URI to a Uint8Array
 */
function base64ToUint8Array(base64DataUri) {
  const base64Index = base64DataUri.indexOf("base64,");
  const rawBase64 = base64Index !== -1 ? base64DataUri.slice(base64Index + 7) : base64DataUri;
  const binaryString = atob(rawBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Resolves PDF bytes from either a base64 data URI, Blob, or URL
 */
async function resolvePdfBytes(file) {
  if (!file) return null;

  if (file instanceof Uint8Array || file instanceof ArrayBuffer) {
    return file;
  }

  if (file instanceof Blob) {
    return new Uint8Array(await file.arrayBuffer());
  }

  const url = file.url || (typeof file === "string" ? file : null);
  if (!url) return null;

  if (url.startsWith("data:application/pdf") || url.startsWith("data:;base64,") || url.includes(";base64,")) {
    return base64ToUint8Array(url);
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (err) {
    console.error(`Failed to fetch attachment PDF from ${url}:`, err);
    return null;
  }
}

/**
 * Merges the primary report PDF with all attached PDF documents
 * 
 * @param {Blob|ArrayBuffer|Uint8Array} mainPdfInput - Primary generated PDF from ReactPDF
 * @param {Array} attachments - Array of attachment objects { name, url, type }
 * @returns {Promise<Blob>} - Combined single PDF Blob
 */
export async function mergeReportWithAttachments(mainPdfInput, attachments = []) {
  try {
    const mainBytes = await resolvePdfBytes(mainPdfInput);
    if (!mainBytes) {
      throw new Error("Invalid main PDF input");
    }

    // Filter attachments that are PDFs
    const pdfAttachments = (attachments || []).filter((file) => {
      if (!file) return false;
      const isPdfType = file.type === "application/pdf";
      const isPdfUrl = file.url?.startsWith("data:application/pdf");
      const isPdfName = (file.name || "").toLowerCase().endsWith(".pdf");
      return isPdfType || isPdfUrl || isPdfName || (typeof file === "string" && file.startsWith("data:application/pdf"));
    });

    // If there are no PDF attachments, return the main PDF directly as a Blob
    if (pdfAttachments.length === 0) {
      return mainPdfInput instanceof Blob ? mainPdfInput : new Blob([mainBytes], { type: "application/pdf" });
    }

    // Create a new merged PDF document
    const mergedDoc = await PDFDocument.create();

    // 1. Copy main report pages
    const mainDoc = await PDFDocument.load(mainBytes, { ignoreEncryption: true });
    const mainPages = await mergedDoc.copyPages(mainDoc, mainDoc.getPageIndices());
    mainPages.forEach((page) => mergedDoc.addPage(page));

    // 2. Sequentially copy pages from each attached PDF
    for (let i = 0; i < pdfAttachments.length; i++) {
      const att = pdfAttachments[i];
      try {
        const attBytes = await resolvePdfBytes(att);
        if (!attBytes || attBytes.byteLength === 0) continue;

        const attDoc = await PDFDocument.load(attBytes, { ignoreEncryption: true });
        const attPages = await mergedDoc.copyPages(attDoc, attDoc.getPageIndices());
        attPages.forEach((page) => mergedDoc.addPage(page));
      } catch (attErr) {
        console.warn(`Could not merge attachment #${i + 1} (${att.name || "unnamed"}):`, attErr);
        // Continue merging remaining valid attachments
      }
    }

    const mergedPdfBytes = await mergedDoc.save();
    return new Blob([mergedPdfBytes], { type: "application/pdf" });
  } catch (error) {
    console.error("Error merging report with attachments:", error);
    // Graceful fallback to original PDF
    return mainPdfInput instanceof Blob ? mainPdfInput : new Blob([mainPdfInput], { type: "application/pdf" });
  }
}
