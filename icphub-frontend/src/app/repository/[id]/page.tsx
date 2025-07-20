'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, canisterId } from "@/declarations/icphub_backend_backend";
import { AuthClient } from "@dfinity/auth-client";

// Types
type FileEntry = {
  path: string;
  content: number[];
  hash: string;
  lastModified: bigint;
};

type Commit = {
  id: string;
  message: string;
  timestamp: bigint;
  files: FileEntry[];
};

export default function RepositoryDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [backend, setBackend] = useState<any>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [commitFiles, setCommitFiles] = useState<FileEntry[]>([]);

  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [commitMessage, setCommitMessage] = useState("");

  // ✅ Authenticated backend actor
  useEffect(() => {
    const init = async () => {
      try {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();

        const agent = new HttpAgent({
          identity,
          host: "http://127.0.0.1:4943", // local dev
        });

        if (process.env.NODE_ENV === "development") {
          await agent.fetchRootKey();
        }

        const actor = Actor.createActor(idlFactory, {
          agent,
          canisterId,
        });

        setBackend(actor);
      } catch (err) {
        console.error("Actor initialization failed:", err);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (backend && id) {
      fetchFiles();
      fetchCommits();
    }
  }, [backend, id]);

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const result = await backend.listFiles(id);
      setFiles(result);
    } catch (err) {
      console.error("Failed to fetch files:", err);
      setFiles([]);
    }
    setLoadingFiles(false);
  };

  const fetchCommits = async () => {
    try {
      const result = await backend.listCommits(id);
      setCommits(result);
      setSelectedCommit(null);
      setCommitFiles([]);
    } catch (err) {
      console.error("Failed to fetch commits:", err);
      setCommits([]);
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload || !backend) return;

    const buffer = await fileToUpload.arrayBuffer();
    const blob = Array.from(new Uint8Array(buffer));

    try {
      await backend.uploadFile(id, fileToUpload.name, blob);
      alert("✅ Upload complete");
      setFileToUpload(null);
      await fetchFiles();
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload failed");
    }
  };

  const handleDelete = async (filePath: string) => {
    if (!backend) return;
    const confirmDelete = confirm(`Delete "${filePath}"?`);
    if (!confirmDelete) return;

    try {
      await backend.deleteFile(id, filePath);
      alert("🗑️ File deleted");
      await fetchFiles();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("❌ Error deleting file");
    }
  };

  const handleDownload = async (filePath: string) => {
    if (!backend) return;

    try {
      const file = await backend.getFile(id, filePath);
      if (!file) return alert("File not found");

      const blob = new Blob([new Uint8Array(file.content)], {
        type: "application/octet-stream",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.path;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("❌ Error downloading file");
    }
  };

  const handleCommit = async () => {
    if (!backend) return;
    if (!commitMessage.trim()) return alert("Please enter a commit message.");

    try {
      const result = await backend.commitChanges(id, commitMessage.trim());
      alert(result);
      setCommitMessage("");
      await fetchCommits();
    } catch (err) {
      console.error("Commit failed:", err);
      alert("❌ Commit failed");
    }
  };

  const selectCommit = async (commit: Commit) => {
    setSelectedCommit(commit);
    setCommitFiles(commit.files);
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith(".png") || path.endsWith(".jpg")) return "🖼️";
    if (path.endsWith(".pdf")) return "📄";
    if (path.endsWith(".js")) return "📜";
    if (path.endsWith(".md")) return "📝";
    return "📁";
  };

  return (
    <div className="min-h-screen p-6 bg-[#0f0f0f] text-white max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Repository: {id}</h1>

      {/* Upload File */}
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
        <input
          type="file"
          onChange={(e) => setFileToUpload(e.target.files?.[0] ?? null)}
          className="text-white file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
        />
        <button
          onClick={handleUpload}
          disabled={!fileToUpload}
          className={`px-6 py-2 rounded font-semibold ${
            fileToUpload ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 cursor-not-allowed"
          }`}
        >
          Upload
        </button>
      </div>

      {/* File List */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Files (Current State)</h2>
        {loadingFiles ? (
          <p className="text-gray-400">Loading files…</p>
        ) : files.length === 0 ? (
          <p className="text-gray-400">No files found in this repository.</p>
        ) : (
          <ul className="space-y-3">
            {files.map((file) => (
              <li
                key={file.path}
                className="border border-gray-700 p-4 rounded flex justify-between items-center bg-[#1a1a1a]"
              >
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-xl">{getFileIcon(file.path)}</span>
                    {file.path}
                  </div>
                  <div className="text-sm text-gray-400">
                    {Math.round(file.content.length / 1024)} KB &middot; Last modified:{" "}
                    {new Date(Number(file.lastModified)).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(file.path)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.path)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Commit Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Commit Changes</h2>
        <div className="flex gap-4 max-w-xl">
          <input
            type="text"
            placeholder="Enter commit message"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="px-4 py-2 rounded bg-[#222] border border-gray-700 flex-grow text-white"
          />
          <button
            onClick={handleCommit}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold"
          >
            Commit
          </button>
        </div>
      </section>

      {/* Commit History */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Commit History</h2>
        {commits.length === 0 ? (
          <p className="text-gray-400">No commits yet.</p>
        ) : (
          <ul className="space-y-4 max-w-4xl">
            {commits.map((commit) => (
              <li
                key={commit.id}
                className={`border p-4 rounded cursor-pointer ${
                  selectedCommit?.id === commit.id ? "bg-indigo-600" : "bg-[#1a1a1a]"
                }`}
                onClick={() => selectCommit(commit)}
              >
                <div className="font-semibold">{commit.message}</div>
                <div className="text-sm text-gray-400">
                  ID: {commit.id} <br />
                  Date: {new Date(Number(commit.timestamp)).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}

        {selectedCommit && (
          <div className="mt-8 max-w-4xl">
            <h3 className="text-xl font-semibold mb-3">
              Files in Commit: {selectedCommit.message}
            </h3>
            {commitFiles.length === 0 ? (
              <p className="text-gray-400 italic">No files in this commit.</p>
            ) : (
              <ul className="space-y-2">
                {commitFiles.map((file) => (
                  <li key={file.path} className="flex justify-between items-center bg-[#222] p-3 rounded">
                    <span>{file.path}</span>
                    <button
                      onClick={async () => {
                        if (!backend) return alert("Backend not ready");
                        try {
                          const f = await backend.getCommitFileContent(
                            id,
                            selectedCommit.id,
                            file.path
                          );
                          if (!f) return alert("File not found in commit");
                          const blob = new Blob([new Uint8Array(f.content)], {
                            type: "application/octet-stream",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = f.path;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch (e) {
                          alert("❌ Error downloading commit file");
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
