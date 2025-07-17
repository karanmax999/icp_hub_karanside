'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory, canisterId } from "@/declarations/icphub_backend_backend";

type FileEntry = {
  path: string;
  content: Uint8Array;
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
  const { id } = useParams();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [commitMessage, setCommitMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [backend, setBackend] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });

        if (process.env.NODE_ENV === "development") {
          await agent.fetchRootKey();
        }

        const actor = Actor.createActor(idlFactory, {
          agent,
          canisterId,
        });

        console.log("Backend actor created:", actor);
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
    try {
      setLoading(true);
      const result = await backend.listFiles(id as string);
      setFiles(result as FileEntry[]);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommits = async () => {
    try {
      const result = await backend.listCommits(id as string);
      setCommits(result as Commit[]);
    } catch (err) {
      console.error("Failed to fetch commits:", err);
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload || !backend) return;

    const buffer = await fileToUpload.arrayBuffer();
    const blob = Array.from(new Uint8Array(buffer));

    try {
      const result = await backend.uploadFile(id as string, fileToUpload.name, blob);
      alert("✅ Upload complete");
      setFileToUpload(null);
      fetchFiles();
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
      await backend.deleteFile(id as string, filePath);
      alert("🗑️ File deleted");
      fetchFiles();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("❌ Error deleting file");
    }
  };

  const handleDownload = async (filePath: string) => {
    if (!backend) return;

    try {
      const file = await backend.getFile(id as string, filePath) as FileEntry | null;
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
    if (!commitMessage.trim()) return alert("Enter a commit message");

    try {
      const result = await backend.commitChanges(id as string, commitMessage);
      alert(result);
      setCommitMessage("");
      fetchCommits();
    } catch (err) {
      console.error("Commit failed:", err);
      alert("❌ Commit failed");
    }
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith(".png") || path.endsWith(".jpg")) return "🖼️";
    if (path.endsWith(".pdf")) return "📄";
    if (path.endsWith(".js")) return "📜";
    if (path.endsWith(".md")) return "📝";
    return "📁";
  };

  return (
    <div className="min-h-screen p-6 bg-[#0f0f0f] text-white">
      <h1 className="text-2xl font-bold mb-4">Repository: {id}</h1>

      {/* Upload File */}
      <div className="mb-6">
        <input
          type="file"
          onChange={(e) => setFileToUpload(e.target.files?.[0] ?? null)}
          className="text-white file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
        />
        <button
          onClick={handleUpload}
          className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          Upload
        </button>
      </div>

      {/* File List */}
      <h2 className="text-xl font-semibold mb-2">Files:</h2>
      {loading ? (
        <p className="text-gray-400">Loading files...</p>
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

      {/* Commit Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Commit Changes</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Enter commit message"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="px-4 py-2 rounded bg-[#222] border border-gray-700 w-full text-white"
          />
          <button
            onClick={handleCommit}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded"
          >
            Commit
          </button>
        </div>
      </div>

      {/* Commit History */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Commit History</h2>
        {commits.length === 0 ? (
          <p className="text-gray-400">No commits yet.</p>
        ) : (
          <ul className="space-y-4">
            {commits.map((commit) => (
              <li
                key={commit.id}
                className="border border-gray-700 p-4 rounded bg-[#1a1a1a]"
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
      </div>
    </div>
  );
}
