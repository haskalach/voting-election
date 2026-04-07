import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  describe('form validation', () => {
    it('should create login component', () => {
      expect(component).toBeTruthy();
    });

    it('should have invalid form with empty fields', () => {
      const emailControl = component.loginForm?.get('email');
      const passwordControl = component.loginForm?.get('password');

      emailControl?.setValue('');
      passwordControl?.setValue('');

      expect(component.loginForm?.valid).toBeFalsy();
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm?.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('valid@test.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });

    it('should require password', () => {
      const passwordControl = component.loginForm?.get('password');

      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBeTruthy();

      passwordControl?.setValue('password123');
      expect(passwordControl?.hasError('required')).toBeFalsy();
    });

    it('should enable submit button with valid form', () => {
      component.loginForm?.patchValue({
        email: 'user@test.com',
        password: 'password123',
      });

      fixture.detectChanges();
      expect(component.loginForm?.valid).toBeTruthy();
    });
  });

  describe('login submission', () => {
    it('should submit login request with form values', () => {
      const loginRequest = { email: 'user@test.com', password: 'password123' };
      const mockResponse = {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        user: {
          id: 1,
          email: 'user@test.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'Employee',
        },
      };

      authServiceSpy.login.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockResponse);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.loginForm?.patchValue(loginRequest);
      component.login();

      expect(authServiceSpy.login).toHaveBeenCalledWith(
        jasmine.objectContaining(loginRequest),
      );
    });

    it('should navigate to dashboard on successful login', () => {
      const loginRequest = { email: 'user@test.com', password: 'password123' };

      authServiceSpy.login.and.returnValue({
        subscribe: (callback: any) => {
          callback({});
          return { unsubscribe: () => {} };
        },
      } as any);

      component.loginForm?.patchValue(loginRequest);
      component.login();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should display error message on login failure', () => {
      const loginRequest = { email: 'user@test.com', password: 'wrong' };

      authServiceSpy.login.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Invalid credentials' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.loginForm?.patchValue(loginRequest);
      component.login();

      expect(component.errorMessage).toBeTruthy();
    });

    it('should disable submit button during login', (done) => {
      const loginRequest = { email: 'user@test.com', password: 'password123' };

      authServiceSpy.login.and.returnValue({
        subscribe: (callback: any) => {
          expect(component.isLoading).toBe(true);
          callback({});
          done();
          return { unsubscribe: () => {} };
        },
      } as any);

      component.loginForm?.patchValue(loginRequest);
      component.login();
    });
  });
});
