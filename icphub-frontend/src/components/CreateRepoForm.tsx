'use client';

import { useState } from 'react';
import { backendActor } from '@/lib/ic-agent';

export default function CreateRepoForm({ onCreate }: { onCreate?: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await backendActor.createRepository(name, description || null, isPrivate);
      if (onCreate) onCreate(); // Refresh list on create
      setName('');
      setDescription('');
      setIsPrivate(false);
    } catch (err) {
      console.error("Failed to create repo:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow mb-4">
      <h2 className="font-semibold mb-2 text-lg">Create Repository</h2>
      <input
        className="border px-2 py-1 w-full mb-2"
        placeholder="Repository Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border px-2 py-1 w-full mb-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <label className="block mb-2">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
        />{' '}
        Private
      </label>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleCreate}
        disabled={loading || !name}
      >
        {loading ? 'Creating...' : 'Create'}
      </button>
    </div>
  );
}
