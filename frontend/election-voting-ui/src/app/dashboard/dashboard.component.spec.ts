import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../core/services/dashboard.service';
import { AuthService } from '../core/services/auth.service';
import { signal } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const dashboardServiceMock = jasmine.createSpyObj('DashboardService', [
      'getSystemDashboard',
      'getOrganizationDashboard',
    ]);
    const authServiceMock = jasmine.createSpyObj('AuthService', [], {
      isSystemOwner: signal(false),
      isManager: signal(false),
      user: signal({
        id: 1,
        email: 'user@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'Employee',
      }),
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    dashboardServiceSpy = TestBed.inject(
      DashboardService,
    ) as jasmine.SpyObj<DashboardService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create dashboard component', () => {
      expect(component).toBeTruthy();
    });

    it('should load system dashboard for system owner', () => {
      authServiceSpy.isSystemOwner = signal(true);
      const mockDashboard = {
        totalEmployees: 150,
        activeEmployees: 120,
        totalVotersLogged: 45000,
        totalVotesCounted: 43200,
        totalPollingStations: 25,
        stationSummaries: [],
        candidateTallies: [],
      };

      dashboardServiceSpy.getSystemDashboard.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockDashboard);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(dashboardServiceSpy.getSystemDashboard).toHaveBeenCalled();
    });

    it('should load organization dashboard for manager', () => {
      authServiceSpy.isManager = signal(true);
      authServiceSpy.user = signal({
        id: 1,
        email: 'user@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'Manager',
        organizationId: 1,
      } as any);
      const mockDashboard = {
        totalEmployees: 50,
        activeEmployees: 45,
        totalVotersLogged: 12000,
        totalVotesCounted: 11800,
        totalPollingStations: 8,
        stationSummaries: [],
        candidateTallies: [],
      };

      dashboardServiceSpy.getOrganizationDashboard.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockDashboard);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(dashboardServiceSpy.getOrganizationDashboard).toHaveBeenCalled();
    });
  });

  describe('dashboard display', () => {
    it('should display employee statistics', () => {
      component.dashboard = signal({
        totalEmployees: 150,
        activeEmployees: 120,
        totalVotersLogged: 45000,
        totalVotesCounted: 43200,
        totalPollingStations: 25,
        stationSummaries: [],
        candidateTallies: [],
      });

      fixture.detectChanges();

      expect(component.dashboard().totalEmployees).toBe(150);
      expect(component.dashboard().activeEmployees).toBe(120);
    });

    it('should display voter and vote statistics', () => {
      component.dashboard = signal({
        totalEmployees: 50,
        activeEmployees: 45,
        totalVotersLogged: 45000,
        totalVotesCounted: 43200,
        totalPollingStations: 8,
        stationSummaries: [],
        candidateTallies: [],
      });

      fixture.detectChanges();

      expect(component.dashboard().totalVotersLogged).toBe(45000);
      expect(component.dashboard().totalVotesCounted).toBe(43200);
    });

    it('should display polling station count', () => {
      component.dashboard = signal({
        totalEmployees: 50,
        activeEmployees: 45,
        totalVotersLogged: 12000,
        totalVotesCounted: 11800,
        totalPollingStations: 25,
        stationSummaries: [],
        candidateTallies: [],
      });

      fixture.detectChanges();

      expect(component.dashboard().totalPollingStations).toBe(25);
    });

    it('should display candidate vote tallies', () => {
      component.dashboard = signal({
        totalEmployees: 50,
        activeEmployees: 45,
        totalVotersLogged: 12000,
        totalVotesCounted: 10000,
        totalPollingStations: 8,
        stationSummaries: [],
        candidateTallies: [
          { candidateName: 'Candidate A', totalVotes: 5000, percentage: 50.0 },
          { candidateName: 'Candidate B', totalVotes: 3000, percentage: 30.0 },
          { candidateName: 'Candidate C', totalVotes: 2000, percentage: 20.0 },
        ],
      });

      fixture.detectChanges();

      expect(component.dashboard().candidateTallies.length).toBe(3);
      expect(component.dashboard().candidateTallies[0].percentage).toBe(50.0);
    });
  });

  describe('error handling', () => {
    it('should display error message on load failure', () => {
      dashboardServiceSpy.getSystemDashboard.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: 'Failed to load dashboard' });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(component.errorMessage).toBeTruthy();
    });

    it('should show loading state while fetching data', () => {
      component.isLoading = true;

      fixture.detectChanges();

      expect(component.isLoading).toBe(true);
    });
  });
});
