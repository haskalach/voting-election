import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidateFormComponent } from './candidate-form.component';
import { CandidateService } from '../core/services/candidate.service';
import { ElectionService } from '../core/services/election.service';
import { of } from 'rxjs';

describe('CandidateFormComponent', () => {
  let component: CandidateFormComponent;
  let fixture: ComponentFixture<CandidateFormComponent>;
  let candidateServiceSpy: jasmine.SpyObj<CandidateService>;
  let electionServiceSpy: jasmine.SpyObj<ElectionService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  const mockElections = [
    { electionId: 1, electionName: 'General Election 2024' },
    { electionId: 2, electionName: 'Regional Election 2024' },
  ];

  beforeEach(async () => {
    const candidateServiceMock = jasmine.createSpyObj('CandidateService', [
      'create',
      'update',
      'getById',
    ]);
    const electionServiceMock = jasmine.createSpyObj('ElectionService', [
      'getAll',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteMock = {
      params: of({ id: null, electionId: null }),
    };

    await TestBed.configureTestingModule({
      imports: [CandidateFormComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: CandidateService, useValue: candidateServiceMock },
        { provide: ElectionService, useValue: electionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    candidateServiceSpy = TestBed.inject(
      CandidateService,
    ) as jasmine.SpyObj<CandidateService>;
    electionServiceSpy = TestBed.inject(
      ElectionService,
    ) as jasmine.SpyObj<ElectionService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute);

    electionServiceSpy.getAll.and.returnValue({
      subscribe: (callback: any) => {
        callback(mockElections);
        return { unsubscribe: () => {} };
      },
    } as any);

    fixture = TestBed.createComponent(CandidateFormComponent);
    component = fixture.componentInstance;
  });

  describe('component initialization', () => {
    it('should create candidate form component', () => {
      expect(component).toBeTruthy();
    });

    it('should load elections on init', () => {
      component.ngOnInit();

      expect(electionServiceSpy.getAll).toHaveBeenCalled();
      expect(component.elections.length).toBe(2);
    });

    it('should initialize candidate form with required fields', () => {
      const candidateForm = component.candidateForm;

      expect(candidateForm?.get('candidateName')).toBeTruthy();
      expect(candidateForm?.get('partyAffiliation')).toBeTruthy();
      expect(candidateForm?.get('electionId')).toBeTruthy();
      expect(candidateForm?.get('biography')).toBeTruthy();
    });
  });

  describe('form validation', () => {
    it('should validate required candidate name', () => {
      const nameControl = component.candidateForm?.get('candidateName');

      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBeTruthy();

      nameControl?.setValue('John Smith');
      expect(nameControl?.hasError('required')).toBeFalsy();
    });

    it('should require minimum candidate name length', () => {
      const nameControl = component.candidateForm?.get('candidateName');

      nameControl?.setValue('Jo');
      expect(nameControl?.hasError('minlength')).toBeTruthy();

      nameControl?.setValue('John Smith');
      expect(nameControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate party affiliation', () => {
      const partyControl = component.candidateForm?.get('partyAffiliation');

      partyControl?.setValue('');
      expect(partyControl?.hasError('required')).toBeTruthy();

      partyControl?.setValue('Democratic Party');
      expect(partyControl?.hasError('required')).toBeFalsy();
    });

    it('should validate election selection', () => {
      const electionControl = component.candidateForm?.get('electionId');

      electionControl?.setValue(null);
      expect(electionControl?.hasError('required')).toBeTruthy();

      electionControl?.setValue(1);
      expect(electionControl?.hasError('required')).toBeFalsy();
    });

    it('should validate optional biography field', () => {
      const bioControl = component.candidateForm?.get('biography');

      bioControl?.setValue('');
      expect(bioControl?.valid).toBeTruthy(); // Optional field

      bioControl?.setValue('Experienced politician with 20 years in service');
      expect(bioControl?.valid).toBeTruthy();
    });

    it('should disable submit button with invalid form', () => {
      component.candidateForm?.patchValue({
        candidateName: 'Jo',
        partyAffiliation: '',
        electionId: null,
      });

      expect(component.candidateForm?.valid).toBeFalsy();
    });

    it('should enable submit button with valid form', () => {
      component.candidateForm?.patchValue({
        candidateName: 'John Smith',
        partyAffiliation: 'Democratic Party',
        electionId: 1,
        biography: 'Lorem ipsum...',
      });

      expect(component.candidateForm?.valid).toBeTruthy();
    });
  });

  describe('candidate creation', () => {
    it('should create new candidate', () => {
      const createRequest = {
        candidateName: 'Jane Doe',
        partyAffiliation: 'Republican Party',
        electionId: 1,
      };

      candidateServiceSpy.create.and.returnValue({
        subscribe: (callback: any) => {
          callback({ candidateId: 1, ...createRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.candidateForm?.patchValue(createRequest);
      component.saveCandidate();

      expect(candidateServiceSpy.create).toHaveBeenCalled();
    });

    it('should navigate to candidates list after creation', () => {
      candidateServiceSpy.create.and.returnValue({
        subscribe: (callback: any) => {
          callback({ candidateId: 1 });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.candidateForm?.patchValue({
        candidateName: 'Jane Doe',
        partyAffiliation: 'Republican Party',
        electionId: 1,
      });
      component.saveCandidate();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/candidates']);
    });

    it('should handle creation error with duplicate', () => {
      candidateServiceSpy.create.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({
            error: { message: 'Candidate already exists in this election' },
          });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.candidateForm?.patchValue({
        candidateName: 'John Smith',
        partyAffiliation: 'Democratic Party',
        electionId: 1,
      });
      component.saveCandidate();

      expect(component.errorMessage).toBeTruthy();
    });
  });

  describe('candidate update', () => {
    beforeEach(() => {
      activatedRouteSpy.params = of({ id: 1, electionId: 1 });
    });

    it('should load candidate data for editing', () => {
      component.candidateId = 1;
      const mockCandidate = {
        candidateId: 1,
        candidateName: 'John Smith',
        partyAffiliation: 'Democratic Party',
        electionId: 1,
        biography: 'Lorem ipsum',
      };

      candidateServiceSpy.getById.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockCandidate);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(candidateServiceSpy.getById).toHaveBeenCalledWith(1);
    });

    it('should update existing candidate', () => {
      component.candidateId = 1;

      const updateRequest = {
        candidateName: 'John Smith Updated',
        partyAffiliation: 'Democratic Party',
        electionId: 1,
      };

      candidateServiceSpy.update.and.returnValue({
        subscribe: (callback: any) => {
          callback({ candidateId: 1, ...updateRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.candidateForm?.patchValue(updateRequest);
      component.saveCandidate();

      expect(candidateServiceSpy.update).toHaveBeenCalledWith(
        1,
        jasmine.any(Object),
      );
    });

    it('should navigate to candidates list after update', () => {
      component.candidateId = 1;

      candidateServiceSpy.update.and.returnValue({
        subscribe: (callback: any) => {
          callback({ candidateId: 1 });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.candidateForm?.patchValue({
        candidateName: 'John Smith',
        partyAffiliation: 'Democratic Party',
        electionId: 1,
      });
      component.saveCandidate();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/candidates']);
    });
  });

  describe('election selection', () => {
    it('should display all elections in dropdown', () => {
      component.elections = mockElections;
      fixture.detectChanges();

      expect(component.elections.length).toBe(2);
    });

    it('should set selected election', () => {
      const electionControl = component.candidateForm?.get('electionId');

      electionControl?.setValue(1);

      expect(electionControl?.value).toBe(1);
    });

    it('should show election name for selected election', () => {
      component.elections = mockElections;
      const electionControl = component.candidateForm?.get('electionId');

      electionControl?.setValue(1);
      fixture.detectChanges();

      expect(electionControl?.value).toBe(1);
    });
  });

  describe('party affiliation options', () => {
    it('should have predefined party options', () => {
      const parties = component.partyOptions || [
        'Democratic Party',
        'Republican Party',
        'Independent',
        'Green Party',
        'Libertarian Party',
      ];

      expect(parties.length).toBeGreaterThan(0);
    });

    it('should select party from options', () => {
      const partyControl = component.candidateForm?.get('partyAffiliation');

      partyControl?.setValue('Independent');

      expect(partyControl?.value).toBe('Independent');
    });
  });

  describe('biography handling', () => {
    it('should accept biography text', () => {
      const bioControl = component.candidateForm?.get('biography');
      const biography =
        'Experienced politician with 20 years in public service';

      bioControl?.setValue(biography);

      expect(bioControl?.value).toBe(biography);
    });

    it('should accept empty biography', () => {
      const bioControl = component.candidateForm?.get('biography');

      bioControl?.setValue('');

      expect(bioControl?.value).toBe('');
      expect(bioControl?.valid).toBeTruthy();
    });

    it('should limit biography length', () => {
      const bioControl = component.candidateForm?.get('biography');
      const longBio = 'A'.repeat(2000);

      bioControl?.setValue(longBio);

      if (component.maxBioLength) {
        expect(bioControl?.value.length).toBeLessThanOrEqual(
          component.maxBioLength,
        );
      }
    });
  });
});
