// This file should be populated with the contents of `pdf.js`
// from the official PDF.js UMD distribution.
//
// Example download steps:
// 1. Download `pdfjs-4.4.178-dist.zip` from https://mozilla.github.io/pdf.js/getting_started/#download
// 2. Unzip `pdfjs-4.4.178-dist.zip`
// 3. Copy `build/pdf.js` into this file.

console.log("PDF.js UMD build (pdf.js) loaded (placeholder).");
window.pdfjsLib = { GlobalWorkerOptions: {}, getDocument: () => { console.error("PDF.js not fully loaded. Replace placeholder with actual library."); return { promise: Promise.reject("Placeholder file") }; } };