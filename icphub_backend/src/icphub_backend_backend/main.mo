import Types "./types";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Nat32 "mo:base/Nat32";
import Blob "mo:base/Blob";
import Principal "mo:base/Principal";

actor {

  stable var repositories : [Types.Repository] = [];
  stable var proposals : [Types.Proposal] = [];

  func isAuthorized(caller: Principal, repo: Types.Repository) : Bool {
    if (repo.owner == caller) return true;
    for (collab in repo.collaborators.vals()) {
      if (collab == caller) return true;
    };
    return false;
  };

  public query func hello(name : Text) : async Text {
    return "Welcome to ICPHub, " # name # "!";
  };

  // ========== 🧱 REPOSITORY MANAGEMENT ==========

  public shared ({ caller }) func createRepository(
    name: Text,
    description: ?Text,
    isPrivate: Bool
  ) : async Text {
    let now = Time.now();
    let id = name # "_" # Nat.toText(Int.abs(now));

    let defaultBranch: Types.Branch = {
      name = "main";
      commits = [];
    };

    let newRepo: Types.Repository = {
      id = id;
      name = name;
      description = description;
      owner = caller;
      collaborators = [];
      isPrivate = isPrivate;
      createdAt = now;
      updatedAt = now;
      files = [];
      commits = [];
      branches = [defaultBranch];
      currentBranch = "main";
      chainMetadata = [];
    };

    repositories := Array.append(repositories, [newRepo]);
    return id;
  };

  public shared ({ caller }) func deleteRepository(id: Text) : async Text {
    var deleted = false;
    let filtered = Array.filter<Types.Repository>(
      repositories,
      func(repo) {
        if (repo.id == id and repo.owner == caller) {
          deleted := true;
          false
        } else true
      }
    );

    if (deleted) {
      repositories := filtered;
      return "Repository deleted.";
    };
    return "Error: Unauthorized or not found.";
  };

  public query func getRepository(id: Text) : async ?Types.Repository {
    for (repo in repositories.vals()) {
      if (repo.id == id) return ?repo;
    };
    return null;
  };

  public shared query ({ caller }) func getUserRepositories() : async [Types.Repository] {
    Array.filter<Types.Repository>(repositories, func(repo) { repo.owner == caller })
  };

  public shared query ({ caller }) func getCollaboratorRepositories() : async [Types.Repository] {
    Array.filter<Types.Repository>(
      repositories,
      func(repo) {
        Array.find<Principal>(repo.collaborators, func(p) { p == caller }) != null
      }
    )
  };

  // ========== 👥 COLLABORATORS ==========

  public shared ({ caller }) func addCollaborator(repositoryId: Text, newCollaborator: Principal) : async Text {
    var updated = false;
    repositories := Array.map<Types.Repository, Types.Repository>(
      repositories,
      func(repo) {
        if (repo.id == repositoryId and repo.owner == caller) {
          if (Array.find<Principal>(repo.collaborators, func(p) { p == newCollaborator }) == null) {
            updated := true;
            {
              repo with
              collaborators = Array.append(repo.collaborators, [newCollaborator]);
              updatedAt = Time.now();
            }
          } else repo
        } else repo
      }
    );
    if (updated) return "Collaborator added.";
    return "Error: Unauthorized or already exists.";
  };

  // ========== 📁 FILE MANAGEMENT ==========

  public shared ({ caller }) func uploadFile(repositoryId: Text, path: Text, content: Blob) : async Text {
    let hash = Nat32.toNat(Text.hash(path));
    let timestamp = Time.now();
    var updated = false;
    var duplicate = false;

    repositories := Array.map<Types.Repository, Types.Repository>(
      repositories,
      func(repo) {
        if (repo.id == repositoryId) {
          if (not isAuthorized(caller, repo)) return repo;

          if (Array.find<Types.FileEntry>(repo.files, func(f) { f.path == path }) != null) {
            duplicate := true;
            return repo;
          };

          let file: Types.FileEntry = {
            path = path;
            content = content;
            hash = Nat.toText(hash);
            lastModified = timestamp;
          };

          updated := true;
          {
            repo with
            files = Array.append(repo.files, [file]);
            updatedAt = timestamp;
          };
        } else repo
      }
    );

    if (duplicate) return "Error: File already exists.";
    if (updated) return "File uploaded.";
    return "Unauthorized or repository not found.";
  };

  public shared ({ caller }) func deleteFile(repositoryId: Text, path: Text) : async Text {
    var deleted = false;
    let now = Time.now();

    repositories := Array.map<Types.Repository, Types.Repository>(
      repositories,
      func(repo) {
        if (repo.id == repositoryId and isAuthorized(caller, repo)) {
          let filtered = Array.filter<Types.FileEntry>(
            repo.files,
            func(file) {
              if (file.path == path) {
                deleted := true; false
              } else true
            }
          );

          {
            repo with
            files = filtered;
            updatedAt = now;
          };
        } else repo
      }
    );

    if (deleted) return "File deleted.";
    return "Unauthorized or file not found.";
  };

  public shared query ({ caller }) func listFiles(repositoryId: Text) : async [Text] {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId and (not repo.isPrivate or isAuthorized(caller, repo))) {
        return Array.map<Types.FileEntry, Text>(repo.files, func(f) { f.path });
      };
    };
    return [];
  };

  public shared query ({ caller }) func getFile(repositoryId: Text, path: Text) : async ?Types.FileEntry {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId and (not repo.isPrivate or isAuthorized(caller, repo))) {
        for (file in repo.files.vals()) {
          if (file.path == path) return ?file;
        }
      }
    };
    return null;
  };

  // ========== ✅ COMMITS ==========

  public shared ({ caller }) func commitChanges(repositoryId: Text, message: Text) : async Text {
    let now = Time.now();
    let commitId = "commit_" # Nat.toText(Int.abs(now));
    var success = false;

    repositories := Array.map<Types.Repository, Types.Repository>(
      repositories,
      func(repo) {
        if (repo.id == repositoryId and isAuthorized(caller, repo)) {
          let newCommit: Types.Commit = {
            id = commitId;
            message = message;
            timestamp = now;
            files = repo.files;
          };

          let updatedBranches = Array.map<Types.Branch, Types.Branch>(
            repo.branches,
            func(branch) {
              if (branch.name == repo.currentBranch) {
                { branch with commits = Array.append(branch.commits, [newCommit]) }
              } else branch
            }
          );

          success := true;
          {
            repo with
            branches = updatedBranches;
            commits = Array.append(repo.commits, [newCommit]);
            updatedAt = now;
          };
        } else repo
      }
    );

    if (success) return "Commit created: " # commitId;
    return "Unauthorized or repo not found.";
  };

  public shared query ({ caller }) func listCommits(repositoryId: Text) : async [Types.Commit] {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId and (not repo.isPrivate or isAuthorized(caller, repo))) {
        return repo.commits;
      };
    };
    return [];
  };

  public shared query ({ caller }) func getCommit(repositoryId: Text, commitId: Text) : async ?Types.Commit {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId and (not repo.isPrivate or isAuthorized(caller, repo))) {
        for (commit in repo.commits.vals()) {
          if (commit.id == commitId) return ?commit;
        }
      }
    };
    return null;
  };

  public shared query ({ caller }) func getCommitFileContent(repositoryId: Text, commitId: Text, filePath: Text) : async ?Types.FileEntry {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId and isAuthorized(caller, repo)) {
        for (commit in repo.commits.vals()) {
          if (commit.id == commitId) {
            for (file in commit.files.vals()) {
              if (file.path == filePath) return ?file;
            }
          }
        }
      }
    };
    return null;
  };

  // ========== 🔀 BRANCHING ==========

  public shared ({ caller }) func createBranch(repositoryId: Text, newBranchName: Text, fromBranchName: Text) : async Text {
    var success = false;
    repositories := Array.map<Types.Repository, Types.Repository>(
      repositories,
      func(repo) {
        if (repo.id == repositoryId and isAuthorized(caller, repo)) {
          if (Array.find<Types.Branch>(repo.branches, func(b) { b.name == newBranchName }) != null) return repo;

          let fromOpt = Array.find<Types.Branch>(repo.branches, func(b) { b.name == fromBranchName });
          switch (fromOpt) {
            case (?base) {
              let newBranch = {
                name = newBranchName;
                commits = base.commits;
              };
              success := true;
              {
                repo with
                branches = Array.append(repo.branches, [newBranch]);
                updatedAt = Time.now();
              }
            };
            case (_) repo
          };
        } else repo
      }
    );

    if (success) return "Branch created.";
    return "Error: Branch exists or base not found.";
  };

  public shared ({ caller }) func switchBranch(repositoryId: Text, newBranchName: Text) : async Text {
    var switched = false;
    repositories := Array.map<Types.Repository, Types.Repository>(
      repositories,
      func(repo) {
        if (repo.id == repositoryId and isAuthorized(caller, repo)) {
          if (Array.find<Types.Branch>(repo.branches, func(b) { b.name == newBranchName }) != null) {
            switched := true;
            {
              repo with
              currentBranch = newBranchName;
              updatedAt = Time.now();
            }
          } else repo
        } else repo
      }
    );

    if (switched) return "Switched to branch: " # newBranchName;
    return "Branch not found or unauthorized.";
  };

  public shared query ({ caller }) func listBranches(repositoryId: Text) : async [Text] {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId and isAuthorized(caller, repo)) {
        return Array.map<Types.Branch, Text>(repo.branches, func(b) { b.name });
      };
    };
    return [];
  };

  public shared query ({ caller }) func getCurrentBranch(repositoryId: Text) : async ?Text {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId and isAuthorized(caller, repo)) {
        return ?repo.currentBranch;
      };
    };
    return null;
  };

  // ========== 💬 PROPOSALS ==========

  public shared ({ caller }) func createProposal(repositoryId: Text, message: Text) : async Nat {
    let id = Int.abs(proposals.size()); // ✅ FIXED HERE
    let newProposal: Types.Proposal = {
      id = id;
      repositoryId = repositoryId;
      proposer = caller;
      message = message;
      timestamp = Time.now();
      approved = false;
    };
    proposals := Array.append(proposals, [newProposal]);
    return id;
  };


  public query func listProposals() : async [Types.Proposal] {
    return proposals;
  };

}
