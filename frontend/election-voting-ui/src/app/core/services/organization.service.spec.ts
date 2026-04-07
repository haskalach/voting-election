import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { OrganizationService } from './organization.service';
import { environment } from '../../../../environments/environment';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrganizationService],
    });

    service = TestBed.inject(OrganizationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('should fetch all organizations', () => {
      const mockOrganizations = [
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

      service.getAll().subscribe((orgs) => {
        expect(orgs.length).toBe(2);
        expect(orgs[0].organizationName).toBe('Election Board - Region 1');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/organizations`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrganizations);
    });

    it('should handle empty organization list', () => {
      service.getAll().subscribe((orgs) => {
        expect(orgs.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/organizations`);
      req.flush([]);
    });
  });

  describe('getById', () => {
    it('should fetch organization details', () => {
      const orgId = 1;
      const mockOrg = {
        organizationId: 1,
        organizationName: 'Election Board - Region 1',
        registrationNumber: 'EB-001',
        isActive: true,
        employeeCount: 50,
        pollingStationCount: 8,
      };

      service.getById(orgId).subscribe((org) => {
        expect(org.organizationName).toBe('Election Board - Region 1');
        expect(org.employeeCount).toBe(50);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/organizations/${orgId}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockOrg);
    });

    it('should handle organization not found', () => {
      const invalidId = 999;

      service.getById(invalidId).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne(
        `${environment.apiUrl}/organizations/${invalidId}`,
      );
      req.flush(
        { error: 'Organization not found' },
        { status: 404, statusText: 'Not Found' },
      );
    });
  });

  describe('create', () => {
    it('should create new organization', () => {
      const createRequest = {
        organizationName: 'Election Board - Region 3',
        registrationNumber: 'EB-003',
      };
      const mockResponse = {
        organizationId: 3,
        organizationName: 'Election Board - Region 3',
        registrationNumber: 'EB-003',
        isActive: true,
      };

      service.create(createRequest).subscribe((org) => {
        expect(org.organizationId).toBe(3);
        expect(org.organizationName).toBe('Election Board - Region 3');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/organizations`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.registrationNumber).toBe('EB-003');
      req.flush(mockResponse);
    });

    it('should validate duplicate registration numbers', () => {
      const invalidRequest = {
        organizationName: 'Duplicate Org',
        registrationNumber: 'EB-001', // Already exists
      };

      service.create(invalidRequest).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(409);
        },
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/organizations`);
      req.flush(
        { error: 'Registration number already exists' },
        { status: 409, statusText: 'Conflict' },
      );
    });
  });

  describe('update', () => {
    it('should update organization details', () => {
      const orgId = 1;
      const updateRequest = {
        organizationName: 'Updated Election Board - Region 1',
        registrationNumber: 'EB-001-UPDATED',
      };
      const mockResponse = {
        organizationId: 1,
        organizationName: 'Updated Election Board - Region 1',
        registrationNumber: 'EB-001-UPDATED',
        isActive: true,
      };

      service.update(orgId, updateRequest).subscribe((org) => {
        expect(org.organizationName).toBe('Updated Election Board - Region 1');
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/organizations/${orgId}`,
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.organizationName).toContain('Updated');
      req.flush(mockResponse);
    });

    it('should handle update with invalid organization ID', () => {
      const invalidId = 999;
      const updateRequest = {
        organizationName: 'Updated Name',
        registrationNumber: 'EB-999',
      };

      service.update(invalidId, updateRequest).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne(
        `${environment.apiUrl}/organizations/${invalidId}`,
      );
      req.flush(
        { error: 'Organization not found' },
        { status: 404, statusText: 'Not Found' },
      );
    });
  });

  describe('delete', () => {
    it('should delete organization', () => {
      const orgId = 1;

      service.delete(orgId).subscribe(() => {
        expect(true).toBe(true);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/organizations/${orgId}`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle delete non-existent organization', () => {
      const invalidId = 999;

      service.delete(invalidId).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        },
      );

      const req = httpMock.expectOne(
        `${environment.apiUrl}/organizations/${invalidId}`,
      );
      req.flush(
        { error: 'Organization not found' },
        { status: 404, statusText: 'Not Found' },
      );
    });
  });

  describe('organization validation', () => {
    it('should require organization name', () => {
      const invalidRequest = {
        organizationName: '',
        registrationNumber: 'EB-004',
      };

      service.create(invalidRequest).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
        },
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/organizations`);
      req.flush(
        { error: 'Organization name is required' },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('should require registration number', () => {
      const invalidRequest = {
        organizationName: 'Test Organization',
        registrationNumber: '',
      };

      service.create(invalidRequest).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
        },
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/organizations`);
      req.flush(
        { error: 'Registration number is required' },
        { status: 400, statusText: 'Bad Request' },
      );
    });
  });
});
