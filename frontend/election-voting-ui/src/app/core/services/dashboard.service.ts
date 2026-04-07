import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dashboard } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getOrganizationDashboard(orgId: number): Observable<Dashboard> {
    return this.http.get<Dashboard>(
      `${environment.apiUrl}/dashboard/organization/${orgId}`,
    );
  }

  getSystemDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${environment.apiUrl}/dashboard/system`);
  }
}
