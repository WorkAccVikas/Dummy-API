const createSelfPing = ({
  url,
  intervalMs,
  timeoutMs,
  initialDelayMs = 0,
  enabled = true,
}) => {
  let intervalId = null;
  let initialDelayId = null;
  let isStopped = false;

  const validateConfig = () => {
    if (!enabled) {
      return;
    }

    if (!url) {
      throw new Error('SELF_PING_URL is required when self-ping is enabled.');
    }

    if (!Number.isInteger(intervalMs) || intervalMs <= 0) {
      throw new Error('SELF_PING_INTERVAL_MS must be a positive integer.');
    }

    if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
      throw new Error('SELF_PING_TIMEOUT_MS must be a positive integer.');
    }

    if (!Number.isInteger(initialDelayMs) || initialDelayMs < 0) {
      throw new Error(
        'SELF_PING_INITIAL_DELAY_MS must be a non-negative integer.',
      );
    }
  };

  const ping = async () => {
    if (isStopped) {
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'NodeJS-Self-Ping/1.0',
        },
        signal: controller.signal,
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        console.warn(
          `[SelfPing] Failed: ${response.status} ${response.statusText} (${duration}ms)`,
        );

        return;
      }

      console.log(`[SelfPing] Success: ${response.status} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error.name === 'AbortError') {
        console.warn(`[SelfPing] Timeout after ${timeoutMs}ms (${duration}ms)`);

        return;
      }

      console.error(
        `[SelfPing] Request failed (${duration}ms):`,
        error.message,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const start = () => {
    validateConfig();

    if (!enabled) {
      console.log('[SelfPing] Disabled.');

      return;
    }

    if (intervalId || initialDelayId) {
      console.warn('[SelfPing] Already running.');

      return;
    }

    isStopped = false;

    console.log(`[SelfPing] Started: ${url}`);
    console.log(`[SelfPing] Interval: ${intervalMs}ms`);

    initialDelayId = setTimeout(() => {
      initialDelayId = null;

      if (isStopped) {
        return;
      }

      // First ping
      ping();

      // Future pings
      intervalId = setInterval(() => {
        ping();
      }, intervalMs);
    }, initialDelayMs);
  };

  const stop = () => {
    isStopped = true;

    if (initialDelayId) {
      clearTimeout(initialDelayId);
      initialDelayId = null;
    }

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    console.log('[SelfPing] Stopped.');
  };

  return Object.freeze({
    start,
    stop,
    ping,
  });
};

export { createSelfPing };
