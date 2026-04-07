using ElectionVoting.Domain.Entities;

namespace ElectionVoting.Domain.Interfaces;

public interface IVoterAttendanceRepository : IRepository<VoterAttendance>
{
    Task<IEnumerable<VoterAttendance>> GetByEmployeeAsync(int employeeId);
    Task<IEnumerable<VoterAttendance>> GetByOrganizationAsync(int organizationId);
    Task<IEnumerable<VoterAttendance>> GetByStationAsync(int pollingStationId);
}
