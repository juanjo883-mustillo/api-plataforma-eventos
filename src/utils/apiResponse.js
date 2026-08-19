export function sendSuccess(res, { statusCode = 200, payload, message } = {}) {
  const body = { status: 'success' };

  if (message) body.message = message;
  if (payload !== undefined) body.payload = payload;

  return res.status(statusCode).json(body);
}

export function sendPaginated(res, { data, page, limit, total }) {
  return res.status(200).json({
    status: 'success',
    data,
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  });
}
