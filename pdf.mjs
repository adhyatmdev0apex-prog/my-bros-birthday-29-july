// This file should be populated with the contents of `pdf.mjs`
// from the official PDF.js distribution.
//
// Example download steps:
// 1. curl -L https://github.com/mozilla/pdf.js/releases/latest/download/pdfjs.zip -o pdfjs.zip
// 2. unzip pdfjs.zip
// 3. cp build/pdf.mjs js/pdfjs/pdf.mjs

// Placeholder exports to make the module system work until the real file is in place.
export const GlobalWorkerOptions = {};
export function getDocument() {
    console.error("This is a placeholder for pdf.mjs. Please replace it with the real file from the PDF.js distribution.");
    return { promise: Promise.reject("Placeholder file") };
}