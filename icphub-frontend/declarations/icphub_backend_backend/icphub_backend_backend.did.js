export const idlFactory = ({ IDL }) => {
  const FileEntry = IDL.Record({
    'content' : IDL.Vec(IDL.Nat8),
    'hash' : IDL.Text,
    'path' : IDL.Text,
    'lastModified' : IDL.Int,
  });
  const ChainMetadata = IDL.Record({
    'ethTx' : IDL.Opt(IDL.Text),
    'btcTx' : IDL.Opt(IDL.Text),
  });
  const CommitMetadata = IDL.Record({
    'chain' : ChainMetadata,
    'commitId' : IDL.Text,
  });
  const Commit = IDL.Record({
    'id' : IDL.Text,
    'files' : IDL.Vec(FileEntry),
    'message' : IDL.Text,
    'timestamp' : IDL.Int,
  });
  const Branch = IDL.Record({ 'name' : IDL.Text, 'commits' : IDL.Vec(Commit) });
  const Repository = IDL.Record({
    'id' : IDL.Text,
    'files' : IDL.Vec(FileEntry),
    'chainMetadata' : IDL.Vec(CommitMetadata),
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'description' : IDL.Opt(IDL.Text),
    'commits' : IDL.Vec(Commit),
    'updatedAt' : IDL.Int,
    'isPrivate' : IDL.Bool,
    'collaborators' : IDL.Vec(IDL.Principal),
    'branches' : IDL.Vec(Branch),
    'currentBranch' : IDL.Text,
  });
  const Proposal = IDL.Record({
    'id' : IDL.Nat,
    'repositoryId' : IDL.Text,
    'approved' : IDL.Bool,
    'message' : IDL.Text,
    'timestamp' : IDL.Int,
    'proposer' : IDL.Principal,
  });
  return IDL.Service({
    'addCollaborator' : IDL.Func([IDL.Text, IDL.Principal], [IDL.Text], []),
    'commitChanges' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'createBranch' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Text], []),
    'createProposal' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'createRepository' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text), IDL.Bool],
        [IDL.Text],
        [],
      ),
    'deleteFile' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'deleteRepository' : IDL.Func([IDL.Text], [IDL.Text], []),
    'getCollaboratorRepositories' : IDL.Func(
        [],
        [IDL.Vec(Repository)],
        ['query'],
      ),
    'getCommit' : IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(Commit)], ['query']),
    'getCommitFileContent' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [IDL.Opt(FileEntry)],
        ['query'],
      ),
    'getCurrentBranch' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'getFile' : IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(FileEntry)], ['query']),
    'getRepository' : IDL.Func([IDL.Text], [IDL.Opt(Repository)], ['query']),
    'getUserRepositories' : IDL.Func([], [IDL.Vec(Repository)], ['query']),
    'hello' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'listBranches' : IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
    'listCommits' : IDL.Func([IDL.Text], [IDL.Vec(Commit)], ['query']),
    'listFiles' : IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
    'listProposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'switchBranch' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'uploadFile' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8)],
        [IDL.Text],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
