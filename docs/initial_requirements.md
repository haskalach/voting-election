# Initial Requirements - Election Voting Supervision App

## Project Overview

**Project Name:** Election-Voting Supervision System  
**Purpose:** Controlling and supervising voting processes in Lebanon with multi-party involvement  
**Urgency:** 2 sprints for normal developers, or 3 days for 1 AI-assisted developer

## Problem Statement

Lebanon's voting process requires coordination between multiple political parties. Each party has representative individuals who need to:

- Ensure voter turnout and assist elderly voters
- Track voter attendance
- Count and record votes for each candidate
- Centralize data collection across all supervisory staff

## Stakeholders

- **Primary Stakeholder:** Project Owner (System Administrator)
- **Secondary Stakeholders:** Lebanese Political Parties (al kataeb, harakit amal, etc.)
- **End Users:**
  - Organization Managers (party representatives)
  - On-ground Supervisory Employees

## Target Users

- Normal users with varying technical proficiency
- Political party representatives and their staff
- Election supervisors at polling locations

## Key Requirements (Gathered)

### User Hierarchy

1. **Project Owner** - System-wide admin access
   - Create and manage organizations
   - View all system data
2. **Organization Owner** - Party/Organization admin
   - Manage employees within their organization
   - View all data from their employees
3. **On-Ground Employees** - Field supervisors
   - Log voting data at polling stations
   - Submit attendance and vote count records

### Core Features Required

1. Authentication & Authorization
   - Secure login system for all user types
   - Role-based access control (RBAC)
2. Organization Management
   - Create and manage organizations
   - Assign organization managers
3. Employee Management
   - Create and manage employees under organizations
   - Assign permissions and roles
4. Data Logging
   - On-ground employees can log voting data
   - Track voter attendance
   - Record vote counts per candidate
5. Data Visualization & Reporting
   - View aggregated data across employees
   - Generate reports by organization
   - Display vote counts and statistics

## Technical Constraints

- **Frontend:** Angular
- **Backend:** .NET Core with Model-First Database Approach
- **Database:** SQL Server (implied by Model-First approach)

## Success Criteria

1. **Usability:** Intuitive UI easily understood by non-technical users
2. **Visual Design:** Professional and visually appealing interface
3. **Data Integrity:** Robust data validation and control mechanisms
4. **Performance:** Fast response times
5. **Security:** Secure authentication and data protection

## Initial Questions for Clarification

- How many organizations (parties) will be created initially?
- What is the expected number of employees per organization?
- Are there specific dashboards or reports required?
- Should the system support multiple polling stations?
- Are there audit/logging requirements for data changes?
