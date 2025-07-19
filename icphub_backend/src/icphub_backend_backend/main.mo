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

  func isAuthorized(caller: Principal, repo: Types.Repository) : Bool {
    if (repo.owner == caller) {
      return true;
    };
    for (collab in repo.collaborators.vals()) {
      if (collab == caller) {
        return true;
      };
    };
    return false;
  };

  public query func hello(name : Text) : async Text {
    return "Welcome to ICPHub, " # name # "!";
  };

  public shared ({ caller }) func createRepository(
    name: Text,
    description: ?Text,
    isPrivate: Bool
  ) : async Text {
    let now = Time.now();
    let id = name # "_" # Nat.toText(Int.abs(now));

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
    };

    repositories := Array.append(repositories, [newRepo]);
    return id;
  };

  public query func getRepository(id: Text) : async ?Types.Repository {
    for (repo in repositories.vals()) {
      if (repo.id == id) {
        return ?repo;
      };
    };
    return null;
  };

  public shared ({ caller }) func uploadFile(
    repositoryId: Text,
    path: Text,
    content: Blob
  ) : async Text {
    let hash = Nat32.toNat(Text.hash(path));
    let timestamp = Time.now();
    var updated = false;
    var duplicate = false;

    repositories := Array.map<Types.Repository, Types.Repository>(
      repositories,
      func(repo) {
        if (repo.id == repositoryId) {
          if (not isAuthorized(caller, repo)) {
            return repo;
          };
          for (file in repo.files.vals()) {
            if (file.path == path) {
              duplicate := true;
              return repo;
            };
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
        } else {
          repo
        }
      }
    );

    if (duplicate) {
      return "Error: File with this path already exists.";
    } else if (updated) {
      return "File uploaded successfully.";
    } else {
      return "Repository not found or unauthorized.";
    };
  };

  public shared query ({ caller }) func listFiles(repositoryId: Text) : async [Text] {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId) {
        if (repo.isPrivate and not isAuthorized(caller, repo)) {
          return [];
        };
        return Array.map<Types.FileEntry, Text>(repo.files, func(file) { file.path });
      };
    };
    return [];
  };

  public shared query ({ caller }) func getFile(
    repositoryId: Text,
    path: Text
  ) : async ?Types.FileEntry {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId) {
        if (repo.isPrivate and not isAuthorized(caller, repo)) {
          return null;
        };
        for (file in repo.files.vals()) {
          if (file.path == path) {
            return ?file;
          };
        };
      };
    };
    return null;
  };

  public shared ({ caller }) func deleteFile(
    repositoryId: Text,
    path: Text
  ) : async Text {
    var deleted = false;
    let now = Time.now();

    repositories := Array.map<Types.Repository, Types.Repository>(
      repositories,
      func(repo) {
        if (repo.id == repositoryId) {
          if (not isAuthorized(caller, repo)) {
            return repo;
          };

          let filtered = Array.filter<Types.FileEntry>(
            repo.files,
            func(file) {
              if (file.path == path) {
                deleted := true;
                false
              } else {
                true
              }
            }
          );

          {
            repo with
            files = filtered;
            updatedAt = now;
          };
        } else {
          repo
        }
      }
    );

    if (deleted) {
      return "File deleted.";
    } else {
      return "File not found or unauthorized.";
    };
  };

  public query func getAllRepositories() : async [Types.Repository] {
    return repositories;
  };

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
            };
          } else {
            repo
          }
        } else {
          repo
        }
      }
    );

    if (updated) {
      return "Collaborator added.";
    } else {
      return "Error: Unauthorized or already exists.";
    };
  };

  public shared ({ caller }) func deleteRepository(id: Text) : async Text {
    var deleted = false;

    let filtered = Array.filter<Types.Repository>(
      repositories,
      func(repo) {
        if (repo.id == id and repo.owner == caller) {
          deleted := true;
          false
        } else {
          true
        }
      }
    );

    if (deleted) {
      repositories := filtered;
      return "Repository deleted.";
    } else {
      return "Error: Unauthorized or not found.";
    };
  };

  // 🔥 COMMIT SYSTEM STARTS HERE

  public shared ({ caller }) func commitChanges(repositoryId: Text, message: Text) : async Text {
    var committed = false;
    let now = Time.now();
    let commitId = "commit_" # Nat.toText(Int.abs(now));

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
          committed := true;
          {
            repo with
            commits = Array.append(repo.commits, [newCommit]);
            updatedAt = now;
          };
        } else {
          repo;
        }
      }
    );

    if (committed) {
      return "Commit created successfully: " # commitId;
    } else {
      return "Error: Repository not found or unauthorized.";
    };
  };

  public shared query ({ caller }) func listCommits(repositoryId: Text) : async [Types.Commit] {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId and (not repo.isPrivate or isAuthorized(caller, repo))) {
        return repo.commits;
      };
    };
    return [];
  };

  public shared query ({ caller }) func getCommit(
    repositoryId: Text, 
    commitId: Text
  ) : async ?Types.Commit {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId and (not repo.isPrivate or isAuthorized(caller, repo))) {
        for (commit in repo.commits.vals()) {
          if (commit.id == commitId) {
            return ?commit;
          };
        };
      };
    };
    return null;
  };

  // ✅ NEW: Retrieve file content from any commit snapshot
  public shared query ({ caller }) func getCommitFileContent(
    repositoryId: Text,
    commitId: Text,
    filePath: Text
  ) : async ?Types.FileEntry {
    for (repo in repositories.vals()) {
      if (repo.id == repositoryId and (not repo.isPrivate or isAuthorized(caller, repo))) {
        for (commit in repo.commits.vals()) {
          if (commit.id == commitId) {
            for (file in commit.files.vals()) {
              if (file.path == filePath) {
                return ?file;
              };
            };
            return null; // File not found in commit
          };
        };
        return null; // Commit not found
      };
    };
    return null; // Repo not found or unauthorized
  };

  // 🔍 Get repositories owned by caller
  public shared query ({ caller }) func getUserRepositories() : async [Types.Repository] {
    Array.filter<Types.Repository>(
      repositories,
      func(repo) { repo.owner == caller }
    )
  };

  // 🤝 Get repositories where caller is a collaborator
  public shared query ({ caller }) func getCollaboratorRepositories() : async [Types.Repository] {
    Array.filter<Types.Repository>(
      repositories,
      func(repo) {
        Array.find<Principal>(repo.collaborators, func(p) { p == caller }) != null
      }
    )
  };

};
