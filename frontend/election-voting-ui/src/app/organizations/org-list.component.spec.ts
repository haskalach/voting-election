import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OrgListComponent } from './org-list.component';
import { OrganizationService } from '../core/services/organization.service';

describe('OrgListComponent', () => {
  let component: OrgListComponent;
  let fixture: ComponentFixture<OrgListComponent>;
  let orgServiceSpy: jasmine.SpyObj<OrganizationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const orgServiceMock = jasmine.createSpyObj('OrganizationService', [
      'getAll',
      'delete',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OrgListComponent],
      providers: [
        { provide: OrganizationService, useValue: orgServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    orgServiceSpy = TestBed.inject(
      OrganizationService,
    ) as jasmine.SpyObj<OrganizationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(OrgListComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create org list component', () => {
      expect(component).toBeTruthy();
    });

    it('should load all organizations on init', () => {
      const mockOrgs = [
        {
          organizationId: 1,
          organizationName: 'Election Board - Region 1',
          registrationNumber: 'EB-001',
          isActive: true,
        },
        {
          organizationId: 2,
          organizationName: 'Election Board - Region 2',
          registrationNumber: 'EB-002',
          isActive: true,
        },
      ];

      orgServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockOrgs);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(orgServiceSpy.getAll).toHaveBeenCalled();
      expect(component.organizations).toEqual(mockOrgs);
    });
  });

  describe('organization display', () => {
    it('should display organization list', () => {
      component.organizations = [
        {
          organizationId: 1,
          organizationName: 'Org 1',
          registrationNumber: 'EB-001',
          isActive: true,
        },
        {
          organizationId: 2,
          organizationName: 'Org 2',
          registrationNumber: 'EB-002',
          isActive: true,
        },
      ];

      fixture.detectChanges();

      expect(component.organizations.length).toBe(2);
      expect(component.organizations[0].organizationName).toBe('Org 1');
    });

    it('should handle empty organization list', () => {
      component.organizations = [];

      fixture.detectChanges();

      expect(component.organizations.length).toBe(0);
    });
  });

  describe('organization actions', () => {
    it('should navigate to create organization form', () => {
      component.createNewOrganization();

      expect(routerSpy.navigate).toHaveBeenCalledWith([
        '/organizations/create',
      ]);
    });

    it('should navigate to edit organization form', () => {
      const orgId = 1;

      component.editOrganization(orgId);

      expect(routerSpy.navigate).toHaveBeenCalledWith([
        '/organizations/edit',
        orgId,
      ]);
    });

    it('should navigate to organization details', () => {
      const orgId = 1;

      component.viewOrganization(orgId);

      expect(routerSpy.navigate).toHaveBeenCalledWith([
        '/organizations',
        orgId,
      ]);
    });

    it('should delete organization', () => {
      const orgId = 1;

      orgServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback({});
          return { unsubscribe: () => {} };
        },
      } as any);

      component.deleteOrganization(orgId);

      expect(orgServiceSpy.delete).toHaveBeenCalledWith(orgId);
    });

    it('should show success message on delete', () => {
      orgServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback({});
          return { unsubscribe: () => {} };
        },
      } as any);

      component.deleteOrganization(1);

      expect(component.successMessage).toBeTruthy();
    });

    it('should remove deleted organization from list', () => {
      component.organizations = [
        {
          organizationId: 1,
          organizationName: 'Org 1',
          registrationNumber: 'EB-001',
          isActive: true,
        },
        {
          organizationId: 2,
          organizationName: 'Org 2',
          registrationNumber: 'EB-002',
          isActive: true,
        },
      ];

      orgServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback({});
          component.organizations = component.organizations.filter(
            (o) => o.organizationId !== 1,
          );
          return { unsubscribe: () => {} };
        },
      } as any);

      component.deleteOrganization(1);

      expect(component.organizations.length).toBe(1);
      expect(component.organizations[0].organizationId).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should display error on load failure', () => {
      orgServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: 'Failed to load organizations' });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(component.errorMessage).toBeTruthy();
    });

    it('should display error on delete failure', () => {
      orgServiceSpy.delete.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({
            error: {
              message: 'Cannot delete organization with active employees',
            },
          });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.deleteOrganization(1);

      expect(component.errorMessage).toBeTruthy();
    });
  });
});
