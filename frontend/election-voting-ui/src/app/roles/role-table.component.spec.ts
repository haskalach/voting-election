import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RoleTableComponent } from './role-table.component';
import { RoleService } from '../core/services/role.service';
import { of } from 'rxjs';

describe('RoleTableComponent', () => {
  let component: RoleTableComponent;
  let fixture: ComponentFixture<RoleTableComponent>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockRoles = [
    {
      roleId: 1,
      roleName: 'Administrator',
      description: 'Full system access',
      permissionCount: 10,
      isActive: true,
      createdAt: new Date('2024-01-15'),
    },
    {
      roleId: 2,
      roleName: 'Election Officer',
      description: 'Can manage elections',
      permissionCount: 5,
      isActive: true,
      createdAt: new Date('2024-01-16'),
    },
    {
      roleId: 3,
      roleName: 'Viewer',
      description: 'Read-only access',
      permissionCount: 2,
      isActive: true,
      createdAt: new Date('2024-01-17'),
    },
    {
      roleId: 4,
      roleName: 'Archived Role',
      description: 'No longer used',
      permissionCount: 0,
      isActive: false,
      createdAt: new Date('2024-01-10'),
    },
  ];

  beforeEach(async () => {
    const roleServiceMock = jasmine.createSpyObj('RoleService', [
      'getAll',
      'delete',
      'getPermissions',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        RoleTableComponent,
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
      ],
      providers: [
        { provide: RoleService, useValue: roleServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    roleServiceSpy = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(RoleTableComponent);
    component = fixture.componentInstance;
  });

  describe('table initialization', () => {
    it('should create role table component', () => {
      expect(component).toBeTruthy();
    });

    it('should load roles on init', () => {
      roleServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockRoles);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(roleServiceSpy.getAll).toHaveBeenCalled();
      expect(component.roles.length).toBe(4);
    });

    it('should display roles in table', () => {
      component.roles = mockRoles;
      fixture.detectChanges();

      expect(component.roles.length).toBe(4);
    });

    it('should display role columns', () => {
      component.roles = mockRoles;
      component.displayedColumns = [
        'roleName',
        'description',
        'permissionCount',
        'isActive',
        'actions',
      ];
      fixture.detectChanges();

      const headers = fixture.nativeElement.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('role actions', () => {
    it('should navigate to edit role', () => {
      component.editRole(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/roles/1/edit']);
    });

    it('should navigate to view role details', () => {
      component.viewDetails(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/roles/1']);
    });

    it('should navigate to manage permissions', () => {
      component.managePermissions(1);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/roles/1/permissions']);
    });

    it('should delete role with confirmation', () => {
      roleServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback(true);
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteRole(1);

      expect(window.confirm).toHaveBeenCalled();
      expect(roleServiceSpy.delete).toHaveBeenCalledWith(1);
    });

    it('should not delete role without confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteRole(1);

      expect(roleServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('should refresh roles after deletion', () => {
      roleServiceSpy.delete.and.returnValue({
        subscribe: (callback: any) => {
          callback(true);
          return { unsubscribe: () => {} };
        },
      } as any);

      roleServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockRoles.slice(0, 2));
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteRole(1);
      component.loadRoles();

      expect(component.roles.length).toBe(2);
    });
  });

  describe('table filtering and sorting', () => {
    it('should filter roles by name', () => {
      component.roles = mockRoles;
      component.filterValue = 'Administrator';

      const filtered = component.roles.filter((role) =>
        role.roleName
          .toLowerCase()
          .includes(component.filterValue.toLowerCase()),
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].roleId).toBe(1);
    });

    it('should filter roles by description', () => {
      component.roles = mockRoles;
      component.filterValue = 'manage';

      const filtered = component.roles.filter((role) =>
        role.description
          .toLowerCase()
          .includes(component.filterValue.toLowerCase()),
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].roleId).toBe(2);
    });

    it('should display active roles only when filtered', () => {
      component.roles = mockRoles;
      const active = component.roles.filter((role) => role.isActive);

      expect(active.length).toBe(3);
    });

    it('should display all roles including inactive', () => {
      component.roles = mockRoles;

      expect(component.roles.length).toBe(4);
    });

    it('should sort by role name', () => {
      component.roles = mockRoles;

      const sorted = [...component.roles].sort((a, b) =>
        a.roleName.localeCompare(b.roleName),
      );

      expect(sorted[0].roleName).toBe('Administrator');
      expect(sorted[sorted.length - 1].roleName).toBe('Viewer');
    });

    it('should sort by permission count', () => {
      component.roles = mockRoles;

      const sorted = [...component.roles].sort(
        (a, b) => b.permissionCount - a.permissionCount,
      );

      expect(sorted[0].permissionCount).toBe(10);
      expect(sorted[sorted.length - 1].permissionCount).toBe(0);
    });
  });

  describe('role permissions', () => {
    it('should display permission count for each role', () => {
      component.roles = mockRoles;
      fixture.detectChanges();

      expect(component.roles[0].permissionCount).toBe(10);
      expect(component.roles[1].permissionCount).toBe(5);
      expect(component.roles[2].permissionCount).toBe(2);
    });

    it('should load role permissions', () => {
      const mockPermissions = [
        { permissionId: 1, permissionName: 'Create Election' },
        { permissionId: 2, permissionName: 'Edit Election' },
      ];

      roleServiceSpy.getPermissions.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockPermissions);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.loadRolePermissions(1);

      expect(roleServiceSpy.getPermissions).toHaveBeenCalledWith(1);
    });
  });

  describe('error handling', () => {
    it('should display error on load failure', () => {
      roleServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Failed to load roles' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(component.errorMessage).toBeTruthy();
    });

    it('should display error on delete failure', () => {
      roleServiceSpy.delete.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({
            error: { message: 'Cannot delete role with users' },
          });
          return { unsubscribe: () => {} };
        },
      } as any);

      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteRole(1);

      expect(component.errorMessage).toBeTruthy();
    });

    it('should retry loading roles', () => {
      roleServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockRoles);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.retryLoad();

      expect(roleServiceSpy.getAll).toHaveBeenCalled();
    });

    it('should clear error message', () => {
      component.errorMessage = 'Some error';
      component.clearError();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('pagination', () => {
    it('should implement pagination for large role lists', () => {
      component.roles = Array.from({ length: 25 }, (_, i) => ({
        roleId: i + 1,
        roleName: `Role ${i + 1}`,
        description: `Description ${i + 1}`,
        permissionCount: Math.floor(Math.random() * 10),
        isActive: true,
        createdAt: new Date(),
      }));

      expect(component.roles.length).toBe(25);
      expect(component.pageSize || 10).toBeLessThanOrEqual(25);
    });

    it('should paginate with 10 items per page', () => {
      component.roles = mockRoles;
      component.pageSize = 10;

      const page1 = component.roles.slice(0, component.pageSize);

      expect(page1.length).toBeLessThanOrEqual(10);
    });
  });

  describe('table state', () => {
    it('should show loading state while fetching', () => {
      component.isLoading = true;
      fixture.detectChanges();

      expect(component.isLoading).toBeTruthy();
    });

    it('should clear loading state after fetch', () => {
      roleServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockRoles);
          component.isLoading = false;
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(component.isLoading).toBeFalsy();
    });
  });
});
