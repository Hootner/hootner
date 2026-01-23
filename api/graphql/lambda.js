// Lambda handler for GraphQL API (ESM)
import serverless from 'serverless-http';
import { app, initializeApp } from './server.js';

let cachedHandler;

export const handler = async (event, context) => {
  if (!cachedHandler) {
    await initializeApp();
    cachedHandler = serverless(app);
  }

  return cachedHandler(event, context);
};
