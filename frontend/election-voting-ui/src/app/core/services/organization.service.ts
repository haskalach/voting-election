import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Organization,
  OrganizationSummary,
  CreateOrganization,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly url = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<OrganizationSummary[]> {
    return this.http.get<OrganizationSummary[]>(this.url);
  }

  getById(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.url}/${id}`);
  }

  create(dto: CreateOrganization): Observable<Organization> {
    return this.http.post<Organization>(this.url, dto);
  }

  update(id: number, dto: CreateOrganization): Observable<Organization> {
    return this.http.put<Organization>(`${this.url}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
