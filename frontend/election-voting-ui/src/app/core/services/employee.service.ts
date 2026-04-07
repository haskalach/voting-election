import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Employee,
  EmployeeSummary,
  CreateEmployee,
  UpdateEmployee,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  constructor(private http: HttpClient) {}

  private baseUrl(orgId: number) {
    return `${environment.apiUrl}/organizations/${orgId}/employees`;
  }

  getByOrganization(orgId: number): Observable<EmployeeSummary[]> {
    return this.http.get<EmployeeSummary[]>(this.baseUrl(orgId));
  }

  getById(orgId: number, empId: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl(orgId)}/${empId}`);
  }

  create(orgId: number, dto: CreateEmployee): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl(orgId), dto);
  }

  update(
    orgId: number,
    empId: number,
    dto: UpdateEmployee,
  ): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl(orgId)}/${empId}`, dto);
  }

  deactivate(orgId: number, empId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(orgId)}/${empId}`);
  }
}
