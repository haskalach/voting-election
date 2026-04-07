import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse, UserInfo } from '../models/models';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerSpyObj }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should send login request and store tokens', () => {
      const loginRequest: LoginRequest = {
        email: 'user@test.com',
        password: 'password123',
      };
      const mockResponse: LoginResponse = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_456',
        user: {
          id: 1,
          email: 'user@test.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'Employee',
        },
      };

      service.login(loginRequest).subscribe((response) => {
        expect(response.accessToken).toBe('access_token_123');
        expect(localStorage.getItem('access_token')).toBe('access_token_123');
        expect(localStorage.getItem('refresh_token')).toBe('refresh_token_456');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockResponse);
    });

    it('should update user signal on successful login', () => {
      const loginRequest: LoginRequest = {
        email: 'user@test.com',
        password: 'password123',
      };
      const userInfo: UserInfo = {
        id: 1,
        email: 'user@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'Manager',
      };
      const mockResponse: LoginResponse = {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        user: userInfo,
      };

      service.login(loginRequest).subscribe(() => {
        expect(service.user()).toEqual(userInfo);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear session data', () => {
      localStorage.setItem('access_token', 'token123');
      localStorage.setItem('refresh_token', 'refresh123');
      localStorage.setItem('user_info', '{"id":1,"email":"test@test.com"}');

      service.logout();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      req.flush({});

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user_info')).toBeNull();
    });

    it('should clear session on logout error', () => {
      localStorage.setItem('access_token', 'token123');

      service.logout();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      req.error(new ProgressEvent('error'));

      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('role checks', () => {
    it('should identify SystemOwner role', (done) => {
      const loginRequest: LoginRequest = {
        email: 'owner@test.com',
        password: 'password',
      };
      const mockResponse: LoginResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: {
          id: 1,
          email: 'owner@test.com',
          firstName: 'System',
          lastName: 'Owner',
          role: 'SystemOwner',
        },
      };

      service.login(loginRequest).subscribe(() => {
        expect(service.isSystemOwner()).toBe(true);
        expect(service.isManager()).toBe(false);
        expect(service.isEmployee()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);
    });

    it('should identify Manager role', (done) => {
      const loginRequest: LoginRequest = {
        email: 'manager@test.com',
        password: 'password',
      };
      const mockResponse: LoginResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: {
          id: 2,
          email: 'manager@test.com',
          firstName: 'Local',
          lastName: 'Manager',
          role: 'Manager',
        },
      };

      service.login(loginRequest).subscribe(() => {
        expect(service.isSystemOwner()).toBe(false);
        expect(service.isManager()).toBe(true);
        expect(service.isEmployee()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);
    });

    it('should identify Employee role', (done) => {
      const loginRequest: LoginRequest = {
        email: 'employee@test.com',
        password: 'password',
      };
      const mockResponse: LoginResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: {
          id: 3,
          email: 'employee@test.com',
          firstName: 'Data',
          lastName: 'Entry',
          role: 'Employee',
        },
      };

      service.login(loginRequest).subscribe(() => {
        expect(service.isSystemOwner()).toBe(false);
        expect(service.isManager()).toBe(false);
        expect(service.isEmployee()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when user is logged in', (done) => {
      const loginRequest: LoginRequest = {
        email: 'user@test.com',
        password: 'password',
      };
      const mockResponse: LoginResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: {
          id: 1,
          email: 'user@test.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'Employee',
        },
      };

      service.login(loginRequest).subscribe(() => {
        expect(service.isLoggedIn()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);
    });

    it('should return false when user is not logged in', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });
});
