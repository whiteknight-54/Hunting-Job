/** JSON error responses for API routes (public app — no auth layer). */

export function jsonError(res, status, error, message) {
  const body = { error };
  if (message) body.message = message;
  return res.status(status).json(body);
}

export function methodNotAllowed(res, method = "POST") {
  return jsonError(res, 405, "Method not allowed", `Only ${method} is supported`);
}

export function badRequest(res, error, message) {
  return jsonError(res, 400, error, message);
}

export function serverError(res, error, message) {
  return jsonError(res, 500, error, message);
}
