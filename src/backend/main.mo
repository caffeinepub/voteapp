import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Type Definitions
  type Voter = {
    voterId : Text;
    status : VoterStatus;
  };

  type Candidate = {
    candidateId : Text;
    candidateName : Text;
    voteCount : Nat;
  };

  type Vote = {
    voteId : Text;
    voterId : Text;
    candidateId : Text;
    timestamp : Int;
  };

  type VoterStatus = {
    #notVoted;
    #voted;
  };

  module Voter {
    public func toText(voter : Voter) : Text {
      voter.voterId;
    };

    public func compare(voter1 : Voter, voter2 : Voter) : Order.Order {
      Text.compare(voter1.voterId, voter2.voterId);
    };
  };

  module Candidate {
    public func compare(candidate1 : Candidate, candidate2 : Candidate) : Order.Order {
      switch (Text.compare(candidate1.candidateId, candidate2.candidateId)) {
        case (#equal) { Text.compare(candidate1.candidateName, candidate2.candidateName) };
        case (order) { order };
      };
    };

    public func compareByVotes(candidate1 : Candidate, candidate2 : Candidate) : Order.Order {
      Nat.compare(candidate2.voteCount, candidate1.voteCount);
    };
  };

  module Vote {
    public func toText(vote : Vote) : Text {
      vote.voteId;
    };

    public func compare(vote1 : Vote, vote2 : Vote) : Order.Order {
      Text.compare(vote1.voteId, vote2.voteId);
    };
  };

  // Persistent Storage
  let voterEntries : Map.Map<Text, Voter> = Map.fromIter<Text, Voter>(
    [
      (
        "VOTER001",
        {
          voterId = "VOTER001";
          status = #notVoted;
        },
      ),
      (
        "VOTER002",
        {
          voterId = "VOTER002";
          status = #notVoted;
        },
      ),
      (
        "VOTER003",
        {
          voterId = "VOTER003";
          status = #notVoted;
        },
      ),
      (
        "VOTER004",
        {
          voterId = "VOTER004";
          status = #notVoted;
        },
      ),
      (
        "VOTER005",
        {
          voterId = "VOTER005";
          status = #notVoted;
        },
      ),
    ].values(),
  );

  let candidateEntries : Map.Map<Text, Candidate> = Map.fromIter<Text, Candidate>(
    [
      (
        "C001",
        {
          candidateId = "C001";
          candidateName = "Alice Johnson";
          voteCount = 0;
        },
      ),
      (
        "C002",
        {
          candidateId = "C002";
          candidateName = "Bob Martinez";
          voteCount = 0;
        },
      ),
      (
        "C003",
        {
          candidateId = "C003";
          candidateName = "Carol Chen";
          voteCount = 0;
        },
      ),
    ].values(),
  );

  let votes = Map.empty<Text, Vote>();

  // Voter APIs - Require user role
  public query ({ caller }) func loginVoter(voterId : Text) : async Voter {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can login as voters");
    };
    switch (voterEntries.get(voterId)) {
      case (null) { Runtime.trap("Voter not found") };
      case (?voter) {
        switch (voter.status) {
          case (#voted) { Runtime.trap("Voter already voted") };
          case (#notVoted) { voter };
        };
      };
    };
  };

  public shared ({ caller }) func castVote(voterId : Text, candidateId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cast votes");
    };
    switch (voterEntries.get(voterId)) {
      case (null) { Runtime.trap("Voter not found") };
      case (?voter) {
        switch (voter.status) {
          case (#voted) {
            Runtime.trap("Voter already voted");
          };
          case (#notVoted) {
            switch (candidateEntries.get(candidateId)) {
              case (null) { Runtime.trap("Candidate not found") };
              case (?candidate) {
                let newVote : Vote = {
                  voteId = voterId # "_" # candidateId;
                  voterId;
                  candidateId;
                  timestamp = Time.now();
                };
                votes.add(newVote.voteId, newVote);
                let updatedCandidate : Candidate = updateVoteCount(candidate);
                let updatedVoter : Voter = { voter with status = #voted };
                candidateEntries.add(candidateId, updatedCandidate);
                voterEntries.add(voterId, updatedVoter);
              };
            };
          };
        };
      };
    };
  };

  // Helper function to update candidate vote count using persistent state
  func updateVoteCount(candidate : Candidate) : Candidate {
    { candidate with voteCount = candidate.voteCount + 1 };
  };

  // Admin APIs - Require admin role
  public shared ({ caller }) func adminLogin() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform admin login");
    };
    // Admin login successful - caller has admin role
  };

  public query ({ caller }) func getVoteResults() : async [Candidate] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view vote results");
    };
    candidateEntries.values().toArray().sort(Candidate.compareByVotes);
  };

  public query ({ caller }) func getAllVoters() : async [Voter] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all voters");
    };
    voterEntries.values().toArray().sort();
  };

  public shared ({ caller }) func addVoter(voterId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add voters");
    };
    if (voterEntries.containsKey(voterId)) {
      Runtime.trap("Voter already exists");
    };
    let newVoter : Voter = { voterId; status = #notVoted };
    voterEntries.add(voterId, newVoter);
  };

  public shared ({ caller }) func deleteVoter(voterId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete voters");
    };
    if (not voterEntries.containsKey(voterId)) {
      Runtime.trap("Voter not found");
    };
    voterEntries.remove(voterId);
  };

  public shared ({ caller }) func resetVoterStatus(voterId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reset voter status");
    };
    switch (getVoterPersistent(voterId)) {
      case (null) { Runtime.trap("Voter not found") };
      case (?voter) {
        if (findVoterVote(voterId) != null) {
          switch (findVoterVote(voterId)) {
            case (null) { () };
            case (?vote) {
              // Also decrement the candidate's vote count
              switch (candidateEntries.get(vote.candidateId)) {
                case (null) { () };
                case (?candidate) {
                  let updatedCandidate : Candidate = {
                    candidate with voteCount = if (candidate.voteCount > 0) {
                      candidate.voteCount - 1;
                    } else { 0 };
                  };
                  candidateEntries.add(vote.candidateId, updatedCandidate);
                };
              };
              votes.remove(vote.voteId);
            };
          };
        };
        let updatedVoter : Voter = { voter with status = #notVoted };
        voterEntries.add(voterId, updatedVoter);
      };
    };
  };

  // Helper Functions
  func getVoterPersistent(voterId : Text) : ?Voter {
    voterEntries.get(voterId);
  };

  func findVoterVote(voterId : Text) : ?Vote {
    votes.values().find(func(vote) { vote.voterId == voterId });
  };
};
