import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

export const searchTool = createTool({
  id: "search-tool",
  description: "Performs real-time web search using Brave Web Search API.",
  inputSchema: z.object({
    query: z.string().describe("The web search query to send to Brave Search API"),
  }),
  outputSchema: z.object({
    results: z.any().describe("Raw Brave Web Search API response")
  }),
  execute: async ({ context }) => {
    const { query } = context;
    if (!BRAVE_API_KEY) {
      throw new Error("BRAVE_API_KEY env variable is not set");
    }
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
    }
    const results = await response.json();
    return { results };
  },
});
