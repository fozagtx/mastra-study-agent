# Study Tool with Web Crawler MCP Server

A comprehensive study tool that helps students upload PDFs, generate questions, get summaries, and assess their work by crawling external documents like Google Docs and Notion.

## Features

### 📚 PDF Processing
- Upload PDFs and extract content
- Generate comprehensive questions from PDF content
- Create summaries of PDF documents

### 🤖 AI-Powered Assessment
- Generate questions from text content
- Assess student work from external documents
- Provide detailed feedback and scoring

### 🌐 Web Crawler MCP Server
- Extract content from Google Docs, Notion, and other web pages
- Support for both static and dynamic content
- Intelligent content parsing and filtering

## Quick Start

1. **Install dependencies:**
```bash
pnpm install
```

2. **Start the development server:**
```bash
pnpm dev
```

## Usage Examples

### Generate Questions from PDF
```typescript
import { generateQuestionsFromPdfWorkflow } from './src/mastra';

const result = await generateQuestionsFromPdfWorkflow.execute({
  pdfUrl: 'https://example.com/document.pdf'
});
```

### Assess Student Work
```typescript
import { assessStudentWorkWorkflow } from './src/mastra';

const assessment = await assessStudentWorkWorkflow.execute({
  documentUrl: 'https://docs.google.com/document/d/your-doc-id',
  originalQuestions: [
    'What is the main concept discussed?',
    'How does this relate to other topics?'
  ],
  subject: 'Physics',
  assessmentType: 'comprehensive'
});
```

### Web Crawler Tool
```typescript
import { webCrawlerTool } from './src/mastra';

const content = await webCrawlerTool.execute({
  url: 'https://notion.so/your-page',
  contentType: 'full',
  usePuppeteer: true // For dynamic content
});
```

## Architecture

### Agents
- **PDF Question Agent**: Generates questions from PDF content
- **PDF Summarization Agent**: Creates summaries of PDF documents
- **Text Question Agent**: Generates questions from text content
- **Content Assessment Agent**: Evaluates student work

### Tools
- **Download PDF Tool**: Downloads and processes PDF files
- **Generate Questions Tool**: Creates questions from text
- **Web Crawler Tool**: Extracts content from web pages

### Workflows
- **Generate Questions from PDF**: Complete workflow for PDF processing
- **Assess Student Work**: Evaluates work from external documents

## Supported Platforms

- **Google Docs**: Full content extraction
- **Notion**: Page content and structure
- **General Web Pages**: Text content extraction
- **PDF Documents**: Content parsing and analysis

## Dependencies

- `@mastra/core`: Core framework
- `cheerio`: HTML parsing
- `puppeteer`: Dynamic content extraction
- `pdf2json`: PDF processing
- `@ai-sdk/google`: AI model integration
