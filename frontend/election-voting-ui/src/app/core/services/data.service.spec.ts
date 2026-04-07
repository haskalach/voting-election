import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { DataService } from './data.service';
import { environment } from '../../../../environments/environment';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService],
    });

    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('logAttendance', () => {
    it('should log voter attendance', () => {
      const logRequest = {
        stationId: 1,
        voterCount: 150,
        notes: 'Morning session',
      };
      const mockResponse = {
        attendanceId: 1,
        employeeId: 1,
        voterCount: 150,
        recordedAt: new Date().toISOString(),
        notes: 'Morning session',
      };

      service.logAttendance(logRequest).subscribe((response) => {
        expect(response.voterCount).toBe(150);
        expect(response.notes).toBe('Morning session');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/data/attendance`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.voterCount).toBe(150);
      req.flush(mockResponse);
    });

    it('should validate voter count before submission', () => {
      const invalidLogRequest = {
        stationId: 1,
        voterCount: -10,
        notes: 'Invalid',
      };

      service.logAttendance(invalidLogRequest).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
        },
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/data/attendance`);
      req.flush(
        { error: 'Voter count must be positive' },
        { status: 400, statusText: 'Bad Request' },
      );
    });
  });

  describe('getMyAttendance', () => {
    it('should retrieve attendance records for current user', () => {
      const mockAttendance = [
        {
          attendanceId: 1,
          voterCount: 150,
          recordedAt: new Date().toISOString(),
          stationName: 'Station 1',
        },
        {
          attendanceId: 2,
          voterCount: 200,
          recordedAt: new Date().toISOString(),
          stationName: 'Station 1',
        },
      ];

      service.getMyAttendance().subscribe((records) => {
        expect(records.length).toBe(2);
        expect(records[0].voterCount).toBe(150);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/data/attendance/me`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAttendance);
    });

    it('should handle empty attendance records', () => {
      service.getMyAttendance().subscribe((records) => {
        expect(records.length).toBe(0);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/data/attendance/me`,
      );
      req.flush([]);
    });
  });

  describe('logVoteCount', () => {
    it('should log vote count for candidate', () => {
      const voteRequest = {
        stationId: 1,
        candidateName: 'Candidate A',
        votes: 250,
      };
      const mockResponse = {
        voteCountId: 1,
        candidateName: 'Candidate A',
        votes: 250,
        recordedAt: new Date().toISOString(),
      };

      service.logVoteCount(voteRequest).subscribe((response) => {
        expect(response.candidateName).toBe('Candidate A');
        expect(response.votes).toBe(250);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/data/votes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.candidateName).toBe('Candidate A');
      req.flush(mockResponse);
    });

    it('should prevent duplicate candidate votes on same day', () => {
      const voteRequest = {
        stationId: 1,
        candidateName: 'Candidate A',
        votes: 100,
      };

      service.logVoteCount(voteRequest).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(409);
        },
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/data/votes`);
      req.flush(
        { error: 'Vote already logged for this candidate today' },
        { status: 409, statusText: 'Conflict' },
      );
    });
  });

  describe('getMyVotes', () => {
    it('should retrieve vote records for current user', () => {
      const mockVotes = [
        {
          voteCountId: 1,
          candidateName: 'Candidate A',
          votes: 250,
          recordedAt: new Date().toISOString(),
          stationName: 'Station 1',
        },
        {
          voteCountId: 2,
          candidateName: 'Candidate B',
          votes: 180,
          recordedAt: new Date().toISOString(),
          stationName: 'Station 1',
        },
      ];

      service.getMyVotes().subscribe((records) => {
        expect(records.length).toBe(2);
        expect(records[0].candidateName).toBe('Candidate A');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/data/votes/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockVotes);
    });
  });

  describe('getPollingStations', () => {
    it('should retrieve list of polling stations', () => {
      const mockStations = [
        {
          pollingStationId: 1,
          stationName: 'Central Station',
          location: 'Downtown',
          capacity: 500,
        },
        {
          pollingStationId: 2,
          stationName: 'North Station',
          location: 'North District',
          capacity: 300,
        },
      ];

      service.getPollingStations().subscribe((stations) => {
        expect(stations.length).toBe(2);
        expect(stations[0].stationName).toBe('Central Station');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/data/stations`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStations);
    });

    it('should handle filtering by organization', () => {
      const orgId = 1;
      const mockStations = [
        {
          pollingStationId: 1,
          stationName: 'Station 1',
          location: 'Location 1',
          capacity: 500,
        },
      ];

      service.getPollingStations(orgId).subscribe((stations) => {
        expect(stations.length).toBe(1);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/data/stations?organizationId=${orgId}`,
      );
      req.flush(mockStations);
    });
  });
});
