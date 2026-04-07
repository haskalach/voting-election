import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeFormComponent } from './employee-form.component';
import { EmployeeService } from '../core/services/employee.service';

describe('EmployeeFormComponent', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;
  let employeeServiceSpy: jasmine.SpyObj<EmployeeService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const employeeServiceMock = jasmine.createSpyObj('EmployeeService', [
      'create',
      'update',
      'getById',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: EmployeeService, useValue: employeeServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    employeeServiceSpy = TestBed.inject(
      EmployeeService,
    ) as jasmine.SpyObj<EmployeeService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(EmployeeFormComponent);
    component = fixture.componentInstance;
  });

  describe('form validation', () => {
    it('should create employee form component', () => {
      expect(component).toBeTruthy();
    });

    it('should validate required fields', () => {
      const firstNameControl = component.employeeForm?.get('firstName');
      const lastNameControl = component.employeeForm?.get('lastName');
      const emailControl = component.employeeForm?.get('email');

      firstNameControl?.setValue('');
      lastNameControl?.setValue('');
      emailControl?.setValue('');

      expect(component.employeeForm?.valid).toBeFalsy();
    });

    it('should validate email format', () => {
      const emailControl = component.employeeForm?.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('valid@test.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });

    it('should enable submit button with valid form', () => {
      component.employeeForm?.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        roleId: 3,
      });

      fixture.detectChanges();
      expect(component.employeeForm?.valid).toBeTruthy();
    });
  });

  describe('employee creation', () => {
    it('should create new employee', () => {
      const createRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        roleId: 3,
      };

      employeeServiceSpy.create.and.returnValue({
        subscribe: (callback: any) => {
          callback({ employeeId: 1, ...createRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.employeeForm?.patchValue(createRequest);
      component.saveEmployee();

      expect(employeeServiceSpy.create).toHaveBeenCalled();
    });

    it('should navigate to employee list on successful creation', () => {
      employeeServiceSpy.create.and.returnValue({
        subscribe: (callback: any) => {
          callback({ employeeId: 1 });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.employeeForm?.patchValue({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        roleId: 3,
      });
      component.saveEmployee();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/employees']);
    });

    it('should display error message on creation failure', () => {
      employeeServiceSpy.create.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Email already exists' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.employeeForm?.patchValue({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        roleId: 3,
      });
      component.saveEmployee();

      expect(component.errorMessage).toBeTruthy();
    });
  });

  describe('employee update', () => {
    it('should update existing employee', () => {
      component.employeeId = 1;
      const updateRequest = {
        firstName: 'Jane',
        lastName: 'Updated',
        email: 'jane.updated@test.com',
        roleId: 3,
      };

      employeeServiceSpy.update.and.returnValue({
        subscribe: (callback: any) => {
          callback({ employeeId: 1, ...updateRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.employeeForm?.patchValue(updateRequest);
      component.saveEmployee();

      expect(employeeServiceSpy.update).toHaveBeenCalledWith(
        1,
        jasmine.any(Object),
      );
    });

    it('should load employee data for editing', () => {
      component.employeeId = 1;
      const mockEmployee = {
        employeeId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        role: 'Employee',
      };

      employeeServiceSpy.getById.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockEmployee);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(employeeServiceSpy.getById).toHaveBeenCalledWith(1);
    });
  });
});
