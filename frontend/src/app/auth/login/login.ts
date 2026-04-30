import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  login() {
    this.message = '';

    if (!this.email || !this.password) {
      this.message = 'Please enter your email and password.';
      return;
    }

    this.isLoading = true;

    this.auth.login({
      email: this.email,
      password: this.password,
    }).subscribe({
      next: (res: any) => {
        this.auth.saveLogin(res);
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.message = err.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}