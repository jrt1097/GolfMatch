import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private authHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.auth.getToken()}`,
      },
    };
  }

  getCurrentUser() {
    return this.auth.getCurrentUser();
  }

  getUserHistory(userId: number) {
    return this.http.get(
      `${this.API}/users/${userId}/history`,
      this.authHeaders(),
    );
  }
}