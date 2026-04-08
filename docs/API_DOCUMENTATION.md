# API Documentation — Election Voting Supervision System

**Version**: 1.0  
**Last Updated**: April 8, 2026  
**Base URL**: `http://localhost:5001/api` (development)

---

## 📖 Table of Contents

1. [Authentication](#authentication)
2. [Authorization & Roles](#authorization--roles)
3. [Endpoints](#endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Examples](#examples)

---

## Authentication

### Overview

The API uses **JWT (JSON Web Tokens)** for stateless authentication:

1. User logs in → receives `accessToken` + `refreshToken`
2. Include `Authorization: Bearer {accessToken}` in requests
3. Access token expires after 60 minutes
4. Use `refreshToken` to get a new `accessToken`

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "manager@election.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a7f8c2d9-4b1e-46a2-9f3c...",
  "expiresIn": 3600,
  "user": {
    "userId": 2,
    "email": "manager@election.com",
    "firstName": "John",
    "lastName": "Manager",
    "role": "Manager",
    "organizationId": 1
  }
}
```

**Errors**:

- `401 Unauthorized`: Invalid credentials
- `401 Unauthorized`: Account is deactivated

### Register User

```http
POST /api/auth/register
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "newuser@election.com",
  "password": "SecurePassword123",
  "firstName": "Jane",
  "lastName": "User",
  "roleId": 2
}
```

**Response** (201 Created):

```json
{
  "userId": 5,
  "email": "newuser@election.com",
  "firstName": "Jane",
  "lastName": "User",
  "role": "Manager",
  "organizationId": null
}
```

**Restrictions**: SystemOwner role only

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "a7f8c2d9-4b1e-46a2-9f3c..."
}
```

**Response** (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors**:

- `401 Unauthorized`: Invalid or expired refresh token
- `429 Too Many Requests`: Rate limit exceeded

### Logout

```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

**Response** (204 No Content)

---

## Authorization & Roles

### Role Hierarchy

| Role            | Permissions                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SystemOwner** | <ul><li>Create/manage organizations</li><li>Register users</li><li>View system dashboard</li><li>Full system access</li></ul>                                        |
| **Manager**     | <ul><li>Manage own organization</li><li>Create/manage employees</li><li>Manage polling stations</li><li>View org dashboard</li><li>Record attendance/votes</li></ul> |
| **Employee**    | <ul><li>Record voter attendance</li><li>Record vote counts</li><li>View own polling station</li></ul>                                                                |

### Organization Isolation

**Managers** can only access their own organization:

- Attempting to access another org's dashboard → `403 Forbidden`
- Attempting to update another org → `403 Forbidden`
- Manager's org ID determined by JWT claim

---

## Endpoints

### Dashboard

#### Get Organization Dashboard

```http
GET /api/dashboard/organization/{orgId}
Authorization: Bearer {accessToken}
```

**Roles**: SystemOwner, Manager  
**Org Check**: Manager can only access own organization

**Response** (200 OK):

```json
{
  "organizationId": 1,
  "organizationName": "Election Authority",
  "totalEmployees": 45,
  "totalPollingStations": 12,
  "totalVoterAttendance": 3500,
  "totalVotesCounted": 3500
}
```

**Errors**:

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Manager accessing another org
- `404 Not Found`: Organization not found

#### Get System Dashboard

```http
GET /api/dashboard/system
Authorization: Bearer {accessToken}
```

**Roles**: SystemOwner only

**Response** (200 OK):

```json
{
  "totalOrganizations": 8,
  "totalEmployees": 250,
  "totalPollingStations": 100,
  "totalVoterAttendance": 45000,
  "totalVotesCounted": 45000
}
```

---

### Organizations

#### List All Organizations

```http
GET /api/organizations
Authorization: Bearer {accessToken}
```

**Roles**: SystemOwner, Manager  
**Note**: Managers see all orgs but can only modify their own

**Response** (200 OK):

```json
[
  {
    "organizationId": 1,
    "organizationName": "Election Authority",
    "partyName": "Independent",
    "isActive": true,
    "employeeCount": 45
  },
  ...
]
```

#### Get Organization Details

```http
GET /api/organizations/{id}
Authorization: Bearer {accessToken}
```

**Roles**: SystemOwner, Manager

**Response** (200 OK):

```json
{
  "organizationId": 1,
  "organizationName": "Election Authority",
  "partyName": "Independent",
  "contactEmail": "info@election.com",
  "address": "123 Main St, Capital City",
  "isActive": true,
  "createdAt": "2026-01-15T10:30:00Z",
  "employeeCount": 45
}
```

#### Create Organization

```http
POST /api/organizations
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "organizationName": "New Election Board",
  "partyName": "Test Party",
  "contactEmail": "contact@test.com",
  "address": "456 Oak Ave, City",
  "adminEmail": "admin@test.com",
  "adminPassword": "SecureAdmin123!",
  "adminFirstName": "John",
  "adminLastName": "Admin"
}
```

**Roles**: SystemOwner only  
**Validation**:

- Org name must be unique
- Admin email must be unique
- Password min 8 characters

**Response** (201 Created):

```json
{
  "organizationId": 9,
  "organizationName": "New Election Board",
  ...
  "employeeCount": 1
}
```

**Errors**:

- `400 Bad Request`: Org name already exists, email in use
- `422 Unprocessable Entity`: Validation failed

#### Update Organization

```http
PUT /api/organizations/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "organizationName": "Updated Name",
  "partyName": "Updated Party",
  "contactEmail": "new@email.com",
  "address": "789 New St, City"
}
```

**Roles**: SystemOwner, Manager  
**Org Check**: Manager can only update own organization

**Response** (200 OK):

```json
{
  "organizationId": 1,
  ...
  "organizationName": "Updated Name"
}
```

#### Delete Organization

```http
DELETE /api/organizations/{id}
Authorization: Bearer {accessToken}
```

**Roles**: SystemOwner only  
**Cascade**: Deletes all employees, polling stations, and audit logs

**Response** (204 No Content)

---

### Employees

#### List Organization Employees

```http
GET /api/organizations/{orgId}/employees
Authorization: Bearer {accessToken}
```

**Roles**: SystemOwner, Manager, Employee

**Response** (200 OK):

```json
[
  {
    "employeeId": 1,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@election.com",
    "isActive": true
  },
  ...
]
```

#### Get Employee Details

```http
GET /api/organizations/{orgId}/employees/{empId}
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "employeeId": 1,
  "organizationId": 1,
  "organizationName": "Election Authority",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@election.com",
  "phoneNumber": "+1-555-0123",
  "dateOfBirth": "1990-05-15",
  "isActive": true,
  "createdAt": "2026-01-20T14:22:00Z",
  "lastActivityAt": "2026-01-30T16:45:00Z"
}
```

#### Create Employee

```http
POST /api/organizations/{orgId}/employees
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Worker",
  "email": "john@election.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1-555-9876",
  "dateOfBirth": "1992-08-22"
}
```

**Roles**: Manager of owning org  
**Response** (201 Created)

#### Update Employee

```http
PUT /api/organizations/{orgId}/employees/{empId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Worker",
  "email": "john.new@election.com",
  "phoneNumber": "+1-555-9876",
  "dateOfBirth": "1992-08-22",
  "isActive": true
}
```

**Roles**: Manager of owning org  
**Response** (200 OK)

#### Delete Employee

```http
DELETE /api/organizations/{orgId}/employees/{empId}
Authorization: Bearer {accessToken}
```

**Roles**: Manager of owning org  
**Response** (204 No Content)

---

### Polling Stations

#### List Polling Stations

```http
GET /api/organizations/{orgId}/polling-stations
Authorization: Bearer {accessToken}
```

**Roles**: All authenticated users (org-scoped)

#### Create Polling Station

```http
POST /api/organizations/{orgId}/polling-stations
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "stationName": "Central Polling",
  "address": "100 Election Way",
  "capacity": 500
}
```

**Roles**: Manager of owning org  
**Response** (201 Created)

#### Update/Delete

Similar to Employees (PUT/DELETE)

---

### Data Recording

#### Log Voter Attendance

```http
POST /api/data/attendance
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "pollingStationId": 1,
  "voterCount": 250,
  "notes": "Morning shift complete"
}
```

**Roles**: Employee, Manager  
**Response** (201 Created)

#### Log Vote Count

```http
POST /api/data/votes
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "pollingStationId": 1,
  "candidateName": "John Smith",
  "votes": 125
}
```

**Roles**: Employee, Manager  
**Response** (201 Created)

---

## Error Handling

### Standard Error Response

All errors return a consistent format:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "The request body contains invalid data"
}
```

### HTTP Status Codes

| Code | Meaning              | Solution                              |
| ---- | -------------------- | ------------------------------------- |
| 200  | OK                   | Request successful                    |
| 201  | Created              | Resource created successfully         |
| 204  | No Content           | Success, no body (DELETE)             |
| 400  | Bad Request          | Invalid input, check validation       |
| 401  | Unauthorized         | Missing/invalid token, login again    |
| 403  | Forbidden            | Insufficient permissions for resource |
| 404  | Not Found            | Resource doesn't exist                |
| 422  | Unprocessable Entity | Validation failed (duplicate, format) |
| 429  | Too Many Requests    | Rate limit exceeded, wait 1 min       |
| 500  | Server Error         | Contact support with request ID       |

---

## Rate Limiting

### Auth Endpoints Limited

- `POST /api/auth/login`
- `POST /api/auth/refresh`

**Limit**: 10 requests per 1 minute per IP  
**Response on Limit**:

```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "detail": "Rate limit exceeded"
}
```

### Other Endpoints

No rate limiting (except auth)

---

## Examples

### Full Login → Dashboard → Logout Flow

```bash
# 1. Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@election.com",
    "password": "SecurePassword123"
  }'

# Save accessToken from response
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# 2. Access protected resource
curl http://localhost:5001/api/dashboard/organization/1 \
  -H "Authorization: Bearer $TOKEN"

# 3. Logout
curl -X POST http://localhost:5001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

### Create Organization (SystemOwner)

```bash
curl -X POST http://localhost:5001/api/organizations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "County Elections",
    "partyName": "Election Board",
    "contactEmail": "contact@county.gov",
    "address": "123 Government Blvd",
    "adminEmail": "admin@county.gov",
    "adminPassword": "SecureAdminPass123!",
    "adminFirstName": "Sarah",
    "adminLastName": "Administrator"
  }'
```

### Manager Creates Employee

```bash
curl -X POST http://localhost:5001/api/organizations/1/employees \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Volunteer",
    "email": "john.volunteer@county.gov",
    "password": "VolunteerPass123!",
    "phoneNumber": "+1-555-0123",
    "dateOfBirth": "1990-06-15"
  }'
```

---

## Swagger/OpenAPI

Interactive API documentation available at:

```
http://localhost:5001/swagger
```

- Try endpoints directly
- See live request/response examples
- View all schemas and validations

---

## Support

For issues or questions:

1. Check [Backend README](../backend/README.md)
2. Check [Frontend README](../frontend/README.md)
3. Review [Architecture Diagrams](../../docs/diagrams/)
4. Check [Phase 5 Code Review](../../PHASE_5_CODE_REVIEW.md)

---

**Version**: 1.0  
**Last Updated**: April 8, 2026  
**Status**: ✅ Production Ready (Phase 5 Security Hardened)
