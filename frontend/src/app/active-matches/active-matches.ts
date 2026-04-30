import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
    const currentUser = this.roundService.getCurrentUser();

    if (!currentUser) {
      this.message = 'You must be logged in to view active matches.';
      this.activeRounds = [];
      this.cdr.detectChanges();
      return;
    }

    this.roundService.getRounds().subscribe({
      next: (data: any) => {
        const possibleActiveRounds = data.filter(
          (round: any) =>
            round.status === 'open' || round.status === 'in_progress',
        );

        if (possibleActiveRounds.length === 0) {
          this.activeRounds = [];
          this.message = 'No active matches right now.';
          this.cdr.detectChanges();
          return;
        }

        const participantChecks = possibleActiveRounds.map((round: any) =>
          this.roundService.getParticipants(round.id).pipe(
            map((participants: any) => {
              const isAcceptedParticipant = participants.some(
                (p: any) =>
                  Number(p.userId) === Number(currentUser.id) &&
                  p.status === 'accepted',
              );

              return {
                round,
                isAcceptedParticipant,
              };
            }),
            catchError(() =>
              of({
                round,
                isAcceptedParticipant: false,
              }),
            ),
          ),
        );

        forkJoin(participantChecks).subscribe({
          next: (checkedRounds: any) => {
            this.activeRounds = checkedRounds
              .filter((item: any) => item.isAcceptedParticipant)
              .map((item: any) => item.round);

            this.message =
              this.activeRounds.length === 0
                ? 'No active matches right now.'
                : '';

            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.message = 'Could not load active matches.';
            this.cdr.detectChanges();
          },
        });
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