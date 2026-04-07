import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';

@Component({
  selector: 'app-org-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h2>{{ isEdit() ? 'Edit Organization' : 'New Organization' }}</h2>
    </div>

    <div class="card">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-row">
          <div class="form-group">
            <label>Organization Name *</label>
            <input
              type="text"
              formControlName="organizationName"
              placeholder="e.g. Al-Kataeb"
              [class.error]="isInvalid('organizationName')"
            />
            @if (isInvalid('organizationName')) {
              <span class="error-msg">Organization name is required</span>
            }
          </div>
          <div class="form-group">
            <label>Party Name *</label>
            <input
              type="text"
              formControlName="partyName"
              placeholder="Full party name"
              [class.error]="isInvalid('partyName')"
            />
            @if (isInvalid('partyName')) {
              <span class="error-msg">Party name is required</span>
            }
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Contact Email *</label>
            <input
              type="email"
              formControlName="contactEmail"
              placeholder="contact@party.lb"
              [class.error]="isInvalid('contactEmail')"
            />
            @if (isInvalid('contactEmail')) {
              <span class="error-msg">Valid email is required</span>
            }
          </div>
          <div class="form-group">
            <label>Address</label>
            <input
              type="text"
              formControlName="address"
              placeholder="Beirut, Lebanon"
            />
          </div>
        </div>

        @if (errorMessage()) {
          <div class="alert-error">{{ errorMessage() }}</div>
        }

        <div class="form-actions">
          <button type="button" (click)="cancel()" class="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="loading() || form.invalid"
            class="btn-primary"
          >
            {{ loading() ? 'Saving...' : isEdit() ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
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
      .card {
        background: white;
        border-radius: 10px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        max-width: 700px;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 0;
      }
      .form-group {
        margin-bottom: 1.25rem;
      }
      .form-group label {
        display: block;
        font-weight: 600;
        color: #333;
        font-size: 0.9rem;
        margin-bottom: 0.4rem;
      }
      .form-group input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 0.95rem;
        box-sizing: border-box;
      }
      .form-group input:focus {
        outline: none;
        border-color: #0f3460;
        box-shadow: 0 0 0 3px rgba(15, 52, 96, 0.1);
      }
      .form-group input.error {
        border-color: #e74c3c;
      }
      .error-msg {
        font-size: 0.8rem;
        color: #e74c3c;
        margin-top: 0.25rem;
        display: block;
      }
      .alert-error {
        background: #fdf0f0;
        border: 1px solid #f5c6cb;
        color: #721c24;
        padding: 0.75rem;
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
      }
      .btn-primary {
        background: #0f3460;
        color: white;
        border: none;
        padding: 0.7rem 1.5rem;
        border-radius: 8px;
        font-size: 0.95rem;
        cursor: pointer;
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-secondary {
        background: #f0f0f0;
        color: #333;
        border: none;
        padding: 0.7rem 1.5rem;
        border-radius: 8px;
        font-size: 0.95rem;
        cursor: pointer;
      }
    `,
  ],
})
export class OrgFormComponent implements OnInit {
  form!: ReturnType<FormBuilder['group']>;

  isEdit = signal(false);
  loading = signal(false);
  errorMessage = signal('');
  private orgId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private orgService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      organizationName: ['', Validators.required],
      partyName: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      address: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.orgId = +id;
      this.orgService.getById(this.orgId).subscribe((org) => {
        this.form.patchValue(org);
      });
    }
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
    this.errorMessage.set('');
    const dto = this.form.value as any;
    const request = this.isEdit()
      ? this.orgService.update(this.orgId!, dto)
      : this.orgService.create(dto);

    request.subscribe({
      next: () => this.router.navigate(['/organizations']),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Failed to save.');
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/organizations']);
  }
}
