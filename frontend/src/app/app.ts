import { Component, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  get user() {
    return this.auth.getCurrentUser();
  }

  logout() {
    this.auth.clearLogin();
    this.router.navigate(['/login']);
  }
}