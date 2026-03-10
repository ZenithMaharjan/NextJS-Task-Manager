import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export function extractUserIdFromHeader(authHeader: string | null): string | null {
  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return null;
  }
  const payload = verifyToken(token);
  return payload ? payload.userId : null;
}

export function extractUserFromHeader(authHeader: string | null): JWTPayload | null {
  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return null;
  }
  const payload = verifyToken(token);
  return payload;
}
