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
