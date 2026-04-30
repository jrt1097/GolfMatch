import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class RoundService {
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

  searchGolfCourses(query: string) {
    const cleanedQuery = query.trim();

    const encodedQuery = encodeURIComponent(
      `${cleanedQuery} golf course`,
    );

    return this.http.get(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=8&addressdetails=1`,
    );
  }

  getRounds() {
    return this.http.get(`${this.API}/rounds`, this.authHeaders());
  }

  getNearbyRounds(lat: number, lng: number, radius: number) {
    return this.http.get(
      `${this.API}/rounds/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
      this.authHeaders(),
    );
  }

  getRound(roundId: number) {
    return this.http.get(`${this.API}/rounds/${roundId}`, this.authHeaders());
  }

  createRound(data: any) {
    return this.http.post(`${this.API}/rounds`, data, this.authHeaders());
  }

  updateRound(roundId: number, data: any) {
    return this.http.patch(
      `${this.API}/rounds/${roundId}`,
      data,
      this.authHeaders(),
    );
  }

  deleteRound(roundId: number) {
    return this.http.delete(
      `${this.API}/rounds/${roundId}`,
      this.authHeaders(),
    );
  }

  updateStatus(roundId: number, status: string) {
    return this.http.patch(
      `${this.API}/rounds/${roundId}/status`,
      { status },
      this.authHeaders(),
    );
  }

  joinRound(roundId: number) {
    return this.http.post(
      `${this.API}/rounds/${roundId}/join`,
      {},
      this.authHeaders(),
    );
  }

  leaveRound(roundId: number) {
    return this.http.delete(
      `${this.API}/rounds/${roundId}/leave`,
      this.authHeaders(),
    );
  }

  inviteUser(roundId: number, displayName: string) {
    return this.http.post(
      `${this.API}/rounds/${roundId}/invite`,
      { displayName },
      this.authHeaders(),
    );
  }

  getParticipants(roundId: number) {
    return this.http.get(
      `${this.API}/rounds/${roundId}/participants`,
      this.authHeaders(),
    );
  }

  updateParticipantStatus(
    roundId: number,
    participantId: number,
    status: string,
  ) {
    return this.http.patch(
      `${this.API}/rounds/${roundId}/participants/${participantId}`,
      { status },
      this.authHeaders(),
    );
  }

  removeParticipant(roundId: number, userId: number) {
    return this.http.delete(
      `${this.API}/rounds/${roundId}/participants/${userId}`,
      this.authHeaders(),
    );
  }

  submitScore(roundId: number, totalStrokes: number) {
    return this.http.post(
      `${this.API}/rounds/${roundId}/scores`,
      { totalStrokes },
      this.authHeaders(),
    );
  }

  updateScore(roundId: number, scoreId: number, totalStrokes: number) {
    return this.http.patch(
      `${this.API}/rounds/${roundId}/scores/${scoreId}`,
      { totalStrokes },
      this.authHeaders(),
    );
  }

  getScores(roundId: number) {
    return this.http.get(
      `${this.API}/rounds/${roundId}/scores`,
      this.authHeaders(),
    );
  }

  getResults(roundId: number) {
    return this.http.get(
      `${this.API}/rounds/${roundId}/results`,
      this.authHeaders(),
    );
  }
}