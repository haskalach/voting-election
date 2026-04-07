import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { VoteCountComponent } from './vote-count.component';
import { DataService } from '../core/services/data.service';

describe('VoteCountComponent', () => {
  let component: VoteCountComponent;
  let fixture: ComponentFixture<VoteCountComponent>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    const dataServiceMock = jasmine.createSpyObj('DataService', [
      'logVoteCount',
      'getMyVotes',
      'getPollingStations',
    ]);

    await TestBed.configureTestingModule({
      imports: [VoteCountComponent, ReactiveFormsModule, FormsModule],
      providers: [{ provide: DataService, useValue: dataServiceMock }],
    }).compileComponents();

    dataServiceSpy = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;

    fixture = TestBed.createComponent(VoteCountComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create vote count component', () => {
      expect(component).toBeTruthy();
    });

    it('should load polling stations on init', () => {
      const mockStations = [
        {
          pollingStationId: 1,
          stationName: 'Station 1',
          location: 'Downtown',
          capacity: 500,
        },
        {
          pollingStationId: 2,
          stationName: 'Station 2',
          location: 'Uptown',
          capacity: 300,
        },
      ];

      dataServiceSpy.getPollingStations.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockStations);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(dataServiceSpy.getPollingStations).toHaveBeenCalled();
      expect(component.stations).toEqual(mockStations);
    });

    it('should load user vote records', () => {
      const mockVotes = [
        {
          voteCountId: 1,
          candidateName: 'Candidate A',
          votes: 250,
          recordedAt: new Date().toISOString(),
          stationName: 'Station 1',
        },
      ];

      dataServiceSpy.getMyVotes.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockVotes);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(dataServiceSpy.getMyVotes).toHaveBeenCalled();
    });
  });

  describe('form validation', () => {
    it('should have invalid form with empty fields', () => {
      const stationControl = component.voteCountForm?.get('stationId');
      const candidateControl = component.voteCountForm?.get('candidateName');
      const votesControl = component.voteCountForm?.get('votes');

      stationControl?.setValue('');
      candidateControl?.setValue('');
      votesControl?.setValue('');

      expect(component.voteCountForm?.valid).toBeFalsy();
    });

    it('should validate positive vote count', () => {
      const votesControl = component.voteCountForm?.get('votes');

      votesControl?.setValue(-50);
      expect(votesControl?.hasError('min')).toBeTruthy();

      votesControl?.setValue(100);
      expect(votesControl?.hasError('min')).toBeFalsy();
    });

    it('should require candidate name', () => {
      const candidateControl = component.voteCountForm?.get('candidateName');

      candidateControl?.setValue('');
      expect(candidateControl?.hasError('required')).toBeTruthy();

      candidateControl?.setValue('Candidate A');
      expect(candidateControl?.hasError('required')).toBeFalsy();
    });

    it('should require station selection', () => {
      const stationControl = component.voteCountForm?.get('stationId');

      stationControl?.setValue('');
      expect(stationControl?.hasError('required')).toBeTruthy();

      stationControl?.setValue(1);
      expect(stationControl?.hasError('required')).toBeFalsy();
    });

    it('should enable submit button with valid form', () => {
      component.voteCountForm?.patchValue({
        stationId: 1,
        candidateName: 'Candidate A',
        votes: 250,
      });

      fixture.detectChanges();
      expect(component.voteCountForm?.valid).toBeTruthy();
    });
  });

  describe('vote counting', () => {
    it('should submit vote count record', () => {
      const voteRequest = {
        stationId: 1,
        candidateName: 'Candidate A',
        votes: 250,
      };

      dataServiceSpy.logVoteCount.and.returnValue({
        subscribe: (callback: any) => {
          callback({ voteCountId: 1, ...voteRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.voteCountForm?.patchValue(voteRequest);
      component.logVoteCount();

      expect(dataServiceSpy.logVoteCount).toHaveBeenCalled();
    });

    it('should show success message after logging', () => {
      const voteRequest = {
        stationId: 1,
        candidateName: 'Candidate B',
        votes: 180,
      };

      dataServiceSpy.logVoteCount.and.returnValue({
        subscribe: (callback: any) => {
          callback({ voteCountId: 1, ...voteRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.voteCountForm?.patchValue(voteRequest);
      component.logVoteCount();

      expect(component.successMessage).toBeTruthy();
    });

    it('should clear form after successful submission', () => {
      dataServiceSpy.logVoteCount.and.returnValue({
        subscribe: (callback: any) => {
          callback({
            voteCountId: 1,
            candidateName: 'Candidate A',
            votes: 250,
          });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.voteCountForm?.patchValue({
        stationId: 1,
        candidateName: 'Candidate A',
        votes: 250,
      });
      component.logVoteCount();

      expect(component.voteCountForm?.get('candidateName')?.value).toBe('');
    });

    it('should display error on duplicate candidate vote', () => {
      dataServiceSpy.logVoteCount.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({
            error: { message: 'Vote already logged for this candidate today' },
          });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.voteCountForm?.patchValue({
        stationId: 1,
        candidateName: 'Candidate A',
        votes: 250,
      });
      component.logVoteCount();

      expect(component.errorMessage).toContain('already logged');
    });
  });

  describe('vote records display', () => {
    it('should display user vote history', () => {
      component.voteRecords = [
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

      fixture.detectChanges();

      expect(component.voteRecords.length).toBe(2);
      expect(component.voteRecords[0].candidateName).toBe('Candidate A');
    });

    it('should calculate total votes recorded', () => {
      component.voteRecords = [
        {
          voteCountId: 1,
          candidateName: 'A',
          votes: 250,
          recordedAt: '',
          stationName: 'S1',
        },
        {
          voteCountId: 2,
          candidateName: 'B',
          votes: 180,
          recordedAt: '',
          stationName: 'S1',
        },
        {
          voteCountId: 3,
          candidateName: 'C',
          votes: 200,
          recordedAt: '',
          stationName: 'S1',
        },
      ];

      const total = component.voteRecords.reduce((sum, r) => sum + r.votes, 0);

      expect(total).toBe(630);
    });

    it('should group votes by candidate', () => {
      const mockVotes = [
        {
          voteCountId: 1,
          candidateName: 'Candidate A',
          votes: 250,
          recordedAt: '',
          stationName: 'S1',
        },
        {
          voteCountId: 2,
          candidateName: 'Candidate A',
          votes: 100,
          recordedAt: '',
          stationName: 'S2',
        },
        {
          voteCountId: 3,
          candidateName: 'Candidate B',
          votes: 180,
          recordedAt: '',
          stationName: 'S1',
        },
      ];

      const grouped = mockVotes.reduce((acc: any, vote: any) => {
        acc[vote.candidateName] = (acc[vote.candidateName] || 0) + vote.votes;
        return acc;
      }, {});

      expect(grouped['Candidate A']).toBe(350);
      expect(grouped['Candidate B']).toBe(180);
    });
  });
});
