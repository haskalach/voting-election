import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleFormComponent } from './role-form.component';
import { RoleService } from '../core/services/role.service';
import { PermissionService } from '../core/services/permission.service';
import { of } from 'rxjs';

describe('RoleFormComponent', () => {
  let component: RoleFormComponent;
  let fixture: ComponentFixture<RoleFormComponent>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  const mockPermissions = [
    {
      permissionId: 1,
      permissionName: 'Create Election',
      permissionCode: 'CREATE_ELECTION',
    },
    {
      permissionId: 2,
      permissionName: 'Edit Election',
      permissionCode: 'EDIT_ELECTION',
    },
    {
      permissionId: 3,
      permissionName: 'Delete Election',
      permissionCode: 'DELETE_ELECTION',
    },
    {
      permissionId: 4,
      permissionName: 'View Results',
      permissionCode: 'VIEW_RESULTS',
    },
  ];

  beforeEach(async () => {
    const roleServiceMock = jasmine.createSpyObj('RoleService', [
      'create',
      'update',
      'getById',
    ]);
    const permissionServiceMock = jasmine.createSpyObj('PermissionService', [
      'getAll',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteMock = {
      params: of({ id: null }),
    };

    await TestBed.configureTestingModule({
      imports: [RoleFormComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: RoleService, useValue: roleServiceMock },
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    roleServiceSpy = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    permissionServiceSpy = TestBed.inject(
      PermissionService,
    ) as jasmine.SpyObj<PermissionService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute);

    permissionServiceSpy.getAll.and.returnValue({
      subscribe: (callback: any) => {
        callback(mockPermissions);
        return { unsubscribe: () => {} };
      },
    } as any);

    fixture = TestBed.createComponent(RoleFormComponent);
    component = fixture.componentInstance;
  });

  describe('component initialization', () => {
    it('should create role form component', () => {
      expect(component).toBeTruthy();
    });

    it('should load permissions on init', () => {
      component.ngOnInit();

      expect(permissionServiceSpy.getAll).toHaveBeenCalled();
      expect(component.availablePermissions.length).toBe(4);
    });

    it('should initialize role form with required fields', () => {
      const roleForm = component.roleForm;

      expect(roleForm?.get('roleName')).toBeTruthy();
      expect(roleForm?.get('description')).toBeTruthy();
      expect(roleForm?.get('permissions')).toBeTruthy();
    });
  });

  describe('form validation', () => {
    it('should validate required role name', () => {
      const nameControl = component.roleForm?.get('roleName');

      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBeTruthy();

      nameControl?.setValue('Administrator');
      expect(nameControl?.hasError('required')).toBeFalsy();
    });

    it('should require minimum role name length', () => {
      const nameControl = component.roleForm?.get('roleName');

      nameControl?.setValue('A');
      expect(nameControl?.hasError('minlength')).toBeTruthy();

      nameControl?.setValue('Administrator');
      expect(nameControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate description field', () => {
      const descControl = component.roleForm?.get('description');

      descControl?.setValue('');
      expect(descControl?.valid).toBeTruthy(); // Optional field

      descControl?.setValue('Administrator role with full permissions');
      expect(descControl?.valid).toBeTruthy();
    });

    it('should require at least one permission', () => {
      const permControl = component.roleForm?.get('permissions');

      permControl?.setValue([]);
      expect(permControl?.hasError('required')).toBeTruthy();

      permControl?.setValue([1, 2]);
      expect(permControl?.hasError('required')).toBeFalsy();
    });

    it('should disable submit button with invalid form', () => {
      component.roleForm?.patchValue({
        roleName: 'A',
        permissions: [],
      });

      expect(component.roleForm?.valid).toBeFalsy();
    });

    it('should enable submit button with valid form', () => {
      component.roleForm?.patchValue({
        roleName: 'Administrator',
        description: 'Full access role',
        permissions: [1, 2, 3, 4],
      });

      expect(component.roleForm?.valid).toBeTruthy();
    });
  });

  describe('role creation', () => {
    it('should create new role', () => {
      const createRequest = {
        roleName: 'Administrator',
        description: 'Full access role',
        permissions: [1, 2, 3, 4],
      };

      roleServiceSpy.create.and.returnValue({
        subscribe: (callback: any) => {
          callback({ roleId: 1, ...createRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.roleForm?.patchValue(createRequest);
      component.saveRole();

      expect(roleServiceSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining(createRequest),
      );
    });

    it('should navigate to roles list after creation', () => {
      roleServiceSpy.create.and.returnValue({
        subscribe: (callback: any) => {
          callback({ roleId: 1 });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.roleForm?.patchValue({
        roleName: 'Viewer',
        permissions: [4],
      });
      component.saveRole();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/roles']);
    });

    it('should handle creation error with duplicate name', () => {
      roleServiceSpy.create.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Role name already exists' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.roleForm?.patchValue({
        roleName: 'Administrator',
        permissions: [1, 2, 3, 4],
      });
      component.saveRole();

      expect(component.errorMessage).toBeTruthy();
    });
  });

  describe('role update', () => {
    beforeEach(() => {
      activatedRouteSpy.params = of({ id: 1 });
    });

    it('should load role data for editing', () => {
      component.roleId = 1;
      const mockRole = {
        roleId: 1,
        roleName: 'Administrator',
        description: 'Full access role',
        permissions: [1, 2, 3, 4],
      };

      roleServiceSpy.getById.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockRole);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(roleServiceSpy.getById).toHaveBeenCalledWith(1);
    });

    it('should update existing role', () => {
      component.roleId = 1;
      const updateRequest = {
        roleName: 'Senior Administrator',
        description: 'Updated role',
        permissions: [1, 2, 3],
      };

      roleServiceSpy.update.and.returnValue({
        subscribe: (callback: any) => {
          callback({ roleId: 1, ...updateRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.roleForm?.patchValue(updateRequest);
      component.saveRole();

      expect(roleServiceSpy.update).toHaveBeenCalledWith(
        1,
        jasmine.any(Object),
      );
    });

    it('should navigate to roles list after update', () => {
      component.roleId = 1;

      roleServiceSpy.update.and.returnValue({
        subscribe: (callback: any) => {
          callback({ roleId: 1 });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.roleForm?.patchValue({
        roleName: 'Administrator',
        permissions: [1, 2, 3, 4],
      });
      component.saveRole();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/roles']);
    });

    it('should update role permissions', () => {
      component.roleId = 1;

      roleServiceSpy.update.and.returnValue({
        subscribe: (callback: any) => {
          callback({ roleId: 1, permissions: [1, 2] });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.roleForm?.patchValue({
        roleName: 'Limited Admin',
        permissions: [1, 2],
      });
      component.saveRole();

      expect(roleServiceSpy.update).toHaveBeenCalled();
    });
  });

  describe('permission management', () => {
    it('should display all available permissions', () => {
      component.availablePermissions = mockPermissions;
      fixture.detectChanges();

      expect(component.availablePermissions.length).toBe(4);
    });

    it('should select multiple permissions', () => {
      const permControl = component.roleForm?.get('permissions');

      permControl?.setValue([1, 3]);

      expect(permControl?.value).toEqual([1, 3]);
    });

    it('should toggle permission selection', () => {
      const permControl = component.roleForm?.get('permissions');
      let permissions = [1, 2];

      permControl?.setValue(permissions);
      expect(permControl?.value).toEqual([1, 2]);

      permissions = [1, 2, 3];
      permControl?.setValue(permissions);
      expect(permControl?.value).toEqual([1, 2, 3]);

      permissions = permissions.filter((p) => p !== 2);
      permControl?.setValue(permissions);
      expect(permControl?.value).toEqual([1, 3]);
    });

    it('should load permissions on role edit', () => {
      component.roleId = 1;
      const mockRole = {
        roleId: 1,
        roleName: 'Administrator',
        permissions: [1, 2, 3, 4],
      };

      roleServiceSpy.getById.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockRole);
          return { unsubscribe: () => {} };
        },
      } as any);

      permissionServiceSpy.getAll.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockPermissions);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(component.availablePermissions.length).toBe(4);
    });
  });
});
