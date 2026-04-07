export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SystemOwner' | 'Manager' | 'Employee';
  organizationId: number | null;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface Organization {
  organizationId: number;
  organizationName: string;
  partyName: string;
  contactEmail: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  employeeCount: number;
}

export interface OrganizationSummary {
  organizationId: number;
  organizationName: string;
  partyName: string;
  isActive: boolean;
  employeeCount: number;
}

export interface CreateOrganization {
  organizationName: string;
  partyName: string;
  contactEmail: string;
  address: string;
}

export interface Employee {
  employeeId: number;
  organizationId: number;
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  isActive: boolean;
  createdAt: string;
  lastActivityAt: string | null;
}

export interface EmployeeSummary {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export interface CreateEmployee {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
}

export interface UpdateEmployee extends CreateEmployee {
  isActive: boolean;
}

export interface PollingStation {
  pollingStationId: number;
  organizationId: number;
  stationName: string;
  location: string;
  address: string;
  capacity: number;
  createdAt: string;
}

export interface LogVoterAttendance {
  pollingStationId: number;
  voterCount: number;
  notes: string;
}

export interface VoterAttendanceRecord {
  attendanceId: number;
  employeeId: number;
  employeeName: string;
  pollingStationId: number;
  stationName: string;
  voterCount: number;
  notes: string;
  isVerified: boolean;
  recordedAt: string;
}

export interface LogVoteCount {
  pollingStationId: number;
  candidateName: string;
  votes: number;
}

export interface VoteCountRecord {
  voteCountId: number;
  employeeId: number;
  employeeName: string;
  pollingStationId: number;
  stationName: string;
  candidateName: string;
  votes: number;
  isVerified: boolean;
  recordedAt: string;
}

export interface Dashboard {
  totalEmployees: number;
  activeEmployees: number;
  totalVotersLogged: number;
  totalVotesCounted: number;
  totalPollingStations: number;
  stationSummaries: StationSummary[];
  candidateTallies: CandidateTally[];
}

export interface StationSummary {
  pollingStationId: number;
  stationName: string;
  totalVoters: number;
  totalVotes: number;
}

export interface CandidateTally {
  candidateName: string;
  totalVotes: number;
  percentage: number;
}

export interface ApiError {
  message: string;
}
