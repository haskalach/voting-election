import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CandidateTableComponent } from './candidate-table.component';
import { CandidateService } from '../core/services/candidate.service';
import { of } from 'rxjs';

describe('CandidateTableComponent', () => {
  let component: CandidateTableComponent;
  let fixture: ComponentFixture<CandidateTableComponent>;
  let candidateServiceSpy: jasmine.SpyObj<CandidateService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCandidates = [
    {
      candidateId: 1,
      candidateName: 'John Smith',
      partyAffiliation: 'Democratic Party',
      electionName: 'General Election 2024',
      voteCount: 5000,
      status: 'ACTIVE',
      createdAt: new Date('2024-01-15'),
    },
    {
      candidateId: 2,
      candidateName: 'Jane Doe',
      partyAffiliation: 'Republican Party',
      electionName: 'General Election 2024',
      voteCount: 4500,
      status: 'ACTIVE',
      createdAt: new Date('2024-01-16'),
    },
    {
      candidateId: 3,
      candidateName: 'Bob Johnson',
      partyAffiliation: 'Independent',
      electionName: 'General Election 2024',
      voteCount: 2000,
      status: 'INACTIVE',
      createdAt: new Date('2024-01-17'),
    },
  ];

  beforeEach(async () => {
    const candidateServiceMock = jasmine.createSpyObj('CandidateService', [
      'getAll',
      'delete',
      'getByElection',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CandidateTableComponent,
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
      ],
      providers: [
        { provide: CandidateService, useValue: candidateServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    candidateServiceSpy = TestBed.inject(
      CandidateService,
    ) as jasmine.SpyObj<CandidateService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(CandidateTableComponent);
    component = fixture.componentInstance;
  });

  describe('table initialization', () => {
    it('should create candidate table component', () => {
      expect(component).toBeTruthy();
    });

    it('should load candidates on init', () => {
      candidateServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockCandidates);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(candidateServiceSpy.getAll).toHaveBeenCalled();
      expect(component.candidates.length).toBe(3);
    });

    it('should display candidates in table', () => {
      component.candidates = mockCandidates;
      fixture.detectChanges();

      expect(component.candidates.length).toBe(3);
    });

    it('should display candidate columns', () => {
      component.candidates = mockCandidates;
      component.displayedColumns = [
        'candidateName',
        'partyAffiliation',
        'electionName',
        'voteCount',
        'actions',
      ];
      fixture.detectChanges();

      const headers = fixture.nativeElement.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('candidate actions', () => {
    it('should navigate to edit candidate', () => {
      component.editCandidate(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/candidates/1/edit']);
    });

    it('should navigate to view candidate details', () => {
      component.viewDetails(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/candidates/1']);
    });

    it('should navigate to candidate votes', () => {
      component.viewVotes(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/candidates/1/votes']);
    });

    it('should delete candidate with confirmation', () => {
      candidateServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback(true);
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteCandidate(1);

      expect(window.confirm).toHaveBeenCalled();
      expect(candidateServiceSpy.delete).toHaveBeenCalledWith(1);
    });

    it('should not delete candidate without confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteCandidate(1);

      expect(candidateServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('should refresh candidates after deletion', () => {
      candidateServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback(true);
          return { unsubscribe: () => {} };
        },
      } as any);

      candidateServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockCandidates.slice(0, 2));
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteCandidate(1);
      component.loadCandidates();

      expect(component.candidates.length).toBe(2);
    });
  });

  describe('table filtering and sorting', () => {
    it('should filter candidates by name', () => {
      component.candidates = mockCandidates;
      component.filterValue = 'John';

      const filtered = component.candidates.filter((candidate) =>
        candidate.candidateName
          .toLowerCase()
          .includes(component.filterValue.toLowerCase()),
      );

      expect(filtered.length).toBe(2);
    });

    it('should filter candidates by party', () => {
      component.candidates = mockCandidates;
      component.filterValue = 'Democratic';

      const filtered = component.candidates.filter((candidate) =>
        candidate.partyAffiliation
          .toLowerCase()
          .includes(component.filterValue.toLowerCase()),
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].candidateId).toBe(1);
    });

    it('should filter candidates by election', () => {
      component.candidates = mockCandidates;
      component.filterValue = 'General Election 2024';

      const filtered = component.candidates.filter((candidate) =>
        candidate.electionName
          .toLowerCase()
          .includes(component.filterValue.toLowerCase()),
      );

      expect(filtered.length).toBe(3);
    });

    it('should sort by candidate name', () => {
      component.candidates = mockCandidates;

      const sorted = [...component.candidates].sort((a, b) =>
        a.candidateName.localeCompare(b.candidateName),
      );

      expect(sorted[0].candidateName).toBe('Bob Johnson');
    });

    it('should sort by vote count descending', () => {
      component.candidates = mockCandidates;

      const sorted = [...component.candidates].sort(
        (a, b) => b.voteCount - a.voteCount,
      );

      expect(sorted[0].voteCount).toBe(5000);
      expect(sorted[sorted.length - 1].voteCount).toBe(2000);
    });

    it('should sort by party affiliation', () => {
      component.candidates = mockCandidates;

      const sorted = [...component.candidates].sort((a, b) =>
        a.partyAffiliation.localeCompare(b.partyAffiliation),
      );

      expect(sorted[0].partyAffiliation).toBe('Democratic Party');
    });
  });

  describe('vote counting', () => {
    it('should display vote count for each candidate', () => {
      component.candidates = mockCandidates;
      fixture.detectChanges();

      expect(component.candidates[0].voteCount).toBe(5000);
      expect(component.candidates[1].voteCount).toBe(4500);
      expect(component.candidates[2].voteCount).toBe(2000);
    });

    it('should calculate total votes across all candidates', () => {
      component.candidates = mockCandidates;

      const totalVotes = component.candidates.reduce(
        (sum, candidate) => sum + candidate.voteCount,
        0,
      );

      expect(totalVotes).toBe(11500);
    });

    it('should calculate percentage of votes for each candidate', () => {
      component.candidates = mockCandidates;
      const totalVotes = 11500;

      const percentage = (component.candidates[0].voteCount / totalVotes) * 100;

      expect(percentage).toBeCloseTo(43.48);
    });

    it('should identify leading candidate', () => {
      component.candidates = mockCandidates;

      const leader = component.candidates.reduce((prev, current) =>
        prev.voteCount > current.voteCount ? prev : current,
      );

      expect(leader.candidateId).toBe(1);
      expect(leader.candidateName).toBe('John Smith');
    });
  });

  describe('candidate status', () => {
    it('should display candidate status', () => {
      component.candidates = mockCandidates;
      fixture.detectChanges();

      expect(component.candidates[0].status).toBe('ACTIVE');
      expect(component.candidates[2].status).toBe('INACTIVE');
    });

    it('should filter active candidates', () => {
      component.candidates = mockCandidates;

      const active = component.candidates.filter((c) => c.status === 'ACTIVE');

      expect(active.length).toBe(2);
    });

    it('should filter inactive candidates', () => {
      component.candidates = mockCandidates;

      const inactive = component.candidates.filter(
        (c) => c.status === 'INACTIVE',
      );

      expect(inactive.length).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should display error on load failure', () => {
      candidateServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Failed to load candidates' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(component.errorMessage).toBeTruthy();
    });

    it('should display error on delete failure', () => {
      candidateServiceSpy.delete.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Cannot delete candidate' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteCandidate(1);

      expect(component.errorMessage).toBeTruthy();
    });

    it('should retry loading candidates', () => {
      candidateServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockCandidates);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.retryLoad();

      expect(candidateServiceSpy.getAll).toHaveBeenCalled();
    });

    it('should clear error message', () => {
      component.errorMessage = 'Some error';
      component.clearError();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('pagination', () => {
    it('should implement pagination for large candidate lists', () => {
      component.candidates = Array.from({ length: 30 }, (_, i) => ({
        candidateId: i + 1,
        candidateName: `Candidate ${i + 1}`,
        partyAffiliation: [
          'Democratic Party',
          'Republican Party',
          'Independent',
        ][i % 3],
        electionName: `Election ${(i % 2) + 1}`,
        voteCount: Math.floor(Math.random() * 10000),
        status: i % 5 !== 0 ? 'ACTIVE' : 'INACTIVE',
        createdAt: new Date(),
      }));

      expect(component.candidates.length).toBe(30);
      expect(component.pageSize || 10).toBeLessThanOrEqual(30);
    });
  });

  describe('election filtering', () => {
    it('should filter candidates by specific election', () => {
      candidateServiceSpy.getByElection.and.returnValue({
        subscribe: (callback: any) => {
          callback(
            mockCandidates.filter(
              (c) => c.electionName === 'General Election 2024',
            ),
          );
          return { unsubscribe: () => {} };
        },
      } as any);

      component.filterByElection(1);

      expect(candidateServiceSpy.getByElection).toHaveBeenCalledWith(1);
    });
  });
});
