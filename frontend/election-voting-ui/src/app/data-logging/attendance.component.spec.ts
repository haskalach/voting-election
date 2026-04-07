import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AttendanceComponent } from './attendance.component';
import { DataService } from '../core/services/data.service';

describe('AttendanceComponent', () => {
  let component: AttendanceComponent;
  let fixture: ComponentFixture<AttendanceComponent>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    const dataServiceMock = jasmine.createSpyObj('DataService', [
      'logAttendance',
      'getMyAttendance',
      'getPollingStations',
    ]);

    await TestBed.configureTestingModule({
      imports: [AttendanceComponent, ReactiveFormsModule, FormsModule],
      providers: [{ provide: DataService, useValue: dataServiceMock }],
    }).compileComponents();

    dataServiceSpy = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;

    fixture = TestBed.createComponent(AttendanceComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create attendance component', () => {
      expect(component).toBeTruthy();
    });

    it('should load polling stations on init', () => {
      const mockStations = [
        {
          pollingStationId: 1,
          stationName: 'Station 1',
          location: 'Downtown',
          capacity: 500,
        },
        {
          pollingStationId: 2,
          stationName: 'Station 2',
          location: 'Uptown',
          capacity: 300,
        },
      ];

      dataServiceSpy.getPollingStations.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockStations);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(dataServiceSpy.getPollingStations).toHaveBeenCalled();
      expect(component.stations).toEqual(mockStations);
    });

    it('should load user attendance records', () => {
      const mockAttendance = [
        {
          attendanceId: 1,
          voterCount: 150,
          recordedAt: new Date().toISOString(),
          stationName: 'Station 1',
        },
      ];

      dataServiceSpy.getMyAttendance.and.returnValue({
        subscribe: (callback: any) => {
          callback(mockAttendance);
          return { unsubscribe: () => {} };
        },
      } as any);

      component.ngOnInit();

      expect(dataServiceSpy.getMyAttendance).toHaveBeenCalled();
    });
  });

  describe('form validation', () => {
    it('should have invalid form with empty fields', () => {
      const stationControl = component.attendanceForm?.get('stationId');
      const voterCountControl = component.attendanceForm?.get('voterCount');

      stationControl?.setValue('');
      voterCountControl?.setValue('');

      expect(component.attendanceForm?.valid).toBeFalsy();
    });

    it('should validate positive voter count', () => {
      const voterCountControl = component.attendanceForm?.get('voterCount');

      voterCountControl?.setValue(-10);
      expect(voterCountControl?.hasError('min')).toBeTruthy();

      voterCountControl?.setValue(100);
      expect(voterCountControl?.hasError('min')).toBeFalsy();
    });

    it('should require station selection', () => {
      const stationControl = component.attendanceForm?.get('stationId');

      stationControl?.setValue('');
      expect(stationControl?.hasError('required')).toBeTruthy();

      stationControl?.setValue(1);
      expect(stationControl?.hasError('required')).toBeFalsy();
    });

    it('should enable submit button with valid form', () => {
      component.attendanceForm?.patchValue({
        stationId: 1,
        voterCount: 150,
        notes: 'Morning session',
      });

      fixture.detectChanges();
      expect(component.attendanceForm?.valid).toBeTruthy();
    });
  });

  describe('attendance logging', () => {
    it('should submit attendance record', () => {
      const logRequest = {
        stationId: 1,
        voterCount: 150,
        notes: 'Morning session',
      };

      dataServiceSpy.logAttendance.and.returnValue({
        subscribe: (callback: any) => {
          callback({ attendanceId: 1, ...logRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.attendanceForm?.patchValue(logRequest);
      component.logAttendance();

      expect(dataServiceSpy.logAttendance).toHaveBeenCalled();
    });

    it('should show success message after logging', () => {
      const logRequest = {
        stationId: 1,
        voterCount: 150,
        notes: 'Morning session',
      };

      dataServiceSpy.logAttendance.and.returnValue({
        subscribe: (callback: any) => {
          callback({ attendanceId: 1, ...logRequest });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.attendanceForm?.patchValue(logRequest);
      component.logAttendance();

      expect(component.successMessage).toBeTruthy();
    });

    it('should clear form after successful submission', () => {
      dataServiceSpy.logAttendance.and.returnValue({
        subscribe: (callback: any) => {
          callback({ attendanceId: 1, voterCount: 150 });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.attendanceForm?.patchValue({
        stationId: 1,
        voterCount: 150,
        notes: 'Test',
      });
      component.logAttendance();

      expect(component.attendanceForm?.get('voterCount')?.value).toBe('');
    });

    it('should display error message on submission failure', () => {
      dataServiceSpy.logAttendance.and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          errorCallback({ error: { message: 'Failed to log attendance' } });
          return { unsubscribe: () => {} };
        },
      } as any);

      component.attendanceForm?.patchValue({
        stationId: 1,
        voterCount: 150,
        notes: 'Test',
      });
      component.logAttendance();

      expect(component.errorMessage).toBeTruthy();
    });
  });

  describe('attendance records display', () => {
    it('should display user attendance history', () => {
      component.attendanceRecords = [
        {
          attendanceId: 1,
          voterCount: 150,
          recordedAt: new Date().toISOString(),
          stationName: 'Station 1',
        },
        {
          attendanceId: 2,
          voterCount: 200,
          recordedAt: new Date().toISOString(),
          stationName: 'Station 1',
        },
      ];

      fixture.detectChanges();

      expect(component.attendanceRecords.length).toBe(2);
      expect(component.attendanceRecords[0].voterCount).toBe(150);
    });

    it('should calculate total voters logged', () => {
      component.attendanceRecords = [
        { attendanceId: 1, voterCount: 150, recordedAt: '', stationName: 'S1' },
        { attendanceId: 2, voterCount: 200, recordedAt: '', stationName: 'S1' },
        { attendanceId: 3, voterCount: 100, recordedAt: '', stationName: 'S1' },
      ];

      const total = component.attendanceRecords.reduce(
        (sum, r) => sum + r.voterCount,
        0,
      );

      expect(total).toBe(450);
    });
  });
});
