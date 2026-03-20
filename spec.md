# VoteApp

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Voter login screen: enter a unique Voter ID (e.g. VOTER001) to authenticate
- Voting screen: list of candidates with name, photo placeholder, and a Vote button
- One-vote restriction: if voter has already voted, show "You have already voted."
- Vote confirmation: after submitting, show "Your vote has been successfully submitted."
- Admin login screen: separate username/password login for admin
- Admin dashboard: live vote counts per candidate
- Admin voter management: add voter IDs, delete voter IDs, reset a voter's status to Not Voted
- Admin candidate management: view all candidates and their current vote counts

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan

### Backend (Motoko)

**Data models:**
- Voter: { voter_id: Text, status: #NotVoted | #Voted }
- Candidate: { candidate_id: Text, candidate_name: Text, vote_count: Nat }
- Vote: { vote_id: Text, voter_id: Text, candidate_id: Text, timestamp: Int }

**Voter-facing APIs:**
- `loginVoter(voter_id: Text)` -> returns voter record or error (not found / already voted)
- `castVote(voter_id: Text, candidate_id: Text)` -> records vote, increments count, marks voter as Voted; error if already voted

**Admin-facing APIs:**
- `adminLogin(username: Text, password: Text)` -> returns session token or error
- `getVoteResults()` -> returns all candidates with vote counts (admin only)
- `getAllVoters()` -> returns full voter list with statuses (admin only)
- `addVoter(voter_id: Text)` -> adds a new voter ID
- `deleteVoter(voter_id: Text)` -> removes a voter ID
- `resetVoterStatus(voter_id: Text)` -> resets voter status to NotVoted

**Seed data:**
- Voters: VOTER001, VOTER002, VOTER003, VOTER004, VOTER005 (all NotVoted)
- Candidates: 3 sample candidates with names
- Admin credentials: username "admin", password "admin123"

### Frontend (React + TypeScript)

**Pages/Views:**
1. Home/Entry: choose "Voter Login" or "Admin Login"
2. Voter Login: input field for Voter ID, submit button
3. Voting Screen: candidate cards with name, avatar placeholder, Vote button
4. Vote Success: confirmation message
5. Already Voted: error/notice screen
6. Admin Login: username + password form
7. Admin Dashboard tabs:
   - Results tab: live candidate vote counts with bar/progress indicators
   - Voters tab: list of all voters with status badges, add/delete/reset actions

**Security:**
- Vote counts only shown in admin dashboard
- Voter screen shows no counts or results
- Admin session stored in component state (not persisted to avoid leaks)
