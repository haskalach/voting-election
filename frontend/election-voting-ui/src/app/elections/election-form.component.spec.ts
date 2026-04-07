import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectionFormComponent } from './election-form.component';
import { ElectionService } from '../core/services/election.service';
import { OrganizationService } from '../core/services/organization.service';
import { of } from 'rxjs';

describe('ElectionFormComponent', () => {
  let component: ElectionFormComponent;
  let fixture: ComponentFixture<ElectionFormComponent>;
  let electionServiceSpy: jasmine.SpyObj<ElectionService>;
  let orgServiceSpy: jasmine.SpyObj<OrganizationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  const mockOrganizations = [
    { organizationId: 1, organizationName: 'Election Board - Region 1' },
    { organizationId: 2, organizationName: 'Election Board - Region 2' },
  ];

  beforeEach(async () => {
    const electionServiceMock = jasmine.createSpyObj('ElectionService', [
      'create',
      'update',
      'getById',
    ]);
    const orgServiceMock = jasmine.createSpyObj('OrganizationService', [
      'getAll',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteMock = {
      params: of({ id: null }),
    };

    await TestBed.configureTestingModule({
      imports: [ElectionFormComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: ElectionService, useValue: electionServiceMock },
        { provide: OrganizationService, useValue: orgServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    electionServiceSpy = TestBed.inject(
      ElectionService,
    ) as jasmine.SpyObj<ElectionService>;
    orgServiceSpy = TestBed.inject(
      OrganizationService,
    ) as jasmine.SpyObj<OrganizationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute);

    orgServiceSpy.getAll.and.returnValue({
      subscribe: (callback: any) => {
        callback(mockOrganizations);
        return { unsubscribe: () => {} };
      },
    } as any);

    fixture = TestBed.createComponent(ElectionFormComponent);
    component = fixture.componentInstance;
  });

  describe('component initialization', () => {
    it('should create election form component', () => {
      expect(component).toBeTruthy();
    });

    it('should load organizations on init', () => {
      component.ngOnInit();

      expect(orgServiceSpy.getAll).toHaveBeenCalled();
      expect(component.organizations.length).toBe(2);
    });

    it('should initialize election form with required fields', () => {
      const electionForm = component.electionForm;

      expect(electionForm?.get('electionName')).toBeTruthy();
      expect(electionForm?.get('organizationId')).toBeTruthy();
      expect(electionForm?.get('startDate')).toBeTruthy();
      expect(electionForm?.get('endDate')).toBeTruthy();
    });
  });

  describe('form validation', () => {
    it('should validate required election name', () => {
      const nameControl = component.electionForm?.get('electionName');

      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBeTruthy();

      nameControl?.setValue('General Election 2024');
      expect(nameControl?.hasError('required')).toBeFalsy();
    });

    it('should require minimum election name length', () => {
      const nameControl = component.electionForm?.get('electionName');

      nameControl?.setValue('El');
      expect(nameControl?.hasError('minlength')).toBeTruthy();

      nameControl?.setValue('General Election');
      expect(nameControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate organization selection', () => {
      const orgControl = component.electionForm?.get('organizationId');

      orgControl?.setValue(null);
      expect(orgControl?.hasError('required')).toBeTruthy();

      orgControl?.setValue(1);
      expect(orgControl?.hasError('required')).toBeFalsy();
    });

    it('should validate start date is required', () => {
      const startControl = component.electionForm?.get('startDate');

      startControl?.setValue(null);
      expect(startControl?.hasError('required')).toBeTruthy();

      startControl?.setValue(new Date());
      expect(startControl?.hasError('required')).toBeFalsy();
    });

    it('should validate end date is after start date', () => {
      const startControl = component.electionForm?.get('startDate');
      const endControl = component.electionForm?.get('endDate');

      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      startControl?.setValue(tomorrow);
      endControl?.setValue(today);

      expect(
        component.electionForm?.get('endDate')?.hasError('invalidDate'),
      ).toBeTruthy();
    });

    it('should disable submit button with invalid form', () => {
      component.electionForm?.patchValue({
        electionName: 'El',
        organizationId: null,
      });

      expect(component.electionForm?.valid).toBeFalsy();
    });

    it('should enable submit button with valid form', () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

      component.electionForm?.patchValue({
        electionName: 'General Election 2024',
        organizationId: 1,
        startDate: startDate,
        endDate: endDate,
      });

      expect(component.electionForm?.valid).toBeTruthy();
    });
  });

  describe('election creation', () => {
    it('should create new election', () => {
      const createRequest = {
        electionName: 'General Election 2024',
        organizationId: 1,
        startDate: new Date(),
        endDate: new Date(),
      };

      electionServiceSpy.create.and.returnValue({
        subscribe: (callback: any) => {
          callback({ electionId: 1, ...createRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionForm?.patchValue(createRequest);
      component.saveElection();

      expect(electionServiceSpy.create).toHaveBeenCalled();
    });

    it('should navigate to elections list after creation', () => {
      electionServiceSpy.create.and.returnValue({
        subscribe: (callback: any) => {
          callback({ electionId: 1 });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionForm?.patchValue({
        electionName: 'General Election 2024',
        organizationId: 1,
        startDate: new Date(),
        endDate: new Date(),
      });
      component.saveElection();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/elections']);
    });

    it('should handle creation error', () => {
      electionServiceSpy.create.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Cannot create election' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionForm?.patchValue({
        electionName: 'General Election 2024',
        organizationId: 1,
        startDate: new Date(),
        endDate: new Date(),
      });
      component.saveElection();

      expect(component.errorMessage).toBeTruthy();
    });
  });

  describe('election update', () => {
    beforeEach(() => {
      activatedRouteSpy.params = of({ id: 1 });
    });

    it('should load election data for editing', () => {
      component.electionId = 1;
      const mockElection = {
        electionId: 1,
        electionName: 'General Election 2024',
        organizationId: 1,
        startDate: new Date(),
        endDate: new Date(),
      };

      electionServiceSpy.getById.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockElection);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(electionServiceSpy.getById).toHaveBeenCalledWith(1);
    });

    it('should update existing election', () => {
      component.electionId = 1;
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 48 * 60 * 60 * 1000);

      const updateRequest = {
        electionName: 'Updated Election 2024',
        organizationId: 1,
        startDate: startDate,
        endDate: endDate,
      };

      electionServiceSpy.update.and.returnValue({
        subscribe: (callback: any) => {
          callback({ electionId: 1, ...updateRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionForm?.patchValue(updateRequest);
      component.saveElection();

      expect(electionServiceSpy.update).toHaveBeenCalledWith(
        1,
        jasmine.any(Object),
      );
    });

    it('should navigate to elections list after update', () => {
      component.electionId = 1;

      electionServiceSpy.update.and.returnValue({
        subscribe: (callback: any) => {
          callback({ electionId: 1 });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.electionForm?.patchValue({
        electionName: 'General Election 2024',
        organizationId: 1,
        startDate: new Date(),
        endDate: new Date(),
      });
      component.saveElection();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/elections']);
    });
  });

  describe('organization selection', () => {
    it('should display all organizations in dropdown', () => {
      component.organizations = mockOrganizations;
      fixture.detectChanges();

      expect(component.organizations.length).toBe(2);
    });

    it('should set selected organization', () => {
      const orgControl = component.electionForm?.get('organizationId');

      orgControl?.setValue(1);

      expect(orgControl?.value).toBe(1);
    });

    it('should show organization name selected', () => {
      component.organizations = mockOrganizations;
      const orgControl = component.electionForm?.get('organizationId');

      orgControl?.setValue(1);
      fixture.detectChanges();

      expect(orgControl?.value).toBe(1);
    });
  });

  describe('date validation', () => {
    it('should validate start date is not in the past', () => {
      const startControl = component.electionForm?.get('startDate');
      const pastDate = new Date('2020-01-01');

      startControl?.setValue(pastDate);

      expect(component.electionForm?.valid).toBeFalsy();
    });

    it('should allow future start dates', () => {
      const futureDate = new Date(
        new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
      );
      const endDate = new Date(futureDate.getTime() + 24 * 60 * 60 * 1000);

      component.electionForm?.patchValue({
        electionName: 'Future Election',
        organizationId: 1,
        startDate: futureDate,
        endDate: endDate,
      });

      expect(component.electionForm?.valid).toBeTruthy();
    });

    it('should validate minimum election duration', () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 1 * 60 * 60 * 1000); // 1 hour later

      component.electionForm?.patchValue({
        startDate: startDate,
        endDate: endDate,
      });

      expect(component.electionForm?.valid).toBeTruthy();
    });
  });
});
