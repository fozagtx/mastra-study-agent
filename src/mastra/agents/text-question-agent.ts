import { mistral } from "@ai-sdk/mistral";
import { Agent } from "@mastra/core/agent";

export const textQuestionAgent = new Agent({
  name: "textQuestionAgent",
  description: "Lightweight agent for generating questions from provided text without using additional tools",
  instructions: `You generate clear, concise study questions from input text. Focus on key concepts, definitions, mechanisms, comparisons, and applications. Provide a diverse set of question types and avoid requiring external tools.`,
  model: mistral("mistral-large-latest"),
  tools: {},
});
