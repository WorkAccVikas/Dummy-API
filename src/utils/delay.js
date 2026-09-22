/**
 * Resolves after the given number of milliseconds, or rejects early if the
 * supplied `AbortSignal` is triggered.
 *
 * This is the low-level timing primitive of the codebase and always works in
 * milliseconds. Domain-facing code translates its own units (e.g. seconds)
 * before calling this function.
 *
 * @async
 * @function delay
 * @param {number} ms - Duration to wait, in milliseconds.
 * @param {object} [options] - Optional options.
 * @param {AbortSignal} [options.signal] - When aborted, the returned promise
 *    rejects with an `AbortError` instead of waiting out the duration.
 * @returns {Promise<void>} Resolves after `ms` milliseconds.
 * @throws {TypeError} When `ms` is not a finite non-negative number.
 * @throws {DOMException} With name `AbortError`, when `signal` is already
 *    aborted or is aborted before the delay elapses.
 */
export function delay(ms, { signal } = {}) {
  if (!Number.isFinite(ms) || ms < 0) {
    return Promise.reject(
      new TypeError('Delay must be a finite non-negative number'),
    );
  }

  if (signal?.aborted) {
    return Promise.reject(new DOMException('Operation aborted', 'AbortError'));
  }

  return new Promise((resolve, reject) => {
    let timer;

    const cleanup = () => {
      clearTimeout(timer);

      signal?.removeEventListener('abort', handleAbort);
    };

    const handleAbort = () => {
      cleanup();

      reject(new DOMException('Operation aborted', 'AbortError'));
    };

    timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    signal?.addEventListener('abort', handleAbort, { once: true });
  });
}
