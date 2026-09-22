export function requestAbortMiddleware(req, res, next) {
  const controller = new AbortController();

  req.abortSignal = controller.signal;

  const abortRequest = () => {
    controller.abort();
  };

  req.on('aborted', abortRequest);

  res.on('close', () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  });

  next();
}
