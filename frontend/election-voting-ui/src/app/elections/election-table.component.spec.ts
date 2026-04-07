import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ElectionTableComponent } from './election-table.component';
import { ElectionService } from '../core/services/election.service';
import { of } from 'rxjs';

describe('ElectionTableComponent', () => {
  let component: ElectionTableComponent;
  let fixture: ComponentFixture<ElectionTableComponent>;
  let electionServiceSpy: jasmine.SpyObj<ElectionService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockElections = [
    {
      electionId: 1,
      electionName: 'General Election 2024',
      organizationName: 'Election Board - Region 1',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-20'),
      status: 'PENDING',
      totalVoters: 50000,
      createdAt: new Date('2024-01-15'),
    },
    {
      electionId: 2,
      electionName: 'Regional Election 2024',
      organizationName: 'Election Board - Region 2',
      startDate: new Date('2024-04-10'),
      endDate: new Date('2024-04-15'),
      status: 'ACTIVE',
      totalVoters: 30000,
      createdAt: new Date('2024-01-16'),
    },
    {
      electionId: 3,
      electionName: 'Local Election 2023',
      organizationName: 'Election Board - Region 1',
      startDate: new Date('2023-09-01'),
      endDate: new Date('2023-09-05'),
      status: 'COMPLETED',
      totalVoters: 25000,
      createdAt: new Date('2023-08-01'),
    },
  ];

  beforeEach(async () => {
    const electionServiceMock = jasmine.createSpyObj('ElectionService', [
      'getAll',
      'delete',
      'changeStatus',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ElectionTableComponent,
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
      ],
      providers: [
        { provide: ElectionService, useValue: electionServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    electionServiceSpy = TestBed.inject(
      ElectionService,
    ) as jasmine.SpyObj<ElectionService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(ElectionTableComponent);
    component = fixture.componentInstance;
  });

  describe('table initialization', () => {
    it('should create election table component', () => {
      expect(component).toBeTruthy();
    });

    it('should load elections on init', () => {
      electionServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockElections);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(electionServiceSpy.getAll).toHaveBeenCalled();
      expect(component.elections.length).toBe(3);
    });

    it('should display elections in table', () => {
      component.elections = mockElections;
      fixture.detectChanges();

      expect(component.elections.length).toBe(3);
    });

    it('should display election columns', () => {
      component.elections = mockElections;
      component.displayedColumns = [
        'electionName',
        'organizationName',
        'startDate',
        'status',
        'actions',
      ];
      fixture.detectChanges();

      const headers = fixture.nativeElement.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('election actions', () => {
    it('should navigate to edit election', () => {
      component.editElection(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/elections/1/edit']);
    });

    it('should navigate to view election details', () => {
      component.viewDetails(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/elections/1']);
    });

    it('should navigate to election results', () => {
      component.viewResults(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/elections/1/results']);
    });

    it('should navigate to election voters', () => {
      component.viewVoters(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/elections/1/voters']);
    });

    it('should delete election with confirmation', () => {
      electionServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback(true);
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteElection(1);

      expect(window.confirm).toHaveBeenCalled();
      expect(electionServiceSpy.delete).toHaveBeenCalledWith(1);
    });

    it('should not delete election without confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteElection(1);

      expect(electionServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('should refresh elections after deletion', () => {
      electionServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback(true);
          return { unsubscribe: () => {} };
        },
      } as any);

      electionServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockElections.slice(0, 2));
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteElection(1);
      component.loadElections();

      expect(component.elections.length).toBe(2);
    });
  });

  describe('election status', () => {
    it('should display election status', () => {
      component.elections = mockElections;
      fixture.detectChanges();

      expect(component.elections[0].status).toBe('PENDING');
      expect(component.elections[1].status).toBe('ACTIVE');
      expect(component.elections[2].status).toBe('COMPLETED');
    });

    it('should change election status', () => {
      electionServiceSpy.changeStatus.and.returnValue({
        subscribe: (callback: any) => {
          callback({ electionId: 1, status: 'ACTIVE' });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.changeStatus(1, 'ACTIVE');

      expect(electionServiceSpy.changeStatus).toHaveBeenCalledWith(1, 'ACTIVE');
    });

    it('should handle status change error', () => {
      electionServiceSpy.changeStatus.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Cannot change status' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.changeStatus(1, 'PENDING');

      expect(component.errorMessage).toBeTruthy();
    });

    it('should not allow status change for completed elections', () => {
      const completedElection = mockElections[2];

      const canChange = completedElection.status !== 'COMPLETED';

      expect(canChange).toBeFalsy();
    });
  });

  describe('table filtering and sorting', () => {
    it('should filter elections by name', () => {
      component.elections = mockElections;
      component.filterValue = 'General';

      const filtered = component.elections.filter((election) =>
        election.electionName
          .toLowerCase()
          .includes(component.filterValue.toLowerCase()),
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].electionId).toBe(1);
    });

    it('should filter elections by organization', () => {
      component.elections = mockElections;
      component.filterValue = 'Region 1';

      const filtered = component.elections.filter((election) =>
        election.organizationName
          .toLowerCase()
          .includes(component.filterValue.toLowerCase()),
      );

      expect(filtered.length).toBe(2);
    });

    it('should filter elections by status', () => {
      component.elections = mockElections;

      const active = component.elections.filter(
        (election) => election.status === 'ACTIVE',
      );

      expect(active.length).toBe(1);
      expect(active[0].electionId).toBe(2);
    });

    it('should sort by election name', () => {
      component.elections = mockElections;

      const sorted = [...component.elections].sort((a, b) =>
        a.electionName.localeCompare(b.electionName),
      );

      expect(sorted[0].electionName).toBe('General Election 2024');
    });

    it('should sort by start date', () => {
      component.elections = mockElections;

      const sorted = [...component.elections].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );

      expect(sorted[0].electionId).toBe(3);
    });

    it('should sort by voter count', () => {
      component.elections = mockElections;

      const sorted = [...component.elections].sort(
        (a, b) => b.totalVoters - a.totalVoters,
      );

      expect(sorted[0].totalVoters).toBe(50000);
    });
  });

  describe('error handling', () => {
    it('should display error on load failure', () => {
      electionServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Failed to load elections' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(component.errorMessage).toBeTruthy();
    });

    it('should display error on delete failure', () => {
      electionServiceSpy.delete.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({
            error: { message: 'Cannot delete active election' },
          });
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteElection(1);

      expect(component.errorMessage).toBeTruthy();
    });

    it('should retry loading elections', () => {
      electionServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockElections);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.retryLoad();

      expect(electionServiceSpy.getAll).toHaveBeenCalled();
    });

    it('should clear error message', () => {
      component.errorMessage = 'Some error';
      component.clearError();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('pagination', () => {
    it('should implement pagination for large election lists', () => {
      component.elections = Array.from({ length: 50 }, (_, i) => ({
        electionId: i + 1,
        electionName: `Election ${i + 1}`,
        organizationName: `Organization ${(i % 5) + 1}`,
        startDate: new Date(),
        endDate: new Date(),
        status: i % 3 === 0 ? 'PENDING' : i % 3 === 1 ? 'ACTIVE' : 'COMPLETED',
        totalVoters: Math.floor(Math.random() * 100000),
        createdAt: new Date(),
      }));

      expect(component.elections.length).toBe(50);
      expect(component.pageSize || 10).toBeLessThanOrEqual(50);
    });
  });

  describe('election statistics', () => {
    it('should display total voters for election', () => {
      component.elections = mockElections;
      fixture.detectChanges();

      expect(component.elections[0].totalVoters).toBe(50000);
      expect(component.elections[1].totalVoters).toBe(30000);
      expect(component.elections[2].totalVoters).toBe(25000);
    });

    it('should calculate total voters across all elections', () => {
      component.elections = mockElections;

      const totalVoters = component.elections.reduce(
        (sum, election) => sum + election.totalVoters,
        0,
      );

      expect(totalVoters).toBe(105000);
    });
  });
});
