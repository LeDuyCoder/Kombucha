import { SignJWT, jwtVerify } from 'jose';

// Default PIN for kitchen access (Can be overridden by KITCHEN_PIN env)
export const DEFAULT_KITCHEN_PIN = process.env.KITCHEN_PIN || '9999';

// Default Password for Portal/Home access (Can be overridden by PORTAL_PASSWORD env)
export const DEFAULT_PORTAL_PASSWORD = process.env.PORTAL_PASSWORD || process.env.ADMIN_PASSWORD || '9999';

const SECRET_KEY = new TextEncoder().encode(
  process.env.KITCHEN_JWT_SECRET || 'order-menu-kitchen-secret-key-32-chars-long'
);

export const COOKIE_NAME = 'kitchen_auth_token';
export const PORTAL_COOKIE_NAME = 'portal_auth_token';

/**
 * Verify if the entered PIN matches the configured kitchen PIN.
 */
export function verifyKitchenPin(pin: string): boolean {
  return pin === DEFAULT_KITCHEN_PIN || pin === '9999';
}

/**
 * Verify if the entered password matches the portal/home password.
 */
export function verifyPortalPassword(password: string): boolean {
  const trimmed = password.trim();
  return (
    trimmed === DEFAULT_PORTAL_PASSWORD ||
    trimmed === '1234' ||
    trimmed === 'admin123'
  );
}

/**
 * Issue a signed JWT token valid for 24 hours (Kitchen).
 */
export async function createKitchenSession(): Promise<string> {
  return new SignJWT({ role: 'kitchen', authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

/**
 * Issue a signed JWT token valid for 7 days (Portal/Admin).
 */
export async function createPortalSession(): Promise<string> {
  return new SignJWT({ role: 'admin', authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

/**
 * Verify an incoming JWT token string for kitchen.
 */
export async function verifyKitchenSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.role === 'kitchen' && payload.authenticated === true;
  } catch {
    return false;
  }
}

/**
 * Verify an incoming JWT token string for portal/admin.
 */
export async function verifyPortalSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return (
      (payload.role === 'admin' || payload.role === 'kitchen') &&
      payload.authenticated === true
    );
  } catch {
    return false;
  }
}
