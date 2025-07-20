import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Branch { 'name' : string, 'commits' : Array<Commit> }
export interface ChainMetadata {
  'ethTx' : [] | [string],
  'btcTx' : [] | [string],
}
export interface Commit {
  'id' : string,
  'files' : Array<FileEntry>,
  'message' : string,
  'timestamp' : bigint,
}
export interface CommitMetadata { 'chain' : ChainMetadata, 'commitId' : string }
export interface FileEntry {
  'content' : Uint8Array | number[],
  'hash' : string,
  'path' : string,
  'lastModified' : bigint,
}
export interface Proposal {
  'id' : bigint,
  'repositoryId' : string,
  'approved' : boolean,
  'message' : string,
  'timestamp' : bigint,
  'proposer' : Principal,
}
export interface Repository {
  'id' : string,
  'files' : Array<FileEntry>,
  'chainMetadata' : Array<CommitMetadata>,
  'owner' : Principal,
  'name' : string,
  'createdAt' : bigint,
  'description' : [] | [string],
  'commits' : Array<Commit>,
  'updatedAt' : bigint,
  'isPrivate' : boolean,
  'collaborators' : Array<Principal>,
  'branches' : Array<Branch>,
  'currentBranch' : string,
}
export interface _SERVICE {
  'addCollaborator' : ActorMethod<[string, Principal], string>,
  'commitChanges' : ActorMethod<[string, string], string>,
  'createBranch' : ActorMethod<[string, string, string], string>,
  'createProposal' : ActorMethod<[string, string], bigint>,
  'createRepository' : ActorMethod<[string, [] | [string], boolean], string>,
  'deleteFile' : ActorMethod<[string, string], string>,
  'deleteRepository' : ActorMethod<[string], string>,
  'getCollaboratorRepositories' : ActorMethod<[], Array<Repository>>,
  'getCommit' : ActorMethod<[string, string], [] | [Commit]>,
  'getCommitFileContent' : ActorMethod<
    [string, string, string],
    [] | [FileEntry]
  >,
  'getCurrentBranch' : ActorMethod<[string], [] | [string]>,
  'getFile' : ActorMethod<[string, string], [] | [FileEntry]>,
  'getRepository' : ActorMethod<[string], [] | [Repository]>,
  'getUserRepositories' : ActorMethod<[], Array<Repository>>,
  'hello' : ActorMethod<[string], string>,
  'listBranches' : ActorMethod<[string], Array<string>>,
  'listCommits' : ActorMethod<[string], Array<Commit>>,
  'listFiles' : ActorMethod<[string], Array<string>>,
  'listProposals' : ActorMethod<[], Array<Proposal>>,
  'switchBranch' : ActorMethod<[string, string], string>,
  'uploadFile' : ActorMethod<[string, string, Uint8Array | number[]], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
