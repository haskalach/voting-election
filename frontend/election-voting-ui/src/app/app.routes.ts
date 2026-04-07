import { Routes } from '@angular/router';
import { authGuard, loginGuard, roleGuard } from './core/guards/auth.guard';
import { ShellComponent } from './shared/components/shell.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrgListComponent } from './organizations/list/org-list.component';
import { OrgDetailComponent } from './organizations/detail/org-detail.component';
import { OrgFormComponent } from './organizations/form/org-form.component';
import { EmployeeFormComponent } from './employees/form/employee-form.component';
import { AttendanceComponent } from './data-logging/attendance/attendance.component';
import { VoteCountComponent } from './data-logging/vote-count/vote-count.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'organizations',
        canActivate: [roleGuard('SystemOwner', 'Manager')],
        children: [
          { path: '', component: OrgListComponent },
          {
            path: 'new',
            component: OrgFormComponent,
            canActivate: [roleGuard('SystemOwner')],
          },
          { path: ':id', component: OrgDetailComponent },
          {
            path: ':id/edit',
            component: OrgFormComponent,
            canActivate: [roleGuard('SystemOwner')],
          },
        ],
      },
      {
        path: 'employees/:orgId',
        canActivate: [roleGuard('SystemOwner', 'Manager')],
        children: [
          { path: 'new', component: EmployeeFormComponent },
          { path: ':empId/edit', component: EmployeeFormComponent },
        ],
      },
      {
        path: 'data',
        canActivate: [roleGuard('Employee')],
        children: [
          { path: 'attendance', component: AttendanceComponent },
          { path: 'votes', component: VoteCountComponent },
        ],
      },
      {
        path: 'admin',
        component: AdminComponent,
        canActivate: [roleGuard('SystemOwner')],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
