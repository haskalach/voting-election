using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;

namespace ElectionVoting.Application.Services;

public class DataService : IDataService
{
    private readonly IVoterAttendanceRepository _attendanceRepo;
    private readonly IVoteCountRepository _voteCountRepo;
    private readonly IEmployeeRepository _employeeRepo;
    private readonly IPollingStationRepository _stationRepo;

    public DataService(
        IVoterAttendanceRepository attendanceRepo,
        IVoteCountRepository voteCountRepo,
        IEmployeeRepository employeeRepo,
        IPollingStationRepository stationRepo)
    {
        _attendanceRepo = attendanceRepo;
        _voteCountRepo = voteCountRepo;
        _employeeRepo = employeeRepo;
        _stationRepo = stationRepo;
    }

    public async Task<VoterAttendanceDto> LogAttendanceAsync(int employeeId, LogVoterAttendanceDto dto)
    {
        var employee = await _employeeRepo.GetWithOrganizationAsync(employeeId)
            ?? throw new KeyNotFoundException("Employee not found.");

        if (!employee.IsActive)
            throw new InvalidOperationException("Inactive employees cannot log attendance.");

        var station = await _stationRepo.GetByIdAsync(dto.PollingStationId)
            ?? throw new KeyNotFoundException("Polling station not found.");

        if (station.OrganizationId != employee.OrganizationId)
            throw new UnauthorizedAccessException("Station does not belong to employee's organization.");

        var record = new VoterAttendance
        {
            EmployeeId = employeeId,
            PollingStationId = dto.PollingStationId,
            VoterCount = dto.VoterCount,
            Notes = dto.Notes,
            RecordedAt = DateTime.UtcNow
        };

        await _attendanceRepo.AddAsync(record);

        employee.LastActivityAt = DateTime.UtcNow;
        await _employeeRepo.UpdateAsync(employee);
        await _attendanceRepo.SaveChangesAsync();

        return new VoterAttendanceDto(
            record.AttendanceId,
            employeeId,
            $"{employee.FirstName} {employee.LastName}",
            station.PollingStationId,
            station.StationName,
            record.VoterCount,
            record.Notes,
            record.IsVerified,
            record.RecordedAt);
    }

    public async Task<IEnumerable<VoterAttendanceDto>> GetAttendanceByEmployeeAsync(int employeeId)
    {
        var records = await _attendanceRepo.GetByEmployeeAsync(employeeId);
        return records.Select(r => new VoterAttendanceDto(
            r.AttendanceId,
            r.EmployeeId,
            $"{r.Employee.FirstName} {r.Employee.LastName}",
            r.PollingStationId,
            r.PollingStation.StationName,
            r.VoterCount,
            r.Notes,
            r.IsVerified,
            r.RecordedAt));
    }

    public async Task<IEnumerable<VoterAttendanceDto>> GetAttendanceByOrganizationAsync(int organizationId)
    {
        var records = await _attendanceRepo.GetByOrganizationAsync(organizationId);
        return records.Select(r => new VoterAttendanceDto(
            r.AttendanceId,
            r.EmployeeId,
            $"{r.Employee.FirstName} {r.Employee.LastName}",
            r.PollingStationId,
            r.PollingStation.StationName,
            r.VoterCount,
            r.Notes,
            r.IsVerified,
            r.RecordedAt));
    }

    public async Task<VoteCountDto> LogVoteCountAsync(int employeeId, LogVoteCountDto dto)
    {
        var employee = await _employeeRepo.GetWithOrganizationAsync(employeeId)
            ?? throw new KeyNotFoundException("Employee not found.");

        if (!employee.IsActive)
            throw new InvalidOperationException("Inactive employees cannot log vote counts.");

        var station = await _stationRepo.GetByIdAsync(dto.PollingStationId)
            ?? throw new KeyNotFoundException("Polling station not found.");

        if (station.OrganizationId != employee.OrganizationId)
            throw new UnauthorizedAccessException("Station does not belong to employee's organization.");

        var record = new VoteCount
        {
            EmployeeId = employeeId,
            PollingStationId = dto.PollingStationId,
            CandidateName = dto.CandidateName,
            Votes = dto.Votes,
            RecordedAt = DateTime.UtcNow
        };

        await _voteCountRepo.AddAsync(record);

        employee.LastActivityAt = DateTime.UtcNow;
        await _employeeRepo.UpdateAsync(employee);
        await _voteCountRepo.SaveChangesAsync();

        return new VoteCountDto(
            record.VoteCountId,
            employeeId,
            $"{employee.FirstName} {employee.LastName}",
            station.PollingStationId,
            station.StationName,
            record.CandidateName,
            record.Votes,
            record.IsVerified,
            record.RecordedAt);
    }

    public async Task<IEnumerable<VoteCountDto>> GetVoteCountsByEmployeeAsync(int employeeId)
    {
        var records = await _voteCountRepo.GetByEmployeeAsync(employeeId);
        return records.Select(r => new VoteCountDto(
            r.VoteCountId,
            r.EmployeeId,
            $"{r.Employee.FirstName} {r.Employee.LastName}",
            r.PollingStationId,
            r.PollingStation.StationName,
            r.CandidateName,
            r.Votes,
            r.IsVerified,
            r.RecordedAt));
    }

    public async Task<IEnumerable<VoteCountDto>> GetVoteCountsByOrganizationAsync(int organizationId)
    {
        var records = await _voteCountRepo.GetByOrganizationAsync(organizationId);
        return records.Select(r => new VoteCountDto(
            r.VoteCountId,
            r.EmployeeId,
            $"{r.Employee.FirstName} {r.Employee.LastName}",
            r.PollingStationId,
            r.PollingStation.StationName,
            r.CandidateName,
            r.Votes,
            r.IsVerified,
            r.RecordedAt));
    }
}
