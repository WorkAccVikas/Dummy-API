const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_INITIAL_DELAY_MS = 5_000;

const selfPingConfig = Object.freeze({
  defaultIntervalMs: DEFAULT_INTERVAL_MS,
  defaultTimeoutMs: DEFAULT_TIMEOUT_MS,
  defaultInitialDelayMs: DEFAULT_INITIAL_DELAY_MS,
});

export { selfPingConfig };
