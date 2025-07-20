module {
  public type FileEntry = {
    path: Text;
    content: Blob;
    hash: Text;
    lastModified: Int;
  };

  public type Commit = {
    id: Text;
    message: Text;
    timestamp: Int;
    files: [FileEntry];
  };

  public type Branch = {
    name: Text;
    commits: [Commit];
  };

  public type ChainMetadata = {
    ethTx: ?Text;
    btcTx: ?Text;
  };

  public type CommitMetadata = {
    commitId: Text;
    chain: ChainMetadata;
  };

  public type Repository = {
    id: Text;
    name: Text;
    description: ?Text;
    owner: Principal;
    collaborators: [Principal];
    isPrivate: Bool;
    createdAt: Int;
    updatedAt: Int;
    files: [FileEntry];
    commits: [Commit]; // legacy fallback
    branches: [Branch];
    currentBranch: Text;
    chainMetadata: [CommitMetadata];
  };

  public type Contribution = {
    contributor: Principal;
    repoId: Text;
    commitId: Text;
    timestamp: Int;
  };

  public type Proposal = {
    id: Nat;
    repositoryId: Text;
    proposer: Principal;
    message: Text;
    timestamp: Int;
    approved: Bool;
  };

  public type User = {
    principal: Principal;
    username: Text;
    email: ?Text;
    repositories: [Text];
    createdAt: Int;
  };
}
