import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.API}/auth/register`, data);
  }

  login(data: any) {
    return this.http.post(`${this.API}/auth/login`, data);
  }

  saveLogin(res: any) {
    localStorage.setItem('token', res.accessToken);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getCurrentUser() {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  clearLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  logout() {
    return this.http.post(
      `${this.API}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      },
    );
  }

  me() {
    return this.http.get(`${this.API}/auth/me`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    });
  }
}