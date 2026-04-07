import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { environment } from '../../../../environments/environment';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeService],
    });

    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getByOrganization', () => {
    it('should fetch employees for organization', () => {
      const orgId = 1;
      const mockEmployees = [
        {
          employeeId: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          isActive: true,
          role: 'Employee',
        },
        {
          employeeId: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@test.com',
          isActive: true,
          role: 'Employee',
        },
      ];

      service.getByOrganization(orgId).subscribe((employees) => {
        expect(employees.length).toBe(2);
        expect(employees[0].firstName).toBe('John');
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/employees?organizationId=${orgId}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockEmployees);
    });

    it('should handle empty employee list', () => {
      const orgId = 1;

      service.getByOrganization(orgId).subscribe((employees) => {
        expect(employees.length).toBe(0);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/employees?organizationId=${orgId}`,
      );
      req.flush([]);
    });
  });

  describe('getById', () => {
    it('should fetch employee details by ID', () => {
      const employeeId = 1;
      const mockEmployee = {
        employeeId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        isActive: true,
        role: 'Manager',
      };

      service.getById(employeeId).subscribe((employee) => {
        expect(employee.firstName).toBe('John');
        expect(employee.role).toBe('Manager');
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/employees/${employeeId}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockEmployee);
    });

    it('should handle employee not found', () => {
      const invalidId = 999;

      service.getById(invalidId).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne(
        `${environment.apiUrl}/employees/${invalidId}`,
      );
      req.flush(
        { error: 'Employee not found' },
        { status: 404, statusText: 'Not Found' },
      );
    });
  });

  describe('create', () => {
    it('should create new employee', () => {
      const createRequest = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@test.com',
        roleId: 3,
      };
      const mockResponse = {
        employeeId: 3,
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@test.com',
        isActive: true,
        role: 'Employee',
      };

      service.create(createRequest).subscribe((employee) => {
        expect(employee.employeeId).toBe(3);
        expect(employee.firstName).toBe('Bob');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/employees`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.firstName).toBe('Bob');
      req.flush(mockResponse);
    });

    it('should validate required fields', () => {
      const invalidRequest = {
        firstName: '',
        lastName: 'Johnson',
        email: 'invalid-email',
        roleId: 3,
      };

      service.create(invalidRequest).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
        },
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/employees`);
      req.flush(
        { error: 'Validation failed' },
        { status: 400, statusText: 'Bad Request' },
      );
    });
  });

  describe('update', () => {
    it('should update employee details', () => {
      const employeeId = 1;
      const updateRequest = {
        firstName: 'John',
        lastName: 'Updated',
        email: 'john.updated@test.com',
      };
      const mockResponse = {
        employeeId: 1,
        firstName: 'John',
        lastName: 'Updated',
        email: 'john.updated@test.com',
        isActive: true,
        role: 'Employee',
      };

      service.update(employeeId, updateRequest).subscribe((employee) => {
        expect(employee.lastName).toBe('Updated');
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/employees/${employeeId}`,
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.lastName).toBe('Updated');
      req.flush(mockResponse);
    });

    it('should handle update with invalid employee ID', () => {
      const invalidId = 999;
      const updateRequest = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@test.com',
      };

      service.update(invalidId, updateRequest).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne(
        `${environment.apiUrl}/employees/${invalidId}`,
      );
      req.flush(
        { error: 'Employee not found' },
        { status: 404, statusText: 'Not Found' },
      );
    });
  });

  describe('delete', () => {
    it('should delete employee', () => {
      const employeeId = 1;

      service.delete(employeeId).subscribe(() => {
        expect(true).toBe(true);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/employees/${employeeId}`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle delete non-existent employee', () => {
      const invalidId = 999;

      service.delete(invalidId).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne(
        `${environment.apiUrl}/employees/${invalidId}`,
      );
      req.flush(
        { error: 'Employee not found' },
        { status: 404, statusText: 'Not Found' },
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate employee', () => {
      const employeeId = 1;
      const mockResponse = {
        employeeId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        isActive: false,
        role: 'Employee',
      };

      service.deactivate(employeeId).subscribe((employee) => {
        expect(employee.isActive).toBe(false);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/employees/${employeeId}/deactivate`,
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});
