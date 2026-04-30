import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoundService } from '../services/round';

@Component({
  selector: 'app-rounds',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './rounds.html',
  styleUrl: './rounds.css',
})
export class RoundsComponent implements OnInit {
  rounds: any[] = [];

  courseName = '';
  scheduledAt = '';
  format = '';
  visibility = 'public';
  message = '';

  constructor(
    private roundService: RoundService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadRounds();
  }

  loadRounds() {
    this.roundService.getRounds().subscribe({
      next: (data: any) => {
        this.rounds = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Could not load rounds';
        this.cdr.detectChanges();
      },
    });
  }

  createRound() {
    const user = this.roundService.getCurrentUser();

    if (!user) {
      this.message = 'You must be logged in';
      this.cdr.detectChanges();
      return;
    }

    if (!this.courseName || !this.scheduledAt || !this.format) {
      this.message = 'Please fill out all round fields';
      this.cdr.detectChanges();
      return;
    }

    this.roundService
      .createRound({
        courseName: this.courseName,
        scheduledAt: this.scheduledAt,
        format: this.format,
        visibility: this.visibility,
      })
      .subscribe({
        next: () => {
          this.message = 'Round created';
          this.courseName = '';
          this.scheduledAt = '';
          this.format = '';
          this.visibility = 'public';
          this.loadRounds();
        },
        error: (err) => {
          console.error(err);
          this.message = err.error?.message || 'Could not create round';
          this.cdr.detectChanges();
        },
      });
  }

  openRound(roundId: number) {
    this.router.navigate(['/rounds', roundId]);
  }
}