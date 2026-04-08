import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router
  ) {}

  // Pokud je auth vypnuté v environment, vždy vrátí true
  async isLoggedIn(): Promise<boolean> {
    if (!environment.authEnabled) return true;
    const token = await this.storage.get('auth_token');
    return !!token;
  }

  async getToken(): Promise<string | null> {
    return await this.storage.get('auth_token');
  }

  async login(email: string, password: string): Promise<void> {
    const res: any = await firstValueFrom(
      this.http.post(`${environment.apiUrl}/auth/login`, { email, password })
    );

    await this.storage.set('auth_token', res.token);
    await this.storage.set('auth_user', res.user);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/logout`, {})
      );
    } catch (e) {
      // I při chybě odhlásíme lokálně
    }

    await this.storage.remove('auth_token');
    await this.storage.remove('auth_user');
    this.router.navigate(['/login']);
  }

  async getUser(): Promise<any> {
    return await this.storage.get('auth_user');
  }

}
