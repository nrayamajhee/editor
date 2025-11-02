export const loggingMiddleware = async (
  { request }: any,
  next: () => Promise<Response>,
) => {
  console.log(`[Request] ${request.method} ${request.url}`);

  const start = performance.now();
  const response = await next();
  const duration = performance.now() - start;

  console.log(`[Response] ${response.status} (${duration}ms)`);

  return response;
};
