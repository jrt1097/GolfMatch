import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class HistoryComponent implements OnInit {
  history: any[] = [];
  message = '';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    const user = this.userService.getCurrentUser();

    if (!user) {
      this.message = 'You must be logged in to view history';
      this.cdr.detectChanges();
      return;
    }

    this.userService.getUserHistory(user.id).subscribe({
      next: (data: any) => {
        this.history = data;

        if (this.history.length === 0) {
          this.message = 'No round history yet';
        } else {
          this.message = '';
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Could not load history';
        this.cdr.detectChanges();
      },
    });
  }
}