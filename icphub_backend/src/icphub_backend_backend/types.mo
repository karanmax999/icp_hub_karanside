module {
  public type FileEntry = {
    path: Text;
    content: Blob;
    hash: Text;
    lastModified: Int;
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
  };

  public type User = {
    principal: Principal;
    username: Text;
    email: ?Text;
    repositories: [Text];
    createdAt: Int;
  };
}
