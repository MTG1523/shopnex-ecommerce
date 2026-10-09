/**
 * Simple JWT-like auth using base64 (for demo purposes)
 * In production, use proper JWT library like jose or jsonwebtoken
 */

export function createToken(payload) {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return Buffer.from(data).toString('base64');
}

export function verifyToken(token) {
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function getUserFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}
