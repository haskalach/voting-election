import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrgFormComponent } from './org-form.component';
import { OrganizationService } from '../core/services/organization.service';
import { of } from 'rxjs';

describe('OrgFormComponent', () => {
  let component: OrgFormComponent;
  let fixture: ComponentFixture<OrgFormComponent>;
  let orgServiceSpy: jasmine.SpyObj<OrganizationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  beforeEach(async () => {
    const orgServiceMock = jasmine.createSpyObj('OrganizationService', [
      'create',
      'update',
      'getById',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteMock = {
      params: of({ id: null }),
    };

    await TestBed.configureTestingModule({
      imports: [OrgFormComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: OrganizationService, useValue: orgServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    orgServiceSpy = TestBed.inject(
      OrganizationService,
    ) as jasmine.SpyObj<OrganizationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute);

    fixture = TestBed.createComponent(OrgFormComponent);
    component = fixture.componentInstance;
  });

  describe('form validation', () => {
    it('should create org form component', () => {
      expect(component).toBeTruthy();
    });

    it('should validate required fields', () => {
      const nameControl = component.organizationForm?.get('organizationName');
      const regControl = component.organizationForm?.get('registrationNumber');

      nameControl?.setValue('');
      regControl?.setValue('');

      expect(component.organizationForm?.valid).toBeFalsy();
    });

    it('should require organization name', () => {
      const nameControl = component.organizationForm?.get('organizationName');

      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBeTruthy();

      nameControl?.setValue('New Organization');
      expect(nameControl?.hasError('required')).toBeFalsy();
    });

    it('should require registration number', () => {
      const regControl = component.organizationForm?.get('registrationNumber');

      regControl?.setValue('');
      expect(regControl?.hasError('required')).toBeTruthy();

      regControl?.setValue('EB-004');
      expect(regControl?.hasError('required')).toBeFalsy();
    });

    it('should enable submit button with valid form', () => {
      component.organizationForm?.patchValue({
        organizationName: 'New Election Board',
        registrationNumber: 'EB-004',
      });

      fixture.detectChanges();
      expect(component.organizationForm?.valid).toBeTruthy();
    });
  });

  describe('organization creation', () => {
    it('should create new organization', () => {
      const createRequest = {
        organizationName: 'New Election Board',
        registrationNumber: 'EB-004',
      };

      orgServiceSpy.create.and.returnValue({
        subscribe: (callback: any) => {
          callback({ organizationId: 4, ...createRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.organizationForm?.patchValue(createRequest);
      component.saveOrganization();

      expect(orgServiceSpy.create).toHaveBeenCalled();
    });

    it('should navigate to org list on successful creation', () => {
      orgServiceSpy.create.and.returnValue({
        subscribe: (callback: any) => {
          callback({ organizationId: 4 });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.organizationForm?.patchValue({
        organizationName: 'New Organization',
        registrationNumber: 'EB-004',
      });
      component.saveOrganization();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/organizations']);
    });

    it('should display error on duplicate registration', () => {
      orgServiceSpy.create.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({
            error: { message: 'Registration number already exists' },
          });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.organizationForm?.patchValue({
        organizationName: 'Duplicate Org',
        registrationNumber: 'EB-001',
      });
      component.saveOrganization();

      expect(component.errorMessage).toBeTruthy();
    });
  });

  describe('organization update', () => {
    beforeEach(() => {
      activatedRouteSpy.params = of({ id: 1 });
    });

    it('should load organization data for editing', () => {
      component.organizationId = 1;
      const mockOrg = {
        organizationId: 1,
        organizationName: 'Election Board - Region 1',
        registrationNumber: 'EB-001',
        isActive: true,
      };

      orgServiceSpy.getById.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockOrg);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(orgServiceSpy.getById).toHaveBeenCalledWith(1);
    });

    it('should update existing organization', () => {
      component.organizationId = 1;
      const updateRequest = {
        organizationName: 'Updated Election Board',
        registrationNumber: 'EB-001-UPDATED',
      };

      orgServiceSpy.update.and.returnValue({
        subscribe: (callback: any) => {
          callback({ organizationId: 1, ...updateRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.organizationForm?.patchValue(updateRequest);
      component.saveOrganization();

      expect(orgServiceSpy.update).toHaveBeenCalledWith(1, jasmine.any(Object));
    });

    it('should navigate to org list on successful update', () => {
      component.organizationId = 1;

      orgServiceSpy.update.and.returnValue({
        subscribe: (callback: any) => {
          callback({ organizationId: 1 });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.organizationForm?.patchValue({
        organizationName: 'Updated',
        registrationNumber: 'EB-001',
      });
      component.saveOrganization();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/organizations']);
    });
  });
});
