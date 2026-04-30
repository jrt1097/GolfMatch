import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RoundService } from '../services/round';

@Component({
  selector: 'app-round-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './round-detail.html',
  styleUrl: './round-detail.css',
})
export class RoundDetailComponent implements OnInit {
  round: any = null;
  roundId = 0;

  message = '';

  scoreInput = 0;
  inviteUserId = 0;

  participants: any[] = [];
  scores: any[] = [];
  results: any = null;

  constructor(
    private route: ActivatedRoute,
    private roundService: RoundService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.roundId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEverything();
  }

  getCurrentUser() {
    return this.roundService.getCurrentUser();
  }

  getCurrentUserId() {
    return this.getCurrentUser()?.id;
  }

  isCreator() {
    return this.round?.createdByUserId === this.getCurrentUserId();
  }

  isCompleted() {
    return this.round?.status === 'completed';
  }

  loadEverything() {
    this.loadRound();
    this.loadParticipants();
    this.loadScores();
    this.loadResults();
  }

  loadRound() {
    this.roundService.getRound(this.roundId).subscribe({
      next: (data: any) => {
        this.round = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Could not load round';
        this.cdr.detectChanges();
      },
    });
  }

  loadParticipants() {
    this.roundService.getParticipants(this.roundId).subscribe({
      next: (data: any) => {
        this.participants = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  loadScores() {
    this.roundService.getScores(this.roundId).subscribe({
      next: (data: any) => {
        this.scores = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  loadResults() {
    this.roundService.getResults(this.roundId).subscribe({
      next: (data: any) => {
        this.results = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  updateStatus(status: string) {
    if (!status) return;

    this.roundService.updateStatus(this.roundId, status).subscribe({
      next: () => {
        this.message = 'Status updated';
        this.loadEverything();
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Could not update status';
        this.cdr.detectChanges();
      },
    });
  }

  deleteRound() {
    if (!confirm('Are you sure you want to delete this round?')) return;

    this.roundService.deleteRound(this.roundId).subscribe({
      next: () => {
        window.location.href = '/dashboard';
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Could not delete round';
        this.cdr.detectChanges();
      },
    });
  }

  joinRound() {
    this.roundService.joinRound(this.roundId).subscribe({
      next: () => {
        this.message = 'Joined round';
        this.loadEverything();
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Could not join round';
        this.cdr.detectChanges();
      },
    });
  }

  inviteUser() {
    if (!this.inviteUserId || this.inviteUserId <= 0) {
      this.message = 'Enter a valid user ID';
      this.cdr.detectChanges();
      return;
    }

    this.roundService.inviteUser(this.roundId, this.inviteUserId).subscribe({
      next: () => {
        this.message = 'User invited';
        this.inviteUserId = 0;
        this.loadParticipants();
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Could not invite user';
        this.cdr.detectChanges();
      },
    });
  }

  updateParticipantStatus(participantId: number, status: string) {
    if (!status) return;

    this.roundService
      .updateParticipantStatus(this.roundId, participantId, status)
      .subscribe({
        next: () => {
          this.message = 'Participant status updated';
          this.loadParticipants();
        },
        error: (err) => {
          console.error(err);
          this.message = err.error?.message || 'Could not update participant';
          this.cdr.detectChanges();
        },
      });
  }

  removeParticipant(userId: number) {
    if (!confirm('Remove this player?')) return;

    this.roundService.removeParticipant(this.roundId, userId).subscribe({
      next: () => {
        this.message = 'Participant removed';
        this.loadEverything();
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Could not remove participant';
        this.cdr.detectChanges();
      },
    });
  }

  submitScore() {
    if (this.isCompleted()) {
      this.message = 'Round is completed. Scores are locked.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.scoreInput || this.scoreInput <= 0) {
      this.message = 'Enter a valid score';
      this.cdr.detectChanges();
      return;
    }

    this.roundService.submitScore(this.roundId, this.scoreInput).subscribe({
      next: () => {
        this.message = 'Score submitted';
        this.scoreInput = 0;
        this.loadEverything();
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.message || 'Could not submit score';
        this.cdr.detectChanges();
      },
    });
  }

  updateScore() {
    if (this.isCompleted()) {
      this.message = 'Round is completed. Scores are locked.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.scoreInput || this.scoreInput <= 0) {
      this.message = 'Enter a valid score';
      this.cdr.detectChanges();
      return;
    }

    const myScore = this.scores.find(
      (s) => s.userId === this.getCurrentUserId(),
    );

    if (!myScore) {
      this.message = 'Submit a score before updating it';
      this.cdr.detectChanges();
      return;
    }

    this.roundService
      .updateScore(this.roundId, myScore.id, this.scoreInput)
      .subscribe({
        next: () => {
          this.message = 'Score updated';
          this.scoreInput = 0;
          this.loadEverything();
        },
        error: (err) => {
          console.error(err);
          this.message = err.error?.message || 'Could not update score';
          this.cdr.detectChanges();
        },
      });
  }
}