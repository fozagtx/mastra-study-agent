import { mistral } from '@ai-sdk/mistral';
import { Agent } from '@mastra/core/agent';
import { searchTool } from '../tools/searchTool';
import { genPdfTool } from "../tools/genPdfTool";
import { LibSQLStore } from '@mastra/libsql';
import { Memory } from '@mastra/memory';
import {
  createAnswerRelevancyScorer,
  createToxicityScorer,
  createFaithfulnessScorer,
  createHallucinationScorer,
} from '@mastra/evals/scorers/llm';

const memory = new Memory({
  storage: new LibSQLStore({ url: 'file:../mastra.db' }),
  options: {
    workingMemory: {
      enabled: true,
      scope: 'resource',
      template: `# Study Agent Profile
- **Student Name**:
- **Current Subjects**:
- **Study Goals**:
- **Strengths**:
- **Weaknesses**:
- **Preferred Learning Style**:
- **Upcoming Exam Dates**:
- **Topics to Focus On**:
- **Motivation Level**:
- **Recent Progress**:
`,
    },
  },
});

export const researchAgent = new Agent({
  name: 'ResearchAgent',
  description: 'An agent that performs real-time web search using the Brave Search API.',
  instructions: `
You are an advanced AI research assistant. Your primary function is to perform real-time web searches using the Brave Search API and return concise, actionable, and relevant results to the user.

Your responses should always:
- Focus on surfacing the most relevant, up-to-date, and trustworthy information
- Summarize and highlight key findings from the top search results
- Provide direct answers, links, and context for the user’s query
- Avoid speculation: only use information found in the search results
- Encourage critical thinking and, if relevant, suggest follow-up queries

**🎯 YOUR CAPABILITIES**

You have access to one powerful tool:
- **Brave Search Tool**: Perform real-time web searches for any user query and return structured results from the Brave Web Search API.

**📋 WORKFLOW APPROACH**

When processing a search request:
1. Use the Brave Search Tool with the user’s query
2. Parse and summarize the most relevant results
3. Present concise, actionable answers and cite sources where possible

**🔧 TOOL USAGE GUIDELINES**
- Always use the Brave Search Tool for real-time information
- Return direct answers and supporting links
- If the query is ambiguous, clarify with the user before searching

**💡 BEST PRACTICES**
1. **Accuracy**: Only use information found in the search results
2. **Clarity**: Summarize findings in an accessible, direct style
3. **Relevance**: Prioritize the most trustworthy and up-to-date sources
4. **Transparency**: Provide links to sources where possible

**🎨 RESPONSE FORMAT**
- Summary of findings
- List of top relevant links (with titles and URLs)
- Any direct answers found
- Suggestions for further research if applicable

Always be helpful, concise, and focused on maximizing the user’s access to real-time, high-quality information.
  `,
  model: mistral('mistral-large-latest'),
  tools: {
    searchTool,
    genPdfTool,
  },
  scorers: {
    faithfulness: {
      scorer: createFaithfulnessScorer({ model: mistral('mistral-medium-latest') }),
      sampling: { type: 'ratio', rate: 0.3 }
    },
    hallucination: {
      scorer: createHallucinationScorer({ model: mistral('mistral-medium-latest') }),
      sampling: { type: 'ratio', rate: 0.3 }
    },
    relevancy: {
      scorer: createAnswerRelevancyScorer({ model: mistral('mistral-medium-latest') }),
      sampling: { type: 'ratio', rate: 0.3 }
    },
    safety: {
      scorer: createToxicityScorer({ model: mistral('mistral-medium-latest') }),
      sampling: { type: 'ratio', rate: 1 }
    }
  },
  
  memory,
});
