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

  courseSearch = '';
  courseResults: any[] = [];
  selectedCourse: any = null;

  manualMode = false;
  manualCourseName = '';
  manualTownState = '';

  courseName = '';
  courseAddress = '';
  courseLatitude: number | null = null;
  courseLongitude: number | null = null;
  placeId = '';

  scheduledAt = '';
  format = '';
  visibility = 'public';
  radius = 25;

  message = '';
  locationMessage = '';
  isSearchingCourses = false;
  isLoadingNearby = false;

  constructor(
    private roundService: RoundService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadRounds();
  }

  loadRounds() {
    this.locationMessage = '';

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

  searchCourses() {
    this.message = '';
    this.courseResults = [];
    this.selectedCourse = null;
    this.manualMode = false;

    if (!this.courseSearch.trim()) {
      this.message = 'Enter a golf course name or town/state to search.';
      return;
    }

    this.isSearchingCourses = true;

    this.roundService.searchGolfCourses(this.courseSearch).subscribe({
      next: (results: any) => {
        this.courseResults = results || [];
        this.isSearchingCourses = false;

        if (this.courseResults.length === 0) {
          this.message = 'No courses found. You can enter the course manually below.';
          this.manualMode = true;
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isSearchingCourses = false;
        this.message = 'Course search failed. You can enter the course manually below.';
        this.manualMode = true;
        this.cdr.detectChanges();
      },
    });
  }

  selectCourse(course: any) {
    this.selectedCourse = course;
    this.manualMode = false;

    this.courseName = course.name || course.display_name?.split(',')[0] || this.courseSearch;
    this.courseAddress = course.display_name || '';
    this.courseLatitude = Number(course.lat);
    this.courseLongitude = Number(course.lon);
    this.placeId = String(course.place_id || '');

    this.courseResults = [];
    this.message = `Selected ${this.courseName}`;
    this.cdr.detectChanges();
  }

  useManualCourse() {
    this.message = '';
    this.courseResults = [];
    this.selectedCourse = null;
    this.manualMode = true;

    this.courseName = '';
    this.courseAddress = '';
    this.courseLatitude = null;
    this.courseLongitude = null;
    this.placeId = '';

    this.cdr.detectChanges();
  }

  saveManualCourse() {
    if (!this.manualCourseName.trim() || !this.manualTownState.trim()) {
      this.message = 'Please enter both the course name and town/state.';
      return;
    }

    this.courseName = this.manualCourseName.trim();
    this.courseAddress = this.manualTownState.trim();
    this.courseLatitude = null;
    this.courseLongitude = null;
    this.placeId = 'manual';

    this.selectedCourse = {
      name: this.courseName,
      display_name: this.courseAddress,
      manual: true,
    };

    this.manualMode = false;
    this.message = `Selected ${this.courseName}`;
    this.cdr.detectChanges();
  }

  loadNearbyRounds() {
    this.message = '';
    this.locationMessage = '';

    if (!navigator.geolocation) {
      this.locationMessage = 'Your browser does not support location filtering.';
      return;
    }

    this.isLoadingNearby = true;
    this.locationMessage = 'Checking your location...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.roundService.getNearbyRounds(lat, lng, this.radius).subscribe({
          next: (data: any) => {
            this.rounds = data;
            this.isLoadingNearby = false;
            this.locationMessage = `Showing rounds within ${this.radius} miles.`;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.isLoadingNearby = false;
            this.locationMessage = 'Could not load nearby rounds.';
            this.cdr.detectChanges();
          },
        });
      },
      (error) => {
        console.error(error);
        this.isLoadingNearby = false;
        this.locationMessage = 'Location permission was denied or unavailable.';
        this.cdr.detectChanges();
      },
    );
  }

  createRound() {
    const user = this.roundService.getCurrentUser();

    if (!user) {
      this.message = 'You must be logged in';
      this.cdr.detectChanges();
      return;
    }

    if (!this.courseName || !this.scheduledAt || !this.format) {
      this.message = 'Please select or manually enter a course, then fill out all round fields.';
      this.cdr.detectChanges();
      return;
    }

    this.roundService
      .createRound({
        courseName: this.courseName,
        courseAddress: this.courseAddress,
        courseLatitude: this.courseLatitude,
        courseLongitude: this.courseLongitude,
        placeId: this.placeId,
        scheduledAt: this.scheduledAt,
        format: this.format,
        visibility: this.visibility,
      })
      .subscribe({
        next: () => {
          this.message = 'Round created';
          this.resetForm();
          this.loadRounds();
        },
        error: (err) => {
          console.error(err);
          this.message = err.error?.message || 'Could not create round';
          this.cdr.detectChanges();
        },
      });
  }

  resetForm() {
    this.courseSearch = '';
    this.courseResults = [];
    this.selectedCourse = null;
    this.manualMode = false;
    this.manualCourseName = '';
    this.manualTownState = '';
    this.courseName = '';
    this.courseAddress = '';
    this.courseLatitude = null;
    this.courseLongitude = null;
    this.placeId = '';
    this.scheduledAt = '';
    this.format = '';
    this.visibility = 'public';
  }

  openRound(roundId: number) {
    this.router.navigate(['/rounds', roundId]);
  }
}