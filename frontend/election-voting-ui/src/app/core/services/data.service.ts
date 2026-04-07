import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LogVoterAttendance,
  VoterAttendanceRecord,
  LogVoteCount,
  VoteCountRecord,
  PollingStation,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly dataUrl = `${environment.apiUrl}/data`;

  constructor(private http: HttpClient) {}

  logAttendance(dto: LogVoterAttendance): Observable<VoterAttendanceRecord> {
    return this.http.post<VoterAttendanceRecord>(
      `${this.dataUrl}/attendance`,
      dto,
    );
  }

  getMyAttendance(): Observable<VoterAttendanceRecord[]> {
    return this.http.get<VoterAttendanceRecord[]>(
      `${this.dataUrl}/attendance/employee`,
    );
  }

  logVoteCount(dto: LogVoteCount): Observable<VoteCountRecord> {
    return this.http.post<VoteCountRecord>(`${this.dataUrl}/votes`, dto);
  }

  getMyVotes(): Observable<VoteCountRecord[]> {
    return this.http.get<VoteCountRecord[]>(`${this.dataUrl}/votes/employee`);
  }

  getPollingStations(orgId: number): Observable<PollingStation[]> {
    return this.http.get<PollingStation[]>(
      `${environment.apiUrl}/organizations/${orgId}/polling-stations`,
    );
  }
}
