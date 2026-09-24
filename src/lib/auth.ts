import { SignJWT, jwtVerify } from 'jose';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { getStoreKitchenPin, setStoreKitchenPin } from '@/lib/mock-data';

const SECRET_KEY = new TextEncoder().encode(
  process.env.KITCHEN_JWT_SECRET || 'order-menu-kitchen-secret-key-32-chars-long'
);

export const COOKIE_NAME = 'kitchen_auth_token';

/**
 * Dynamically fetch the configured kitchen PIN.
 * Checks Supabase `store_settings.kitchen_pin` -> in-memory store -> env KITCHEN_PIN -> '9999'
 */
export async function getKitchenPin(): Promise<string> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('kitchen_pin')
        .eq('id', 'main')
        .maybeSingle();

      if (!error && data?.kitchen_pin) {
        return String(data.kitchen_pin);
      }
    } catch (err) {
      console.warn('Supabase getKitchenPin error:', err);
    }
  }

  return getStoreKitchenPin();
}

/**
 * Dynamically update the kitchen PIN.
 * Saves to in-memory store and Supabase `store_settings.kitchen_pin`.
 */
export async function setKitchenPin(newPin: string): Promise<boolean> {
  const cleanPin = newPin.trim();
  setStoreKitchenPin(cleanPin);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          id: 'main',
          kitchen_pin: cleanPin,
          updated_at: new Date().toISOString(),
        });

      if (!error) return true;
      console.warn('Update kitchen_pin in Supabase:', error);
    } catch (err) {
      console.warn('Supabase setKitchenPin error:', err);
    }
  }

  return true;
}

/**
 * Verify if the entered PIN matches the dynamically configured kitchen PIN.
 */
export async function verifyKitchenPin(pin: string): Promise<boolean> {
  const currentPin = await getKitchenPin();
  return pin.trim() === currentPin;
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
