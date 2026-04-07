import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🗳️ Election Voting</h1>
          <p>Supervision System</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              [class.error]="isInvalid('email')"
            />
            @if (isInvalid('email')) {
              <span class="error-msg">Valid email is required</span>
            }
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              [class.error]="isInvalid('password')"
            />
            @if (isInvalid('password')) {
              <span class="error-msg">Password is required</span>
            }
          </div>

          @if (errorMessage()) {
            <div class="alert-error">{{ errorMessage() }}</div>
          }

          <button
            type="submit"
            [disabled]="loading() || form.invalid"
            class="btn-primary"
          >
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
          135deg,
          #1a1a2e 0%,
          #16213e 50%,
          #0f3460 100%
        );
      }
      .login-card {
        background: white;
        border-radius: 12px;
        padding: 2.5rem;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      .login-header {
        text-align: center;
        margin-bottom: 2rem;
      }
      .login-header h1 {
        font-size: 1.8rem;
        color: #0f3460;
        margin: 0;
      }
      .login-header p {
        color: #666;
        margin: 0.25rem 0 0;
      }
      .form-group {
        margin-bottom: 1.25rem;
      }
      .form-group label {
        display: block;
        margin-bottom: 0.4rem;
        font-weight: 600;
        color: #333;
        font-size: 0.9rem;
      }
      .form-group input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        box-sizing: border-box;
        transition: border-color 0.2s;
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
        font-size: 0.9rem;
      }
      .btn-primary {
        width: 100%;
        padding: 0.85rem;
        background: #0f3460;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-primary:hover:not(:disabled) {
        background: #16213e;
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class LoginComponent {
  form!: ReturnType<FormBuilder['group']>;

  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
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

    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMessage.set(
          err.error?.message ?? 'Login failed. Please try again.',
        );
        this.loading.set(false);
      },
    });
  }
}
