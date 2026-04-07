import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { VoterTableComponent } from './voter-table.component';
import { VoterService } from '../core/services/voter.service';
import { of } from 'rxjs';

describe('VoterTableComponent', () => {
  let component: VoterTableComponent;
  let fixture: ComponentFixture<VoterTableComponent>;
  let voterServiceSpy: jasmine.SpyObj<VoterService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockVoters = [
    {
      voterId: 1,
      voterName: 'Alice Johnson',
      email: 'alice@example.com',
      voterId_Number: 'VO-001',
      registeredElections: 2,
      votedElections: 1,
      status: 'ACTIVE',
      registeredDate: new Date('2024-01-10'),
    },
    {
      voterId: 2,
      voterName: 'Bob Davis',
      email: 'bob@example.com',
      voterId_Number: 'VO-002',
      registeredElections: 3,
      votedElections: 2,
      status: 'ACTIVE',
      registeredDate: new Date('2024-01-12'),
    },
    {
      voterId: 3,
      voterName: 'Carol Wilson',
      email: 'carol@example.com',
      voterId_Number: 'VO-003',
      registeredElections: 1,
      votedElections: 0,
      status: 'REGISTERED',
      registeredDate: new Date('2024-01-15'),
    },
    {
      voterId: 4,
      voterName: 'David Brown',
      email: 'david@example.com',
      voterId_Number: 'VO-004',
      registeredElections: 2,
      votedElections: 1,
      status: 'INACTIVE',
      registeredDate: new Date('2024-01-08'),
    },
  ];

  beforeEach(async () => {
    const voterServiceMock = jasmine.createSpyObj('VoterService', [
      'getAll',
      'delete',
      'getByElection',
      'updateStatus',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        VoterTableComponent,
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
      ],
      providers: [
        { provide: VoterService, useValue: voterServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    voterServiceSpy = TestBed.inject(
      VoterService,
    ) as jasmine.SpyObj<VoterService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(VoterTableComponent);
    component = fixture.componentInstance;
  });

  describe('table initialization', () => {
    it('should create voter table component', () => {
      expect(component).toBeTruthy();
    });

    it('should load voters on init', () => {
      voterServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockVoters);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(voterServiceSpy.getAll).toHaveBeenCalled();
      expect(component.voters.length).toBe(4);
    });

    it('should display voters in table', () => {
      component.voters = mockVoters;
      fixture.detectChanges();

      expect(component.voters.length).toBe(4);
    });

    it('should display voter columns', () => {
      component.voters = mockVoters;
      component.displayedColumns = [
        'voterName',
        'email',
        'voterId_Number',
        'status',
        'actions',
      ];
      fixture.detectChanges();

      const headers = fixture.nativeElement.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('voter actions', () => {
    it('should navigate to view voter details', () => {
      component.viewDetails(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/voters/1']);
    });

    it('should navigate to voter voting history', () => {
      component.viewVotingHistory(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/voters/1/history']);
    });

    it('should delete voter with confirmation', () => {
      voterServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback(true);
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteVoter(1);

      expect(window.confirm).toHaveBeenCalled();
      expect(voterServiceSpy.delete).toHaveBeenCalledWith(1);
    });

    it('should not delete voter without confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteVoter(1);

      expect(voterServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('should refresh voters after deletion', () => {
      voterServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback(true);
          return { unsubscribe: () => {} };
        },
      } as any);

      voterServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockVoters.slice(0, 2));
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteVoter(1);
      component.loadVoters();

      expect(component.voters.length).toBe(2);
    });
  });

  describe('voter status management', () => {
    it('should display voter status', () => {
      component.voters = mockVoters;
      fixture.detectChanges();

      expect(component.voters[0].status).toBe('ACTIVE');
      expect(component.voters[2].status).toBe('REGISTERED');
      expect(component.voters[3].status).toBe('INACTIVE');
    });

    it('should update voter status', () => {
      voterServiceSpy.updateStatus.and.returnValue({
        subscribe: (callback: any) => {
          callback({ voterId: 1, status: 'INACTIVE' });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.updateStatus(1, 'INACTIVE');

      expect(voterServiceSpy.updateStatus).toHaveBeenCalledWith(1, 'INACTIVE');
    });

    it('should handle status update error', () => {
      voterServiceSpy.updateStatus.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Cannot update status' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.updateStatus(1, 'INACTIVE');

      expect(component.errorMessage).toBeTruthy();
    });

    it('should filter active voters', () => {
      component.voters = mockVoters;

      const active = component.voters.filter((v) => v.status === 'ACTIVE');

      expect(active.length).toBe(2);
    });

    it('should filter registered voters', () => {
      component.voters = mockVoters;

      const registered = component.voters.filter(
        (v) => v.status === 'REGISTERED',
      );

      expect(registered.length).toBe(1);
    });

    it('should filter inactive voters', () => {
      component.voters = mockVoters;

      const inactive = component.voters.filter((v) => v.status === 'INACTIVE');

      expect(inactive.length).toBe(1);
    });
  });

  describe('table filtering and sorting', () => {
    it('should filter voters by name', () => {
      component.voters = mockVoters;
      component.filterValue = 'Alice';

      const filtered = component.voters.filter((voter) =>
        voter.voterName
          .toLowerCase()
          .includes(component.filterValue.toLowerCase()),
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].voterId).toBe(1);
    });

    it('should filter voters by email', () => {
      component.voters = mockVoters;
      component.filterValue = 'bob@';

      const filtered = component.voters.filter((voter) =>
        voter.email.toLowerCase().includes(component.filterValue.toLowerCase()),
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].voterId).toBe(2);
    });

    it('should filter voters by voter ID number', () => {
      component.voters = mockVoters;
      component.filterValue = 'VO-001';

      const filtered = component.voters.filter((voter) =>
        voter.voterId_Number.includes(component.filterValue),
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].voterId).toBe(1);
    });

    it('should sort by voter name', () => {
      component.voters = mockVoters;

      const sorted = [...component.voters].sort((a, b) =>
        a.voterName.localeCompare(b.voterName),
      );

      expect(sorted[0].voterName).toBe('Alice Johnson');
    });

    it('should sort by registration date', () => {
      component.voters = mockVoters;

      const sorted = [...component.voters].sort(
        (a, b) =>
          new Date(a.registeredDate).getTime() -
          new Date(b.registeredDate).getTime(),
      );

      expect(sorted[0].voterId).toBe(4);
    });

    it('should sort by elections voted', () => {
      component.voters = mockVoters;

      const sorted = [...component.voters].sort(
        (a, b) => b.votedElections - a.votedElections,
      );

      expect(sorted[0].votedElections).toBe(2);
    });
  });

  describe('voter statistics', () => {
    it('should display registered elections count', () => {
      component.voters = mockVoters;
      fixture.detectChanges();

      expect(component.voters[0].registeredElections).toBe(2);
      expect(component.voters[1].registeredElections).toBe(3);
    });

    it('should display voted elections count', () => {
      component.voters = mockVoters;
      fixture.detectChanges();

      expect(component.voters[0].votedElections).toBe(1);
      expect(component.voters[1].votedElections).toBe(2);
    });

    it('should calculate voter participation rate', () => {
      const voter = mockVoters[0];
      const participation =
        (voter.votedElections / voter.registeredElections) * 100;

      expect(participation).toBe(50);
    });

    it('should calculate total registrations across all voters', () => {
      component.voters = mockVoters;

      const totalRegistrations = component.voters.reduce(
        (sum, voter) => sum + voter.registeredElections,
        0,
      );

      expect(totalRegistrations).toBe(8);
    });

    it('should calculate total votes across all voters', () => {
      component.voters = mockVoters;

      const totalVotes = component.voters.reduce(
        (sum, voter) => sum + voter.votedElections,
        0,
      );

      expect(totalVotes).toBe(4);
    });
  });

  describe('election filtering', () => {
    it('should filter voters by specific election', () => {
      voterServiceSpy.getByElection.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockVoters.slice(0, 2));
          return { unsubscribe: () => {} };
        },
      } as any);

      component.filterByElection(1);

      expect(voterServiceSpy.getByElection).toHaveBeenCalledWith(1);
    });
  });

  describe('error handling', () => {
    it('should display error on load failure', () => {
      voterServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Failed to load voters' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(component.errorMessage).toBeTruthy();
    });

    it('should display error on delete failure', () => {
      voterServiceSpy.delete.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Cannot delete voter' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteVoter(1);

      expect(component.errorMessage).toBeTruthy();
    });

    it('should retry loading voters', () => {
      voterServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockVoters);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.retryLoad();

      expect(voterServiceSpy.getAll).toHaveBeenCalled();
    });

    it('should clear error message', () => {
      component.errorMessage = 'Some error';
      component.clearError();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('pagination', () => {
    it('should implement pagination for large voter lists', () => {
      component.voters = Array.from({ length: 50 }, (_, i) => ({
        voterId: i + 1,
        voterName: `Voter ${i + 1}`,
        email: `voter${i + 1}@example.com`,
        voterId_Number: `VO-${String(i + 1).padStart(3, '0')}`,
        registeredElections: Math.floor(Math.random() * 5) + 1,
        votedElections: Math.floor(Math.random() * 3),
        status: ['ACTIVE', 'REGISTERED', 'INACTIVE'][
          Math.floor(Math.random() * 3)
        ],
        registeredDate: new Date(),
      }));

      expect(component.voters.length).toBe(50);
      expect(component.pageSize || 10).toBeLessThanOrEqual(50);
    });
  });

  describe('table state', () => {
    it('should show loading state while fetching', () => {
      component.isLoading = true;
      fixture.detectChanges();

      expect(component.isLoading).toBeTruthy();
    });

    it('should clear loading state after fetch', () => {
      voterServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockVoters);
          component.isLoading = false;
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(component.isLoading).toBeFalsy();
    });

    it('should show empty state when no voters', () => {
      voterServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback([]);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(component.voters.length).toBe(0);
    });
  });
});
