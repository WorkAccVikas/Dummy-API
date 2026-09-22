import dotenv from 'dotenv';

import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
  path: './.env',
});

const PORT = process.env.PORT ?? 8000;

let server;
let isShuttingDown = false;

async function startServer() {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
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
