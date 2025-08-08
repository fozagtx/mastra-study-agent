import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createSmitheryUrl } from "@smithery/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const SMITHERY_API_KEY = process.env.SMITHERY_API_KEY;
const SMITHERY_PROFILE = process.env.SMITHERY_PROFILE;

export const genPdfTool = createTool({
  id: "gen-pdf-tool",
  description:
    "Generates a PDF using Smithery MCP @gen-pdf. Provide either HTML or Markdown input.",
  inputSchema: z
    .object({
      html: z.string().optional().describe("HTML content to render into PDF"),
      markdown: z.string().optional().describe("Markdown content to render into PDF"),
      filename: z.string().optional().describe("Desired filename (e.g., output.pdf)"),
      toc: z.boolean().optional().describe("Add a table of contents to the beginning of the PDF"),
      cover: z.boolean().optional().describe("Add a cover page containing title, subtitle, date, and image"),
      title: z.string().optional().describe("Title for the PDF document (required if using cover)"),
      authors: z.array(z.string()).optional().describe("Authors listed on the cover page"),
      darkMode: z.boolean().optional().describe("Enable dark theme for the document"),
      subtitle: z.string().optional().describe("Subtitle for the PDF document"),
      pageMargin: z.string().optional().describe("Page margins (e.g., '1in' or CSS-like shorthand)"),
      markdownDocument: z.string().optional().describe("Markdown content to convert to PDF"),
      enablePageNumbering: z.boolean().optional().describe("Enable page numbering"),
    })
    .refine((v) => Boolean(v.html || v.markdown || v.markdownDocument), {
      message: "Provide 'html', 'markdown', or 'markdownDocument'",
      path: ["markdownDocument"],
    }),
  outputSchema: z.object({
    pdfBase64: z.string().describe("Base64-encoded PDF content"),
    contentType: z.string().default("application/pdf"),
    bytes: z.number().optional().describe("Size in bytes if known"),
    toolName: z.string().optional().describe("MCP tool used for generation"),
  }),
  execute: async ({ context }) => {
    if (!SMITHERY_API_KEY || !SMITHERY_PROFILE) {
      throw new Error(
        "Missing SMITHERY_API_KEY or SMITHERY_PROFILE. Set them in your environment (.env).",
      );
    }

    const serverUrl = createSmitheryUrl(
      "https://server.smithery.ai/@gen-pdf/mcp",
      { apiKey: SMITHERY_API_KEY, profile: SMITHERY_PROFILE },
    );

    const transport = new StreamableHTTPClientTransport(serverUrl);
    const client = new Client({ name: "Study Agent", version: "1.0.0" });

    await client.connect(transport);

    // Discover available tools, pick one containing "pdf" or fallback to first
    const toolsRaw = (await client.listTools()) as unknown;
    const toolList: Array<{ name?: string }> = Array.isArray(toolsRaw)
      ? (toolsRaw as Array<{ name?: string }>)
      : [];
    if (toolList.length === 0) {
      throw new Error("No MCP tools available on Smithery endpoint");
    }

    // Prefer tool with "pdf" in its name; fall back to the first tool
    const preferred =
      (toolList.find((t) => t?.name && /pdf/i.test(t.name))?.name ?? toolList[0]?.name) as string;

    // Prepare arguments for the PDF tool. Common conventions supported by @gen-pdf
    const {
      html,
      markdown,
      filename,
      toc,
      cover,
      title,
      authors,
      darkMode,
      subtitle,
      pageMargin,
      markdownDocument,
      enablePageNumbering,
    } = context as {
      html?: string;
      markdown?: string;
      filename?: string;
      toc?: boolean;
      cover?: boolean;
      title?: string;
      authors?: string[];
      darkMode?: boolean;
      subtitle?: string;
      pageMargin?: string;
      markdownDocument?: string;
      enablePageNumbering?: boolean;
    };

    const args: Record<string, unknown> = {};
    if (html) args.html = html;
    if (markdown) args.markdown = markdown;
    if (markdownDocument) args.markdownDocument = markdownDocument;
    if (filename) args.filename = filename;
    if (typeof toc === "boolean") args.toc = toc;
    if (typeof cover === "boolean") args.cover = cover;
    if (typeof title === "string") args.title = title;
    if (Array.isArray(authors)) args.authors = authors;
    if (typeof darkMode === "boolean") args.darkMode = darkMode;
    if (typeof subtitle === "string") args.subtitle = subtitle;
    if (typeof pageMargin === "string") args.pageMargin = pageMargin;
    if (typeof enablePageNumbering === "boolean") args.enablePageNumbering = enablePageNumbering;

    // Execute
    const result = await client.callTool({ name: preferred, arguments: args });

    // Try to extract base64 PDF from common MCP payload shapes
    // 1) Direct { base64 } or { data } field
    // 2) content[] entries with type === "binary" or a string payload
    // 3) Fallback: stringify result
    let pdfBase64: string | undefined;
    let bytes: number | undefined;

    // Direct fields
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown> & { content?: unknown };
      const base64Field = r["base64"];
      const dataField = r["data"];
      if (typeof base64Field === "string") {
        pdfBase64 = base64Field;
      } else if (typeof dataField === "string") {
        pdfBase64 = dataField;
      }

      if (!pdfBase64 && Array.isArray(r.content)) {
        for (const item of r.content as unknown[]) {
          if (!item) continue;
          if (
            typeof item === "object" &&
            item !== null &&
            ("type" in item || "mime" in item)
          ) {
            const obj = item as { type?: unknown; mime?: unknown; data?: unknown; bytes?: unknown };
            const isPdfBinary =
              (typeof obj.type === "string" && obj.type === "binary") ||
              (typeof obj.mime === "string" && obj.mime === "application/pdf");
            if (isPdfBinary && typeof obj.data === "string") {
              pdfBase64 = obj.data;
              if (typeof obj.bytes === "number") bytes = obj.bytes;
              break;
            }
          }
          if (typeof item === "string" && /\n?JVBER/i.test(item)) {
            // If a string looks like base64-encoded PDF (starts with %PDF -> JVBER)
            pdfBase64 = item;
            break;
          }
        }
      }
    }

    if (!pdfBase64) {
      // As a last resort, try to coerce to string
      pdfBase64 = typeof result === "string" ? result : Buffer.from(JSON.stringify(result)).toString("base64");
    }

    return {
      pdfBase64,
      contentType: "application/pdf",
      bytes,
      toolName: preferred,
    };
  },
});
