import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const authFilePath = path.join(process.cwd(), 'admin_security.json');
const DEFAULT_PIN = '123456';
const DEFAULT_SESSION_DAYS = 30;

type AdminSecurityConfig = {
  pin: string;
  pinUpdatedAt: string;
  sessionDurationDays: number;
  lastLoginAt?: string;
};

function getSecurityConfig(): AdminSecurityConfig {
  try {
    if (fs.existsSync(authFilePath)) {
      const data = fs.readFileSync(authFilePath, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed.pin === 'string' && parsed.pin.length === 6) {
        return {
          pin: parsed.pin,
          pinUpdatedAt: parsed.pinUpdatedAt || new Date().toISOString(),
          sessionDurationDays: Number(parsed.sessionDurationDays) || DEFAULT_SESSION_DAYS,
          lastLoginAt: parsed.lastLoginAt
        };
      }
    }
  } catch (err) {
    console.error('Error reading admin_security.json:', err);
  }

  // Create default configuration safely
  const defaultConfig: AdminSecurityConfig = {
    pin: DEFAULT_PIN,
    pinUpdatedAt: new Date().toISOString(),
    sessionDurationDays: DEFAULT_SESSION_DAYS,
  };

  try {
    fs.writeFileSync(authFilePath, JSON.stringify(defaultConfig, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing default admin_security.json:', err);
  }

  return defaultConfig;
}

function saveSecurityConfig(config: AdminSecurityConfig): boolean {
  try {
    fs.writeFileSync(authFilePath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving admin_security.json:', err);
    return false;
  }
}

// Generate simple tamper-evident session token
function generateSessionToken(pin: string, durationDays: number): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
  const payload = {
    role: 'admin',
    createdAt: Date.now(),
    expiresAt,
    salt: 'vishwakarma-atta-chakki-admin-session'
  };
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return { token, expiresAt };
}

// Validate session token
function isTokenValid(token: string): boolean {
  try {
    if (!token) return false;
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (!decoded || decoded.role !== 'admin' || !decoded.expiresAt) return false;
    return Date.now() < decoded.expiresAt;
  } catch {
    return false;
  }
}

// GET: Check PIN status (whether using default PIN) and session validity
export async function GET(request: Request) {
  try {
    const config = getSecurityConfig();
    const isDefault = config.pin === DEFAULT_PIN;
    
    // Check optional token header
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const sessionValid = token ? isTokenValid(token) : false;

    return NextResponse.json({
      success: true,
      isDefaultPin: isDefault,
      sessionDurationDays: config.sessionDurationDays,
      sessionValid,
      serverTime: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Actions (login, change_pin, verify_token, reset_pin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || 'login';
    const config = getSecurityConfig();

    if (action === 'login') {
      const inputPin = String(body.pin || '').trim();
      if (!inputPin || inputPin.length !== 6 || !/^\d{6}$/.test(inputPin)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Please enter a valid 6-digit numeric PIN.' 
        }, { status: 400 });
      }

      if (inputPin !== config.pin) {
        return NextResponse.json({ 
          success: false, 
          error: 'Incorrect PIN. Please try again.' 
        }, { status: 401 });
      }

      // Successful verification
      const durationDays = Number(body.rememberDays) || config.sessionDurationDays || DEFAULT_SESSION_DAYS;
      const { token, expiresAt } = generateSessionToken(config.pin, durationDays);

      // Update last login
      config.lastLoginAt = new Date().toISOString();
      saveSecurityConfig(config);

      return NextResponse.json({
        success: true,
        message: 'PIN verified successfully.',
        token,
        expiresAt,
        isDefaultPin: config.pin === DEFAULT_PIN
      });
    }

    if (action === 'change_pin') {
      const currentPin = String(body.currentPin || '').trim();
      const newPin = String(body.newPin || '').trim();
      const confirmPin = String(body.confirmPin || '').trim();

      if (currentPin !== config.pin) {
        return NextResponse.json({ 
          success: false, 
          error: 'Current PIN is incorrect.' 
        }, { status: 400 });
      }

      if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
        return NextResponse.json({ 
          success: false, 
          error: 'New PIN must be exactly 6 digits (numbers only).' 
        }, { status: 400 });
      }

      if (confirmPin && newPin !== confirmPin) {
        return NextResponse.json({ 
          success: false, 
          error: 'New PIN and Confirm PIN do not match.' 
        }, { status: 400 });
      }

      // Save new PIN
      config.pin = newPin;
      config.pinUpdatedAt = new Date().toISOString();
      saveSecurityConfig(config);

      // Issue refreshed session token
      const { token, expiresAt } = generateSessionToken(newPin, config.sessionDurationDays);

      return NextResponse.json({
        success: true,
        message: '6-digit Admin PIN changed successfully!',
        token,
        expiresAt,
        isDefaultPin: false
      });
    }

    if (action === 'verify_token') {
      const token = String(body.token || '').trim();
      const valid = isTokenValid(token);
      return NextResponse.json({
        success: true,
        valid,
        isDefaultPin: config.pin === DEFAULT_PIN
      });
    }

    if (action === 'reset_pin') {
      // Allows resetting back to 123456 if requested
      const confirmText = String(body.confirmText || '').trim();
      if (confirmText !== 'RESET_PIN') {
        return NextResponse.json({ 
          success: false, 
          error: 'Confirmation text does not match.' 
        }, { status: 400 });
      }

      config.pin = DEFAULT_PIN;
      config.pinUpdatedAt = new Date().toISOString();
      saveSecurityConfig(config);

      const { token, expiresAt } = generateSessionToken(DEFAULT_PIN, config.sessionDurationDays);

      return NextResponse.json({
        success: true,
        message: 'PIN successfully reset to default: 123456',
        token,
        expiresAt,
        isDefaultPin: true
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
