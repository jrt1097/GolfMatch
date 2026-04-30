import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  displayName = '';
  email = '';
  password = '';
  message = '';
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  register() {
    this.message = '';

    if (!this.displayName || !this.email || !this.password) {
      this.message = 'Please fill out all fields.';
      return;
    }

    if (this.password.length < 6) {
      this.message = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;

    this.auth.register({
      displayName: this.displayName,
      email: this.email,
      password: this.password,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.message = err.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}