import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../core/services/dashboard.service';
import { AuthService } from '../core/services/auth.service';
import { Dashboard } from '../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>
        {{
          auth.isSystemOwner() ? 'System Dashboard' : 'Organization Dashboard'
        }}
      </h2>
      <button (click)="load()" class="btn-refresh">↻ Refresh</button>
    </div>

    @if (loading()) {
      <div class="loading">Loading dashboard data...</div>
    } @else if (data()) {
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-value">{{ data()!.totalEmployees }}</div>
            <div class="stat-label">Total Employees</div>
          </div>
          <div class="stat-sub">{{ data()!.activeEmployees }} active</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🗳️</div>
          <div class="stat-info">
            <div class="stat-value">
              {{ data()!.totalVotersLogged | number }}
            </div>
            <div class="stat-label">Voters Logged</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-value">
              {{ data()!.totalVotesCounted | number }}
            </div>
            <div class="stat-label">Votes Counted</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📍</div>
          <div class="stat-info">
            <div class="stat-value">{{ data()!.totalPollingStations }}</div>
            <div class="stat-label">Polling Stations</div>
          </div>
        </div>
      </div>

      <div class="bottom-grid">
        <div class="card">
          <h3>Candidate Results</h3>
          @if (data()!.candidateTallies.length === 0) {
            <div class="empty-state">No vote data yet.</div>
          } @else {
            @for (c of data()!.candidateTallies; track c.candidateName) {
              <div class="candidate-row">
                <div class="candidate-name">{{ c.candidateName }}</div>
                <div class="bar-container">
                  <div class="bar" [style.width.%]="c.percentage"></div>
                </div>
                <div class="candidate-stats">
                  <span class="votes">{{ c.totalVotes | number }}</span>
                  <span class="pct">{{ c.percentage }}%</span>
                </div>
              </div>
            }
          }
        </div>

        <div class="card">
          <h3>Station Summary</h3>
          @if (data()!.stationSummaries.length === 0) {
            <div class="empty-state">No station data yet.</div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Voters</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                @for (s of data()!.stationSummaries; track s.pollingStationId) {
                  <tr>
                    <td>{{ s.stationName }}</td>
                    <td>{{ s.totalVoters | number }}</td>
                    <td>{{ s.totalVotes | number }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .page-header h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #1a1a2e;
      }
      .btn-refresh {
        background: white;
        border: 1px solid #ddd;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.25rem;
        margin-bottom: 1.5rem;
      }
      .stat-card {
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        gap: 1rem;
        position: relative;
      }
      .stat-icon {
        font-size: 2rem;
      }
      .stat-value {
        font-size: 1.8rem;
        font-weight: 700;
        color: #0f3460;
        line-height: 1;
      }
      .stat-label {
        font-size: 0.85rem;
        color: #666;
        margin-top: 0.25rem;
      }
      .stat-sub {
        position: absolute;
        bottom: 0.75rem;
        right: 1rem;
        font-size: 0.75rem;
        color: #28a745;
      }
      .bottom-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
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
      .candidate-row {
        margin-bottom: 1rem;
      }
      .candidate-name {
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 0.35rem;
      }
      .bar-container {
        background: #f0f0f0;
        border-radius: 4px;
        height: 8px;
        margin-bottom: 0.25rem;
        overflow: hidden;
      }
      .bar {
        background: linear-gradient(90deg, #0f3460, #16213e);
        height: 100%;
        border-radius: 4px;
        transition: width 0.5s ease;
      }
      .candidate-stats {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
      }
      .votes {
        color: #0f3460;
        font-weight: 600;
      }
      .pct {
        color: #888;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        padding: 0.75rem;
        text-align: left;
        font-size: 0.85rem;
        color: #666;
        border-bottom: 1px solid #eee;
      }
      td {
        padding: 0.75rem;
        border-bottom: 1px solid #f5f5f5;
        font-size: 0.9rem;
      }
      .loading {
        text-align: center;
        padding: 3rem;
        color: #666;
        background: white;
        border-radius: 10px;
      }
      .empty-state {
        text-align: center;
        padding: 2rem;
        color: #999;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  data = signal<Dashboard | null>(null);
  loading = signal(true);

  constructor(
    private dashService: DashboardService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const orgId = this.auth.user()?.organizationId;
    const req = this.auth.isSystemOwner()
      ? this.dashService.getSystemDashboard()
      : this.dashService.getOrganizationDashboard(orgId!);

    req.subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
