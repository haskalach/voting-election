import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { environment } from '../../../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getSystemDashboard', () => {
    it('should fetch system-wide dashboard metrics', () => {
      const mockDashboard = {
        totalEmployees: 150,
        activeEmployees: 120,
        totalVotersLogged: 45000,
        totalVotesCounted: 43200,
        totalPollingStations: 25,
        stationSummaries: [],
        candidateTallies: [
          { candidateName: 'Candidate A', totalVotes: 15000, percentage: 34.7 },
          {
            candidateName: 'Candidate B',
            totalVotes: 13200,
            percentage: 30.56,
          },
        ],
      };

      service.getSystemDashboard().subscribe((dashboard) => {
        expect(dashboard.totalEmployees).toBe(150);
        expect(dashboard.activeEmployees).toBe(120);
        expect(dashboard.totalVotersLogged).toBe(45000);
        expect(dashboard.candidateTallies.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/system`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboard);
    });

    it('should handle empty dashboard data', () => {
      const emptyDashboard = {
        totalEmployees: 0,
        activeEmployees: 0,
        totalVotersLogged: 0,
        totalVotesCounted: 0,
        totalPollingStations: 0,
        stationSummaries: [],
        candidateTallies: [],
      };

      service.getSystemDashboard().subscribe((dashboard) => {
        expect(dashboard.totalEmployees).toBe(0);
        expect(dashboard.candidateTallies.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/system`);
      req.flush(emptyDashboard);
    });
  });

  describe('getOrganizationDashboard', () => {
    it('should fetch organization-specific dashboard metrics', () => {
      const orgId = 1;
      const mockDashboard = {
        totalEmployees: 50,
        activeEmployees: 45,
        totalVotersLogged: 12000,
        totalVotesCounted: 11800,
        totalPollingStations: 8,
        stationSummaries: [
          {
            pollingStationId: 1,
            stationName: 'Station 1',
            totalVoters: 1500,
            totalVotes: 1450,
          },
        ],
        candidateTallies: [
          { candidateName: 'Candidate A', totalVotes: 5900, percentage: 50.0 },
          { candidateName: 'Candidate B', totalVotes: 5900, percentage: 50.0 },
        ],
      };

      service.getOrganizationDashboard(orgId).subscribe((dashboard) => {
        expect(dashboard.totalEmployees).toBe(50);
        expect(dashboard.totalPollingStations).toBe(8);
        expect(dashboard.stationSummaries.length).toBe(1);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/dashboard/organization/${orgId}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboard);
    });

    it('should handle dashboard error for invalid organization', () => {
      const invalidOrgId = 999;

      service.getOrganizationDashboard(invalidOrgId).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne(
        `${environment.apiUrl}/dashboard/organization/${invalidOrgId}`,
      );
      req.flush(
        { error: 'Organization not found' },
        { status: 404, statusText: 'Not Found' },
      );
    });
  });

  describe('dashboard data aggregation', () => {
    it('should calculate correct vote percentages', () => {
      const mockDashboard = {
        totalEmployees: 10,
        activeEmployees: 10,
        totalVotersLogged: 1000,
        totalVotesCounted: 1000,
        totalPollingStations: 5,
        stationSummaries: [],
        candidateTallies: [
          { candidateName: 'Candidate A', totalVotes: 500, percentage: 50.0 },
          { candidateName: 'Candidate B', totalVotes: 300, percentage: 30.0 },
          { candidateName: 'Candidate C', totalVotes: 200, percentage: 20.0 },
        ],
      };

      service.getSystemDashboard().subscribe((dashboard) => {
        const totalVotes = dashboard.candidateTallies.reduce(
          (sum, t) => sum + t.totalVotes,
          0,
        );
        expect(totalVotes).toBe(1000);
        dashboard.candidateTallies.forEach((tally) => {
          const calculated = (tally.totalVotes / totalVotes) * 100;
          expect(tally.percentage).toBeCloseTo(calculated, 1);
        });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/system`);
      req.flush(mockDashboard);
    });
  });
});
