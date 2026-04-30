import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoundService } from '../services/round';

@Component({
  selector: 'app-active-matches',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-matches.html',
  styleUrl: './active-matches.css',
})
export class ActiveMatchesComponent implements OnInit {
  rounds: any[] = [];
  activeRounds: any[] = [];
  message = '';

  constructor(
    private roundService: RoundService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadActiveMatches();
  }

  loadActiveMatches() {
    this.roundService.getRounds().subscribe({
      next: (data: any) => {
        this.rounds = data;

        this.activeRounds = this.rounds.filter(
          (round) =>
            round.status === 'open' || round.status === 'in_progress',
        );

        if (this.activeRounds.length === 0) {
          this.message = 'No active matches right now.';
        } else {
          this.message = '';
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Could not load active matches';
        this.cdr.detectChanges();
      },
    });
  }

  openRound(roundId: number) {
    this.router.navigate(['/rounds', roundId]);
  }
}