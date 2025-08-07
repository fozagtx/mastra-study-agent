import 'dotenv/config';
import { Mastra } from '@mastra/core/mastra';
import { VercelDeployer } from "@mastra/deployer-vercel";
import { MastraJwtAuth } from '@mastra/auth';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { testAgent } from './agents/test-agent';
import { researchAgent } from './agents/research-agent';
import { summaryAgent } from './agents/summary-agent';

export const mastra = new Mastra({
  deployer: new VercelDeployer(),
  agents: {
    testAgent,
    summaryAgent,
    researchAgent,
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
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
