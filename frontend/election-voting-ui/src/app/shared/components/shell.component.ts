import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">🗳️ Election Voting</div>
      <div class="nav-links">
        @if (auth.isSystemOwner() || auth.isManager()) {
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/organizations" routerLinkActive="active"
            >Organizations</a
          >
        }
        @if (auth.isSystemOwner() || auth.isManager()) {
          <a routerLink="/employees" routerLinkActive="active">Employees</a>
        }
        @if (auth.isEmployee()) {
          <a routerLink="/data/attendance" routerLinkActive="active"
            >Log Attendance</a
          >
          <a routerLink="/data/votes" routerLinkActive="active">Log Votes</a>
        }
        @if (auth.isSystemOwner()) {
          <a routerLink="/admin" routerLinkActive="active">Admin</a>
        }
      </div>
      <div class="nav-user">
        <span class="user-name"
          >{{ auth.user()?.firstName }} {{ auth.user()?.lastName }}</span
        >
        <span class="user-role">{{ auth.user()?.role }}</span>
        <button (click)="auth.logout()" class="btn-logout">Sign Out</button>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        display: flex;
        align-items: center;
        background: #0f3460;
        padding: 0 2rem;
        height: 60px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
      .nav-brand {
        color: white;
        font-size: 1.2rem;
        font-weight: 700;
        margin-right: 2rem;
        white-space: nowrap;
      }
      .nav-links {
        display: flex;
        gap: 0.25rem;
        flex: 1;
      }
      .nav-links a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        transition: all 0.2s;
      }
      .nav-links a:hover,
      .nav-links a.active {
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }
      .nav-user {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .user-name {
        color: white;
        font-size: 0.9rem;
        font-weight: 600;
      }
      .user-role {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.75rem;
      }
      .btn-logout {
        background: rgba(255, 255, 255, 0.15);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 0.4rem 0.9rem;
        border-radius: 6px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-logout:hover {
        background: rgba(255, 255, 255, 0.25);
      }
    `,
  ],
})
export class NavComponent {
  constructor(public auth: AuthService) {}
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [NavComponent, RouterOutlet],
  template: `
    <app-nav />
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .main-content {
        padding: 2rem;
        min-height: calc(100vh - 60px);
        background: #f4f6f9;
      }
    `,
  ],
})
export class ShellComponent {}
