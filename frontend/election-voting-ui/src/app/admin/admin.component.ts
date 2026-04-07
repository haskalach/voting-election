import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { OrganizationService } from '../core/services/organization.service';
import { OrganizationSummary } from '../core/models/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h1>System Administration</h1>
      <section>
        <h2>Organizations Overview</h2>
        @if (loading()) {
          <p>Loading...</p>
        } @else {
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Organization Name</th>
                <th>Party Name</th>
                <th>Employees</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              @for (org of orgs(); track org.organizationId) {
                <tr>
                  <td>{{ org.organizationId }}</td>
                  <td>{{ org.organizationName }}</td>
                  <td>{{ org.partyName }}</td>
                  <td>{{ org.employeeCount }}</td>
                  <td>{{ org.isActive ? 'Yes' : 'No' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .admin-container {
        padding: 2rem;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }
      th,
      td {
        border: 1px solid #ccc;
        padding: 0.5rem 1rem;
        text-align: left;
      }
      th {
        background: #f4f4f4;
      }
    `,
  ],
})
export class AdminComponent implements OnInit {
  orgs = signal<OrganizationSummary[]>([]);
  loading = signal(true);

  constructor(
    private orgService: OrganizationService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.orgService.getAll().subscribe({
      next: (data) => {
        this.orgs.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
