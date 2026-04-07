using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using ElectionVoting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectionVoting.Infrastructure.Repositories;

public class VoterAttendanceRepository : Repository<VoterAttendance>, IVoterAttendanceRepository
{
    public VoterAttendanceRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<VoterAttendance>> GetByEmployeeAsync(int employeeId) =>
        await _context.VoterAttendances
            .Where(va => va.EmployeeId == employeeId)
            .Include(va => va.Employee)
            .Include(va => va.PollingStation)
            .ToListAsync();

    public async Task<IEnumerable<VoterAttendance>> GetByOrganizationAsync(int organizationId) =>
        await _context.VoterAttendances
            .Where(va => va.PollingStation.OrganizationId == organizationId)
            .Include(va => va.Employee)
            .Include(va => va.PollingStation)
            .ToListAsync();

    public async Task<IEnumerable<VoterAttendance>> GetByStationAsync(int pollingStationId) =>
        await _context.VoterAttendances
            .Where(va => va.PollingStationId == pollingStationId)
            .Include(va => va.Employee)
            .ToListAsync();
}
