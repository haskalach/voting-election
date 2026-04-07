import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h2>{{ isEdit() ? 'Edit Employee' : 'New Employee' }}</h2>
    </div>
    <div class="card">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-row">
          <div class="form-group">
            <label>First Name *</label>
            <input
              type="text"
              formControlName="firstName"
              [class.error]="isInvalid('firstName')"
            />
            @if (isInvalid('firstName')) {
              <span class="error-msg">Required</span>
            }
          </div>
          <div class="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              formControlName="lastName"
              [class.error]="isInvalid('lastName')"
            />
            @if (isInvalid('lastName')) {
              <span class="error-msg">Required</span>
            }
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Email *</label>
            <input
              type="email"
              formControlName="email"
              [class.error]="isInvalid('email')"
            />
            @if (isInvalid('email')) {
              <span class="error-msg">Valid email required</span>
            }
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              formControlName="phoneNumber"
              placeholder="+961 xx xxx xxx"
            />
          </div>
        </div>
        @if (!isEdit()) {
          <div class="form-row">
            <div class="form-group">
              <label>Password *</label>
              <input
                type="password"
                formControlName="password"
                placeholder="Min. 8 characters"
                [class.error]="isInvalid('password')"
              />
              @if (isInvalid('password')) {
                <span class="error-msg">Min. 8 characters required</span>
              }
            </div>
            <div class="form-group">
              <label>Date of Birth</label>
              <input type="date" formControlName="dateOfBirth" />
            </div>
          </div>
        }
        @if (isEdit()) {
          <div class="form-row">
            <div class="form-group">
              <label>Date of Birth</label>
              <input type="date" formControlName="dateOfBirth" />
            </div>
            <div class="form-group">
              <label>Status</label>
              <select formControlName="isActive">
                <option [value]="true">Active</option>
                <option [value]="false">Inactive</option>
              </select>
            </div>
          </div>
        }
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
      .form-group input,
      .form-group select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 0.95rem;
        box-sizing: border-box;
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
export class EmployeeFormComponent implements OnInit {
  form!: ReturnType<FormBuilder['group']>;

  isEdit = signal(false);
  loading = signal(false);
  errorMessage = signal('');
  private orgId!: number;
  private empId!: number;

  constructor(
    private fb: FormBuilder,
    private empService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phoneNumber: [''],
      dateOfBirth: [null as string | null],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.orgId = +this.route.snapshot.paramMap.get('orgId')!;
    const empId = this.route.snapshot.paramMap.get('empId');
    if (empId) {
      this.isEdit.set(true);
      this.empId = +empId;
      // Password not required on edit
      this.form.get('password')!.clearValidators();
      this.form.get('password')!.updateValueAndValidity();
      this.empService
        .getById(this.orgId, this.empId)
        .subscribe((emp) => this.form.patchValue(emp as any));
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
    const dto = this.form.value as any;
    const request = this.isEdit()
      ? this.empService.update(this.orgId, this.empId, dto)
      : this.empService.create(this.orgId, dto);

    request.subscribe({
      next: () => this.router.navigate(['/organizations', this.orgId]),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Failed to save.');
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/organizations', this.orgId]);
  }
}
