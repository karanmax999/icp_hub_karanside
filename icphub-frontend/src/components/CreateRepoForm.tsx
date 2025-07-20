"use client";
import { useState } from "react";

interface Props {
  onCreate: (repoId: string) => void;
  backend: any;
}

export default function CreateRepoForm({ backend, onCreate }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const newId: string = await backend.createRepository(
        name,
        description ? [description] : [],
        isPrivate
      );
      onCreate(newId);
      setName("");
      setDescription("");
      setIsPrivate(false);
    } catch (err: any) {
      console.error("Failed to create repo", err);
      setError("❌ Failed to create repository");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-gray-700 p-6 rounded">
      <h2 className="text-xl font-bold mb-4">📁 Create Repository</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Name</label>
          <input
            className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-awesome-repo"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional summary of your repo"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            id="private"
          />
          <label htmlFor="private" className="text-sm text-gray-300">
            Make Private
          </label>
        </div>

        {error && <p className="text-red-400">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={submitting || !name}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {submitting ? "Creating..." : "🚀 Create Repository"}
        </button>
      </div>
    </div>
  );
}
