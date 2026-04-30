import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundsComponent } from './rounds';

describe('Rounds', () => {
  let component: RoundsComponent;
  let fixture: ComponentFixture<RoundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoundsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
