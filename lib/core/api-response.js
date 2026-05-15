export function methodNotAllowed(res, allow = "POST") {
  res.setHeader("Allow", allow);
  return res.status(405).json({ error: "Method not allowed" });
}

export function jsonError(res, status, error, message) {
  const body = { error };
  if (message) body.message = message;
  return res.status(status).json(body);
}

export function badRequest(res, error, message) {
  return jsonError(res, 400, error, message);
}

export function serverError(res, error, message) {
  return jsonError(res, 500, error, message);
}
