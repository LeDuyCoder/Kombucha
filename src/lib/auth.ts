import { SignJWT, jwtVerify } from 'jose';

// Default PIN for kitchen access (Can be overridden by KITCHEN_PIN env)
export const DEFAULT_KITCHEN_PIN = process.env.KITCHEN_PIN || '1234';

const SECRET_KEY = new TextEncoder().encode(
  process.env.KITCHEN_JWT_SECRET || 'order-menu-kitchen-secret-key-32-chars-long'
);

export const COOKIE_NAME = 'kitchen_auth_token';

/**
 * Verify if the entered PIN matches the configured kitchen PIN.
 */
export function verifyKitchenPin(pin: string): boolean {
  return pin === DEFAULT_KITCHEN_PIN;
}

/**
 * Issue a signed JWT token valid for 24 hours.
 */
export async function createKitchenSession(): Promise<string> {
  return new SignJWT({ role: 'kitchen', authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

/**
 * Verify an incoming JWT token string.
 */
export async function verifyKitchenSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.role === 'kitchen' && payload.authenticated === true;
  } catch {
    return false;
  }
}
