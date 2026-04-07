import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import {
  PollingStation,
  VoterAttendanceRecord,
} from '../../core/models/models';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header"><h2>Log Voter Attendance</h2></div>
    <div class="two-col">
      <div class="card">
        <h3>New Entry</h3>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label>Polling Station *</label>
            <select
              formControlName="pollingStationId"
              [class.error]="isInvalid('pollingStationId')"
            >
              <option value="">Select station...</option>
              @for (s of stations(); track s.pollingStationId) {
                <option [value]="s.pollingStationId">
                  {{ s.stationName }}
                </option>
              }
            </select>
            @if (isInvalid('pollingStationId')) {
              <span class="error-msg">Required</span>
            }
          </div>
          <div class="form-group">
            <label>Voter Count *</label>
            <input
              type="number"
              formControlName="voterCount"
              min="0"
              [class.error]="isInvalid('voterCount')"
            />
            @if (isInvalid('voterCount')) {
              <span class="error-msg">Required, minimum 0</span>
            }
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea
              formControlName="notes"
              rows="3"
              placeholder="Any additional information..."
            ></textarea>
          </div>
          @if (successMessage()) {
            <div class="alert-success">{{ successMessage() }}</div>
          }
          @if (errorMessage()) {
            <div class="alert-error">{{ errorMessage() }}</div>
          }
          <button
            type="submit"
            [disabled]="loading() || form.invalid"
            class="btn-primary"
          >
            {{ loading() ? 'Submitting...' : 'Submit Attendance' }}
          </button>
        </form>
      </div>

      <div class="card">
        <h3>My Recent Entries</h3>
        @if (records().length === 0) {
          <div class="empty-state">No entries yet.</div>
        } @else {
          @for (r of records(); track r.attendanceId) {
            <div class="record-item">
              <div class="record-top">
                <strong>{{ r.stationName }}</strong>
                <span class="voter-count">{{ r.voterCount }} voters</span>
              </div>
              <div class="record-bottom">
                <span>{{ r.recordedAt | date: 'short' }}</span>
                @if (r.notes) {
                  <span>{{ r.notes }}</span>
                }
                <span
                  [class]="r.isVerified ? 'badge-active' : 'badge-pending'"
                  >{{ r.isVerified ? 'Verified' : 'Pending' }}</span
                >
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        margin-bottom: 1.5rem;
      }
      .page-header h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #1a1a2e;
      }
      .two-col {
        display: grid;
        grid-template-columns: 400px 1fr;
        gap: 1.5rem;
        align-items: start;
      }
      .card {
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .card h3 {
        margin: 0 0 1.25rem;
        font-size: 1.1rem;
        color: #1a1a2e;
      }
      .form-group {
        margin-bottom: 1.1rem;
      }
      .form-group label {
        display: block;
        font-weight: 600;
        color: #333;
        font-size: 0.9rem;
        margin-bottom: 0.4rem;
      }
      .form-group input,
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 0.95rem;
        box-sizing: border-box;
      }
      .form-group input.error,
      .form-group select.error {
        border-color: #e74c3c;
      }
      .error-msg {
        font-size: 0.8rem;
        color: #e74c3c;
        margin-top: 0.25rem;
        display: block;
      }
      .alert-success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
        padding: 0.75rem;
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      .alert-error {
        background: #fdf0f0;
        border: 1px solid #f5c6cb;
        color: #721c24;
        padding: 0.75rem;
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      .btn-primary {
        width: 100%;
        background: #0f3460;
        color: white;
        border: none;
        padding: 0.8rem;
        border-radius: 8px;
        font-size: 0.95rem;
        cursor: pointer;
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .record-item {
        padding: 0.9rem;
        border-bottom: 1px solid #f0f0f0;
      }
      .record-item:last-child {
        border-bottom: none;
      }
      .record-top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.35rem;
      }
      .record-top strong {
        font-size: 0.95rem;
      }
      .voter-count {
        font-weight: 700;
        color: #0f3460;
      }
      .record-bottom {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        color: #888;
        align-items: center;
      }
      .badge-active {
        background: #d4edda;
        color: #155724;
        padding: 0.15rem 0.5rem;
        border-radius: 12px;
      }
      .badge-pending {
        background: #fff3cd;
        color: #856404;
        padding: 0.15rem 0.5rem;
        border-radius: 12px;
      }
      .empty-state {
        text-align: center;
        padding: 2rem;
        color: #999;
      }
    `,
  ],
})
export class AttendanceComponent implements OnInit {
  form!: ReturnType<FormBuilder['group']>;

  stations = signal<PollingStation[]>([]);
  records = signal<VoterAttendanceRecord[]>([]);
  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      pollingStationId: ['', Validators.required],
      voterCount: [0, [Validators.required, Validators.min(0)]],
      notes: [''],
    });
  }

  ngOnInit(): void {
    const orgId = this.auth.user()?.organizationId;
    if (orgId) {
      this.dataService
        .getPollingStations(orgId)
        .subscribe((s) => this.stations.set(s));
    }
    this.dataService.getMyAttendance().subscribe((r) => this.records.set(r));
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    const dto = {
      ...this.form.value,
      pollingStationId: +this.form.value.pollingStationId!,
    } as any;

    this.dataService.logAttendance(dto).subscribe({
      next: (record) => {
        this.records.update((r) => [record, ...r]);
        this.form.reset({ voterCount: 0, notes: '', pollingStationId: '' });
        this.successMessage.set('Attendance logged successfully!');
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Failed to submit.');
        this.loading.set(false);
      },
    });
  }
}
