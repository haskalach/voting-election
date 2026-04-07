import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
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
        <div>
          <a
            [routerLink]="['/organizations', org()!.organizationId, 'edit']"
            class="btn-secondary"
            >Edit</a
          >
          <button
            (click)="deleteOrg()"
            class="btn-delete"
            [disabled]="loading()"
          >
            Delete
          </button>
        </div>
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
                      @if (auth.isSystemOwner()) {
                        <button
                          (click)="
                            deleteEmployee(
                              emp.employeeId,
                              emp.firstName + ' ' + emp.lastName
                            )
                          "
                          class="btn-delete-link"
                        >
                          Delete
                        </button>
                      }
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
      .btn-delete {
        background: #d32f2f;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        border: none;
        text-decoration: none;
        font-size: 0.85rem;
        cursor: pointer;
        margin-left: 0.5rem;
      }
      .btn-delete:hover {
        background: #b71c1c;
      }
      .btn-delete:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      .btn-delete-link {
        background: none;
        border: none;
        color: #d32f2f;
        text-decoration: none;
        font-size: 0.85rem;
        cursor: pointer;
        padding: 0;
        font: inherit;
      }
      .btn-delete-link:hover {
        text-decoration: underline;
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
/**
 * OrgDetailComponent - Displays detailed information about a specific organization
 * Shows organization details and a list of employees belonging to the organization
 * SystemOwner can edit and delete the organization and its employees
 * Features: View org details, manage employees (edit/delete), delete org with cascade
 */
export class OrgDetailComponent implements OnInit {
  /** Signal storing the current organization details */
  org = signal<Organization | null>(null);
  /** Signal storing the list of employees in the organization */
  employees = signal<EmployeeSummary[]>([]);
  /** Signal tracking loading state during delete operations */
  loading = signal(false);

  constructor(
    private orgService: OrganizationService,
    private empService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
  ) {}

  /**
   * Angular lifecycle hook - called when component initializes
   * Extracts organization ID from route params and loads org details and employees
   */
  ngOnInit(): void {
    // Extract organization ID from route URL parameter
    const id = +this.route.snapshot.paramMap.get('id')!;
    // Fetch organization details from API
    this.orgService.getById(id).subscribe((org) => {
      this.org.set(org);
      // Fetch employees for this organization
      this.empService
        .getByOrganization(id)
        .subscribe((emps) => this.employees.set(emps));
    });
  }

  /**
   * Refreshes the employees list for the current organization
   * Used after employee deletion or form submission
   */
  load(): void {
    const id = this.org()!.organizationId;
    this.empService.getByOrganization(id).subscribe((emps) => {
      this.employees.set(emps);
    });
  }

  /**
   * Deletes the entire organization after user confirmation
   * Cascades to delete all employees in the organization
   * Redirects to organizations list on success
   */
  deleteOrg(): void {
    // Show confirmation dialog with cascade warning
    if (
      confirm(
        `Are you sure you want to delete "${this.org()!.organizationName}"? This will also delete all its employees.`,
      )
    ) {
      this.loading.set(true);
      // Call delete API with organization ID
      this.orgService.delete(this.org()!.organizationId).subscribe({
        next: () => {
          // Navigate back to organizations list on successful deletion
          this.router.navigate(['/organizations']);
        },
        error: () => {
          this.loading.set(false);
          alert('Delete failed');
        },
      });
    }
  }

  /**
   * Deletes a single employee from the organization after user confirmation
   * Refreshes employees list on success
   * @param id - Employee ID to delete
   * @param name - Employee name for confirmation dialog
   */
  deleteEmployee(id: number, name: string): void {
    // Show confirmation dialog
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      // Call delete API with organization and employee IDs
      this.empService.delete(this.org()!.organizationId, id).subscribe({
        next: () => this.load(), // Refresh employees list after successful deletion
        error: () => alert('Delete failed'),
      });
    }
  }
}
