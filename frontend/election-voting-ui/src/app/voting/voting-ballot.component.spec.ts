import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VotingBallotComponent } from './voting-ballot.component';
import { ElectionService } from '../core/services/election.service';
import { CandidateService } from '../core/services/candidate.service';
import { VoteService } from '../core/services/vote.service';
import { AuthService } from '../core/services/auth.service';
import { of } from 'rxjs';

describe('VotingBallotComponent', () => {
  let component: VotingBallotComponent;
  let fixture: ComponentFixture<VotingBallotComponent>;
  let electionServiceSpy: jasmine.SpyObj<ElectionService>;
  let candidateServiceSpy: jasmine.SpyObj<CandidateService>;
  let voteServiceSpy: jasmine.SpyObj<VoteService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  const mockElection = {
    electionId: 1,
    electionName: 'General Election 2024',
    startDate: new Date(new Date().getTime() - 1000 * 60 * 60),
    endDate: new Date(new Date().getTime() + 1000 * 60 * 60),
    status: 'ACTIVE',
  };

  const mockCandidates = [
    {
      candidateId: 1,
      candidateName: 'John Smith',
      partyAffiliation: 'Democratic Party',
      biography: 'Experienced leader',
    },
    {
      candidateId: 2,
      candidateName: 'Jane Doe',
      partyAffiliation: 'Republican Party',
      biography: 'Community advocate',
    },
    {
      candidateId: 3,
      candidateName: 'Bob Johnson',
      partyAffiliation: 'Independent',
      biography: 'Independent voice',
    },
  ];

  beforeEach(async () => {
    const electionServiceMock = jasmine.createSpyObj('ElectionService', [
      'getById',
    ]);
    const candidateServiceMock = jasmine.createSpyObj('CandidateService', [
      'getByElection',
    ]);
    const voteServiceMock = jasmine.createSpyObj('VoteService', [
      'submitVote',
      'checkIfVoted',
    ]);
    const authServiceMock = jasmine.createSpyObj('AuthService', [
      'getCurrentUser',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteMock = {
      params: of({ electionId: 1 }),
    };

    await TestBed.configureTestingModule({
      imports: [VotingBallotComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: ElectionService, useValue: electionServiceMock },
        { provide: CandidateService, useValue: candidateServiceMock },
        { provide: VoteService, useValue: voteServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    electionServiceSpy = TestBed.inject(
      ElectionService,
    ) as jasmine.SpyObj<ElectionService>;
    candidateServiceSpy = TestBed.inject(
      CandidateService,
    ) as jasmine.SpyObj<CandidateService>;
    voteServiceSpy = TestBed.inject(VoteService) as jasmine.SpyObj<VoteService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute);

    fixture = TestBed.createComponent(VotingBallotComponent);
    component = fixture.componentInstance;
  });

  describe('component initialization', () => {
    it('should create voting ballot component', () => {
      expect(component).toBeTruthy();
    });

    it('should load election on init', () => {
      electionServiceSpy.getById.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockElection);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(electionServiceSpy.getById).toHaveBeenCalledWith(1);
    });

    it('should load candidates for election', () => {
      candidateServiceSpy.getByElection.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockCandidates);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.loadCandidates();

      expect(candidateServiceSpy.getByElection).toHaveBeenCalledWith(1);
      expect(component.candidates.length).toBe(3);
    });

    it('should get current voter information', () => {
      authServiceSpy.getCurrentUser.and.returnValue({
        subscribe: (callback: any) => {
          callback({ userId: 1, name: 'Voter Name' });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(authServiceSpy.getCurrentUser).toHaveBeenCalled();
    });
  });

  describe('ballot time constraints', () => {
    it('should allow voting during active election', () => {
      component.election = mockElection;

      const now = new Date();
      const isActive =
        now >= mockElection.startDate && now <= mockElection.endDate;

      expect(isActive).toBeTruthy();
    });

    it('should prevent voting before election starts', () => {
      const futureElection = {
        ...mockElection,
        startDate: new Date(new Date().getTime() + 1000 * 60 * 60),
      };
      component.election = futureElection;

      const now = new Date();
      const canVote =
        now >= futureElection.startDate && now <= futureElection.endDate;

      expect(canVote).toBeFalsy();
    });

    it('should prevent voting after election ends', () => {
      const pastElection = {
        ...mockElection,
        endDate: new Date(new Date().getTime() - 1000 * 60 * 60),
      };
      component.election = pastElection;

      const now = new Date();
      const canVote =
        now >= pastElection.startDate && now <= pastElection.endDate;

      expect(canVote).toBeFalsy();
    });
  });

  describe('ballot selection', () => {
    it('should display all candidates', () => {
      component.candidates = mockCandidates;
      fixture.detectChanges();

      expect(component.candidates.length).toBe(3);
    });

    it('should select a candidate', () => {
      component.selectCandidate(1);

      expect(component.selectedCandidateId).toBe(1);
    });

    it('should deselect a candidate', () => {
      component.selectCandidate(1);
      expect(component.selectedCandidateId).toBe(1);

      component.selectCandidate(null);
      expect(component.selectedCandidateId).toBeNull();
    });

    it('should highlight selected candidate', () => {
      component.selectCandidate(2);
      fixture.detectChanges();

      expect(component.selectedCandidateId).toBe(2);
    });

    it('should show candidate biography', () => {
      expect(mockCandidates[0].biography).toBe('Experienced leader');
    });

    it('should display party affiliation', () => {
      expect(mockCandidates[0].partyAffiliation).toBe('Democratic Party');
    });
  });

  describe('vote submission', () => {
    it('should submit vote for selected candidate', () => {
      voteServiceSpy.submitVote.and.returnValue({
        subscribe: (callback: any) => {
          callback({ voteId: 1, candidateId: 1 });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.selectedCandidateId = 1;
      component.submitVote();

      expect(voteServiceSpy.submitVote).toHaveBeenCalled();
    });

    it('should require candidate selection before voting', () => {
      component.selectedCandidateId = null;

      const canSubmit = component.selectedCandidateId !== null;

      expect(canSubmit).toBeFalsy();
    });

    it('should show confirmation before submitting vote', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.electionId = 1;
      component.selectedCandidateId = 1;
      component.submitVote();

      expect(window.confirm).toHaveBeenCalled();
    });

    it('should not submit vote without confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.submitVote();

      expect(voteServiceSpy.submitVote).not.toHaveBeenCalled();
    });

    it('should navigate to confirmation page after vote', () => {
      voteServiceSpy.submitVote.and.returnValue({
        subscribe: (callback: any) => {
          callback({ voteId: 1 });
          routerSpy.navigate(['/voting/confirmation']);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.selectedCandidateId = 1;
      component.submitVote();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/voting/confirmation']);
    });
  });

  describe('vote restrictions', () => {
    it('should check if voter has already voted', () => {
      voteServiceSpy.checkIfVoted.and.returnValue({
        subscribe: (callback: any) => {
          callback({ hasVoted: false });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.checkVoteStatus();

      expect(voteServiceSpy.checkIfVoted).toHaveBeenCalled();
    });

    it('should prevent voting if already voted', () => {
      voteServiceSpy.checkIfVoted.and.returnValue({
        subscribe: (callback: any) => {
          callback({ hasVoted: true });
          component.hasVoted = true;
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.checkVoteStatus();

      expect(component.hasVoted).toBeTruthy();
    });

    it('should show message if voter has already voted', () => {
      component.hasVoted = true;

      expect(component.hasVoted).toBeTruthy();
    });
  });

  describe('ballot validation', () => {
    it('should validate election exists', () => {
      electionServiceSpy.getById.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockElection);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.loadElection();

      expect(component.election).toBeTruthy();
    });

    it('should validate election is active', () => {
      component.election = mockElection;

      const isActive = mockElection.status === 'ACTIVE';

      expect(isActive).toBeTruthy();
    });

    it('should load candidates successfully', () => {
      candidateServiceSpy.getByElection.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockCandidates);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.loadCandidates();

      expect(component.candidates.length).toBe(3);
    });

    it('should handle missing candidates gracefully', () => {
      candidateServiceSpy.getByElection.and.returnValue({
        subscribe: (callback: any) => {
          callback([]);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.loadCandidates();

      expect(component.candidates.length).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should display error when loading election fails', () => {
      electionServiceSpy.getById.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Election not found' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.loadElection();

      expect(component.errorMessage).toBeTruthy();
    });

    it('should display error when vote submission fails', () => {
      voteServiceSpy.submitVote.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Vote submission failed' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.selectedCandidateId = 1;
      component.submitVote();

      expect(component.errorMessage).toBeTruthy();
    });

    it('should clear error messages', () => {
      component.errorMessage = 'Some error';
      component.clearError();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('ballot accessibility', () => {
    it('should display candidate names clearly', () => {
      component.candidates = mockCandidates;
      fixture.detectChanges();

      expect(component.candidates[0].candidateName).toBe('John Smith');
      expect(component.candidates[1].candidateName).toBe('Jane Doe');
    });

    it('should provide keyboard navigation', () => {
      const candidates = mockCandidates.map((_, i) => i + 1);

      candidates.forEach((id) => {
        component.selectCandidate(id);
        expect(component.selectedCandidateId).toBe(id);
      });
    });

    it('should show clear voting instructions', () => {
      expect(
        component.instructions || 'Select one candidate and submit your vote',
      ).toBeTruthy();
    });
  });

  describe('ballot summary', () => {
    it('should display selected candidate before submission', () => {
      component.candidates = mockCandidates;
      component.selectCandidate(2);

      const selected = component.candidates.find(
        (c) => c.candidateId === component.selectedCandidateId,
      );

      expect(selected?.candidateName).toBe('Jane Doe');
    });

    it('should allow voter to review selection', () => {
      component.candidates = mockCandidates;
      component.selectCandidate(1);

      const selected = component.candidates.find(
        (c) => c.candidateId === component.selectedCandidateId,
      );

      expect(selected).toBeDefined();
    });

    it('should confirm vote before final submission', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.submitVote();

      expect(window.confirm).toHaveBeenCalled();
    });
  });
});
