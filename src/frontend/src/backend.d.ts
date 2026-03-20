import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Candidate {
    voteCount: bigint;
    candidateName: string;
    candidateId: string;
}
export interface Voter {
    status: VoterStatus;
    voterId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VoterStatus {
    voted = "voted",
    notVoted = "notVoted"
}
export interface backendInterface {
    addVoter(voterId: string): Promise<void>;
    adminLogin(): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    castVote(voterId: string, candidateId: string): Promise<void>;
    deleteVoter(voterId: string): Promise<void>;
    getAllVoters(): Promise<Array<Voter>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVoteResults(): Promise<Array<Candidate>>;
    isCallerAdmin(): Promise<boolean>;
    loginVoter(voterId: string): Promise<Voter>;
    resetVoterStatus(voterId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
