import 'dotenv/config';
import { Mastra } from '@mastra/core/mastra';
import { VercelDeployer } from "@mastra/deployer-vercel";
import { MastraJwtAuth } from '@mastra/auth';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { testAgent } from './agents/test-agent';
import { researchAgent } from './agents/research-agent';
import { summaryAgent } from './agents/summary-agent';
import { textQuestionAgent } from './agents/text-question-agent';

export const mastra = new Mastra({
  deployer: new VercelDeployer(),
  agents: {
    testAgent,
    summaryAgent,
    researchAgent,
    textQuestionAgent,
  },
  storage: new LibSQLStore({
    url: ':memory:',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  server: {
    experimental_auth: new MastraJwtAuth({
      secret: "mySuperSecretKey123!@#"
    }),
  },
});
