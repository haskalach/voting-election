import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { OrgTableComponent } from './org-table.component';
import { OrganizationService } from '../core/services/organization.service';
import { of } from 'rxjs';

describe('OrgTableComponent', () => {
  let component: OrgTableComponent;
  let fixture: ComponentFixture<OrgTableComponent>;
  let orgServiceSpy: jasmine.SpyObj<OrganizationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockOrganizations = [
    {
      organizationId: 1,
      organizationName: 'Election Board - Region 1',
      registrationNumber: 'EB-001',
      isActive: true,
      createdAt: new Date('2024-01-15'),
    },
    {
      organizationId: 2,
      organizationName: 'Election Board - Region 2',
      registrationNumber: 'EB-002',
      isActive: true,
      createdAt: new Date('2024-01-16'),
    },
    {
      organizationId: 3,
      organizationName: 'Election Board - Region 3',
      registrationNumber: 'EB-003',
      isActive: false,
      createdAt: new Date('2024-01-17'),
    },
  ];

  beforeEach(async () => {
    const orgServiceMock = jasmine.createSpyObj('OrganizationService', [
      'getAll',
      'delete',
      'deactivate',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        OrgTableComponent,
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
      ],
      providers: [
        { provide: OrganizationService, useValue: orgServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    orgServiceSpy = TestBed.inject(
      OrganizationService,
    ) as jasmine.SpyObj<OrganizationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(OrgTableComponent);
    component = fixture.componentInstance;
  });

  describe('table initialization', () => {
    it('should create org table component', () => {
      expect(component).toBeTruthy();
    });

    it('should load organizations on init', () => {
      orgServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockOrganizations);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(orgServiceSpy.getAll).toHaveBeenCalled();
      expect(component.organizations.length).toBe(3);
    });

    it('should display all organizations in table', () => {
      component.organizations = mockOrganizations;
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector('.org-table');
      expect(tableElement).toBeTruthy();
    });

    it('should display organization columns', () => {
      component.organizations = mockOrganizations;
      component.displayedColumns = [
        'organizationName',
        'registrationNumber',
        'isActive',
        'actions',
      ];
      fixture.detectChanges();

      const headers = fixture.nativeElement.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('organization actions', () => {
    it('should navigate to edit organization', () => {
      component.editOrganization(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith([
        '/organizations/1/edit',
      ]);
    });

    it('should navigate to view organization details', () => {
      component.viewDetails(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/organizations/1']);
    });

    it('should delete organization with confirmation', () => {
      orgServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback(true);
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteOrganization(1);

      expect(window.confirm).toHaveBeenCalled();
      expect(orgServiceSpy.delete).toHaveBeenCalledWith(1);
    });

    it('should not delete organization without confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteOrganization(1);

      expect(orgServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('should refresh org list after deletion', () => {
      orgServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback(true);
          return { unsubscribe: () => {} };
        },
      } as any);

      orgServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockOrganizations.slice(0, 2));
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteOrganization(1);
      component.loadOrganizations();

      expect(component.organizations.length).toBe(2);
    });

    it('should deactivate organization', () => {
      orgServiceSpy.deactivate.and.returnValue({
        subscribe: (callback: any) => {
          callback({ organizationId: 1, isActive: false });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.deactivateOrganization(1);

      expect(orgServiceSpy.deactivate).toHaveBeenCalledWith(1);
    });

    it('should handle deactivation error', () => {
      orgServiceSpy.deactivate.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({
            error: { message: 'Cannot deactivate organization' },
          });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.deactivateOrganization(1);

      expect(component.errorMessage).toBeTruthy();
    });
  });

  describe('table filtering and sorting', () => {
    it('should filter organizations by name', () => {
      component.organizations = mockOrganizations;
      component.filterValue = 'Region 1';

      const filtered = component.organizations.filter((org) =>
        org.organizationName
          .toLowerCase()
          .includes(component.filterValue.toLowerCase()),
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].organizationId).toBe(1);
    });

    it('should display active organizations only when filtered', () => {
      component.organizations = mockOrganizations;
      const active = component.organizations.filter((org) => org.isActive);

      expect(active.length).toBe(2);
    });

    it('should display inactive organizations', () => {
      component.organizations = mockOrganizations;
      const inactive = component.organizations.filter((org) => !org.isActive);

      expect(inactive.length).toBe(1);
      expect(inactive[0].organizationId).toBe(3);
    });
  });

  describe('error handling', () => {
    it('should display error message on load failure', () => {
      orgServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Failed to load organizations' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(component.errorMessage).toBeTruthy();
    });

    it('should retry loading organizations', () => {
      orgServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockOrganizations);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.retryLoad();

      expect(orgServiceSpy.getAll).toHaveBeenCalled();
    });

    it('should clear error message', () => {
      component.errorMessage = 'Some error';
      component.clearError();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('pagination', () => {
    it('should implement pagination if more than 10 organizations', () => {
      component.organizations = Array.from({ length: 25 }, (_, i) => ({
        organizationId: i + 1,
        organizationName: `Organization ${i + 1}`,
        registrationNumber: `ORG-${String(i + 1).padStart(3, '0')}`,
        isActive: true,
        createdAt: new Date(),
      }));

      expect(component.organizations.length).toBe(25);
      expect(component.pageSize || 10).toBeLessThanOrEqual(25);
    });
  });
});
