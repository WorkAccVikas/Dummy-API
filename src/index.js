import dotenv from 'dotenv';

import connectDB from './db/index.js';
import { app } from './app.js';
import { createSelfPing } from './utils/selfPing/selfPing.js';

dotenv.config({
  path: './.env',
});

const PORT = process.env.PORT ?? 8000;

const selfPing = createSelfPing({
  url: process.env.SELF_PING_URL,
  intervalMs: Number(process.env.SELF_PING_INTERVAL_MS),
  timeoutMs: Number(process.env.SELF_PING_TIMEOUT_MS),
  initialDelayMs: Number(process.env.SELF_PING_INITIAL_DELAY_MS),
  enabled: process.env.SELF_PING_ENABLED,
});

let server;
let isShuttingDown = false;

async function startServer() {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);

      selfPing.start();
    });
  } catch (error) {
    console.error('❌ Failed to start application:', error);

    process.exitCode = 1;
  }
}

function shutdown(signal) {
  if (isShuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down gracefully...`);

  // Stop self-ping first.
  selfPing.stop();

  if (!server) {
    console.log('HTTP server was not started.');

    process.exitCode = 0;
    return;
  }

  server.close((error) => {
    if (error) {
      console.error('❌ Graceful shutdown failed:', error);

      process.exitCode = 1;
      return;
    }

    console.log('✅ HTTP server closed.');

    process.exitCode = 0;
  });
}

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

await startServer();
