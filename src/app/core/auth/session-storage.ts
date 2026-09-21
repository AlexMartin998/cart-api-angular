import { User } from '../models/user';

export interface Session {
  accessToken: string;
  expiresAt: string;
  user: User;
}

const KEY = 'shop.session';


export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    console.warn('Failed to write session to localStorage');
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    console.warn('Failed to clear session from localStorage');
  }
}

export function hasExpired(session: Session, now = Date.now()): boolean {
  return new Date(session.expiresAt).getTime() <= now;
}
