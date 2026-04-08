# Election Voting Supervision System — Frontend

**Status**: ✅ Angular 18 with security hardening  
**Last Updated**: April 8, 2026  
**Framework**: Angular 18, TypeScript, RxJS, Bootstrap

---

## 📋 Overview

The frontend is an Angular 18 SPA providing:

- **User Authentication**: Login with email/password, token refresh, logout
- **Role-Based Dashboards**: Different views for SystemOwner, Manager, Employee
- **Organization Management**: Create, view, update organizations (SystemOwner/Manager)
- **Polling Station Management**: Create and manage election locations
- **Data Entry**: Record voter attendance and vote counts
- **Responsive UI**: Mobile-friendly Bootstrap-based design

---

## 🏗️ Project Structure

```
election-voting-ui/
├── src/app/
│   ├── core/                          # Core module (singletons)
│   │   ├── guards/
│   │   │   ├── auth.guard.ts          # Redirect unauthenticated users
│   │   │   └── role.guard.ts          # Role-based route protection
│   │   ├── interceptors/
│   │   │   ├── jwt.interceptor.ts     # Add Bearer token to requests
│   │   │   └── error.interceptor.ts   # Global error handling
│   │   ├── models/
│   │   │   └── models.ts              # TypeScript interfaces
│   │   └── services/
│   │       ├── auth.service.ts        # Authentication & tokens
│   │       ├── api.service.ts         # HTTP communication
│   │       └── user.service.ts        # User state management
│   │
│   ├── shared/                         # Shared module
│   │   ├── components/
│   │   │   └── navbar.component.ts    # Navigation header
│   │   └── pipes/
│   │       └── safe.pipe.ts           # DOM sanitization
│   │
│   ├── modules/
│   │   ├── auth/                       # Authentication module
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── dashboard/                  # Dashboard module
│   │   │   ├── system-dashboard/
│   │   │   ├── org-dashboard/
│   │   │   └── dashboard.module.ts
│   │   │
│   │   ├── organizations/              # Organization module
│   │   │   ├── org-list/
│   │   │   ├── org-detail/
│   │   │   ├── org-form/
│   │   │   └── organizations.module.ts
│   │   │
│   │   ├── employees/                  # Employee module
│   │   │   ├── employee-list/
│   │   │   ├── employee-form/
│   │   │   └── employees.module.ts
│   │   │
│   │   └── polling-stations/           # Polling Station module
│   │       ├── station-list/
│   │       ├── station-form/
│   │       └── polling-stations.module.ts
│   │
│   ├── app.component.ts                # Root component
│   ├── app-routing.module.ts           # Main routing
│   └── app.module.ts                   # Root module
│
├── environments/                       # Environment configs
│   ├── environment.ts                  # Development
│   └── environment.prod.ts             # Production
│
└── assets/                             # Static files (images, fonts)
```

---

## 🔐 Security Features

### Phase 5 Hardening

1. **Token Storage**:
   - Access token stored in-memory (Angular service signal)
   - Refresh token in localStorage only
   - No sensitive data in localStorage

2. **JWT Interceptor**:
   - Automatically adds Bearer token to requests
   - Handles token refresh on 401
   - Shared observable prevents race conditions

3. **Angular Guards**:
   - `AuthGuard`: Redirects unauthenticated users to login
   - `RoleGuard`: Blocks routes for unauthorized roles

4. **HTTP Interceptor**:
   - Catches 401 errors, refreshes token, retries request
   - Prevents multiple simultaneous refresh requests

### Authentication Flow

```
1. User enters credentials → Login component
2. AuthService.login() → POST /api/auth/login
3. Response: { accessToken, refreshToken, user }
   - accessToken → memory signal
   - refreshToken → localStorage
   - user → memory signal
4. AuthGuard checks isLoggedIn() → routes allowed
5. JWT Interceptor adds Authorization header
6. On 401 → Refresh token (shared observable)
7. Logout → Clear memory + localStorage + revoke cookies
```

---

## 📦 Key Services

| Service                 | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `AuthService`           | Login, logout, token refresh, user state |
| `ApiService`            | HTTP client wrapper with base URL        |
| `DashboardService`      | Fetch dashboard metrics                  |
| `OrganizationService`   | CRUD for organizations                   |
| `EmployeeService`       | CRUD for employees                       |
| `PollingStationService` | CRUD for polling stations                |

---

## 🎨 Components

### Layout

- **AppComponent**: Root component with navbar
- **NavbarComponent**: Navigation header with role-based menu

### Auth

- **LoginComponent**: Email/password login
- **RegisterComponent**: User registration (SystemOwner only)

### Dashboard

- **SystemDashboardComponent**: Overview across all orgs (SystemOwner)
- **OrgDashboardComponent**: Organization metrics (Manager)

### Organizations

- **OrgListComponent**: Table of organizations
- **OrgDetailComponent**: View org details
- **OrgFormComponent**: Create/edit organization

### Employees

- **EmployeeListComponent**: Employee roster
- **EmployeeFormComponent**: Create/edit employee

### Polling Stations

- **StationListComponent**: List stations
- **StationFormComponent**: Create/edit station

---

## 🚀 Development

### Prerequisites

- Node.js 18+ & npm
- Angular CLI: `npm install -g @angular/cli`
- VS Code (recommended)

### Setup

```bash
cd frontend/election-voting-ui

# Install dependencies
npm install

# Configure API endpoint (if different from default)
# Edit src/environments/environment.ts
```

### Running

```bash
# Development server
ng serve
# App: http://localhost:4200/

# Build for production
ng build --configuration production
# Output: dist/election-voting-ui/

# Run tests
ng test

# Run e2e tests (if configured)
ng e2e
```

### Development Proxy

To avoid CORS during development, configure `proxy.conf.json`:

```json
{
  "/api/*": {
    "target": "http://localhost:5001",
    "secure": false
  }
}
```

---

## 🧪 Testing

### Unit Tests

```bash
ng test                       # Run all
ng test --include="**/auth/**" # Run Auth module only
ng test --code-coverage       # Generate coverage report
```

### E2E Tests (if configured)

```bash
ng e2e
```

---

## 📡 API Integration

### Base URL

Set in `environments/environment.ts`:

```typescript
export const environment = {
  apiUrl: "http://localhost:5001/api",
};
```

### Example Service

```typescript
@Injectable({ providedIn: 'root' })
export class OrganizationService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<OrganizationDto[]> {
    return this.http.get<OrganizationDto[]>`${environment.apiUrl}/organizations`);
  }

  create(dto: CreateOrganizationDto): Observable<OrganizationDto> {
    return this.http.post<OrganizationDto>(
      `${environment.apiUrl}/organizations`,
      dto
    );
  }
}
```

---

## 🎯 Routing

### Protected Routes

```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['SystemOwner', 'Manager'] }
}
```

### Public Routes

```typescript
{
  path: 'login',
  component: LoginComponent
}
```

---

## 📝 Code Standards

### Component Structure

```typescript
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit {
  // Signals for state
  data = signal<DataType | null>(null);
  isLoading = signal(false);

  // Computed
  isEmpty = computed(() => !this.data());

  // DI
  constructor(private service: ServiceType) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() { ... }
}
```

### Template Binding

```html
<!-- Text interpolation -->
<p>{{ user().email }}</p>

<!-- Property binding -->
<app-widget [data]="items()"></app-widget>

<!-- Event binding -->
<button (click)="save()">Save</button>

<!-- Two-way binding -->
<input [(ngModel)]="name" />

<!-- Computed display -->
@if (isEmpty()) {
<p>No data</p>
} @else {
<ul>
  @for (item of items(); track item.id) {
  <li>{{ item.name }}</li>
  }
</ul>
}
```

### RxJS Patterns

```typescript
// Single request
this.service.get(id).subscribe(
  data => this.onSuccess(data),
  error => this.onError(error)
);

// Handle token refresh race
return refreshToken$.pipe(
  shareReplay(1),
  switchMap(() => retryRequest())
);

// Unsubscribe on destroy
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { ... });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## 🌍 Responsive Design

Uses **Bootstrap 5** for consistent styling:

```html
<div class="container">
  <div class="row">
    <div class="col-md-6">Side panel</div>
    <div class="col-md-6">Main content</div>
  </div>
</div>
```

All components are mobile-responsive.

---

## 🔄 Recent Changes (Phase 5)

✅ **Access token in-memory only** (not localStorage)  
✅ **Refresh token race condition fixed** with `shareReplay(1)`  
✅ **HTTP interceptor** handles 401 with automatic retry  
✅ **Angular guards** enforce role-based access

---

## 📚 Related Documentation

- [Backend API Documentation](../backend/README.md)
- [Architecture Diagrams](../../docs/diagrams/)
- [Auth Flow](../../docs/diagrams/03-auth-flow.mmd)
- [Frontend Architecture](../../docs/diagrams/06-frontend-architecture.mmd)

---

## 🛠️ Troubleshooting

### CORS Errors

→ Use proxy.conf.json during development  
→ Check backend CORS policy in Program.cs

### Token Not Persisting

→ Check localStorage in DevTools Application tab  
→ Verify AuthService logic for token save/retrieval

### Guard Not Redirecting

→ Ensure AuthGuard is in route's `canActivate`  
→ Check isLoggedIn() signal in AuthService

### Swagger/API Not Available

→ Ensure backend is running on http://localhost:5001  
→ Check environment.ts has correct apiUrl

---

## 📊 Performance Tips

- Use `OnPush` change detection strategy
- Lazy load feature modules
- Unsubscribe from observables on destroy
- Use `trackBy` with `*ngFor`
- Avoid inline function bindings in templates

---

**Maintained by**: Dev Team  
**Last Review**: Apr 8, 2026  
**Version**: 1.0 (Angular 18)
