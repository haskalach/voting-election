import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import { EmployeeService } from '../../core/services/employee.service';
import { Organization, EmployeeSummary } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-org-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <a routerLink="/organizations" class="back-link">← Organizations</a>
      @if (auth.isSystemOwner() && org()) {
        <a
          [routerLink]="['/organizations', org()!.organizationId, 'edit']"
          class="btn-secondary"
          >Edit</a
        >
      }
    </div>

    @if (org()) {
      <div class="detail-grid">
        <div class="card info-card">
          <h2>{{ org()!.organizationName }}</h2>
          <p class="party-name">{{ org()!.partyName }}</p>
          <div class="info-rows">
            <div class="info-row">
              <span>Contact Email</span><span>{{ org()!.contactEmail }}</span>
            </div>
            <div class="info-row">
              <span>Address</span><span>{{ org()!.address || '—' }}</span>
            </div>
            <div class="info-row">
              <span>Status</span
              ><span
                [class]="org()!.isActive ? 'badge-active' : 'badge-inactive'"
                >{{ org()!.isActive ? 'Active' : 'Inactive' }}</span
              >
            </div>
            <div class="info-row">
              <span>Created</span
              ><span>{{ org()!.createdAt | date: 'mediumDate' }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Employees ({{ employees().length }})</h3>
            <a
              [routerLink]="['/employees', org()!.organizationId, 'new']"
              class="btn-primary"
              >+ Add Employee</a
            >
          </div>
          @if (employees().length === 0) {
            <div class="empty-state">No employees yet.</div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (emp of employees(); track emp.employeeId) {
                  <tr>
                    <td>{{ emp.firstName }} {{ emp.lastName }}</td>
                    <td>{{ emp.email }}</td>
                    <td>
                      <span
                        [class]="
                          emp.isActive ? 'badge-active' : 'badge-inactive'
                        "
                        >{{ emp.isActive ? 'Active' : 'Inactive' }}</span
                      >
                    </td>
                    <td>
                      <a
                        [routerLink]="[
                          '/employees',
                          org()!.organizationId,
                          emp.employeeId,
                          'edit',
                        ]"
                        class="btn-link"
                        >Edit</a
                      >
                    </td>
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
      .back-link {
        color: #0f3460;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .detail-grid {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 1.5rem;
        align-items: start;
      }
      .card {
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .info-card h2 {
        margin: 0 0 0.25rem;
        color: #1a1a2e;
        font-size: 1.3rem;
      }
      .party-name {
        color: #666;
        margin: 0 0 1.25rem;
        font-size: 0.95rem;
      }
      .info-rows {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #f0f0f0;
        font-size: 0.9rem;
      }
      .info-row span:first-child {
        color: #888;
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      .card-header h3 {
        margin: 0;
        font-size: 1.1rem;
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
      .badge-active {
        background: #d4edda;
        color: #155724;
        padding: 0.15rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
      }
      .badge-inactive {
        background: #f8d7da;
        color: #721c24;
        padding: 0.15rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
      }
      .btn-primary {
        background: #0f3460;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        text-decoration: none;
        font-size: 0.85rem;
      }
      .btn-secondary {
        background: #f0f0f0;
        color: #333;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        text-decoration: none;
        font-size: 0.85rem;
      }
      .btn-link {
        color: #0f3460;
        text-decoration: none;
        font-size: 0.85rem;
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
export class OrgDetailComponent implements OnInit {
  org = signal<Organization | null>(null);
  employees = signal<EmployeeSummary[]>([]);

  constructor(
    private orgService: OrganizationService,
    private empService: EmployeeService,
    private route: ActivatedRoute,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.orgService.getById(id).subscribe((org) => {
      this.org.set(org);
      this.empService
        .getByOrganization(id)
        .subscribe((emps) => this.employees.set(emps));
    });
  }
}
