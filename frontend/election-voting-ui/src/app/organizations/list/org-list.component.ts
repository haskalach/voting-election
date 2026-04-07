import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import { OrganizationSummary } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-org-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h2>Organizations</h2>
      @if (auth.isSystemOwner()) {
        <a routerLink="/organizations/new" class="btn-primary"
          >+ New Organization</a
        >
      }
    </div>

    @if (loading()) {
      <div class="loading">Loading...</div>
    } @else if (orgs().length === 0) {
      <div class="empty-state">No organizations found.</div>
    } @else {
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Party</th>
              <th>Employees</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (org of orgs(); track org.organizationId) {
              <tr>
                <td>
                  <strong>{{ org.organizationName }}</strong>
                </td>
                <td>{{ org.partyName }}</td>
                <td>{{ org.employeeCount }}</td>
                <td>
                  <span
                    [class]="org.isActive ? 'badge-active' : 'badge-inactive'"
                    >{{ org.isActive ? 'Active' : 'Inactive' }}</span
                  >
                </td>
                <td>
                  <a
                    [routerLink]="['/organizations', org.organizationId]"
                    class="btn-link"
                    >View</a
                  >
                  @if (auth.isSystemOwner()) {
                    <a
                      [routerLink]="[
                        '/organizations',
                        org.organizationId,
                        'edit',
                      ]"
                      class="btn-link"
                      >Edit</a
                    >
                    <button
                      (click)="
                        deleteOrg(org.organizationId, org.organizationName)
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
      .btn-primary {
        background: #0f3460;
        color: white;
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .btn-link {
        color: #0f3460;
        text-decoration: none;
        margin-right: 0.75rem;
        font-size: 0.9rem;
      }
      .btn-link:hover {
        text-decoration: underline;
      }
      .btn-delete-link {
        background: none;
        border: none;
        color: #d32f2f;
        text-decoration: none;
        margin-right: 0.75rem;
        font-size: 0.9rem;
        cursor: pointer;
        padding: 0;
        font: inherit;
      }
      .btn-delete-link:hover {
        text-decoration: underline;
      }
      .table-container {
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      thead {
        background: #f8f9fa;
      }
      th {
        padding: 1rem;
        text-align: left;
        font-size: 0.85rem;
        color: #666;
        font-weight: 600;
        border-bottom: 1px solid #eee;
      }
      td {
        padding: 1rem;
        border-bottom: 1px solid #f0f0f0;
        font-size: 0.9rem;
      }
      tr:last-child td {
        border-bottom: none;
      }
      tr:hover td {
        background: #fafafa;
      }
      .badge-active {
        background: #d4edda;
        color: #155724;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        font-size: 0.8rem;
      }
      .badge-inactive {
        background: #f8d7da;
        color: #721c24;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        font-size: 0.8rem;
      }
      .loading,
      .empty-state {
        text-align: center;
        padding: 3rem;
        color: #666;
        background: white;
        border-radius: 10px;
      }
    `,
  ],
})
/**
 * OrgListComponent - Displays a list of all organizations
 * Only SystemOwner can create, edit, or delete organizations
 * Features: View organizations, create new, edit, and delete with cascade to employees
 */
export class OrgListComponent implements OnInit {
  /** Signal storing the list of organizations fetched from the API */
  orgs = signal<OrganizationSummary[]>([]);
  /** Signal tracking loading state for the organizations list */
  loading = signal(true);

  constructor(
    private orgService: OrganizationService,
    public auth: AuthService,
  ) {}

  /**
   * Angular lifecycle hook - called when component initializes
   * Loads the organizations list on component load
   */
  ngOnInit(): void {
    this.load();
  }

  /**
   * Fetches all organizations from the API and updates the orgs signal
   * Sets loading state during the request and clears it on completion
   */
  load(): void {
    this.orgService.getAll().subscribe({
      next: (data) => {
        this.orgs.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /**
   * Deletes an organization after user confirmation
   * Cascades to delete all employees in that organization
   * Refreshes the list on success
   * @param id - Organization ID to delete
   * @param name - Organization name for confirmation dialog
   */
  deleteOrg(id: number, name: string): void {
    // Show confirmation dialog with cascade warning
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This will also delete all its employees.`,
      )
    ) {
      this.orgService.delete(id).subscribe({
        next: () => this.load(), // Refresh list after successful deletion
        error: (err) => alert('Delete failed: ' + err.message),
      });
    }
  }
}
