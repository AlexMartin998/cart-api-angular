import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/user';
import { Session, clearSession, hasExpired, readSession, writeSession } from './session-storage';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly session = signal<Session | null>(restoreValidSession());

  readonly user = computed<User | null>(() => this.session()?.user ?? null);
  readonly isSignedIn = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.user()?.role === 'Admin');

  // token accessor - for interceptors 
  token(): string | null {
    return this.session()?.accessToken ?? null;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((response) => this.start(response)));
  }

  logout(): void {
    this.session.set(null);
    clearSession();
  }

  private start(response: AuthResponse): void {
    const session: Session = {
      accessToken: response.accessToken,
      expiresAt: response.expiresAt,
      user: response.user,
    };

    this.session.set(session);
    writeSession(session);
  }
}

function restoreValidSession(): Session | null {
  const session = readSession();

  if (!session || hasExpired(session)) {
    clearSession();
    return null;
  }

  return session;
}
