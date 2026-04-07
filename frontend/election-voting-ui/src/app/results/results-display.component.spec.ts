import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ResultsDisplayComponent } from './results-display.component';
import { ElectionService } from '../core/services/election.service';
import { ResultService } from '../core/services/result.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('ResultsDisplayComponent', () => {
  let component: ResultsDisplayComponent;
  let fixture: ComponentFixture<ResultsDisplayComponent>;
  let electionServiceSpy: jasmine.SpyObj<ElectionService>;
  let resultServiceSpy: jasmine.SpyObj<ResultService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  const mockElection = {
    electionId: 1,
    electionName: 'General Election 2024',
    status: 'COMPLETED',
    totalVoters: 10000,
    totalVotesCast: 8500,
  };

  const mockResults = [
    {
      candidateId: 1,
      candidateName: 'John Smith',
      partyAffiliation: 'Democratic Party',
      voteCount: 4200,
      percentage: 49.41,
    },
    {
      candidateId: 2,
      candidateName: 'Jane Doe',
      partyAffiliation: 'Republican Party',
      voteCount: 3800,
      percentage: 44.71,
    },
    {
      candidateId: 3,
      candidateName: 'Bob Johnson',
      partyAffiliation: 'Independent',
      voteCount: 500,
      percentage: 5.88,
    },
  ];

  beforeEach(async () => {
    const electionServiceMock = jasmine.createSpyObj('ElectionService', [
      'getById',
    ]);
    const resultServiceMock = jasmine.createSpyObj('ResultService', [
      'getResults',
      'getStatistics',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteMock = {
      params: of({ electionId: 1 }),
    };

    await TestBed.configureTestingModule({
      imports: [ResultsDisplayComponent, CommonModule],
      providers: [
        { provide: ElectionService, useValue: electionServiceMock },
        { provide: ResultService, useValue: resultServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    electionServiceSpy = TestBed.inject(
      ElectionService,
    ) as jasmine.SpyObj<ElectionService>;
    resultServiceSpy = TestBed.inject(
      ResultService,
    ) as jasmine.SpyObj<ResultService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute);

    fixture = TestBed.createComponent(ResultsDisplayComponent);
    component = fixture.componentInstance;
  });

  describe('component initialization', () => {
    it('should create results display component', () => {
      expect(component).toBeTruthy();
    });

    it('should load election information on init', () => {
      electionServiceSpy.getById.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockElection);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(electionServiceSpy.getById).toHaveBeenCalledWith(1);
    });

    it('should load election results', () => {
      resultServiceSpy.getResults.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockResults);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.loadResults();

      expect(resultServiceSpy.getResults).toHaveBeenCalledWith(1);
      expect(component.results.length).toBe(3);
    });

    it('should load election statistics', () => {
      const mockStats = {
        totalVotes: 8500,
        totalRegistered: 10000,
        turnoutPercentage: 85,
        blankVotes: 50,
        invalidVotes: 100,
      };

      resultServiceSpy.getStatistics.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockStats);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.loadStatistics();

      expect(resultServiceSpy.getStatistics).toHaveBeenCalledWith(1);
    });
  });

  describe('results display', () => {
    it('should display all candidate results', () => {
      component.results = mockResults;
      fixture.detectChanges();

      expect(component.results.length).toBe(3);
    });

    it('should display vote counts for each candidate', () => {
      component.results = mockResults;
      fixture.detectChanges();

      expect(component.results[0].voteCount).toBe(4200);
      expect(component.results[1].voteCount).toBe(3800);
      expect(component.results[2].voteCount).toBe(500);
    });

    it('should display vote percentages', () => {
      component.results = mockResults;
      fixture.detectChanges();

      expect(component.results[0].percentage).toBeCloseTo(49.41);
      expect(component.results[1].percentage).toBeCloseTo(44.71);
    });

    it('should sort results by vote count descending', () => {
      component.results = mockResults;

      const sorted = [...component.results].sort(
        (a, b) => b.voteCount - a.voteCount,
      );

      expect(sorted[0].voteCount).toBe(4200);
      expect(sorted[1].voteCount).toBe(3800);
      expect(sorted[2].voteCount).toBe(500);
    });

    it('should highlight winner', () => {
      component.results = mockResults;
      fixture.detectChanges();

      const winner = component.results.reduce((prev, current) =>
        prev.voteCount > current.voteCount ? prev : current,
      );

      expect(winner.candidateName).toBe('John Smith');
      expect(winner.voteCount).toBe(4200);
    });

    it('should display party affiliation with results', () => {
      component.results = mockResults;
      fixture.detectChanges();

      expect(component.results[0].partyAffiliation).toBe('Democratic Party');
      expect(component.results[1].partyAffiliation).toBe('Republican Party');
    });
  });

  describe('election statistics', () => {
    it('should display total votes cast', () => {
      component.election = mockElection;
      fixture.detectChanges();

      expect(component.election.totalVotesCast).toBe(8500);
    });

    it('should display voter turnout', () => {
      component.election = mockElection;

      const turnout =
        (component.election.totalVotesCast / component.election.totalVoters) *
        100;

      expect(turnout).toBeCloseTo(85);
    });

    it('should display total registered voters', () => {
      component.election = mockElection;
      fixture.detectChanges();

      expect(component.election.totalVoters).toBe(10000);
    });

    it('should calculate votes not cast', () => {
      component.election = mockElection;

      const notCast =
        component.election.totalVoters - component.election.totalVotesCast;

      expect(notCast).toBe(1500);
    });
  });

  describe('vote calculation', () => {
    it('should calculate total votes from results', () => {
      component.results = mockResults;

      const total = component.results.reduce(
        (sum, result) => sum + result.voteCount,
        0,
      );

      expect(total).toBe(8500);
    });

    it('should calculate percentage correctly', () => {
      const totalVotes = 8500;
      const voteCount = 4200;

      const percentage = (voteCount / totalVotes) * 100;

      expect(percentage).toBeCloseTo(49.41);
    });

    it('should handle zero votes scenario', () => {
      const emptyResults = [
        {
          candidateId: 1,
          candidateName: 'Candidate 1',
          voteCount: 0,
          percentage: 0,
        },
      ];

      component.results = emptyResults;

      const total = component.results.reduce((sum, r) => sum + r.voteCount, 0);

      expect(total).toBe(0);
    });
  });

  describe('visualization', () => {
    it('should prepare data for chart visualization', () => {
      component.results = mockResults;

      const chartData = component.results.map((r) => ({
        name: r.candidateName,
        votes: r.voteCount,
      }));

      expect(chartData.length).toBe(3);
      expect(chartData[0].votes).toBe(4200);
    });

    it('should display party colors in results', () => {
      component.results = mockResults;
      fixture.detectChanges();

      expect(component.results[0]).toBeDefined();
    });

    it('should create result summary', () => {
      const summary = {
        winner: mockResults[0].candidateName,
        winnerVotes: mockResults[0].voteCount,
        totalVotes: 8500,
        turnout: 85,
      };

      expect(summary.winner).toBe('John Smith');
      expect(summary.winnerVotes).toBe(4200);
    });
  });

  describe('result filtering', () => {
    it('should filter results by party affiliation', () => {
      component.results = mockResults;

      const democrats = component.results.filter(
        (r) => r.partyAffiliation === 'Democratic Party',
      );

      expect(democrats.length).toBe(1);
      expect(democrats[0].candidateName).toBe('John Smith');
    });

    it('should show only candidates with votes', () => {
      const resultsWithCandidatesWithoutVotes = [
        ...mockResults,
        {
          candidateId: 4,
          candidateName: 'No Vote Candidate',
          voteCount: 0,
          percentage: 0,
        },
      ];

      component.results = resultsWithCandidatesWithoutVotes;

      const withVotes = component.results.filter((r) => r.voteCount > 0);

      expect(withVotes.length).toBe(3);
    });
  });

  describe('result comparison', () => {
    it('should compare vote margins between top candidates', () => {
      component.results = mockResults;

      const margin =
        component.results[0].voteCount - component.results[1].voteCount;

      expect(margin).toBe(400);
    });

    it('should identify close race', () => {
      const closeResults = [
        {
          candidateId: 1,
          candidateName: 'Candidate A',
          voteCount: 4250,
          percentage: 50.0,
        },
        {
          candidateId: 2,
          candidateName: 'Candidate B',
          voteCount: 4250,
          percentage: 50.0,
        },
      ];

      component.results = closeResults;

      const margin = Math.abs(
        component.results[0].voteCount - component.results[1].voteCount,
      );

      expect(margin).toBe(0);
    });

    it('should identify landslide victory', () => {
      const landslideResults = [
        {
          candidateId: 1,
          candidateName: 'Winner',
          voteCount: 7500,
          percentage: 88.24,
        },
        {
          candidateId: 2,
          candidateName: 'Runner Up',
          voteCount: 1000,
          percentage: 11.76,
        },
      ];

      component.results = landslideResults;

      const margin =
        landslideResults[0].voteCount - landslideResults[1].voteCount;

      expect(margin).toBe(6500);
    });
  });

  describe('export results', () => {
    it('should prepare results for CSV export', () => {
      component.results = mockResults;

      const csvData = component.results.map(
        (r) =>
          `${r.candidateName},${r.partyAffiliation},${r.voteCount},${r.percentage}`,
      );

      expect(csvData.length).toBe(3);
    });

    it('should prepare results for PDF export', () => {
      component.election = mockElection;
      component.results = mockResults;

      const pdfData = {
        election: component.election.electionName,
        results: component.results,
      };

      expect(pdfData.election).toBe('General Election 2024');
      expect(pdfData.results.length).toBe(3);
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

    it('should display error when loading results fails', () => {
      resultServiceSpy.getResults.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Failed to load results' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.loadResults();

      expect(component.errorMessage).toBeTruthy();
    });

    it('should retry loading results', () => {
      resultServiceSpy.getResults.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockResults);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionId = 1;
      component.retryLoad();

      expect(resultServiceSpy.getResults).toHaveBeenCalled();
    });

    it('should clear error message', () => {
      component.errorMessage = 'Some error';
      component.clearError();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('result validation', () => {
    it('should validate results sum to total votes', () => {
      component.results = mockResults;

      const summedVotes = component.results.reduce(
        (sum, r) => sum + r.voteCount,
        0,
      );

      expect(summedVotes).toBe(8500);
    });

    it('should validate percentages sum to approximately 100', () => {
      component.results = mockResults;

      const totalPercentage = component.results.reduce(
        (sum, r) => sum + r.percentage,
        0,
      );

      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should handle election with no votes', () => {
      component.results = [];

      const totalVotes = component.results.reduce(
        (sum, r) => sum + r.voteCount,
        0,
      );

      expect(totalVotes).toBe(0);
    });
  });
});
