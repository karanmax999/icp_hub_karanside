'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthClient } from '@dfinity/use-auth-client';
import { idlFactory } from '@/declarations/icphub_backend_backend';
import { canisterId } from '@/declarations/icphub_backend_backend';
import CreateRepoForm from '@/components/CreateRepoForm';

// ✅ Load identity provider & replica host for local or mainnet
const identityProvider =
  process.env.NEXT_PUBLIC_DFX_LOCALHOST && process.env.NEXT_PUBLIC_II_CANISTER_ID
    ? `${process.env.NEXT_PUBLIC_DFX_LOCALHOST}/?canisterId=${process.env.NEXT_PUBLIC_II_CANISTER_ID}`
    : 'https://identity.ic0.app';

const agentHost = process.env.NEXT_PUBLIC_DFX_LOCALHOST || 'http://127.0.0.1:4943';
console.log('🌍 Agent host:', process.env.NEXT_PUBLIC_DFX_LOCALHOST);

type Repository = {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  owner: string;
  updatedAt: bigint;
};

export default function DashboardPage() {
  const {
    isAuthenticated,
    principal,
    login,
    logout,
    actor,
    isLoading,
  } = useAuthClient({
    loginOptions: {
      identityProvider: `${process.env.NEXT_PUBLIC_DFX_LOCALHOST}/?canisterId=${process.env.NEXT_PUBLIC_II_CANISTER_ID}`,
    },
    actorOptions: {
      canisterId,
      idlFactory,
      host: process.env.NEXT_PUBLIC_DFX_LOCALHOST!, // << ✅ THIS IS CRITICAL
    },
    fetchRootKey: process.env.NODE_ENV === 'development',
  });
  

  const [ownedRepos, setOwnedRepos] = useState<Repository[]>([]);
  const [collabRepos, setCollabRepos] = useState<Repository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);

  useEffect(() => {
    if (!actor) return;

    const loadRepos = async () => {
      setLoadingRepos(true);
      try {
        const owned = await actor.getUserRepositories();
        const collab = await actor.getCollaboratorRepositories();
        setOwnedRepos(owned);
        setCollabRepos(collab);
      } catch (err) {
        console.error('❌ Failed to fetch repositories:', err);
      } finally {
        setLoadingRepos(false);
      }
    };

    loadRepos();
  }, [actor]);

  const formatDate = (timestamp: bigint) =>
    new Date(Number(timestamp / BigInt(1_000_000))).toLocaleString();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        <p>⏳ Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-bold mb-4">🔐 Please Sign In</h1>
        <button
          onClick={login}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
        >
          Sign In with Internet Identity
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">📂 Your Repositories</h1>
        <div className="text-sm text-gray-400 flex items-center space-x-4">
          <span>👤 {principal}</span>
          <button onClick={logout} className="underline text-red-400">
            Sign out
          </button>
        </div>
      </div>

      {/* ✅ Create Repository */}
      {actor && (
        <CreateRepoForm
          backend={actor}
          onCreate={(newId) => {
            console.log('✅ New repository created:', newId);
            if (actor) {
              actor.getUserRepositories().then(setOwnedRepos);
              actor.getCollaboratorRepositories().then(setCollabRepos);
            }
          }}
        />
      )}

      {loadingRepos ? (
        <p className="text-gray-500 mt-4">Loading repositories...</p>
      ) : (
        <>
          {/* Owned Repos */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-2">🛠️ Owned Repositories</h2>
            {ownedRepos.length === 0 ? (
              <p className="text-gray-400">You haven’t created any repositories yet.</p>
            ) : (
              <ul className="space-y-3">
                {ownedRepos.map((repo) => (
                  <li
                    key={repo.id}
                    className="border border-gray-700 bg-[#1a1a1a] p-4 rounded hover:bg-[#222]"
                  >
                    <Link href={`/repository/${repo.id}`}>
                      <div className="text-lg font-semibold">{repo.name}</div>
                      <div className="text-sm text-gray-400">
                        {repo.description ?? 'No description'} • Updated:{' '}
                        {formatDate(repo.updatedAt)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Collaborator Repos */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-2">🤝 Collaborating On</h2>
            {collabRepos.length === 0 ? (
              <p className="text-gray-400">You're not a collaborator on any repositories.</p>
            ) : (
              <ul className="space-y-3">
                {collabRepos.map((repo) => (
                  <li
                    key={repo.id}
                    className="border border-gray-700 bg-[#1a1a1a] p-4 rounded hover:bg-[#222]"
                  >
                    <Link href={`/repository/${repo.id}`}>
                      <div className="text-lg font-semibold">{repo.name}</div>
                      <div className="text-sm text-gray-400">
                        {repo.description ?? 'No description'} • Updated:{' '}
                        {formatDate(repo.updatedAt)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
