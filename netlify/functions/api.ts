import serverless from 'serverless-http';
import { createApp } from '../../src/server/app.ts';
import { db } from '../../src/server/db.ts';

const app = createApp();
const expressHandler = serverless(app, {
  binary: ['application/pdf', 'application/octet-stream', 'image/*'],
});

export const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // Make sure this instance sees the latest data saved by any other instance
  await db.refreshFromCloud();
  try {
    return await expressHandler(event, context);
  } finally {
    // Don't let the function freeze before MongoDB writes are done
    await db.flush();
  }
};
