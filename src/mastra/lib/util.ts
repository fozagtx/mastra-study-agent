// PDF text extraction is disabled because the pdf2json dependency was removed.
// Provide extracted text upstream or reintroduce a parser of your choice.
export async function extractTextFromPDF(_pdfBuffer: Buffer): Promise<{ extractedText: string; pagesCount: number }> {
  throw new Error(
    'PDF text extraction is disabled: pdf2json was removed from dependencies. Pass extracted text from another service/tool or add an alternative PDF parser.'
  );
}
