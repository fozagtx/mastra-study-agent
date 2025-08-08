# Study Tool (Text QG + Web Research + Summaries)

A study-focused toolkit that:
- Generates comprehensive questions from plain text
- Performs real-time web research via Brave Search
- Produces concise summaries with optional live web context

## Features

### ❓ Question Generation (Text)
- Provide raw text and get 5–10 high-quality questions
- Balanced coverage: recall, comprehension, application, analysis
- Token-aware: trims very large inputs

### 🔍 Real-time Web Research
- Brave Search API integration for fresh results
- Structured output for links and key findings

### 📝 Summaries
- Summarize documents or gathered web context
- Focus on high-yield information (80/20)


## Quick Start

1. **Install dependencies:**
```bash
pnpm install
```

2. **Environment variables:** Create `.env` from `.env.example` and set:
```env
MISTRAL_API_KEY=your-mistral-api-key
BRAVE_API_KEY=your-brave-search-api-key
```

3. **Start the development server (if applicable):**
```bash
pnpm dev
```

## Usage Examples

### Generate Questions from Text (direct tool)
```typescript
import { mastra } from './src/mastra';
import { generateQuestionsFromTextTool } from './src/mastra/tools/questions-tool';

const { questions, questionCount, success } = await generateQuestionsFromTextTool.execute({
  context: {
    extractedText: `Your study notes or any text content...`,
    maxQuestions: 10,
  },
  mastra,
});
```

### Real-time Web Research (agent with Brave Search)
```typescript
import { mastra } from './src/mastra';

const researchAgent = mastra.getAgent('ResearchAgent');
const response = await researchAgent.call([{ role: 'user', content: 'latest on transformer architectures' }]);
console.log(response);
```

### Summarization (agent)
```typescript
import { mastra } from './src/mastra';

const summaryAgent = mastra.getAgent('Summary Agent');
const summary = await summaryAgent.call([{ role: 'user', content: 'Summarize: <paste your text here>' }]);
console.log(summary);
```

## Architecture

### Agents
- **Test Agent**: Generates questions from provided text (`generateQuestionsFromTextTool`)
- **ResearchAgent**: Real-time web research using Brave Search (`searchTool`)
- **Summary Agent**: Summarizes content; can optionally use web search for fresh context

### Tools
- **Generate Questions Tool** (`questions-tool.ts`): Creates questions from text
- **Search Tool** (`SearchTool.ts`): Brave Web Search API wrapper

### Workflows
- This template favors direct tool and agent usage rather than predefined workflows.

## Supported Platforms

- General text input for question generation
- Real-time web search via Brave Search API

## Dependencies

- `@mastra/core`: Core framework
- `cheerio`: HTML parsing
- `puppeteer`: Dynamic content extraction
- `@ai-sdk/google`: AI model integration
- `@ai-sdk/mistral`: Mistral models
- `zod`: Schema validation for tools
- `dotenv`: Env management
